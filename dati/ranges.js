/* ╔═══ BLOCCO 2 — TABELLE DEI RANGE ══════════════════════════╗
   Notazione: AA · AKs · AKo · 22+ · A2s+ · 22-44 · K4s-KJs · *
   Prima azione elencata vince. Il fold si scrive con *
   ╚═══════════════════════════════════════════════════════════╝ */
const C={verde:"#146D4D",rosso:"#8A171C",blu:"#1173AD",oliva:"#57521F",viola:"#462F7E",grigio:"#C9CCC4"};

const RANGES=[
{id:"btn-apertura",tavolo:3,bb:25,
 titolo:{it:"Apertura da bottone",en:"Button opening range"},
 meta:{it:"Piatto non aperto · min-rilancio a 2 bui",en:"Unopened pot · min-raise to 2bb"},
 azioni:[
  {k:"RC",c:C.verde,n:{it:"Apro e pago l'all in",en:"Min-raise / call"},m:"55+, A9s+, KQs, ATo+"},
  {k:"RF",c:C.rosso,n:{it:"Apro e passo all'all in",en:"Min-raise / fold"},m:"22-44, A2s-A8s, K4s-KJs, Q5s+, J6s+, T6s+, 96s+, 86s+, 75s+, 65s, 54s, A4o-A9o, K9o+, Q9o+, J9o+, T9o, 98o"},
  {k:"F",c:C.grigio,n:{it:"Passo",en:"Fold"},m:"*"}],
 nota:{it:"Si apre sempre della stessa misura, con qualsiasi mano. La parte verde è il 25,8% dell'apertura: da lì esce il 74% di fold contro un all in.",en:""}},

{id:"sb-apertura",tavolo:3,bb:25,
 titolo:{it:"Apertura da piccolo buio",en:"Small blind opening range"},
 meta:{it:"Bottone ha passato · rilancio 2,5 bui oppure limp",en:"Folded to SB · 2.5x raise or limp"},
 azioni:[
  {k:"RC",c:C.verde,n:{it:"Rilancio 2,5x e continuo",en:"2.5x raise / continue"},m:"QQ+, 66-99, A9s+, KQs, ATo-AJo"},
  {k:"RF",c:C.rosso,n:{it:"Rilancio 2,5x e passo",en:"2.5x raise / fold"},m:"K2s-K7s, Q2s-Q6s, J6s, T6s, 96s, 86s, 75s+, 64s+, 53s+, 43s, A2o-A6o, 87o, 76o, 65o"},
  {k:"LS",c:C.viola,n:{it:"Limp e all in",en:"Limp / shove"},m:"TT-JJ, 22-55, A2s-A5s, AQo+"},
  {k:"LC",c:C.oliva,n:{it:"Limp e pago",en:"Limp / call"},m:"A6s-A8s, K8s-KJs, Q7s+, J7s+, T7s+, 97s+, 87s, A7o-A9o, K9o+, Q9o+, J9o+, T9o, 98o"},
  {k:"LF",c:C.blu,n:{it:"Limp e passo",en:"Limp / fold"},m:"J2s-J5s, T4s-T5s, 94s-95s, 84s-85s, 74s, 63s, 52s, 42s, 32s, K5o-K8o, Q7o-Q8o, J7o-J8o, T7o-T8o, 97o, 86o"},
  {k:"F",c:C.grigio,n:{it:"Passo",en:"Fold"},m:"*"}],
 nota:{it:"Qui compare il limp, che da bottone non esisteva. Le mani forti si dividono: AA KK QQ e 99-66 rilanciano, JJ TT e le coppie basse limpano per poi spingere.",en:""}},

{id:"bb-vs-btn",tavolo:3,bb:25,
 titolo:{it:"Difesa del grande buio contro il bottone",en:"BB defence vs button"},
 meta:{it:"Il bottone ha aperto con un min-rilancio",en:"Facing a button min-raise"},
 azioni:[
  {k:"3C",c:C.verde,n:{it:"Rilancio 2,5x e pago",en:"2.5x 3-bet / call"},m:"QQ+"},
  {k:"3F",c:C.rosso,n:{it:"Rilancio 2,5x e passo",en:"2.5x 3-bet / fold"},m:"K5o-K6o"},
  {k:"AI",c:C.blu,n:{it:"All in",en:"All-in 3-bet"},m:"22-JJ, A5s+, KQs, QTs+, J9s+, T9s, 98s, 87s, 76s, A6o+"},
  {k:"CA",c:C.oliva,n:{it:"Pago",en:"Call"},m:"A2s-A4s, K2s-KJs, Q2s-Q9s, J2s-J8s, T2s-T8s, 92s-97s, 82s-86s, 72s-75s, 62s+, 52s+, 42s+, 32s, A2o-A5o, K7o+, Q7o+, J7o+, T7o+, 97o+, 86o+, 75o+, 64o+, 54o"},
  {k:"F",c:C.grigio,n:{it:"Passo",en:"Fold"},m:"*"}],
 nota:{it:"Il rilancio piccolo esiste quasi solo come bluff ed è composto da due sole mani, K5o e K6o. Servono a impedire che rilanciare piccolo voglia dire sempre mano fortissima.",en:""}},

{id:"bb-vs-sb",tavolo:3,bb:25,
 titolo:{it:"Difesa del grande buio contro il piccolo buio",en:"BB defence vs small blind"},
 meta:{it:"Il piccolo buio ha aperto con un rilancio",en:"Facing a small blind raise"},
 azioni:[
  {k:"3C",c:C.verde,n:{it:"Rilancio 2,5x e pago",en:"2.5x 3-bet / call"},m:"TT+, ATs+"},
  {k:"3F",c:C.rosso,n:{it:"Rilancio 2,5x e passo",en:"2.5x 3-bet / fold"},m:"K2o-K3o, Q3o"},
  {k:"AI",c:C.blu,n:{it:"All in",en:"All-in 3-bet"},m:"22-99, A8o+"},
  {k:"CA",c:C.oliva,n:{it:"Pago",en:"Call"},m:"A2s-A9s, K2s+, Q2s+, J2s+, T2s+, 92s+, 82s+, 72s+, 62s+, 52s+, 42s+, 32s, A2o-A7o, K4o+, Q4o+, J7o+, T7o+, 97o+, 86o+, 75o+, 64o+, 54o"},
  {k:"F",c:C.grigio,n:{it:"Passo",en:"Fold"},m:"*"}],
 nota:{it:"Si difende il 72,9%, contro il 66,5% di quando apre il bottone. La differenza è tutta nel pagare: qui resti in gioco con ogni mano dello stesso seme, nessuna esclusa.",en:""}},

{id:"bb-vs-limp",tavolo:3,bb:25,
 titolo:{it:"Grande buio contro il limp del bottone",en:"BB vs button limp"},
 meta:{it:"Il bottone ha solo pagato · isolamento a 4 bui",en:"Button limped · 4bb isolation"},
 azioni:[
  {k:"IC",c:C.verde,n:{it:"Isolo a 4 bui e pago",en:"Iso 4bb / call"},m:"TT+, A9s+, KQs, AQo+"},
  {k:"IF",c:C.rosso,n:{it:"Isolo a 4 bui e passo",en:"Iso 4bb / fold"},m:"K9o+, QTo+, JTo"},
  {k:"AI",c:C.blu,n:{it:"All in",en:"Raise all-in"},m:"22-99, A2s-A8s, 98s, 87s, 76s, 65s, 54s, A2o-AJo"},
  {k:"CK",c:C.oliva,n:{it:"Check",en:"Check"},m:"*"}],
 nota:{it:"Qui non esiste il fold: sei già nel piatto, quindi l'alternativa all'attacco è vedere il flop gratis. Il 16,3% di all in è la punizione per chi limpa con stack corti.",en:""}}
];
