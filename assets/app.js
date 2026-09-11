/* ╔═══ BLOCCO 4 — MOTORE ═════════════════════════════════════╗ */
const RANK=[...'AKQJT98765432'], iR=r=>RANK.indexOf(r);
let LINGUA='it';
const glo=id=>GLOSSARIO.find(g=>g.id===id);
const L=o=>(o&&o[LINGUA])||(o&&o.it)||'';

const mano=(i,j)=>i===j?RANK[i]+RANK[i]:(i<j?RANK[i]+RANK[j]+'s':RANK[j]+RANK[i]+'o');
function tutte(){const m=[];for(let i=0;i<13;i++)for(let j=0;j<13;j++)m.push(mano(i,j));return m}
const peso=h=>h.length===2?6:(h.endsWith('s')?4:12);

function espandi(spec){
  const out=new Set();
  spec.split(',').map(s=>s.trim()).filter(Boolean).forEach(tok=>{
    if(tok==='*'){tutte().forEach(h=>out.add(h));return}
    if(tok.includes('-')){
      const [a,b]=tok.split('-').map(s=>s.trim());
      if(a.length===2&&b.length===2){
        let x=iR(a[0]),y=iR(b[0]); if(x>y)[x,y]=[y,x];
        for(let i=x;i<=y;i++)out.add(RANK[i]+RANK[i]);
      }else if(a.length===3&&b.length===3&&a[0]===b[0]&&a[2]===b[2]){
        let x=iR(a[1]),y=iR(b[1]); if(x>y)[x,y]=[y,x];
        for(let i=x;i<=y;i++)out.add(a[0]+RANK[i]+a[2]);
      }
      return;
    }
    const piu=tok.endsWith('+'), base=piu?tok.slice(0,-1):tok;
    if(base.length===2&&base[0]===base[1]){
      if(piu){for(let i=iR(base[0]);i>=0;i--)out.add(RANK[i]+RANK[i])}else out.add(base);
    }else if(base.length===3){
      const [a,b,s]=base;
      if(piu){for(let i=iR(b);i>iR(a);i--)out.add(a+RANK[i]+s)}else out.add(base);
    }
  });
  return out;
}
function mappa(r){const m={};r.azioni.forEach(a=>espandi(a.m).forEach(h=>{if(!(h in m))m[h]=a.k}));return m}
const chiaro=c=>c===C.grigio;

function disegna(r){
  const m=mappa(r), tot={};
  Object.entries(m).forEach(([h,k])=>tot[k]=(tot[k]||0)+peso(h));
  const box=document.createElement('div'); box.className='tabella';
  box.innerHTML=`<div class="testata"><div class="titolo">${L(r.titolo)}</div>
    <div class="meta">${r.tavolo} giocatori · ${r.bb} bui · ${L(r.meta)}</div></div>
    <div class="griglia"></div><div class="legenda"></div>
    ${r.nota&&L(r.nota)?`<p class="notaTab">${L(r.nota)}</p>`:''}
    <div class="barra"><input placeholder="Cerca: A7o" aria-label="Cerca una mano">
    <button class="bottone quizOn">Allenamento</button><span class="esito"></span></div>
    <div class="quiz" hidden></div>`;
  const grid=box.querySelector('.griglia');
  for(let i=0;i<13;i++)for(let j=0;j<13;j++){
    const h=mano(i,j), az=r.azioni.find(a=>a.k===m[h])||r.azioni[r.azioni.length-1];
    const c=document.createElement('div');
    c.className='cella'+(chiaro(az.c)?' chiaro':''); c.style.background=az.c;
    c.dataset.mano=h; c.textContent=h; c.title=h+' — '+L(az.n);
    grid.appendChild(c);
  }
  box.querySelector('.legenda').innerHTML=r.azioni.map(a=>{
    const p=((tot[a.k]||0)/1326*100).toFixed(1).replace('.',',');
    return `<span><i style="background:${a.c}"></i>${L(a.n)} <em>${p}%</em></span>`;
  }).join('');

  const inp=box.querySelector('input'), es=box.querySelector('.barra .esito');
  inp.addEventListener('input',()=>{
    const q=normalizza(inp.value);
    box.querySelectorAll('.cella').forEach(c=>{
      c.classList.remove('evidenzia');
      c.classList.toggle('spenta',!!q&&c.dataset.mano!==q);
    });
    if(!q){es.textContent='';return}
    const cel=box.querySelector('.cella[data-mano="'+q+'"]');
    if(cel){cel.classList.add('evidenzia');
      const az=r.azioni.find(a=>a.k===m[q])||r.azioni[r.azioni.length-1];
      es.className='esito'; es.textContent=q+' → '+L(az.n).toLowerCase();
    }else{es.className='esito';es.textContent='Mano non riconosciuta'}
  });

  const quiz=box.querySelector('.quiz'); let ok=0,tt=0;
  box.querySelector('.quizOn').addEventListener('click',e=>{
    const on=quiz.hidden; quiz.hidden=!on;
    e.target.classList.toggle('pieno',on);
    e.target.textContent=on?'Chiudi allenamento':'Allenamento';
    if(on)domanda();
  });
  function domanda(){
    const h=tutte()[Math.floor(Math.random()*169)];
    const giusta=m[h]||r.azioni[r.azioni.length-1].k;
    quiz.innerHTML=`<div class="mano">${h}</div><div class="contesto">${L(r.titolo)} · ${r.bb} bui</div>
      <div class="op"></div><div class="esito"></div><div class="punteggio">${tt?ok+' su '+tt:'&nbsp;'}</div>`;
    const op=quiz.querySelector('.op');
    r.azioni.forEach(a=>{
      const b=document.createElement('button');
      b.className='bottone'; b.textContent=L(a.n);
      b.style.cssText='margin:0 .4rem .4rem 0';
      b.onclick=()=>{
        tt++; const giusto=a.k===giusta; if(giusto)ok++;
        const e2=quiz.querySelector('.esito');
        e2.className='esito '+(giusto?'giusto':'sbagliato');
        e2.textContent=giusto?'✓ Giusto':'✗ Era: '+L(r.azioni.find(x=>x.k===giusta).n).toLowerCase();
        op.querySelectorAll('button').forEach(x=>x.disabled=true);
        quiz.querySelector('.punteggio').textContent=ok+' su '+tt;
        const av=document.createElement('button');
        av.className='bottone pieno'; av.textContent='Mano successiva';
        av.style.marginTop='.6rem'; av.onclick=domanda;
        quiz.appendChild(av); av.focus();
      };
      op.appendChild(b);
    });
  }
  return box;
}
function normalizza(v){
  v=(v||'').trim().toUpperCase().replace(/10/g,'T');
  if(v.length<2)return '';
  let a=v[0],b=v[1],s=(v[2]||'').toLowerCase();
  if(iR(a)<0||iR(b)<0)return '';
  if(iR(a)>iR(b))[a,b]=[b,a];
  return a===b?a+b:a+b+(s==='s'?'s':'o');
}

function componi(md){
  return md.trim().split(/\n{2,}/).map(b=>{
    b=b.trim();
    const r=b.match(/^\[\[range:(.+?)\]\]$/);
    if(r)return `<div data-range="${r[1]}"></div>`;
    if(b.startsWith('## '))return `<h2>${inl(b.slice(3))}</h2>`;
    if(b.startsWith('### '))return `<h3>${inl(b.slice(4))}</h3>`;
    if(b.startsWith('> '))return `<blockquote><p>${inl(b.replace(/^> ?/gm,''))}</p></blockquote>`;
    if(/^[-*] /.test(b))return `<ul>${b.split('\n').map(l=>`<li>${inl(l.replace(/^[-*] /,''))}</li>`).join('')}</ul>`;
    return `<p>${inl(b)}</p>`;
  }).join('\n');
}
const inl=t=>t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');

/* riconoscimento dei termini */
const VOCI=GLOSSARIO.flatMap(g=>g.alias.map(a=>({a,id:g.id}))).sort((x,y)=>y.a.length-x.a.length);
const fuga=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const RE=new RegExp('(?<![\\p{L}\\p{N}])('+VOCI.map(v=>fuga(v.a)).join('|')+')(?![\\p{L}\\p{N}])','iu');

function marca(root){
  const usati=new Set(), salta=new Set(['A','H1','H2','H3','BUTTON','CODE']);
  const nodi=[], tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(tw.nextNode()){
    const n=tw.currentNode, p=n.parentElement;
    if(!p||p.closest('.tabella')||salta.has(p.tagName)||p.classList.contains('termine'))continue;
    nodi.push(n);
  }
  nodi.forEach(n=>{
    let t=n.nodeValue, pezzi=[], g=0;
    while(g++<60){
      const mt=t.match(RE); if(!mt)break;
      const v=VOCI.find(x=>x.a.toLowerCase()===mt[1].toLowerCase());
      const fine=mt.index+mt[1].length;
      if(!v||usati.has(v.id)){pezzi.push(document.createTextNode(t.slice(0,fine)));t=t.slice(fine);continue}
      usati.add(v.id);
      pezzi.push(document.createTextNode(t.slice(0,mt.index)));
      const b=document.createElement('button');
      b.className='termine'; b.dataset.id=v.id; b.dataset.orig=mt[1];
      b.textContent=mt[1]; pezzi.push(b);
      t=t.slice(fine);
    }
    if(!pezzi.length)return;
    pezzi.push(document.createTextNode(t));
    const f=document.createDocumentFragment(); pezzi.forEach(p=>f.appendChild(p));
    n.parentNode.replaceChild(f,n);
  });
  applicaLingua(root);
}
function applicaLingua(root){
  (root||document).querySelectorAll('.termine[data-orig]').forEach(b=>{
    const g=glo(b.dataset.id); if(!g)return;
    if(LINGUA==='it'){b.textContent=b.dataset.orig;return}
    const orig=b.dataset.orig;
    let t=g.en;
    if(orig[0]===orig[0].toUpperCase()&&orig[0]!==orig[0].toLowerCase())
      t=t[0].toUpperCase()+t.slice(1);
    else t=t[0].toLowerCase()+t.slice(1);
    b.textContent=t;
  });
}

/* suggerimento e pannello */
const sugg=document.getElementById('suggerimento'), pannello=document.getElementById('pannello'),
      velo=document.getElementById('velo'), corpo=document.getElementById('pannelloCorpo');
document.addEventListener('mouseover',e=>{
  const t=e.target.closest('.termine'); if(!t)return;
  const g=glo(t.dataset.id); if(!g)return;
  const primo=LINGUA==='it'?g.it:g.en, secondo=LINGUA==='it'?g.en:g.it;
  sugg.innerHTML=`<b>${primo}</b>${primo!==secondo?`<u>${secondo}</u>`:'<u>&nbsp;</u>'}${g.breve}<i>Clicca per la scheda completa</i>`;
  sugg.classList.add('on'); posiziona(t);
});
document.addEventListener('mouseout',e=>{if(e.target.closest('.termine'))sugg.classList.remove('on')});
function posiziona(el){
  const r=el.getBoundingClientRect(), w=Math.min(320,innerWidth-24);
  sugg.style.width=w+'px';
  let x=r.left,y=r.bottom+8;
  if(x+w>innerWidth-12)x=innerWidth-w-12;
  if(y+sugg.offsetHeight>innerHeight-12)y=r.top-sugg.offsetHeight-8;
  sugg.style.left=x+'px'; sugg.style.top=y+'px';
}
document.addEventListener('click',e=>{
  const t=e.target.closest('.termine, .pillola, .nomi');
  if(t&&t.dataset.id)apri(t.dataset.id);
});
function apri(id){
  const g=glo(id); if(!g)return;
  sugg.classList.remove('on');
  const primo=LINGUA==='it'?g.it:g.en, secondo=LINGUA==='it'?g.en:g.it;
  corpo.innerHTML=`<div class="categoria">${g.cat}</div><h3>${primo}</h3>
    <div class="altralingua">${primo!==secondo?secondo:'&nbsp;'}</div>${g.lungo}
    ${g.vedi&&g.vedi.length?`<div class="collegati"><span>Vedi anche</span>${
      g.vedi.map(v=>glo(v)?`<button class="pillola" data-id="${v}">${LINGUA==='it'?glo(v).it:glo(v).en}</button>`:'').join('')}</div>`:''}`;
  pannello.classList.add('on'); velo.classList.add('on');
  pannello.querySelector('.chiudi').focus();
}
const chiudi=()=>{pannello.classList.remove('on');velo.classList.remove('on')};
velo.onclick=chiudi; pannello.querySelector('.chiudi').onclick=chiudi;
document.addEventListener('keydown',e=>{if(e.key==='Escape')chiudi()});

/* pagine */
const pagina=document.getElementById('pagina');
let vista={tipo:'lezione',id:'introduzione'};

function render(){
  if(vista.tipo==='lezione')lezione(vista.id);
  else if(vista.tipo==='glossario')glossario();
  else tabelle();
}
function lezione(id){
  const l=LEZIONI.find(x=>x.id===id); if(!l)return;
  pagina.innerHTML=`<div class="occhiello">${l.occhiello} · ${l.capitolo}${l.bb?' · '+l.bb+' bui':''}</div>
    <h1>${l.titolo}</h1><p class="sommario">${l.sommario}</p>${componi(l.testo)}
    <p class="fonte">${l.fonte}</p>`;
  pagina.querySelectorAll('[data-range]').forEach(ph=>{
    const r=RANGES.find(x=>x.id===ph.dataset.range); if(r)ph.replaceWith(disegna(r));
  });
  marca(pagina); fine('lezione:'+id);
}
function glossario(){
  const voci=GLOSSARIO.slice().sort((a,b)=>(LINGUA==='it'?a.it:a.en).localeCompare(LINGUA==='it'?b.it:b.en));
  pagina.innerHTML=`<div class="occhiello">Riferimento</div><h1>Glossario</h1>
    <p class="sommario">${GLOSSARIO.length} voci, in italiano e in inglese. Cerca in una lingua o nell'altra.</p>
    <input id="cerca" placeholder="Cerca un termine, in italiano o in inglese">
    <div id="elenco"></div>`;
  const el=pagina.querySelector('#elenco');
  const stampa=q=>{
    q=(q||'').toLowerCase().trim();
    const f=voci.filter(g=>!q||g.it.toLowerCase().includes(q)||g.en.toLowerCase().includes(q)
      ||g.alias.some(a=>a.includes(q))||g.breve.toLowerCase().includes(q));
    el.innerHTML=f.length?f.map(g=>{
      const p=LINGUA==='it'?g.it:g.en, s=LINGUA==='it'?g.en:g.it;
      return `<div class="voce"><button class="nomi" data-id="${g.id}">${p}${p!==s?` <small>· ${s}</small>`:''}</button><p>${g.breve}</p></div>`;
    }).join(''):`<div class="vuoto"><b>Nessun termine trovato</b>Se è una parola che ti serve, aggiungila: basta scriverla in chat e diventa una voce.</div>`;
  };
  stampa('');
  pagina.querySelector('#cerca').addEventListener('input',e=>stampa(e.target.value));
  fine('glossario');
}
function tabelle(){
  const disp=[...new Set(RANGES.map(r=>r.bb))];
  const bb=vista.bb||25;
  pagina.innerHTML=`<div class="occhiello">Riferimento</div><h1>Tabelle dei range</h1>
    <p class="sommario">Tavolo da tre giocatori. Cerca una mano, oppure apri l'allenamento per memorizzarle.</p>
    <div class="profondita"><span>Profondità</span></div><div id="tab"></div>`;
  const sel=pagina.querySelector('.profondita');
  [15,20,25].forEach(v=>{
    const b=document.createElement('button');
    b.className='bottone'+(v===bb?' pieno':''); b.textContent=v+' bui';
    b.onclick=()=>{vista={tipo:'tabelle',bb:v};render()};
    sel.appendChild(b);
  });
  const cont=pagina.querySelector('#tab');
  const lista=RANGES.filter(r=>r.bb===bb);
  if(!lista.length){
    cont.innerHTML=`<div class="vuoto"><b>Non ci sono ancora tabelle per ${bb} bui</b>
      A questa profondità il gioco è quasi tutto push o fold, quindi servono tabelle calcolate
      invece che riprese da una guida. È il prossimo pezzo da costruire.</div>`;
  } else lista.forEach(r=>cont.appendChild(disegna(r)));
  fine('tabelle');
}
function fine(k){
  document.querySelectorAll('#indice a').forEach(a=>a.classList.toggle('attivo',a.dataset.k===k));
  document.getElementById('nav').classList.remove('on');
  scrollTo(0,0);
}

/* indice */
(function(){
  const el=document.getElementById('indice'); let h='';
  [...new Set(LEZIONI.map(l=>l.capitolo))].forEach(c=>{
    h+=`<h4>${c}</h4>`+LEZIONI.filter(l=>l.capitolo===c)
      .map(l=>`<a href="#" data-k="lezione:${l.id}">${l.titolo}</a>`).join('');
  });
  h+=`<h4>In programma</h4>
    <a class="futura">Apertura da piccolo buio</a>
    <a class="futura">Difesa del grande buio</a>
    <a class="futura">Contro i limper</a>
    <a class="futura">Texture e c-bet</a>
    <a class="futura">Gioco a 15 bui</a>
    <a class="futura">Testa a testa</a>
    <h4>Riferimento</h4>
    <a href="#" data-k="tabelle">Tabelle dei range</a>
    <a href="#" data-k="glossario">Glossario</a>`;
  el.innerHTML=h;
  el.addEventListener('click',e=>{
    const a=e.target.closest('a[data-k]'); if(!a)return;
    e.preventDefault();
    const [t,id]=a.dataset.k.split(':');
    vista=t==='lezione'?{tipo:'lezione',id}:(t==='glossario'?{tipo:'glossario'}:{tipo:'tabelle',bb:25});
    render();
  });
})();

document.querySelectorAll('.lingua button').forEach(b=>{
  b.onclick=()=>{
    LINGUA=b.dataset.l;
    document.querySelectorAll('.lingua button').forEach(x=>x.classList.toggle('on',x===b));
    render(); chiudi();
  };
});
document.getElementById('apriMenu').onclick=()=>document.getElementById('nav').classList.toggle('on');
render();
