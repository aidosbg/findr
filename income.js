
function resetIdle(){idleSec=0;}

function startTimer(){
  clearInterval(timerIv);
  timerIv=setInterval(()=>{
    idleSec++;const left=IDLE-idleSec;const m=Math.floor(left/60),s=left%60;
    const el=document.getElementById('t-timer');if(el)el.textContent=`${m}:${String(s).padStart(2,'0')}`;
    if(idleSec>=IDLE)logout();
  },1000);
  ['mousemove','keydown','click','scroll','touchstart'].forEach(ev=>document.addEventListener(ev,resetIdle,{passive:true}));
}

function doLogin(){
  if(document.getElementById('pwd-input').value===PASS){
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').classList.add('visible');
    idleSec=0;startTimer();renderAll();
  } else document.getElementById('login-err').style.display='block';
}

function logout(){clearInterval(timerIv);document.getElementById('app').classList.remove('visible');document.getElementById('login-screen').style.display='flex';document.getElementById('pwd-input').value='';document.getElementById('login-err').style.display='none';}


function showSection(id,el){
  document.querySelectorAll('.section').forEach(s=>{s.classList.remove('active');s.style.display='none';});
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const sec=document.getElementById('s-'+id);
  sec.style.display='block';
  sec.classList.add('active');
  el.classList.add('active');
  // Scroll main to top when switching sections
  const mainEl=document.querySelector('.main');if(mainEl)mainEl.scrollTop=0;
  setTimeout(initNumInputs,100);
  if(id==='dashboard')renderDashboard();
  if(id==='reminders')renderReminders();
  if(id==='expenses'){renderExpenses();renderExpAnalytics();}
  if(id==='goals')updateGoalDepDropdown();
  if(id==='insurance')updInsCarDropdown();
  if(id==='property')renderProperty();
  if(id==='accounts'){setTimeout(function(){renderAccounts();renderTransfers();updTransferDropdowns();},50);}
  if(id==='debts'){setTimeout(function(){renderCredits();renderPrivateDebts();renderIOweMe();},50);}
  if(id==='income')updIncomeDepDropdown();
  if(id==='rent'){updRentPropDropdown();}
}


function resetAllData(){
  if(!confirm('⚠️ ВНИМАНИЕ! Все данные будут удалены безвозвратно!\nВы уверены?')) return;
  if(!confirm('Это действие нельзя отменить. Продолжить?')) return;
  localStorage.removeItem('fd3');
  location.reload();
}

function openSettings(){
  const s=D.settings||{usdRate:450,eurRate:500,rubRate:4.8};
  const updated=s.fxUpdated?`<div style="font-size:10px;font-family:var(--mono);color:var(--green);margin-top:6px;">Обновлено: ${s.fxUpdated}</div>`:'';
  const html=`<div class="form-row c3">${mF('Курс USD → KZT','usd',s.usdRate,'number')}${mF('Курс EUR → KZT','eur',s.eurRate,'number')}${mF('Курс RUB → KZT','rub',s.rubRate||4.8,'number')}</div>${updated}<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:8px;">Используется для расчёта чистого капитала</div>`;
  openModal('КУРСЫ ВАЛЮТ',html,()=>{
    D.settings=D.settings||{};
    D.settings.usdRate=mvf('usd')||450;
    D.settings.eurRate=mvf('eur')||500;
    D.settings.rubRate=mvf('rub')||4.8;
    save();renderDashboard();closeModal();
  });
  // Try auto-fetch
  setTimeout(async()=>{
    const ok=await fetchFxRates();
    if(ok){
      const s2=D.settings;
      document.querySelector('#m-usd') && (document.querySelector('#m-usd').value=s2.usdRate);
      document.querySelector('#m-eur') && (document.querySelector('#m-eur').value=s2.eurRate);
      document.querySelector('#m-rub') && (document.querySelector('#m-rub').value=s2.rubRate);
    }
  },300);
}
async function fetchFxRates(){
  try{
    const r=await fetch('https://open.er-api.com/v6/latest/KZT');
    const data=await r.json();
    if(data&&data.rates){
      const usd=1/data.rates['USD'],eur=1/data.rates['EUR'],rub=1/data.rates['RUB'];
      D.settings=D.settings||{};
      D.settings.usdRate=Math.round(usd);
      D.settings.eurRate=Math.round(eur);
      D.settings.rubRate=Math.round(rub*100)/100;
      D.settings.fxUpdated=new Date().toLocaleString('ru-RU');
      save();renderDashboard();
      return true;
    }
  }catch(e){console.log('FX fetch failed',e);}
  return false;
}