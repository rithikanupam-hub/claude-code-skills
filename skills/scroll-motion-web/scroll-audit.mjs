import { chromium, devices } from '<path>';
const b=await chromium.launch({channel:'chrome'});const out=process.argv[2];
for (const [n,o,step] of [['d',{viewport:{width:1440,height:900}},180],['m',devices['iPhone 13'],160]]){
 const c=await b.newContext(o),p=await c.newPage();await p.goto(''+(process.argv[3]||'http://127.0.0.1:8744/index-cerchio.html')+'');await p.waitForTimeout(2500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);const rows=[];let k=0;
 for(let y=0;y<=H;y+=step){
   if(n==='d'){await p.mouse.move(700,450);await p.mouse.wheel(0,step)}else{await p.evaluate(s=>scrollBy(0,s),step)}
   await p.waitForTimeout(500);
   const r=await p.evaluate(()=>{const vh=innerHeight;const sec=[...document.querySelectorAll('main>section')].filter(s=>{const q=s.getBoundingClientRect();return q.bottom>0&&q.top<vh}).map(s=>{const q=s.getBoundingClientRect();return (s.id||s.className)+'['+Math.round(q.top)+','+Math.round(q.bottom)+']'});
     const lv=[...document.querySelectorAll('.live')].map(l=>{const q=l.getBoundingClientRect();return l.dataset.film+' t='+(l.dataset.t||'-')+' top='+Math.round(q.top)+' vis='+Math.round(100*Math.max(0,Math.min(vh,q.bottom)-Math.max(0,q.top))/q.height)+'%'});
     const hidden=[...document.querySelectorAll('h2,.door,.tcard,.cc-t,.stage')].filter(e=>{const q=e.getBoundingClientRect();return q.top<vh*.8&&q.bottom>vh*.2&&+getComputedStyle(e).opacity<.5}).map(e=>e.className||e.tagName).slice(0,4);
     return Math.round(scrollY)+' | '+sec.join(' ')+' | '+lv.join(' ; ')+(hidden.length?' | STILL HIDDEN: '+hidden.join(','):'')});
   rows.push(r);
   if(k%2===0)await p.screenshot({path:`${out}/${n}-${String(k).padStart(3,'0')}.png`});k++;
 }
 console.log('=== '+n);console.log(rows.join('\n'));await c.close()}
await b.close();
