"""
Genera un CSV di esempio con i range a 25 bui del manuale (dati/ranges.js),
così l'MVP funziona subito anche senza un export da solver.

    python seed_data.py            # scrive data/gto_ranges_esempio.csv
    python seed_data.py --load     # ...e lo importa nel database

Il manuale non riporta l'EV, quindi la colonna 'ev' resta vuota:
l'app la mostra solo quando c'è. Per lo studio vero importa il tuo CSV.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

import db

RANKS = "AKQJT98765432"


def all_hands() -> list[str]:
    """Le 169 mani: coppie, suited (carta alta prima) e offsuit."""
    out = []
    for i, r1 in enumerate(RANKS):
        for j, r2 in enumerate(RANKS):
            if i == j:
                out.append(r1 + r2)
            elif i < j:
                out.append(r1 + r2 + "s")
                out.append(r1 + r2 + "o")
    return out


def expand(notation: str) -> set[str]:
    """
    Espande la notazione dei range del manuale:
    AA · AKs · AKo · 22+ · A2s+ · 22-44 · K4s-KJs · * (tutte le mani).
    """
    hands: set[str] = set()
    for tok in (t.strip() for t in notation.split(",")):
        if not tok:
            continue
        if tok == "*":
            hands.update(all_hands())
        elif "-" in tok:  # intervallo: stessa prima carta (o coppie), seconda carta variabile
            a, b = tok.split("-")
            if a[0] == a[1]:  # coppie 22-44
                lo, hi = sorted((RANKS.index(a[0]), RANKS.index(b[0])))
                hands.update(RANKS[k] * 2 for k in range(lo, hi + 1))
            else:  # K4s-KJs
                lo, hi = sorted((RANKS.index(a[1]), RANKS.index(b[1])))
                hands.update(a[0] + RANKS[k] + a[2] for k in range(lo, hi + 1))
        elif tok.endswith("+"):
            base = tok[:-1]
            if base[0] == base[1]:  # 55+ -> 55..AA
                hands.update(RANKS[k] * 2 for k in range(0, RANKS.index(base[0]) + 1))
            else:  # A2s+ -> A2s..AKs (fino alla carta sotto la prima)
                first = RANKS.index(base[0])
                hands.update(base[0] + RANKS[k] + base[2]
                             for k in range(first + 1, RANKS.index(base[1]) + 1))
        else:
            hands.add(tok)
    return hands


# Ogni spot: (posizione, azione precedente, [(azione canonica, range)...]).
# Come nel manuale, la prima azione che contiene la mano vince; '*' = il resto.
# Le sotto-azioni del manuale (es. "apro e pago" / "apro e passo") qui
# coincidono, perché il quiz chiede solo la prima decisione.
SPOTS_25BB = [
    ("BTN", "Unopened", [
        ("Min-Raise", "55+, A9s+, KQs, ATo+"),
        ("Min-Raise", "22-44, A2s-A8s, K4s-KJs, Q5s+, J6s+, T6s+, 96s+, 86s+, 75s+, 65s, 54s, "
                      "A4o-A9o, K9o+, Q9o+, J9o+, T9o, 98o"),
        ("Fold", "*"),
    ]),
    ("SB", "BTN Fold", [
        ("Raise", "QQ+, 66-99, A9s+, KQs, ATo-AJo"),
        ("Raise", "K2s-K7s, Q2s-Q6s, J6s, T6s, 96s, 86s, 75s+, 64s+, 53s+, 43s, A2o-A6o, 87o, 76o, 65o"),
        ("Limp", "TT-JJ, 22-55, A2s-A5s, AQo+"),
        ("Limp", "A6s-A8s, K8s-KJs, Q7s+, J7s+, T7s+, 97s+, 87s, A7o-A9o, K9o+, Q9o+, J9o+, T9o, 98o"),
        ("Limp", "J2s-J5s, T4s-T5s, 94s-95s, 84s-85s, 74s, 63s, 52s, 42s, 32s, K5o-K8o, Q7o-Q8o, "
                 "J7o-J8o, T7o-T8o, 97o, 86o"),
        ("Fold", "*"),
    ]),
    ("BB", "BTN Min-Raise, SB Fold", [
        ("Raise", "QQ+"),
        ("Raise", "K5o-K6o"),
        ("All-in", "22-JJ, A5s+, KQs, QTs+, J9s+, T9s, 98s, 87s, 76s, A6o+"),
        ("Call", "A2s-A4s, K2s-KJs, Q2s-Q9s, J2s-J8s, T2s-T8s, 92s-97s, 82s-86s, 72s-75s, 62s+, "
                 "52s+, 42s+, 32s, A2o-A5o, K7o+, Q7o+, J7o+, T7o+, 97o+, 86o+, 75o+, 64o+, 54o"),
        ("Fold", "*"),
    ]),
    ("BB", "BTN Fold, SB Raise", [
        ("Raise", "TT+, ATs+"),
        ("Raise", "K2o-K3o, Q3o"),
        ("All-in", "22-99, A8o+"),
        ("Call", "A2s-A9s, K2s+, Q2s+, J2s+, T2s+, 92s+, 82s+, 72s+, 62s+, 52s+, 42s+, 32s, "
                 "A2o-A7o, K4o+, Q4o+, J7o+, T7o+, 97o+, 86o+, 75o+, 64o+, 54o"),
        ("Fold", "*"),
    ]),
    ("BB", "BTN Limp, SB Fold", [
        ("Raise", "TT+, A9s+, KQs, AQo+"),
        ("Raise", "K9o+, QTo+, JTo"),
        ("All-in", "22-99, A2s-A8s, 98s, 87s, 76s, 65s, 54s, A2o-AJo"),
        ("Check", "*"),
    ]),
]


def build_rows(depth: float = 25) -> list[dict]:
    rows = []
    for pos, pre, actions in SPOTS_25BB:
        assigned: dict[str, str] = {}
        for action, notation in actions:
            for h in expand(notation):
                assigned.setdefault(h, action)  # la prima azione vince
        for h in all_hands():
            rows.append(dict(bb_depth=depth, hero_position=pos, pre_action=pre,
                             hand=h, best_action=assigned[h], ev=""))
    return rows


def write_csv(path: Path) -> int:
    rows = build_rows()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(db.REQUIRED_COLUMNS))
        w.writeheader()
        w.writerows(rows)
    return len(rows)


SAMPLE_CSV = Path(__file__).resolve().parent / "data" / "gto_ranges_esempio.csv"


def ensure_seeded(conn) -> None:
    """Se il database è vuoto, lo riempie con i range di esempio (usato dall'app al primo avvio)."""
    if db.count_ranges(conn) == 0:
        if not SAMPLE_CSV.exists():
            write_csv(SAMPLE_CSV)
        db.import_csv_file(conn, SAMPLE_CSV)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--load", action="store_true", help="importa anche nel database")
    args = ap.parse_args()
    n = write_csv(SAMPLE_CSV)
    print(f"Scritte {n} righe in {SAMPLE_CSV}")
    if args.load:
        conn = db.get_connection()
        db.init_db(conn)
        print(f"Importate {db.import_csv_file(conn, SAMPLE_CSV)} righe")
