/* ╔═══ BLOCCO 3 — LEZIONI ════════════════════════════════════╗
   ## titolo · **grassetto** · - elenco · > citazione
   [[range:id]] inserisce una tabella
   ╚═══════════════════════════════════════════════════════════╝ */
const LEZIONI=[
{id:"introduzione",capitolo:"Fondamenta",occhiello:"Lezione 0",bb:null,tavolo:3,
 titolo:"Che cos'è davvero uno Spin & Go",
 sommario:"Come funziona il formato, perché la ruota decide più di quanto sembri, e cosa aspettarsi onestamente dai risultati.",
 testo:`
Tre giocatori, un tavolo, pochi minuti. Ti iscrivi, il sistema aspetta di raccogliere tre partecipanti, e prima ancora che venga distribuita una carta una ruota gira e stabilisce il montepremi. Solo a quel punto comincia la partita.

Quella ruota non decide soltanto quanto si vince. Decide anche **con quante fiches si parte e quanto durano i livelli**, e quindi decide che tipo di poker giocherai nei prossimi minuti.

## Le tre partite dentro un formato solo

Dal novembre 2024 la struttura cambia con il moltiplicatore estratto:

- moltiplicatore **x2 e x3**, si parte con **300 fiches**, cioè 15 bui, e i livelli sono brevissimi
- dal **x4**, si parte con **400 fiches**, cioè 20 bui
- dal **x10** in su, si parte con **500 fiches**, cioè 25 bui, e i livelli sono più lunghi

Sono tre giochi diversi con lo stesso nome. A 25 bui esiste una vera fase iniziale: puoi aprire piccolo, vedere un flop, costruire un piatto su tre strade. A 15 bui quella fase praticamente non c'è, e dopo poche mani ogni decisione si riduce a spingere tutto o passare.

Conta anche perché la frequenza è squilibrata: i moltiplicatori bassi escono quasi sempre. Quindi la partita che giocherai più spesso è quella dove si ragiona meno e si calcola di più.

> Quasi tutto il materiale di strategia in circolazione, compreso quello da cui nasce questo manuale, è scritto per i 25 bui. È materiale buono, ma si applica alla minoranza delle tue partite. Tienilo a mente ogni volta che leggi una tabella.

## Chi viene pagato

Fino al x3 vince tutto il primo, gli altri due non prendono niente. Dal x10 in su il premio si distribuisce su tre posizioni.

Sembra un dettaglio contabile, non lo è. Quando vince tutto il primo, arrivare secondi vale esattamente quanto arrivare terzi: sopravvivere non ha valore, e le mani vanno giocate per massimizzare la vittoria. Quando pagano tre posizioni, sopravvivere comincia a valere qualcosa, ed è il territorio dell'ICM.

## Si comincia in tre e si finisce in due

Ogni Spin & Go che non finisce con una doppia eliminazione passa dal testa a testa. È metà del formato, non un epilogo. Un giocatore che conosce benissimo il gioco a tre e improvvisa a due sta buttando via buona parte del suo vantaggio.

## La parte scomoda

Va detta subito, perché tutto il resto dipende da questo.

Una fetta consistente del guadagno atteso di questo formato arriva da moltiplicatori che escono una volta ogni migliaia di partite. Significa che per lunghi tratti un giocatore **vincente sembra perdente**, e un giocatore perdente che becca uno spin fortunato sembra un fenomeno.

Poche centinaia di partite non dicono niente sul tuo livello. Nemmeno mille. Il saldo del mese non è una valutazione della tua bravura, è un campione troppo piccolo per dire qualsiasi cosa.

Questo ha due conseguenze pratiche, e sono entrambe scomode:

- **non cambiare strategia in base ai risultati recenti.** È esattamente il modo in cui si abbandona una strategia corretta nel momento peggiore. Si cambia per un ragionamento, non per un saldo.
- **serve una riserva molto più ampia** di quella che basterebbe in un formato normale, altrimenti non è la sfortuna a batterti, è il fatto che ogni mano pesa troppo e giochi male.

Se una di queste due cose non è in ordine, il resto del manuale serve a poco. Il gioco vale anche denaro vero, e la struttura a lotteria di questo formato lo rende più insidioso di altri sul piano dell'autocontrollo.

## Come è fatto questo manuale

Le lezioni indicano sempre la profondità a cui si riferiscono. Le tabelle dei range sono dati, non immagini: puoi cercarci dentro una mano singola e allenarti a memorizzarle. I termini tecnici sono sottolineati e cliccabili, e l'interruttore in alto a sinistra ti permette di leggerli in italiano o nel gergo inglese, che resta quello che troverai ovunque altrove.
`,
 fonte:"Struttura dei tornei verificata su fonti PokerStars aggiornate al 2025. La parte di strategia della serie nasce dal materiale di PokerStars School di Pete Clarke, ripreso in italiano da Andrea Borea su Assopoker. Testo interamente riscritto."},

{id:"apertura-bottone",capitolo:"Preflop",occhiello:"Lezione 1",bb:25,tavolo:3,
 titolo:"Apertura da bottone",
 sommario:"Perché si apre largo, perché sempre della stessa misura, e perché di fronte a un all in si passa quasi tre volte su quattro.",
 testo:`
Da bottone parti con due vantaggi insieme: non hai versato niente al buio, e dopo il flop parli sempre per ultimo. Sono le condizioni migliori del tavolo, e giustificano un range di apertura largo.

## Una sola misura, sempre

Si apre con un min-rilancio, quindi a 40 quando i bui sono 10/20. Sempre, con qualsiasi mano.

Il motivo non è il risparmio. È che cambiare misura a seconda della forza racconta all'avversario cosa hai, e con stack corti non te lo puoi permettere. C'è anche una ragione strutturale: se il grande buio paga, il piatto è 90 e restano 460 di stack effettivo. Quel rapporto lascia spazio a tre puntate, una per strada, e ti permette di costruire il piatto con calma invece di doverlo risolvere subito.

> È anche il motivo per cui in questa fase non si rallenta con le mani forti. Se hai tre puntate a disposizione non ti serve nascondere: ti serve riempire il piatto.

## Il range

[[range:btn-apertura]]

Il verde e il rosso insieme fanno il 38,8% delle mani. Largo, ma non qualunque cosa: la tentazione di aggiungere anche l'ultima spazzatura tipo 84s va resistita, perché quelle mani non hanno abbastanza potenziale per giocare un flop. Apri, ti pagano, e poi abbandoni regalando 40 alla volta.

Guarda dove passa il confine: K3s si butta, K4s si apre. Q4s si butta, Q5s si apre. Non sono soglie arbitrarie, sono il punto in cui la mano smette di poter reggere una strada successiva.

## Il conto che spaventa

Con questo range, di fronte a un all in, passerai il **74%** delle volte. Sembra una resa, e vale la pena vedere perché non lo è.

Immagina che il grande buio spinga con A7o. Quando passi, lui incassa 70: il tuo rilancio più i due bui. Se succede nel 74% dei casi, quella fetta vale +51,8.

Nel restante 26% tu paghi, e lo fai con la parte verde della tabella. Lì lui si ritrova con circa il 30% di equity in un piatto da 1010: recupera in media 303 fiches su 480 investite, quindi perde 177. Pesata per il 26%, fa −46.

Sommando, il suo all in resta appena positivo. Contro di te, però, guadagna molto meno di quanto crede, e questo vale solo perché quel 26% è composto da mani vere.

## Quando restringere

La tabella presuppone avversari nella media. Se dopo poche mani ti accorgi che al tavolo ci sono giocatori forti, oppure gente che spinge all in di continuo nei primi livelli, stringi. Succede spesso ai buy-in bassi e sui moltiplicatori piccoli.

La logica è semplice: il furto dei bui rende finché gli avversari passano. Quando non passano più, stai solo pagando per giocare piatti scomodi.

## Attenzione alla profondità

Tutto quanto sopra vale a 25 bui, cioè sui moltiplicatori x10 e oltre. A 15 bui il min-rilancio impegna una fetta troppo grande dello stack rispetto a quello che resta dietro, e l'impianto a tre puntate non regge. Quella situazione ha bisogno di tabelle sue, che non sono ancora in questo manuale.
`,
 fonte:"Tabella trascritta dalla griglia PokerStars School ripresa da Assopoker. Testo riscritto. La percentuale del 74% è ricalcolata sulle combinazioni, non copiata: torna."}
];
