// Visitor-paced scroll walk: scrolls like a person (flick, pause, flick) so scroll-driven films
// play at the speed this persona would see them. One screenshot at each stop once the view has moved min(0.9 screen, one flick).
// Usage: node walk.mjs <url> <outDir> [--device m|d] [--flick 0.5] [--pause 600] [--max 60] [--prefix p1]
//   --flick  how far one thumb/wheel flick goes, in screens (skimmer 0.8-1.0, reader 0.25-0.35)
//   --pause  ms the persona stops to look after each flick (skimmer 200-400, reader 1200-2000)
import fs from 'node:fs'; import path from 'node:path';
const tries=[process.env.PLAYWRIGHT_PATH,'playwright','playwright-core','<path>','<path>'].filter(Boolean);
let pw; for(const t of tries){try{pw=await import(t);break}catch{}}
if(!pw){console.error('playwright not found; set PLAYWRIGHT_PATH');process.exit(1)}
const {chromium,devices}=pw;
const [url,out,...rest]=process.argv.slice(2); const opt={device:'m',flick:'0.5',pause:'600',max:'60',prefix:''};
for(let i=0;i<rest.length;i+=2)opt[rest[i].replace(/^--/,'')]=rest[i+1];
fs.mkdirSync(out,{recursive:true});
let b; try{b=await chromium.launch({channel:'chrome'})}catch{b=await chromium.launch()}
const ctx=await b.newContext(opt.device==='m'?{...devices['iPhone 13']}:{viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto(url,{waitUntil:'load',timeout:120000}); await p.waitForTimeout(2500);
const H=await p.evaluate(()=>innerHeight); const flick=+opt.flick, pause=+opt.pause, tick=40;
const pre=(opt.prefix?opt.prefix+'-':'')+opt.device; const frames=[]; let last=-1e9,t0=Date.now(),i=0;
const shot=async()=>{const y=await p.evaluate(()=>Math.round(scrollY));const n=`${pre}-${String(i++).padStart(2,'0')}`;
  await p.screenshot({path:path.join(out,n+'.jpg'),type:'jpeg',quality:65});frames.push({file:n+'.jpg',y,sec:Math.round((Date.now()-t0)/100)/10});last=y};
await shot();
while(frames.length<+opt.max){
  const before=await p.evaluate(()=>scrollY);
  for(let k=0;k<Math.max(1,Math.round(H*flick/tick));k++){await p.evaluate(d=>scrollBy(0,d),tick);await p.waitForTimeout(16)}
  await p.waitForTimeout(pause);
  const y=await p.evaluate(()=>scrollY); if(y===before){if(y>last)await shot();break;}
  if(y-last>=H*Math.min(.9,flick*.95))await shot(); // a frame at every stop that shows a new view
}
fs.writeFileSync(path.join(out,pre+'-walk.json'),JSON.stringify({url,device:opt.device,flick,pause,frames,errors:errs},null,1));
console.log(`${frames.length} frames · ${frames.at(-1)?.sec}s · errors ${errs.length}`); await b.close();
