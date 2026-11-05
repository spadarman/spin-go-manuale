"""
STEP 1 — Architettura dati.

Database SQLite locale con due tabelle:

  gto_ranges   una riga per (profondità, posizione, azione precedente, mano):
               la soluzione GTO importata da CSV.
  user_stats   una riga per ogni risposta data nel quiz: serve a contare
               giuste/sbagliate e a ripassare le mani sbagliate.

Uso da riga di comando:
    python db.py --init                      # crea il database vuoto
    python db.py --import file.csv           # importa (o sostituisce) i range
    python db.py --import file.csv --append  # aggiunge senza cancellare

Formato CSV atteso (intestazione obbligatoria, separatore , oppure ;):
    bb_depth,hero_position,pre_action,hand,best_action,ev
    25,BTN,Unopened,AKs,Min-Raise,1.42
"""

from __future__ import annotations

import argparse
import csv
import io
import sqlite3
from pathlib import Path
from typing import Iterable

# Il file del database sta accanto al codice, così l'app funziona
# ovunque venga lanciata (telefono via Termux, PC di casa, server).
DB_PATH = Path(__file__).resolve().parent / "data" / "gto.sqlite3"

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
SCHEMA = """
CREATE TABLE IF NOT EXISTS gto_ranges (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    bb_depth       REAL    NOT NULL,              -- stack effettivo in bui grandi
    hero_position  TEXT    NOT NULL,              -- BTN / SB / BB
    pre_action     TEXT    NOT NULL,              -- azione davanti a hero, es. 'BTN Min-Raise'
    hand           TEXT    NOT NULL,              -- notazione a 169 mani: AA, AKs, AKo...
    best_action    TEXT    NOT NULL,              -- Fold / Limp / Call / Check / Min-Raise / Raise / All-in
    ev             REAL,                          -- EV dell'azione migliore in bb (può mancare)
    UNIQUE (bb_depth, hero_position, pre_action, hand)
);

-- Indice per la query del quiz, che filtra sempre su questi tre campi.
CREATE INDEX IF NOT EXISTS idx_ranges_spot
    ON gto_ranges (bb_depth, hero_position, pre_action);

CREATE TABLE IF NOT EXISTS user_stats (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    answered_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    session_id     TEXT    NOT NULL,              -- una sessione = un'apertura dell'app
    range_id       INTEGER REFERENCES gto_ranges(id) ON DELETE SET NULL,
    bb_depth       REAL    NOT NULL,              -- copiati dallo spot: le statistiche
    hero_position  TEXT    NOT NULL,              -- restano leggibili anche se i range
    pre_action     TEXT    NOT NULL,              -- vengono reimportati
    hand           TEXT    NOT NULL,
    user_action    TEXT    NOT NULL,
    correct_action TEXT    NOT NULL,
    is_correct     INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    ev             REAL
);

CREATE INDEX IF NOT EXISTS idx_stats_errors
    ON user_stats (is_correct, bb_depth, hero_position, pre_action, hand);
"""

REQUIRED_COLUMNS = ("bb_depth", "hero_position", "pre_action", "hand", "best_action", "ev")

# Nomi canonici delle azioni e sinonimi accettati in importazione.
# Le chiavi sono confrontate in minuscolo e senza spazi/trattini.
CANONICAL_ACTIONS = ("Fold", "Check", "Limp", "Call", "Min-Raise", "Raise", "All-in")
_ACTION_ALIASES = {
    "fold": "Fold", "f": "Fold", "passo": "Fold",
    "check": "Check", "x": "Check",
    "limp": "Limp", "l": "Limp",
    "call": "Call", "c": "Call", "pago": "Call",
    "minraise": "Min-Raise", "mr": "Min-Raise", "minr": "Min-Raise", "raise2": "Min-Raise",
    "raise": "Raise", "r": "Raise", "3bet": "Raise", "iso": "Raise", "isolate": "Raise",
    "allin": "All-in", "shove": "All-in", "jam": "All-in", "push": "All-in", "ai": "All-in",
}

_RANKS = "AKQJT98765432"


def normalize_action(raw: str) -> str:
    """Riporta un'azione del CSV a uno dei nomi canonici."""
    key = raw.strip().lower().replace(" ", "").replace("-", "").replace("_", "")
    if key in _ACTION_ALIASES:
        return _ACTION_ALIASES[key]
    raise ValueError(f"Azione sconosciuta: {raw!r}")


def normalize_hand(raw: str) -> str:
    """'akS' -> 'AKs', 'KA o' -> 'AKo', '77' -> '77'. Ordina sempre la carta alta prima."""
    h = raw.strip().replace(" ", "")
    if len(h) not in (2, 3):
        raise ValueError(f"Mano non valida: {raw!r}")
    r1, r2 = h[0].upper(), h[1].upper()
    if r1 not in _RANKS or r2 not in _RANKS:
        raise ValueError(f"Mano non valida: {raw!r}")
    if _RANKS.index(r1) > _RANKS.index(r2):
        r1, r2 = r2, r1
    if r1 == r2:
        return r1 + r2
    suffix = h[2].lower() if len(h) == 3 else ""
    if suffix not in ("s", "o"):
        raise ValueError(f"Mano non coppia senza s/o: {raw!r}")
    return r1 + r2 + suffix


# ---------------------------------------------------------------------------
# Connessione e creazione
# ---------------------------------------------------------------------------
def get_connection(db_path: Path | str = DB_PATH) -> sqlite3.Connection:
    """Apre il database (creando la cartella se serve) con righe accessibili per nome."""
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    # check_same_thread=False: Streamlit può servire più rerun su thread diversi.
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    """Crea tabelle e indici se mancano. Idempotente."""
    conn.executescript(SCHEMA)
    conn.commit()


# ---------------------------------------------------------------------------
# Importazione CSV
# ---------------------------------------------------------------------------
def _parse_rows(text: str) -> list[tuple]:
    """Legge il testo CSV e restituisce tuple pronte per l'INSERT. Solleva ValueError con la riga."""
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    if reader.fieldnames is None:
        raise ValueError("CSV vuoto")
    fields = [f.strip().lower() for f in reader.fieldnames]
    missing = [c for c in REQUIRED_COLUMNS if c not in fields]
    if missing:
        raise ValueError(f"Colonne mancanti nel CSV: {', '.join(missing)}")
    reader.fieldnames = fields

    rows = []
    for line_no, rec in enumerate(reader, start=2):
        try:
            ev_raw = (rec["ev"] or "").strip().replace(",", ".")
            rows.append((
                float(rec["bb_depth"].replace(",", ".")),
                rec["hero_position"].strip().upper(),
                rec["pre_action"].strip(),
                normalize_hand(rec["hand"]),
                normalize_action(rec["best_action"]),
                float(ev_raw) if ev_raw else None,
            ))
        except (ValueError, AttributeError) as exc:
            raise ValueError(f"Riga {line_no}: {exc}") from exc
    return rows


def import_csv_text(conn: sqlite3.Connection, text: str, replace: bool = True) -> int:
    """
    Importa i range da testo CSV in una sola transazione.
    replace=True svuota gto_ranges prima; le righe duplicate sostituiscono le precedenti.
    Restituisce il numero di righe importate.
    """
    rows = _parse_rows(text)
    with conn:  # transazione: o entra tutto o niente
        if replace:
            conn.execute("DELETE FROM gto_ranges")
        conn.executemany(
            """INSERT INTO gto_ranges (bb_depth, hero_position, pre_action, hand, best_action, ev)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT (bb_depth, hero_position, pre_action, hand)
               DO UPDATE SET best_action = excluded.best_action, ev = excluded.ev""",
            rows,
        )
    return len(rows)


def import_csv_file(conn: sqlite3.Connection, path: Path | str, replace: bool = True) -> int:
    text = Path(path).read_text(encoding="utf-8-sig")  # -sig toglie il BOM dei CSV di Excel
    return import_csv_text(conn, text, replace=replace)


# ---------------------------------------------------------------------------
# Query usate dal quiz
# ---------------------------------------------------------------------------
def count_ranges(conn: sqlite3.Connection) -> int:
    return conn.execute("SELECT COUNT(*) FROM gto_ranges").fetchone()[0]


def distinct_values(conn: sqlite3.Connection, column: str) -> list:
    if column not in ("bb_depth", "hero_position", "pre_action"):
        raise ValueError(column)
    return [r[0] for r in conn.execute(f"SELECT DISTINCT {column} FROM gto_ranges ORDER BY {column}")]


def _filters_sql(depths: Iterable | None, positions: Iterable | None, alias: str = "") -> tuple[str, list]:
    """Costruisce la clausola WHERE per i filtri scelti nella barra laterale."""
    p = f"{alias}." if alias else ""
    clauses, params = [], []
    for col, values in (("bb_depth", depths), ("hero_position", positions)):
        values = list(values or [])
        if values:
            clauses.append(f"{p}{col} IN ({','.join('?' * len(values))})")
            params.extend(values)
    return (" AND ".join(clauses) or "1=1"), params


def random_spot(conn: sqlite3.Connection, depths=None, positions=None,
                only_mistakes: bool = False, exclude_id: int | None = None) -> sqlite3.Row | None:
    """
    Estrae uno spot a caso rispettando i filtri.
    only_mistakes=True pesca solo tra le mani già sbagliate almeno una volta.
    exclude_id evita di riproporre subito la stessa mano.
    """
    where, params = _filters_sql(depths, positions, alias="g")
    if only_mistakes:
        where += """ AND EXISTS (SELECT 1 FROM user_stats u
                     WHERE u.is_correct = 0 AND u.bb_depth = g.bb_depth
                       AND u.hero_position = g.hero_position
                       AND u.pre_action = g.pre_action AND u.hand = g.hand)"""
    base = f"SELECT g.* FROM gto_ranges g WHERE {where}"
    if exclude_id is not None:
        row = conn.execute(base + " AND g.id <> ? ORDER BY RANDOM() LIMIT 1", [*params, exclude_id]).fetchone()
        if row is not None:
            return row
    return conn.execute(base + " ORDER BY RANDOM() LIMIT 1", params).fetchone()


def base_actions(pre_action: str) -> set[str]:
    """
    Azioni legali in base al contesto, indipendenti da cosa sceglie il solver:
    mostrarle tutte evita che il numero di bottoni suggerisca la risposta.
    """
    pa = pre_action.lower()
    if "raise" in pa or "all-in" in pa or "allin" in pa:
        return {"Fold", "Call", "Raise", "All-in"}        # davanti a un rilancio
    if "limp" in pa:
        return {"Check", "Raise", "All-in"}               # BB dopo un limp: il fold non esiste
    return {"Fold", "Limp", "Min-Raise", "All-in"}        # piatto non aperto


def actions_for_spot(conn: sqlite3.Connection, bb_depth, hero_position, pre_action) -> list[str]:
    """
    Bottoni da mostrare per un nodo: azioni legali del contesto + quelle presenti
    nei dati, in ordine canonico. Se i dati usano solo 'Raise' (o solo 'Min-Raise')
    l'altra dimensione di rilancio viene tolta per non avere due bottoni simili.
    """
    found = {r[0] for r in conn.execute(
        "SELECT DISTINCT best_action FROM gto_ranges WHERE bb_depth=? AND hero_position=? AND pre_action=?",
        (bb_depth, hero_position, pre_action))}
    actions = base_actions(pre_action) | found
    if "Raise" in found and "Min-Raise" not in found:
        actions.discard("Min-Raise")
    if "Min-Raise" in found and "Raise" not in found:
        actions.discard("Raise")
    return [a for a in CANONICAL_ACTIONS if a in actions]


def record_answer(conn: sqlite3.Connection, session_id: str, spot: dict, user_action: str) -> bool:
    """Salva la risposta in user_stats e dice se era giusta."""
    is_correct = user_action == spot["best_action"]
    with conn:
        conn.execute(
            """INSERT INTO user_stats (session_id, range_id, bb_depth, hero_position, pre_action,
                                       hand, user_action, correct_action, is_correct, ev)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (session_id, spot["id"], spot["bb_depth"], spot["hero_position"], spot["pre_action"],
             spot["hand"], user_action, spot["best_action"], int(is_correct), spot["ev"]),
        )
    return is_correct


def stats_by_spot(conn: sqlite3.Connection) -> list[sqlite3.Row]:
    """Precisione per nodo, dal peggiore al migliore."""
    return conn.execute(
        """SELECT bb_depth, hero_position, pre_action,
                  COUNT(*) AS risposte, SUM(is_correct) AS giuste,
                  ROUND(100.0 * SUM(is_correct) / COUNT(*), 1) AS precisione
           FROM user_stats GROUP BY bb_depth, hero_position, pre_action
           ORDER BY precisione ASC, risposte DESC""").fetchall()


def top_mistakes(conn: sqlite3.Connection, limit: int = 15) -> list[sqlite3.Row]:
    """Mani sbagliate più spesso."""
    return conn.execute(
        """SELECT bb_depth, hero_position, pre_action, hand, correct_action,
                  COUNT(*) AS errori, MAX(answered_at) AS ultima
           FROM user_stats WHERE is_correct = 0
           GROUP BY bb_depth, hero_position, pre_action, hand
           ORDER BY errori DESC, ultima DESC LIMIT ?""", (limit,)).fetchall()


def reset_stats(conn: sqlite3.Connection) -> None:
    with conn:
        conn.execute("DELETE FROM user_stats")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(description="Gestione del database GTO")
    ap.add_argument("--db", default=str(DB_PATH), help="percorso del file SQLite")
    ap.add_argument("--init", action="store_true", help="crea tabelle e indici")
    ap.add_argument("--import", dest="csv_path", help="CSV da importare in gto_ranges")
    ap.add_argument("--append", action="store_true", help="non svuotare gto_ranges prima")
    args = ap.parse_args()

    conn = get_connection(args.db)
    init_db(conn)
    if args.init:
        print(f"Database pronto: {args.db}")
    if args.csv_path:
        n = import_csv_file(conn, args.csv_path, replace=not args.append)
        print(f"Importate {n} righe. Totale in gto_ranges: {count_ranges(conn)}")


if __name__ == "__main__":
    main()
