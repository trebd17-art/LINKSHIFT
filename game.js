"use strict";
const $=id=>document.getElementById(id);
const modes=["classic","rush","daily"];
const families=[
 [["●","◕"],["▲","△"],["◆","◇"],["■","▣"],["★","☆"],["⬟","⬢"]],
 [["🟦","🟪"],["🟡","🟠"],["🍋","🍊"],["🐱","🐯"],["🌙","⭐"],["🍎","🍐"]]
];
let mode="classic",level=1,score=0,mistakes=0,remaining=60,timer=null,answer=0,locked=false,gameOver=false;
const today=()=>new Date().toLocaleDateString("en-CA");
function seeded(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function hash(s){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0}
function rng(){return mode==="daily"?seeded(hash(today()+":"+level)):Math.random}
function build(){
 if(gameOver)return;
 locked=false;const random=rng(),size=level<4?3:level<9?4:5,count=size*size;
 const pool=families[level%2],pair=pool[Math.floor(random()*pool.length)];
 answer=Math.floor(random()*count);
 const board=$("board");board.replaceChildren();board.style.setProperty("--columns",size);
 for(let i=0;i<count;i++){const b=document.createElement("button");b.className="tile";b.type="button";b.textContent=i===answer?pair[1]:pair[0];b.setAttribute("aria-label",`Tile ${i+1}: ${b.textContent}`);b.addEventListener("click",()=>pick(i,b));board.appendChild(b)}
 $("instruction").textContent=mode==="rush"?"Find the odd symbol before time runs out!":"Tap the odd symbol.";
 update();
}
function update(){
 $("level").textContent=level;$("score").textContent=score;
 $("third-label").textContent=mode==="rush"?"SECONDS":"MISTAKES";
 $("third").textContent=mode==="rush"?remaining:mistakes;
}
function pick(i,b){
 if(locked||gameOver)return;
 if(i!==answer){mistakes++;score=Math.max(0,score-5);b.classList.add("wrong");$("message").textContent="Not quite — try again!";update();setTimeout(()=>b.classList.remove("wrong"),250);return}
 locked=true;b.classList.add("correct");score+=Math.max(10,50-mistakes*2);$("message").textContent="Great eye! + points";update();
 if(mode==="daily"&&level>=5){end("Daily challenge complete! Come back tomorrow.");return}
 setTimeout(()=>{if(gameOver)return;level++;$("message").textContent="";build()},500);
}
function end(msg){gameOver=true;locked=true;clearInterval(timer);$("message").textContent=msg;update()}
function start(next=mode){
 clearInterval(timer);mode=next;level=1;score=0;mistakes=0;remaining=60;locked=false;gameOver=false;
 document.querySelectorAll("nav button").forEach(b=>{b.classList.toggle("active",b.dataset.mode===mode);b.setAttribute("aria-pressed",String(b.dataset.mode===mode))});
 $("message").textContent="";build();
 if(mode==="rush"){timer=setInterval(()=>{remaining--;update();if(remaining<=0)end("Time's up! Share your score.")},1000)}
}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>start(b.dataset.mode)));
$("restart").addEventListener("click",()=>start());
$("share").addEventListener("click",async()=>{
 const msg=`ONEWAY ${mode.toUpperCase()} — Score: ${score}, Level: ${level}. Can you beat me?`;
 try{if(navigator.share)await navigator.share({title:"ONEWAY",text:msg});else if(navigator.clipboard){await navigator.clipboard.writeText(msg);$("message").textContent="Score copied!"}else $("message").textContent=msg}catch(e){if(e.name!=="AbortError")$("message").textContent=msg}
});
start("classic");