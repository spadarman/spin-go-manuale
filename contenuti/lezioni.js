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
- moltiplicatore **x4 e x5**, si parte con **400 fiches**, cioè 20 bui
- dal **x10** in su, si parte con **500 fiches**, cioè 25 bui, e i livelli sono più lunghi

Sono tre giochi diversi con lo stesso nome. A 25 bui esiste una vera fase iniziale: puoi aprire piccolo, vedere un flop, costruire un piatto su tre strade. A 15 bui quella fase praticamente non c'è, e dopo poche mani ogni decisione si riduce a spingere tutto o passare.

Conta anche perché la frequenza è squilibrata. Su Sisal x2 e x3 escono 87 volte su cento, x4 e x5 circa undici, dal x10 in su una volta sola. Quindi la partita che giocherai più spesso è quella dove si ragiona meno e si calcola di più.

> Quasi tutto il materiale di strategia in circolazione, compreso quello da cui nasce questo manuale, è scritto per i 25 bui. È materiale buono, ma su Sisal si applica a circa una partita su cento. Tienilo a mente ogni volta che leggi una tabella.

## Chi viene pagato

Fino al x5 vince tutto il primo, gli altri due non prendono niente. Con il x10 viene pagato anche il secondo, dal x25 in su tutti e tre.

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
 fonte:"Struttura dei tornei verificata su fonti PokerStars aggiornate al 2025 e sulla pagina Spin & Go di Sisal (ottobre 2026). La parte di strategia della serie nasce dal materiale di PokerStars School di Pete Clarke, ripreso in italiano da Andrea Borea su Assopoker. Testo interamente riscritto."},

{id:"conti-sisal",capitolo:"Fondamenta",occhiello:"Lezione 0.1",bb:null,tavolo:3,
 titolo:"I conti: rake, soglia e profondità su Sisal",
 sommario:"Quanto paghi per sederti, quante partite devi vincere per non perdere, e quale partita giocherai davvero quasi sempre. Calcolato sui buy-in da 0,50 € e 5 €.",
 testo:`
Prima di qualsiasi tabella di mani conviene sapere tre numeri: quanto ti costa ogni partita, quale percentuale di vittorie ti serve per non perdere, e a che profondità si gioca davvero. Sono numeri che non dipendono da come giochi, ma decidono come leggere tutto il resto.

## Quanto paghi per sederti

Negli Spin & Go la rake non si paga mano per mano: è già dentro l'iscrizione. Una parte del buy-in va a Sisal, il resto forma il montepremi medio.

| Buy-in | Rake | A partita |
|---|---|---|
| **0,50 €** | 10% | 0,05 € |
| 1 € · 2 € | 9% | 0,09 € · 0,18 € |
| **5 €** | 9% | 0,45 € |
| 10 € | 8% | 0,80 € |
| 25 € e oltre | 7% | 1,75 € e oltre |

Sembra poco, ma si paga a ogni partita, e una partita dura pochi minuti. Mille partite da 5 € sono 450 € di commissioni. Il buy-in più basso è anche quello con la rake più alta in percentuale.

## La soglia: quante partite devi vincere

In tre giocatori, se nessuno è più bravo degli altri, ognuno vince una partita su tre: il 33,3%. Ma una parte del montepremi è andata alla sala, quindi vincere una volta su tre vuol dire perdere esattamente la rake. Il giocatore medio perde circa un buy-in ogni dieci partite.

Per coprire la rake devi vincere di più. La percentuale esatta che ti porta a zero si chiama pareggio, e si ricava dalla tabella dei premi:

| | 0,50 € | 5 € |
|---|---|---|
| Rake | 10% | 9% |
| **Vittorie per andare in pari** | **37,1%** | **36,7%** |
| Pari senza mai prendere un x25 o più | 37,5% | 37,1% |
| Vittorie per un ROI del 5% | 39,0% | 38,5% |

> La regola da tenere a mente: **tre partite vinte su otto**, cioè il 37,5%. Sotto, il saldo scende anche se giochi in modo decente. Sopra il 39% sei un giocatore vincente vero.

Ed ecco cosa succede al ROI a seconda di quanto spesso vinci:

| Vinci il | ROI a 0,50 € | ROI a 5 € |
|---|---|---|
| 33,3% · media | −10,1% | −9,1% |
| 35% | −5,5% | −4,5% |
| 36% | −2,9% | −1,8% |
| 37% | −0,2% | +0,9% |
| 38% | +2,4% | +3,6% |
| 39% | +5,1% | +6,2% |
| 40% | +7,8% | +8,9% |

Tra il 35% e il 39% ci sono quattro punti, e sembrano niente. Sono la differenza tra perdere il 5% di ogni iscrizione e guadagnarne il 5%. In un formato così veloce, con poche mani per partita, guadagnare quei punti è difficilissimo: un giocatore da 38% fisso è già molto forte.

## Il jackpot non è un piano

I moltiplicatori da x25 in su escono meno di una volta ogni mille partite. Nel conto valgono circa **un punto di ROI**: se non ne prendessi mai uno, la soglia salirebbe di quattro decimi, dal 37,1% al 37,5%.

È poco, ed è una buona notizia. Significa che su Sisal, a questi buy-in, il risultato dipende quasi tutto dalle partite normali. Devi essere in attivo senza mai contare sulla ruota. Quando arriva un moltiplicatore grosso è un regalo, non la parte del piano che mancava.

## La partita che giocherai davvero

Su Sisal la profondità di partenza dipende dal moltiplicatore, e i moltiplicatori bassi escono quasi sempre:

| Moltiplicatore | Fiches | Bui | Livelli | Quanto spesso |
|---|---|---|---|---|
| x2 · x3 | 300 | **15** | 1-2 minuti | **87,4%** |
| x4 · x5 | 400 | 20 | 2-3 minuti | 11,5% |
| x10 e oltre | 500 | 25 | 3-5 minuti | 1,1% |

Quasi nove partite su dieci cominciano a 15 bui, con livelli da uno o due minuti. Le tabelle a 25 bui di questo manuale, quelle della serie di Assopoker, valgono per **circa una partita su cento**.

Non vuol dire che siano inutili: insegnano a ragionare per range e posizione, e le idee si trasferiscono. Vuol dire che la priorità di studio è un'altra. Il gioco a 15 bui, quasi tutto push o fold, è il pezzo che pesa di più sui tuoi risultati e il primo da costruire.

## Quanto ci vuole per sapere se sei sopra la soglia

La percentuale di vittorie è facile da leggere, ma su pochi tornei mente. Questa è la forbice in cui sta il tuo valore vero, con il 95% di sicurezza, attorno a una percentuale misurata del 37%:

| Partite giocate | Il valore vero sta tra |
|---|---|
| 500 | 32,8% e 41,2% |
| 1.000 | 34,0% e 40,0% |
| 3.000 | 35,3% e 38,7% |
| 10.000 | 36,1% e 37,9% |

Con mille partite un 37% misurato è compatibile sia con un giocatore perdente sia con uno nettamente vincente. Per sapere davvero da che parte della soglia stai servono parecchie migliaia di partite. Fino a lì la percentuale indica una direzione, non un verdetto. Il saldo in euro, che in più subisce la ruota, dice ancora meno.

## Una nota sulla tabella di Sisal

La tabella ufficiale dei premi a 0,50 € indica 3 € al primo con il x5 e 2 € con il x3. Presi alla lettera, Sisal restituirebbe più di quanto incassa, quindi sono quasi certamente refusi. I valori coerenti con la rake del 10% sono 2,50 € e 1,50 €, ed è su questi che sono fatti i conti qui sopra. Se nel resoconto tornei vedi importi diversi, vale la pena controllare.
`,
 fonte:"Rake, premi, probabilità, stack e durata dei livelli dalla pagina Spin & Go di sisal.it, consultata il 26 ottobre 2026. Soglie, ROI e forbici calcolati sulla tabella dei premi, compresi i premi al secondo e terzo posto. Il metodo della percentuale di vittorie è quello dell'analisi di Arved Klöhn su PokerListings, rifatto con i numeri di Sisal."},

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

Tutto quanto sopra vale a 25 bui, cioè sui moltiplicatori x10 e oltre, che su Sisal escono circa una volta su cento. A 15 bui il min-rilancio impegna una fetta troppo grande dello stack rispetto a quello che resta dietro, e l'impianto a tre puntate non regge. Quella situazione ha bisogno di tabelle sue, che non sono ancora in questo manuale.
`,
 fonte:"Tabella trascritta dalla griglia PokerStars School ripresa da Assopoker. Testo riscritto. La percentuale del 74% è ricalcolata sulle combinazioni, non copiata: torna."}
];
