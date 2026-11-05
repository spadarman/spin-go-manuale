# Quiz GTO Spin & Go (Streamlit)

MVP di allenamento preflop per Spin & Go, da usare dal browser del telefono Android.

## Avvio

```bash
cd quiz_gto
pip install -r requirements.txt
streamlit run app.py --server.address 0.0.0.0
```

Dal telefono, sulla stessa rete Wi-Fi del PC: `http://<ip-del-pc>:8501`.
Al primo avvio il database `data/gto.sqlite3` viene creato e riempito con i range a 25 bui del manuale.

## File

| File | Cosa fa |
|---|---|
| `db.py` | STEP 1: schema SQLite (`gto_ranges`, `user_stats`), importazione CSV, query del quiz. Si usa anche da riga di comando. |
| `seed_data.py` | Genera `data/gto_ranges_esempio.csv` dai range del manuale (`dati/ranges.js`, 5 spot a 25 bui, senza EV). |
| `app.py` | STEP 2 e 3: interfaccia mobile-first, logica del quiz, `st.session_state`, statistiche, importazione CSV. |
| `.streamlit/config.toml` | Tema scuro dei widget nativi. |

## Importare i propri range

Dalla barra laterale (☰ → Importa range) oppure da terminale:

```bash
python db.py --import mio_export.csv            # sostituisce i range
python db.py --import altro.csv --append        # aggiunge
```

Formato: una riga per mano, separatore `,` o `;`.

```csv
bb_depth,hero_position,pre_action,hand,best_action,ev
25,BTN,Unopened,AKs,Min-Raise,1.42
25,BB,"BTN Min-Raise, SB Fold",72o,Fold,0
```

- `hand`: notazione a 169 mani (`AA`, `AKs`, `AKo`); l'ordine delle carte e le maiuscole vengono normalizzati.
- `best_action`: `Fold`, `Check`, `Limp`, `Call`, `Min-Raise`, `Raise`, `All-in` (accetta anche `shove`, `jam`, `3bet`, `iso`...).
- `ev`: facoltativo; se presente viene mostrato dopo la risposta.

## Come funziona il quiz

- Lo spot viene estratto a caso con `ORDER BY RANDOM()` rispettando i filtri (stack, posizione, solo mani sbagliate).
- I bottoni sono le azioni legali del contesto (piatto non aperto: Fold/Limp/Min-Raise/All-in; contro rilancio: Fold/Call/Raise/All-in; BB dopo limp: Check/Raise/All-in), non solo quelle usate dal solver, così il loro numero non suggerisce la risposta.
- Risposta giusta: banner verde e mano successiva subito. Risposta sbagliata: soluzione e griglia 13×13 del range con la mano evidenziata, poi "Prossima mano".
- Ogni risposta viene salvata in `user_stats`; la schermata del quiz è un `st.fragment`, quindi a ogni tocco si aggiorna solo quella parte.

## Limiti dell'MVP

- Una sola azione "migliore" per mano: le strategie miste vanno arrotondate all'azione più frequente.
- Mani estratte in modo uniforme sulle 169 combinazioni astratte, non pesate per numero di combo.
- Database locale per un solo utente.
