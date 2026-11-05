"""
Quiz GTO Spin & Go — MVP Streamlit, pensato per il browser di uno smartphone Android.

Avvio (dalla cartella quiz_gto/, così Streamlit legge .streamlit/config.toml):
    pip install -r requirements.txt
    streamlit run app.py --server.address 0.0.0.0
Poi dal telefono, sulla stessa rete Wi-Fi: http://<ip-del-pc>:8501

Struttura del file:
  1. Configurazione pagina + CSS mobile-first (STEP 2)
  2. Accesso al database (cache di Streamlit)
  3. Stato della sessione e logica del quiz (STEP 3)
  4. Componenti grafici (intestazione, carte, griglia del range)
  5. Schermata del quiz (st.fragment: si aggiorna solo lei, non la pagina)
  6. Barra laterale: filtri, statistiche, importazione CSV
"""

from __future__ import annotations

import random
import uuid

import pandas as pd
import streamlit as st

import db
import seed_data

# ═══════════════════════════════════════════════════════════════════════════
# 1. CONFIGURAZIONE PAGINA E CSS
# ═══════════════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="Quiz GTO Spin & Go",
    page_icon="♠",
    layout="centered",
    initial_sidebar_state="collapsed",  # sul telefono la barra laterale parte chiusa
)

# Colore di ogni azione: lo stesso per bottone, griglia del range ed esito.
ACTION_COLORS = {
    "Fold":      "#4B5563",  # grigio
    "Check":     "#4B5563",
    "Limp":      "#B7791F",  # ocra
    "Call":      "#2F855A",  # verde
    "Min-Raise": "#C53030",  # rosso
    "Raise":     "#C53030",
    "All-in":    "#6B46C1",  # viola
}

# Altezza di un bottone d'azione in px: serve anche per calcolare lo spazio
# da lasciare in fondo alla pagina sotto la barra fissa.
BTN_H = 58
BTN_GAP = 8

CSS = f"""
<style>
/* ---- Tema scuro forzato (anche se il telefono è in modalità chiara) ---- */
:root {{
  --bg: #0B0F14; --surface: #151B23; --surface-2: #1E2630;
  --text: #F3F4F6; --muted: #9CA3AF; --line: #2A3441;
  --ok: #22C55E; --ko: #EF4444; --accent: #FACC15;
}}
html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stMain"] {{
  background: var(--bg) !important; color: var(--text) !important;
}}
[data-testid="stSidebar"] {{ background: var(--surface) !important; }}

/* ---- Margini a zero: tutta la larghezza del telefono ---- */
.block-container, [data-testid="stMainBlockContainer"] {{
  padding: 2.6rem 0.6rem 0 0.6rem !important;   /* in alto resta il posto per il ☰ della barra laterale */
  max-width: 520px !important;
}}
[data-testid="stVerticalBlock"] {{ gap: 0.5rem; }}

/* ---- Via il superfluo di Streamlit (menu, decorazione, footer) ---- */
#MainMenu, footer, [data-testid="stToolbar"], [data-testid="stDecoration"],
[data-testid="stStatusWidget"] {{ display: none !important; }}
header[data-testid="stHeader"] {{ background: transparent !important; height: 2.4rem; }}

/* ---- Intestazione dello spot: stack, posizione, azione precedente ---- */
.spot-head {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }}
.spot-box {{
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
  padding: 8px 10px; text-align: center;
}}
.spot-box .lbl {{ font-size: 0.72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
.spot-box .val {{ font-size: 2rem; font-weight: 800; line-height: 1.1; color: var(--text); }}
.spot-box.wide {{ grid-column: 1 / -1; }}
.spot-box.wide .val {{ font-size: 1.35rem; color: var(--accent); }}

/* ---- Punteggio ---- */
.score {{ margin-top: 4px; display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--muted);
          padding: 0 4px; font-variant-numeric: tabular-nums; }}
.score b.ok {{ color: var(--ok); }} .score b.ko {{ color: var(--ko); }}

/* ---- Carte (mazzo a 4 colori: ♠ nero, ♥ rosso, ♦ blu, ♣ verde) ---- */
.cards {{ display: flex; justify-content: center; gap: 12px; margin: 10px 0 4px; }}
.card {{
  width: 92px; height: 128px; border-radius: 12px; background: #FAFAFA;
  box-shadow: 0 6px 18px rgba(0,0,0,.5); display: flex; flex-direction: column;
  align-items: center; justify-content: center; font-weight: 800; user-select: none;
}}
.card .r {{ font-size: 3.2rem; line-height: 1; }}
.card .s {{ font-size: 2.4rem; line-height: 1; }}
.card.s-s {{ color: #111827; }} .card.s-h {{ color: #DC2626; }}
.card.s-d {{ color: #2563EB; }} .card.s-c {{ color: #15803D; }}
.hand-name {{ text-align: center; color: var(--muted); font-size: 1rem; letter-spacing: .05em; }}

/* ---- Esito della risposta ---- */
.flash {{ border-radius: 10px; padding: 6px 10px; font-size: 0.95rem; text-align: center; }}
.flash.ok {{ background: rgba(34,197,94,.15); color: var(--ok); border: 1px solid rgba(34,197,94,.4); }}
.verdict {{ border-radius: 12px; padding: 10px 12px; background: rgba(239,68,68,.12);
           border: 1px solid rgba(239,68,68,.45); text-align: center; }}
.verdict .t {{ color: var(--ko); font-weight: 800; font-size: 1.2rem; }}
.verdict .d {{ font-size: 1.05rem; margin-top: 2px; }}
.pill {{ display: inline-block; padding: 1px 10px; border-radius: 999px; color: #fff; font-weight: 700; }}

/* ---- Griglia 13x13 del range (mostrata dopo un errore) ---- */
.grid {{ display: grid; grid-template-columns: repeat(13, 1fr); gap: 1px; margin-top: 10px; }}
.grid div {{ font-size: 0.56rem; text-align: center; padding: 4px 0; color: #fff; border-radius: 2px; }}
.grid div.me {{ outline: 2px solid var(--accent); outline-offset: -1px; font-weight: 800; }}
.legend {{ display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.75rem; margin-top: 6px; color: var(--muted); }}
.legend span i {{ display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }}

/* ---- Barra delle azioni fissa in basso (zona del pollice) ---- */
.st-key-barra_azioni {{
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 999;
  background: linear-gradient(to top, var(--bg) 85%, rgba(11,15,20,0));
  padding: 14px 10px calc(10px + env(safe-area-inset-bottom)) 10px;
  gap: {BTN_GAP}px !important;
}}
.st-key-barra_azioni > div {{ max-width: 520px; margin: 0 auto; width: 100%; }}
.st-key-barra_azioni button {{
  width: 100% !important; height: {BTN_H}px; min-height: {BTN_H}px;
  border-radius: 14px; border: none !important; color: #fff !important;
  font-size: 1.25rem !important; font-weight: 800; letter-spacing: .03em;
  touch-action: manipulation;          /* niente ritardo da doppio tap su Android */
  -webkit-tap-highlight-color: transparent;
}}
.st-key-barra_azioni button p {{ font-size: 1.25rem !important; font-weight: 800; }}
.st-key-barra_azioni button:active {{ filter: brightness(1.25); transform: scale(.99); }}
{"".join(f".st-key-act_{a.replace('-', '_')} button {{ background: {c} !important; }}" for a, c in ACTION_COLORS.items())}
.st-key-next button {{ background: #2563EB !important; }}
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════
# 2. DATABASE
# ═══════════════════════════════════════════════════════════════════════════
@st.cache_resource
def get_db():
    """Una sola connessione per processo; al primo avvio crea lo schema e carica i dati di esempio."""
    conn = db.get_connection()
    db.init_db(conn)
    seed_data.ensure_seeded(conn)
    return conn


conn = get_db()


# ═══════════════════════════════════════════════════════════════════════════
# 3. STATO DELLA SESSIONE E LOGICA DEL QUIZ
# ═══════════════════════════════════════════════════════════════════════════
SUITS = "shdc"
SUIT_SYMBOL = {"s": "♠", "h": "♥", "d": "♦", "c": "♣"}


def deal_cards(hand: str) -> list[tuple[str, str]]:
    """Dalla notazione astratta (AKs, AKo, 77) a due carte concrete con semi casuali."""
    r1, r2 = hand[0], hand[1]
    if len(hand) == 3 and hand[2] == "s":
        s = random.choice(SUITS)
        return [(r1, s), (r2, s)]
    s1, s2 = random.sample(SUITS, 2)  # coppie e offsuit: due semi diversi
    return [(r1, s1), (r2, s2)]


def init_state() -> None:
    """Valori iniziali di st.session_state: sopravvivono a ogni rerun finché la scheda resta aperta."""
    defaults = {
        "session_id": uuid.uuid4().hex,
        "spot": None,          # dict con la riga di gto_ranges in gioco
        "cards": [],           # [(rango, seme), (rango, seme)]
        "actions": [],         # bottoni da mostrare per questo nodo
        "phase": "ask",        # 'ask' = attendo la risposta, 'review' = mostro l'errore
        "last": None,          # esito dell'ultima risposta (per il banner)
        "correct": 0,
        "wrong": 0,
        "streak": 0,
        "best_streak": 0,
        "f_depths": [],
        "f_positions": [],
        "f_mistakes": False,
    }
    for k, v in defaults.items():
        st.session_state.setdefault(k, v)


def next_spot() -> None:
    """Pesca uno spot casuale dal database secondo i filtri e prepara carte e bottoni."""
    ss = st.session_state
    prev_id = ss.spot["id"] if ss.spot else None
    row = db.random_spot(conn, ss.f_depths, ss.f_positions, ss.f_mistakes, exclude_id=prev_id)
    ss.phase = "ask"
    if row is None:
        ss.spot, ss.cards, ss.actions = None, [], []
        return
    ss.spot = dict(row)
    ss.cards = deal_cards(row["hand"])
    ss.actions = db.actions_for_spot(conn, row["bb_depth"], row["hero_position"], row["pre_action"])


def on_answer(action: str) -> None:
    """
    Callback dei bottoni d'azione. Gira PRIMA del rerun, quindi il rerun
    mostra già il risultato: un solo tocco, nessun doppio aggiornamento.
    """
    ss = st.session_state
    spot = ss.spot
    if spot is None or ss.phase != "ask":
        return  # doppio tocco durante il rerun: ignorato
    ok = db.record_answer(conn, ss.session_id, spot, action)
    ss.last = {"ok": ok, "hand": spot["hand"], "user": action,
               "best": spot["best_action"], "ev": spot["ev"]}
    if ok:
        ss.correct += 1
        ss.streak += 1
        ss.best_streak = max(ss.best_streak, ss.streak)
        next_spot()             # risposta giusta: si passa subito alla mano dopo
    else:
        ss.wrong += 1
        ss.streak = 0
        ss.phase = "review"     # risposta sbagliata: ci si ferma a guardare il range


def on_filters_change() -> None:
    """Cambiare i filtri scarta la mano in corso e ne pesca una coerente."""
    st.session_state.last = None
    next_spot()


def reset_session_score() -> None:
    ss = st.session_state
    ss.correct = ss.wrong = ss.streak = ss.best_streak = 0
    ss.last = None


init_state()
if st.session_state.spot is None and st.session_state.phase == "ask":
    next_spot()


# ═══════════════════════════════════════════════════════════════════════════
# 4. COMPONENTI GRAFICI (HTML generato)
# ═══════════════════════════════════════════════════════════════════════════
def fmt_depth(x: float) -> str:
    return f"{x:g}"


def html_header(spot: dict) -> str:
    return f"""
    <div class="spot-head">
      <div class="spot-box"><div class="lbl">Stack effettivo</div><div class="val">{fmt_depth(spot['bb_depth'])} BB</div></div>
      <div class="spot-box"><div class="lbl">Posizione</div><div class="val">{spot['hero_position']}</div></div>
      <div class="spot-box wide"><div class="lbl">Azione precedente</div><div class="val">{spot['pre_action']}</div></div>
    </div>"""


def html_score() -> str:
    ss = st.session_state
    tot = ss.correct + ss.wrong
    pct = f"{100 * ss.correct / tot:.0f}%" if tot else "–"
    return (f'<div class="score"><span>✓ <b class="ok">{ss.correct}</b> &nbsp; ✗ <b class="ko">{ss.wrong}</b>'
            f' &nbsp; {pct}</span><span>🔥 {ss.streak} (max {ss.best_streak})</span></div>')


def html_cards(cards: list[tuple[str, str]], hand: str) -> str:
    def one(r, s):
        return f'<div class="card s-{s}"><div class="r">{"10" if r == "T" else r}</div><div class="s">{SUIT_SYMBOL[s]}</div></div>'
    return f'<div class="cards">{"".join(one(r, s) for r, s in cards)}</div><div class="hand-name">{hand}</div>'


def pill(action: str) -> str:
    return f'<span class="pill" style="background:{ACTION_COLORS.get(action, "#555")}">{action}</span>'


def html_ev(ev) -> str:
    return f" · EV {ev:+.2f} bb" if ev is not None else ""


def html_range_grid(spot: dict) -> str:
    """Griglia 13x13 del nodo: ogni casella colorata con l'azione GTO, la mano in gioco evidenziata."""
    rows = conn.execute(
        "SELECT hand, best_action FROM gto_ranges WHERE bb_depth=? AND hero_position=? AND pre_action=?",
        (spot["bb_depth"], spot["hero_position"], spot["pre_action"])).fetchall()
    strategy = {r["hand"]: r["best_action"] for r in rows}
    ranks = seed_data.RANKS
    cells = []
    for i, a in enumerate(ranks):
        for j, b in enumerate(ranks):
            # sopra la diagonale suited, sotto offsuit, sulla diagonale le coppie
            h = a + b if i == j else (a + b + "s" if i < j else b + a + "o")
            act = strategy.get(h)
            color = ACTION_COLORS.get(act, "#1F2937")
            me = " me" if h == spot["hand"] else ""
            cells.append(f'<div class="{me.strip()}" style="background:{color}">{h}</div>')
    used = [a for a in db.CANONICAL_ACTIONS if a in set(strategy.values())]
    legend = "".join(f'<span><i style="background:{ACTION_COLORS[a]}"></i>{a}</span>' for a in used)
    return f'<div class="grid">{"".join(cells)}</div><div class="legend">{legend}</div>'


# ═══════════════════════════════════════════════════════════════════════════
# 5. SCHERMATA DEL QUIZ
# ═══════════════════════════════════════════════════════════════════════════
@st.fragment
def quiz_screen() -> None:
    """
    st.fragment: i bottoni qui dentro rieseguono SOLO questa funzione,
    non tutto lo script né la barra laterale. Lo stato vive in session_state.
    """
    ss = st.session_state
    spot = ss.spot

    if spot is None:
        st.warning("Nessuna mano disponibile con questi filtri"
                   + (" (non hai ancora mani sbagliate da ripassare)." if ss.f_mistakes else "."))
        return

    # Banner con l'esito della risposta precedente quando era giusta.
    last = ss.last
    if ss.phase == "ask" and last and last["ok"]:
        st.markdown(f'<div class="flash ok">✓ Giusto: {last["hand"]} → {last["best"]}{html_ev(last["ev"])}</div>',
                    unsafe_allow_html=True)

    st.markdown(html_header(spot), unsafe_allow_html=True)
    st.markdown(html_score(), unsafe_allow_html=True)
    st.markdown(html_cards(ss.cards, spot["hand"]), unsafe_allow_html=True)

    if ss.phase == "review":
        st.markdown(
            f'<div class="verdict"><div class="t">✗ Sbagliato</div>'
            f'<div class="d">Hai scelto {pill(last["user"])} · GTO: {pill(last["best"])}{html_ev(last["ev"])}</div></div>',
            unsafe_allow_html=True)
        st.markdown(html_range_grid(spot), unsafe_allow_html=True)

    # Spazio vuoto in fondo, alto quanto la barra fissa, così niente resta coperto.
    n_buttons = len(ss.actions) if ss.phase == "ask" else 1
    spacer = n_buttons * (BTN_H + BTN_GAP) + 40
    st.markdown(f'<div style="height:{spacer}px"></div>', unsafe_allow_html=True)

    # Barra fissa in basso: il CSS la aggancia tramite la classe .st-key-barra_azioni
    with st.container(key="barra_azioni"):
        if ss.phase == "ask":
            for action in ss.actions:
                st.button(action, key=f"act_{action.replace('-', '_')}",
                          on_click=on_answer, args=(action,), width="stretch")
        else:
            st.button("Prossima mano ➜", key="next", on_click=next_spot, width="stretch")


quiz_screen()


# ═══════════════════════════════════════════════════════════════════════════
# 6. BARRA LATERALE: FILTRI, STATISTICHE, IMPORTAZIONE
# ═══════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.header("⚙️ Allenamento")
    st.multiselect("Stack (BB)", db.distinct_values(conn, "bb_depth"), key="f_depths",
                   format_func=fmt_depth, on_change=on_filters_change, placeholder="Tutti")
    st.multiselect("Posizione", db.distinct_values(conn, "hero_position"), key="f_positions",
                   on_change=on_filters_change, placeholder="Tutte")
    st.toggle("Ripassa solo le mani sbagliate", key="f_mistakes", on_change=on_filters_change)
    st.button("Azzera punteggio della sessione", on_click=reset_session_score, width="stretch")

    st.divider()
    st.header("📊 Statistiche")
    by_spot = db.stats_by_spot(conn)
    if by_spot:
        df = pd.DataFrame([dict(r) for r in by_spot])
        df["spot"] = df["bb_depth"].map(fmt_depth) + "bb " + df["hero_position"] + " · " + df["pre_action"]
        st.caption("Precisione per spot (dal peggiore)")
        st.dataframe(df[["spot", "risposte", "precisione"]], hide_index=True, width="stretch")
        mistakes = db.top_mistakes(conn)
        if mistakes:
            dm = pd.DataFrame([dict(r) for r in mistakes])
            dm["spot"] = dm["bb_depth"].map(fmt_depth) + "bb " + dm["hero_position"] + " · " + dm["pre_action"]
            st.caption("Mani sbagliate più spesso")
            st.dataframe(dm[["hand", "spot", "correct_action", "errori"]], hide_index=True,
                         width="stretch")
        if st.button("Cancella tutte le statistiche", width="stretch"):
            db.reset_stats(conn)
            st.rerun()
    else:
        st.caption("Ancora nessuna risposta registrata.")

    st.divider()
    st.header("📥 Importa range")
    st.caption("CSV con colonne: bb_depth, hero_position, pre_action, hand, best_action, ev")
    up = st.file_uploader("File CSV", type=["csv", "txt"], label_visibility="collapsed")
    replace = st.checkbox("Sostituisci i range esistenti", value=True)
    if up is not None and st.button("Importa", type="primary", width="stretch"):
        try:
            n = db.import_csv_text(conn, up.getvalue().decode("utf-8-sig"), replace=replace)
        except ValueError as exc:
            st.error(f"Importazione fallita: {exc}")
        else:
            st.success(f"Importate {n} righe.")
            on_filters_change()
            st.rerun()
    st.caption(f"Righe in gto_ranges: {db.count_ranges(conn)}")
