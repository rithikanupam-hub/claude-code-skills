/* Live film engine from the project Version A (4 Nov 2026). Each .live box holds an iframe of a seek(t)-driven composition.
   Markup: <div class="live" data-film="m9" data-end="6.2" data-crop="x,y,w,h"><iframe src="films/m9.html?embed"></iframe></div>
   The composition needs window.draw(t) and window.ready (see film-kit.js: ?embed stops its own timer, ?notext hides its text). */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TXT={
    m9:{it:{'#hk':()=>T.it.rvK.replace(/^01 · .*/,'01 · ')+'Rivediti. Capisci. Migliora.','#hp':()=>T.it.rvP},
        en:{'#hk':()=>'01 · Rewatch. Understand. Improve.','#hp':()=>T.en.rvP,'.head .a':'You','.head .b':'vs you.'}},
    m10:{it:{'#lk':()=>T.it.ccK,'#lp':()=>T.it.ccP},
         en:{'#lk':()=>T.en.ccK,'#lp':()=>T.en.ccP,'.left .a:nth-of-type(1)':'Every step','.left .a:nth-of-type(2)':'forward,','.left .b':'seen.'}}};
  const WORDS={'Noah · rispetto alla<br>partita prima':'Noah · vs his<br>last match','Dati di esempio':'Sample data','palloni recuperati rispetto alla partita prima':'balls won back vs the last match',
    '1 contro 1 tentati':'1 v 1 attempts','Passaggi riusciti':'Passes completed','Un passo avanti.':'One step forward.','Record personale':'Personal best','Risultato':'Result',
    'Rispetto alla<br>partita prima':'Vs the last<br>match','palloni recuperati':'balls won back','Noah · ultime 5 partite':'Noah · last 5 matches','palloni recuperati, oggi':'balls won back, today',
    'Ripresa dall’alto':'Filmed from above'};
  const orig=new WeakMap();
  function setText(doc,film){const L=(typeof lang!=='undefined'?lang:'it'),map=TXT[film][L]||{};
    doc.querySelectorAll('.kk,.hd span,.big span,.row .k,.ft span,.rec,.tag,.m').forEach(e=>{if(!orig.has(e))orig.set(e,e.innerHTML);const o=orig.get(e),key=o.replace(/<i><\/i>/,'').trim();
      e.innerHTML=L==='en'&&WORDS[key]?(o.startsWith('<i></i>')?'<i></i>':'')+WORDS[key]:o});
    ['.head .a','.head .b','.left .a:nth-of-type(1)','.left .a:nth-of-type(2)','.left .b','#hk','#hp','#lk','#lp'].forEach(sel=>{const e=doc.querySelector(sel);if(!e)return;if(!orig.has(e))orig.set(e,e.innerHTML);
      const v=map[sel];e.innerHTML=v==null?orig.get(e):(typeof v==='function'?v():v)})}
  const films=[...document.querySelectorAll('.live')];
  function size(box){const f=box.querySelector('iframe'),mob=innerWidth<=900,c=box.dataset.crop.split(',').map(Number);
    let s,h,tx=0,ty=0;if(mob){s=box.clientWidth/c[2];h=c[3]*s;tx=-c[0]*s;ty=-c[1]*s}else{s=box.clientWidth/1920;h=1080*s}
    box.style.height=h+'px';f.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;
    const d=f.contentDocument;if(d&&d.documentElement){d.documentElement.classList.add('embed');d.documentElement.classList.toggle('notext',mob)}}
  films.forEach(box=>{const f=box.querySelector('iframe'),film=box.dataset.film,end=+box.dataset.end;let w=null,t=0,want=0,raf=0;
    /* p: 0 = the film's top touches the bottom of the screen, 1 = the film is centred (fully in view), 2 = 60% of it has left the top */
    const map=p=>film==='m10'?(p<=1?Math.min(1,p/.92)*3:3+(p-1)*(end-3)):Math.min(1,p/.9)*end;
    const paint=()=>{raf=0;if(!w)return;t+=(want-t)*.35;if(Math.abs(want-t)<.004)t=want;w.draw(t);box.dataset.t=t.toFixed(2);if(t!==want)raf=requestAnimationFrame(paint)};
    box._p=p=>{want=reduce?end:map(Math.max(0,Math.min(2,p)));if(!raf)raf=requestAnimationFrame(paint)};
    const boot=()=>{const cw=f.contentWindow;if(!cw||!cw.ready)return;cw.ready.then(()=>{w=cw;size(box);setText(f.contentDocument,film);box._p(box._last||0);if(reduce)w.draw(end)})};
    f.addEventListener('load',boot);if(f.contentDocument&&f.contentDocument.readyState==='complete')boot();
    box._lang=()=>{if(w)setText(f.contentDocument,film)};});
  addEventListener('resize',()=>films.forEach(size));films.forEach(size);
  document.addEventListener('click',e=>{if(e.target.closest('[data-l]'))setTimeout(()=>films.forEach(b=>b._lang&&b._lang()),0)});
  /* scroll position -> story position: the story finishes as the film settles in the middle of the screen (scroll audit, 4 Nov) */
  const prog=box=>{const r=box.getBoundingClientRect(),vh=innerHeight,h=r.height,c=Math.max(0,(vh-h)/2),a=(vh-r.top)/Math.max(1,vh-c);return a<=1?a:1+(c-r.top)/(h*.6+c)};
  const tick=()=>films.forEach(b=>{const p=prog(b);b._last=p;b._p&&b._p(p)});
  addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick);tick();
})();
