
function initNumInputs(){
  document.querySelectorAll('input[type="number"]').forEach(inp=>{
    if(inp.dataset.fmtInit) return;
    inp.dataset.fmtInit='1';
    // Convert to text input
    inp.type='text';
    inp.inputMode='decimal';
    inp.classList.add('num-input');
    inp.addEventListener('focus',function(){
      // Show raw value for editing
      const raw=this.dataset.rawVal||'';
      this.value=raw;
      this.select();
    });
    inp.addEventListener('blur',function(){
      const raw=this.value.replace(/\s+/g,'').replace(',','.');
      const num=parseFloat(raw);
      if(!isNaN(num)&&this.value.trim()!==''){
        this.dataset.rawVal=String(num);
        this.value=num.toLocaleString('ru-RU',{maximumFractionDigits:6});
        this.classList.remove('error');
      } else if(this.value.trim()===''){
        this.dataset.rawVal='';
        this.value='';
      } else {
        this.classList.add('error');
      }
    });
    inp.addEventListener('input',function(){
      this.dataset.rawVal=this.value.replace(/\s+/g,'').replace(',','.');
    });
    // Format initial value if present
    if(inp.value&&!isNaN(parseFloat(inp.value))){
      const num=parseFloat(inp.value);
      inp.dataset.rawVal=String(num);
      inp.value=num.toLocaleString('ru-RU',{maximumFractionDigits:6});
    }
  });
}
const MONTHS_RU=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

function monthLabel(ym){
  const parts=ym.split('-');
  if(parts.length!==2) return ym;
  const m=parseInt(parts[1])-1;
  return MONTHS_RU[m]+' '+parts[0];
}

function safeNum(id){
  const el=document.getElementById(id);
  if(!el) return NaN;
  const raw=(el.dataset.rawVal!==undefined&&el.dataset.rawVal!=='')?el.dataset.rawVal:el.value;
  return safeParseFloat(raw);
}

function safeParseFloat(val){
  if(val==null) return NaN;
  if(typeof val==='number') return val;
  return parseFloat(String(val).replace(/\s+/g,'').replace(',','.'));
}
const ymOf=(d)=>{const x=d?new Date(d):new Date();return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`;};

let D={invest:[],dividends:[],iHistory:[],nwHistory:[],deposits:[],credits:[],assets:[],income:[],expenses:[],rent:[],goals:[],enpf:[],insurance:[],subs:[],cars:[],parts:[],services:[],govPremiums:[],properties:[],accounts:[],transfers:[],privateDebts:[],iOweMe:[],stos:[],settings:{usdRate:450,eurRate:500}};
let incSort='date',currentCarId=null;


function fmt(n,d=0){if(n==null||isNaN(n)||n==='')return'—';return Number(n).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});}

function fmtP(n){if(n==null||isNaN(n))return'—';return(n>=0?'+':'')+Number(n).toFixed(1)+'%';}

function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/(864e5));}

function daysLeft(d){if(!d)return null;return daysBetween(td(),d);}

function updateDate(){const el=document.getElementById('t-date');if(el){const d=new Date();el.textContent=d.toLocaleDateString('ru-RU',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});}}

const CH={};

function mkChart(id,type,data,opts){
  if(CH[id])CH[id].destroy();
  const c=document.getElementById(id);if(!c)return;
  const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};
  CH[id]=new Chart(c,{type,data,options:opts||base});
}


function openModal(title,html,saveFn){document.getElementById('modal-title').textContent=title;document.getElementById('modal-body').innerHTML=html;document.getElementById('modal-save-btn').onclick=saveFn;document.getElementById('modal').style.display='flex';}

function closeModal(){document.getElementById('modal').style.display='none';}

function mF(label,id,val,type='text',opts=null){
  if(opts){const o=opts.map(x=>`<option${x==val?' selected':''}>${x}</option>`).join('');return`<div class="f"><label>${label}</label><select id="m-${id}">${o}</select></div>`;}
  return`<div class="f"><label>${label}</label><input type="${type}" id="m-${id}" value="${val!=null?val:''}"></div>`;
}
const mv=id=>{const e=document.getElementById('m-'+id);return e?e.value:'';};
const mvf=id=>safeParseFloat(mv(id));

// INVESTMENTS