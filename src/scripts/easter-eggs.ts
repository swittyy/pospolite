const KEY="pospolite-easter-eggs-v1",TOTAL=25;
const old=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}})();
const found=new Set<number>((Array.isArray(old)?old:[]).filter((n:unknown)=>Number.isInteger(n)&&Number(n)>=1&&Number(n)<=TOTAL));
const css=document.createElement("style");
css.textContent=".pos-recon{position:fixed;inset:0;z-index:80;pointer-events:none;overflow:hidden;color:var(--ink,#111);font-family:'DM Mono',monospace}.pos-grid{position:absolute;inset:0;background-image:linear-gradient(#8882 1px,transparent 1px),linear-gradient(90deg,#8882 1px,transparent 1px);background-size:72px 72px;opacity:.12;mask-image:linear-gradient(#000,transparent 88%)}.pos-top span:last-child{pointer-events:auto;cursor:pointer}.pos-top{position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;gap:9px;align-items:center;padding:6px 10px;background:var(--paper,#f3f3ef);border:1px solid var(--line,#ccc);font-size:8px;letter-spacing:.1em;white-space:nowrap}.pos-dot{width:6px;height:6px;border-radius:50%;background:#c88a36;animation:pospulse 1.8s infinite}.pos-seal{position:absolute;right:18px;bottom:18px;width:54px;height:54px;border:1px solid currentColor;border-radius:50%;display:grid;place-items:center;font-size:18px;opacity:.4;pointer-events:auto;cursor:pointer;animation:posspin 22s linear infinite;background:var(--paper,#f3f3ef)}.pos-ticker{position:absolute;left:0;right:0;bottom:0;padding:5px 0;background:#111;color:#eee;font-size:8px;letter-spacing:.16em;white-space:nowrap;overflow:hidden;opacity:.82;pointer-events:auto}.pos-count{position:absolute;right:18px;top:48px;font-size:8px;opacity:.5;pointer-events:auto;cursor:pointer;background:transparent;border:0;color:inherit}.pos-toast{position:fixed;z-index:2000;left:50%;bottom:34px;transform:translate(-50%,18px);padding:12px 16px;background:#111;color:#f4f4ee;border:1px solid #777;font:10px/1.5 monospace;opacity:0;transition:.25s;pointer-events:none;max-width:90vw;text-align:center}.pos-toast.show{opacity:1;transform:translate(-50%,0)}.pos-modal{position:fixed;z-index:2100;inset:0;display:grid;place-items:center;padding:20px;background:#080908dd;color:#f3f3ef;font-family:monospace}.pos-panel{width:min(520px,100%);padding:28px;border:1px solid #777;background:#111410}.pos-panel h2{font:800 clamp(28px,7vw,46px)/1 sans-serif;letter-spacing:-.06em}.pos-panel p{font-size:11px;line-height:1.8;color:#c2c5bb}.pos-panel input{width:100%;padding:12px;background:#090b09;border:1px solid #555;color:#fff;font:12px monospace}.pos-panel button,.pos-panel a{display:inline-flex;padding:11px 14px;margin:8px 8px 0 0;border:1px solid #777;background:transparent;color:#fff;font:10px monospace;text-decoration:none;cursor:pointer}@keyframes posspin{to{transform:rotate(360deg)}}@keyframes pospulse{50%{opacity:.25}}@media(max-width:760px){.pos-top{top:5px;font-size:7px}.pos-seal{width:42px;height:42px;right:10px;bottom:28px}.pos-count{top:42px;right:10px}.pos-grid{background-size:44px 44px}}@media(prefers-reduced-motion:reduce){.pos-seal,.pos-dot{animation:none}}";
document.head.append(css);
const layer=document.createElement("div");layer.className="pos-recon";layer.innerHTML='<div class="pos-grid"></div><div class="pos-top"><i class="pos-dot"></i><span>POSPOLITE / RECONSTRUCTION IN PROGRESS</span><span id="pos-divider">—</span><span id="pos-clock">00D 00:00</span></div><button class="pos-count" id="pos-count">BUILD 026.11</button><button class="pos-seal" id="pos-seal">Ｐ</button><div class="pos-ticker" id="pos-ticker">STRUCTURE REBUILDING · LEGACY SYSTEM ONLINE · DO NOT INTERRUPT · 01010000 01001111 01010011 ·</div>';document.body.append(layer);
const toast=document.createElement("div");toast.className="pos-toast";document.body.append(toast);let toastTimer=0;
function note(s:string){toast.textContent=s;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>toast.classList.remove("show"),2500)}
function unlock(id:number,msg="СИГНАЛ ПРИНЯТ · ФРАГМЕНТ ВОССТАНОВЛЕН"){if(found.has(id))return;found.add(id);try{localStorage.setItem(KEY,JSON.stringify(Array.from(found)))}catch{}note(msg+" ["+String(found.size).padStart(2,"0")+"/25]");const t=document.querySelector<HTMLElement>("#pos-ticker");if(t)t.textContent="STRUCTURE REBUILDING · "+found.size+"/25 FRAGMENTS RESTORED · 01010000 01001111 01010011 ·";if(found.size===25)showFinal()}
function modal(html:string){document.querySelector(".pos-modal")?.remove();const w=document.createElement("div");w.className="pos-modal";w.innerHTML='<section class="pos-panel">'+html+'</section>';w.addEventListener("click",e=>{if(e.target===w)w.remove()});w.querySelector("[data-close]")?.addEventListener("click",()=>w.remove());document.body.append(w);return w}
function terminal(){const w=modal('<div>POSPOLITE // MAINTENANCE TERMINAL</div><h2>СЛУЖЕБНЫЙ ДОСТУП</h2><p>ЯЗЫК ВВОДА: ENGLISH</p><input id="pos-input" placeholder="команда на английском"><p id="pos-output">Ожидание ввода…</p><button data-close>ЗАКРЫТЬ</button>');const i=w.querySelector<HTMLInputElement>("#pos-input")!,o=w.querySelector<HTMLElement>("#pos-output")!;const c:Record<string,string>={help:"КОМАНДЫ НЕ ПЕРЕЧИСЛЕНЫ. ИЩИ СЛЕДЫ В СИСТЕМЕ.",status:"REBUILDING / "+found.size+"/25 / SYSTEM NOMINAL",ping:"PONG — LEGACY NODE RESPONDS",decode:"01010000 01001111 01010011 = POS",hello:"ПРИВЕТ, ИССЛЕДОВАТЕЛЬ. ТЫ БЛИЖЕ, ЧЕМ ДУМАЕШЬ.","2027":"НОВЫЙ ЦИКЛ НАЧНЁТСЯ 01.01.2027"};i.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const s=i.value.trim().toLowerCase();o.textContent=c[s]||"UNKNOWN COMMAND";if(s==="hello")unlock(17);if(s==="2027")unlock(23);i.value=""});i.focus()}
function showFinal(){modal('<div>POSPOLITE // FINAL PROTOCOL</div><h2>СИСТЕМА СОБРАНА.</h2><p>Все 25 фрагментов восстановлены. Ты нашёл то, что было спрятано на старом POSPOLITE.</p><p><strong>НАГРАДА: МИШКА В TELEGRAM НА НОВЫЙ ГОД 🧸</strong></p><p>Сделай скриншот этого экрана и напиши команде. Прохождение сверим вручную.</p><a href="https://t.me/pospoliteshop" target="_blank" rel="noreferrer">ОТКРЫТЬ TELEGRAM ↗</a><button data-close>ЗАКРЫТЬ</button>')}
// 01 tiny footer dot
const mark=document.createElement("button");mark.textContent="·";mark.setAttribute("aria-label","");mark.style.cssText="width:8px;height:8px;margin-left:5px;padding:0;border:0;background:transparent;opacity:.08;cursor:pointer";document.querySelector(".footer-bottom")?.append(mark);mark.addEventListener("click",()=>unlock(1));
// 02 spinning seal
document.querySelector("#pos-seal")?.addEventListener("click",()=>unlock(2,"ОРБИТА СОВПАЛА"));
// 03 five logo clicks
let lc=0,lt=0;document.querySelectorAll<HTMLElement>(".wordmark").forEach(el=>el.addEventListener("click",e=>{if(el.getAttribute("href")==="#")e.preventDefault();lc++;clearTimeout(lt);lt=window.setTimeout(()=>lc=0,1800);if(lc>=5){unlock(3,"ЛОГОТИП ОТВЕТИЛ");lc=0}}));
// 04 barely visible warning
const warn=document.createElement("button");warn.textContent="⚠";warn.setAttribute("aria-label","");warn.style.cssText="position:absolute;left:10px;top:46%;opacity:.22;border:1px solid #c88a36;border-radius:50%;padding:5px 7px;background:var(--paper,#f3f3ef);color:#b77925;font-size:13px;box-shadow:0 0 14px #c88a3633;pointer-events:auto;cursor:pointer";layer.append(warn);warn.addEventListener("click",()=>unlock(4,"ПРЕДУПРЕЖДЕНИЕ СНЯТО"));
// 05 hold wordmark
document.querySelectorAll<HTMLElement>(".wordmark").forEach(el=>{let t=0;el.addEventListener("pointerdown",()=>t=window.setTimeout(()=>unlock(5,"УДЕРЖАНИЕ ПОДТВЕРЖДЕНО"),3000));["pointerup","pointerleave","pointercancel"].forEach(k=>el.addEventListener(k,()=>clearTimeout(t)))});
// 06,07 hero crosses
document.querySelector(".cross-one")?.addEventListener("click",()=>unlock(6,"ПЕРВЫЙ МАРКЕР АКТИВЕН"));document.querySelector(".cross-two")?.addEventListener("click",()=>unlock(7,"ВТОРОЙ МАРКЕР АКТИВЕН"));
// 08 clock click
document.querySelector("#pos-clock")?.addEventListener("click",()=>unlock(8,"ВРЕМЕННАЯ МЕТКА ЗАПИСАНА"));
// 09 theme triple-click
let tc=0;document.querySelector(".theme-toggle")?.addEventListener("click",()=>{tc++;if(tc>=3){unlock(9,"СИСТЕМНАЯ ТЕМА РАСПОЗНАНА");tc=0}window.setTimeout(()=>tc=0,1500)});
// 10 scroll bottom then top
let bottom=false;window.addEventListener("scroll",()=>{if(scrollY+innerHeight>=document.documentElement.scrollHeight-8)bottom=true;if(bottom&&scrollY<12){unlock(10,"МАРШРУТ ПРОЙДЕН");bottom=false}},{passive:true});
// 11 tap the reconstruction label six times
let labelTaps=0,labelTimer=0;document.querySelector(".pos-top span:nth-child(2)")?.addEventListener("click",()=>{labelTaps++;clearTimeout(labelTimer);labelTimer=window.setTimeout(()=>labelTaps=0,1400);if(labelTaps>=6){unlock(11,"МАРКИРОВКА РЕКОНСТРУКЦИИ РАСПОЗНАНА");labelTaps=0}});
// 12 dark theme
new MutationObserver(()=>{if(document.documentElement.dataset.theme==="dark")unlock(12,"ТЁМНАЯ СТОРОНА ОБНАРУЖЕНА")}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
// 13 open the seal context menu
 document.querySelector("#pos-seal")?.addEventListener("contextmenu",e=>{e.preventDefault();unlock(13,"ЗАПАСНОЙ ВХОД В ПЕЧАТЬ ОТКРЫТ")});
// 14 hidden maintenance shortcut
document.addEventListener("keydown",e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="p"){e.preventDefault();unlock(14,"СЛУЖЕБНЫЙ ПРОТОКОЛ ПРИНЯТ")}});
// 15 restore the archive label by typing its hidden name
let typed="";document.addEventListener("keydown",e=>{if(e.key.length===1&&!e.ctrlKey&&!e.altKey){typed=(typed+e.key.toLowerCase()).slice(-7);if(typed.endsWith("archive")){unlock(15,"АРХИВНОЕ ИМЯ ВОССТАНОВЛЕНО");typed=""}}});
// 16 double-click headline
document.querySelector(".hero-title")?.addEventListener("dblclick",()=>unlock(16,"ЗАГОЛОВОК РАСКРЫТ"));
// 17 terminal greeting; 18 build number
document.querySelector("#pos-count")?.addEventListener("click",()=>{unlock(18,"НОМЕР СБОРКИ ЗАМЕЧЕН");terminal()});
// 19 the tiny separator in the status bar is interactive
 document.querySelector("#pos-divider")?.addEventListener("click",()=>unlock(19,"РАЗДЕЛИТЕЛЬ СТАТУСА СНЯТ"));
// 20 hold the countdown clock for three seconds
let clockHold=0;const clockTarget=document.querySelector("#pos-clock");clockTarget?.addEventListener("pointerdown",()=>{clockHold=window.setTimeout(()=>unlock(20,"ВРЕМЕННОЙ УЗЕЛ СИНХРОНИЗИРОВАН"),3000)});["pointerup","pointerleave","pointercancel"].forEach(k=>clockTarget?.addEventListener(k,()=>clearTimeout(clockHold)));
// 21 three rapid ticker taps
let kc=0,kt=0;document.querySelector("#pos-ticker")?.addEventListener("click",()=>{kc++;clearTimeout(kt);kt=window.setTimeout(()=>kc=0,650);if(kc>=3){unlock(21,"РИТМ СООБЩЕНИЯ ПОЙМАН");kc=0}});
// 22 double click clock
document.querySelector("#pos-clock")?.addEventListener("dblclick",()=>unlock(22,"ВРЕМЕННОЙ КОД ПРИНЯТ"));
// 23 terminal shortcut via Shift+~
document.addEventListener("keydown",e=>{if(e.key==="~"){e.preventDefault();terminal()}});
// 24 repeat the ticker after a short pause
let tickerFirst=0,tickerTimer=0;document.querySelector("#pos-ticker")?.addEventListener("click",()=>{const now=Date.now();if(tickerFirst&&now-tickerFirst>=900&&now-tickerFirst<=2400){unlock(24,"СТРОКА ПОВТОРЕНА С ПАУЗОЙ");tickerFirst=0;clearTimeout(tickerTimer)}else{tickerFirst=now;clearTimeout(tickerTimer);tickerTimer=window.setTimeout(()=>tickerFirst=0,2400)}});
// 25 hidden center point
const fp=document.createElement("button");fp.setAttribute("aria-label","");fp.style.cssText="position:fixed;left:50%;top:50%;width:10px;height:10px;transform:translate(-50%,-50%);border:0;background:transparent;opacity:.015;pointer-events:auto";fp.addEventListener("click",()=>{if(found.size>=24)unlock(25,"ФИНАЛЬНЫЙ ПРОТОКОЛ ЗАПУЩЕН");else note("ПРОТОКОЛ ЗАКРЫТ · НЕДОСТАЮЩИЕ ФРАГМЕНТЫ НЕ ОПРЕДЕЛЕНЫ")});document.body.append(fp);
// New Year countdown
const clock=document.querySelector<HTMLElement>("#pos-clock");function tick(){if(!clock)return;const n=new Date(),y=new Date(n.getFullYear()+1,0,1),s=Math.max(0,Math.floor((y.getTime()-n.getTime())/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);clock.textContent=String(d).padStart(3,"0")+"D "+String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")}tick();window.setInterval(tick,60000);
if(found.size===25)window.setTimeout(showFinal,900);
