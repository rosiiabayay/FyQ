const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const amp = document.getElementById('amplitude');
const freq = document.getElementById('frequency');
const speed = document.getElementById('speed');
const ampOut = document.getElementById('ampOut');
const freqOut = document.getElementById('freqOut');
const speedOut = document.getElementById('speedOut');
const lambdaValue = document.getElementById('lambdaValue');
const periodValue = document.getElementById('periodValue');
const velocityValue = document.getElementById('velocityValue');
const explainTitle = document.getElementById('explainTitle');
const explainText = document.getElementById('explainText');
const modeDescription = document.getElementById('modeDescription');
let mode = 'transverse';
let paused = false;
let elapsed = 0;
let lastTime = 0;

function values(){
  const A = Number(amp.value);
  const f = Number(freq.value);
  const v = Number(speed.value);
  return {A,f,v,lambda:v/f,T:1/f};
}
function update(){
  const q=values();
  ampOut.textContent=`${q.A} %`;
  freqOut.textContent=`${q.f} Hz`;
  speedOut.textContent=`${q.v} m/s`;
  lambdaValue.innerHTML=`${q.lambda.toFixed(2).replace('.',',')} <small>m</small>`;
  periodValue.innerHTML=`${q.T.toFixed(2).replace('.',',')} <small>s</small>`;
  velocityValue.innerHTML=`${q.v} <small>m/s</small>`;
  if(mode==='transverse'){
    explainTitle.textContent='La onda transversal está cambiando';
    explainText.textContent=`Con una amplitud de ${q.A} %, la perturbación alcanza un desplazamiento mayor o menor respecto del equilibrio. La frecuencia es ${q.f} Hz: se producen ${q.f} oscilaciones por segundo.`;
  } else {
    explainTitle.textContent='Las partículas se comprimen y se separan';
    explainText.textContent=`En una onda longitudinal, las partículas del medio vibran en la misma dirección en la que avanza la onda. La frecuencia actual es ${q.f} Hz y la longitud de onda es ${q.lambda.toFixed(2)} m.`;
  }
}
[amp,freq,speed].forEach(el=>el.addEventListener('input',update));
document.querySelectorAll('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>{
  mode=btn.dataset.mode;
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b===btn));
  modeDescription.textContent=mode==='transverse'?'Las partículas oscilan perpendicularmente a la propagación.':'Las partículas oscilan en la misma dirección de propagación.';
  update();
}));
document.getElementById('pauseBtn').addEventListener('click',()=>{
  paused=!paused;
  document.getElementById('pauseBtn').textContent=paused?'▶ Reanudar':'Ⅱ Pausar';
});
document.getElementById('resetBtn').addEventListener('click',()=>{
  amp.value=50;freq.value=2;speed.value=8;elapsed=0;paused=false;
  document.getElementById('pauseBtn').textContent='Ⅱ Pausar';update();
});
const challenges=[
 '¿Qué cambia en la onda si duplicamos la frecuencia y mantenemos la velocidad?',
 'Si aumentamos la amplitud, ¿cambia también la velocidad de propagación?',
 'Si la velocidad se mantiene y la frecuencia disminuye, ¿qué pasa con la longitud de onda?',
 '¿Qué diferencia observan entre el movimiento de las partículas en una onda transversal y una longitudinal?',
 '¿Qué parámetro representa la cantidad de oscilaciones por segundo?'
];
let challengeIndex=0;
document.getElementById('challengeBtn').addEventListener('click',()=>{
  challengeIndex=(challengeIndex+1)%challenges.length;
  document.getElementById('challengeText').textContent=challenges[challengeIndex];
});
function resize(){
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.floor(rect.width*dpr));
  canvas.height=Math.max(1,Math.floor(rect.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function drawGrid(w,h){
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='rgba(125,157,195,.10)';ctx.lineWidth=1;
  for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.setLineDash([5,6]);ctx.strokeStyle='rgba(155,181,211,.42)';
  ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();ctx.setLineDash([]);
}
function render(timestamp){
  if(!lastTime)lastTime=timestamp;
  const dt=Math.min((timestamp-lastTime)/1000,.05);lastTime=timestamp;
  if(!paused)elapsed+=dt;
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(w>0&&h>0){
    drawGrid(w,h);
    const q=values(), center=h/2, amplitudePx=(q.A/100)*(h*.34);
    const wavelengthPx=Math.max(24,Math.min(w*1.5,q.lambda*40));
    const phase=elapsed*q.f*2*Math.PI;
    if(mode==='transverse'){
      ctx.beginPath();
      for(let x=0;x<=w;x+=2){
        const y=center-amplitudePx*Math.sin((x/wavelengthPx)*2*Math.PI-phase);
        if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.lineWidth=3;ctx.strokeStyle='#5de1ed';ctx.shadowColor='#42cddd';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;
      for(let x=0;x<w;x+=Math.max(20,wavelengthPx/2)){
        const y=center-amplitudePx*Math.sin((x/wavelengthPx)*2*Math.PI-phase);
        ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#c5fbff';ctx.fill();
      }
    }else{
      const spacing=18;
      for(let x=8;x<w;x+=spacing){
        const displacement=amplitudePx*.22*Math.sin((x/wavelengthPx)*2*Math.PI-phase);
        const px=x+displacement;
        ctx.beginPath();ctx.arc(px,center,3.2,0,Math.PI*2);
        ctx.fillStyle='#65deeb';ctx.shadowColor='#42cddd';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
      }
      ctx.fillStyle='rgba(128,158,194,.7)';ctx.font='10px DM Sans';ctx.fillText('Compresiones y expansiones del medio',12,20);
    }
  }
  requestAnimationFrame(render);
}
window.addEventListener('resize',resize);
resize();update();requestAnimationFrame(render);
