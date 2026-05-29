
function renderDashboard(){
  const ymN=ymOf(),now=new Date();
  const s=D.settings||{usdRate:450,eurRate:500,rubRate:4.8};
  const depKZT=D.deposits.reduce((sum,d)=>{let v=d.sum;if(d.cur==='USD')v=v*s.usdRate;else if(d.cur==='EUR')v=v*s.eurRate;else if(d.cur==='RUB')v=v*(s.rubRate||4.8);return sum+v;},0);
  const propAssetsVal=D.properties.reduce((s,p)=>s+(p.value||0),0);
  const incA=D.assets.filter(a=>a.cat==='income').reduce((s2,a)=>s2+a.buy,0)+depKZT+D.invest.reduce((s2,p)=>s2+p.qty*p.currentPrice,0)+propAssetsVal;
  const privateDebtTotal=D.privateDebts.reduce((s,d)=>s+Math.max((d.returnSum||d.sum)-(d.paid||0),0),0);
  const iOweMeTotal=D.iOweMe.reduce((s,d)=>s+Math.max(d.sum-(d.returned||0),0),0);
  const debt=D.credits.reduce((s,c)=>s+(c.rest||0),0)+privateDebtTotal,nw=incA+iOweMeTotal-debt;
  const mInc=D.income.filter(i=>i.date.slice(0,7)===ymN).reduce((s,i)=>s+i.sum,0);
  const mExp=D.expenses.filter(e=>e.date.slice(0,7)===ymN).reduce((s,e)=>s+e.sum,0);
  const bal=mInc-mExp,divTot=D.dividends.reduce((s,d)=>s+d.amount*d.qty,0),rentM=D.rent.reduce((s,r)=>s+r.sum,0);
  const rewardVal=D.invest.filter(p=>p.source==='cashback').reduce((s,p)=>s+p.qty*p.currentPrice,0);
  // NW history
  D.nwHistory=D.nwHistory||[];const nwByM={};D.nwHistory.forEach(h=>{nwByM[h.m]=h.v;});nwByM[ymN]=nw;D.nwHistory=Object.keys(nwByM).sort().map(m=>({m,v:nwByM[m]}));
  // Insight
  const prevM=ymOf(new Date(now.getFullYear(),now.getMonth()-1,1));
  const pInc=D.income.filter(i=>i.date.slice(0,7)===prevM).reduce((s,i)=>s+i.sum,0);
  const pExp=D.expenses.filter(e=>e.date.slice(0,7)===prevM).reduce((s,e)=>s+e.sum,0);
  let iHtml='';
  if(mInc||mExp||pInc||pExp){
    const id=pInc?((mInc-pInc)/pInc)*100:0,ed=pExp?((mExp-pExp)/pExp)*100:0;
    const top=Object.entries(D.expenses.filter(e=>e.date.slice(0,7)===ymN).reduce((r,e)=>{r[e.cat]=(r[e.cat]||0)+e.sum;return r;},{})).sort((a,b)=>b[1]-a[1])[0];
    iHtml=`<div class="ins-block"><div class="ins-title">💡 ФИНАНСОВЫЙ ИТОГ МЕСЯЦА</div><div class="ins-text">${bal>=0?`<span class="pos">Баланс положительный: +${fmt(bal,0)} тг.</span>`:`<span class="neg">Баланс отрицательный: ${fmt(bal,0)} тг.</span>`}${id!==0?` Доходы ${id>=0?'<span class="pos">выросли':'<span class="neg">упали'} на ${fmt(Math.abs(id),1)}%</span> к прошлому месяцу.`:''}${ed!==0?` Расходы ${ed>=0?'<span class="neg">выросли':'<span class="pos">снизились'} на ${fmt(Math.abs(ed),1)}%</span>.`:''}${top?` Главная статья расходов: <span class="gold">${top[0]} (${fmt(top[1],0)} тг)</span>.`:''}${debt>0?` Долговая нагрузка: <span class="neg">${fmt(debt,0)} тг</span>.`:''}</div></div>`;
  }
  document.getElementById('dash-insight').innerHTML=iHtml;
  // KPIs
  document.getElementById('dash-kpis').innerHTML=`
    <div class="kpi imp"><div class="kpi-label">ЧИСТЫЙ КАПИТАЛ</div><div class="kpi-val ${nw>=0?'gold':'red'}">${fmt(nw,0)}</div><div class="kpi-sub">Доходные активы − Долги</div></div>
    <div class="kpi imp"><div class="kpi-label">ДОХОДНЫЕ АКТИВЫ</div><div class="kpi-val blue">${fmt(incA,0)}</div><div class="kpi-sub">Активы + вклады + портфель</div></div>
    <div class="kpi ${debt>0?'crit':'rtn'}"><div class="kpi-label">ДОЛГИ</div><div class="kpi-val red">${fmt(debt,0)}</div><div class="kpi-sub">Остаток по кредитам</div></div>
    <div class="kpi pos-k"><div class="kpi-label">ДОХОД МЕСЯЦ</div><div class="kpi-val green">${fmt(mInc,0)}</div><div class="kpi-sub">${ymN}</div></div>
    <div class="kpi ${mExp>mInc?'crit':'rtn'}"><div class="kpi-label">РАСХОДЫ МЕСЯЦ</div><div class="kpi-val red">${fmt(mExp,0)}</div><div class="kpi-sub">${ymN}</div></div>
    <div class="kpi ${bal>=0?'pos-k':'crit'}"><div class="kpi-label">БАЛАНС МЕСЯЦ</div><div class="kpi-val ${bal>=0?'green':'red'}">${bal>=0?'+':''}${fmt(bal,0)}</div><div class="kpi-sub">Доходы − Расходы</div></div>
    <div class="kpi pos-k"><div class="kpi-label">АРЕНДА / МЕС</div><div class="kpi-val green">${fmt(rentM,0)}</div><div class="kpi-sub">Пассивный доход</div></div>
    <div class="kpi pos-k"><div class="kpi-label">ДИВИДЕНДЫ</div><div class="kpi-val green">${fmt(divTot,0)}</div><div class="kpi-sub">Всего получено</div></div>
    ${rewardVal>0?`<div class="kpi imp"><div class="kpi-label">КЭШБЭК АКТИВЫ</div><div class="kpi-val blue">${fmt(rewardVal,0)}</div><div class="kpi-sub">Наградные позиции</div></div>`:''}
    ${iOweMeTotal>0?`<div class="kpi pos-k"><div class="kpi-label">МНЕ ДОЛЖНЫ</div><div class="kpi-val green">${fmt(iOweMeTotal,0)}</div><div class="kpi-sub">Ожидаемые возвраты</div></div>`:''}
    ${privateDebtTotal>0?`<div class="kpi crit"><div class="kpi-label">Я ДОЛЖЕН (частн.)</div><div class="kpi-val red">${fmt(privateDebtTotal,0)}</div><div class="kpi-sub">Частные долги</div></div>`:''}`;
  // Assets pie
  const ad={};if(D.assets.filter(a=>a.cat==='income').length)ad['Активы']=D.assets.filter(a=>a.cat==='income').reduce((s,a)=>s+a.buy,0);if(D.properties.length)ad['Недвижимость']=D.properties.reduce((s,p)=>s+(p.value||0),0);if(D.deposits.length)ad['Депозиты']=D.deposits.reduce((s,d)=>s+d.sum,0);if(D.invest.length)ad['Инвестиции']=D.invest.reduce((s,p)=>s+p.qty*p.currentPrice,0);
  const al=Object.keys(ad),av=al.map(k=>ad[k]),ab=al.map((_,i)=>CLR[i%CLR.length]);
  if(al.length){mkChart('c-assets','doughnut',{labels:al,datasets:[{data:av,backgroundColor:ab,borderColor:'#070b12',borderWidth:2}]},{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}});const tot=av.reduce((s,v)=>s+v,0);document.getElementById('l-assets').innerHTML=al.map((l,i)=>{const p=tot?((av[i]/tot)*100).toFixed(1):0;return`<span style="display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;background:${ab[i]};display:inline-block;"></span>${l} ${p}%</span>`;}).join('');}
  // Income vs expenses
  const m6=[];for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);m6.push(ymOf(d));}
  const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,labels:{color:'#8a9ab5',font:{family:'IBM Plex Mono',size:10},boxWidth:10}}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};
  mkChart('c-inout','bar',{labels:m6,datasets:[{label:'Доходы',data:m6.map(m=>D.income.filter(x=>x.date.slice(0,7)===m).reduce((s,x)=>s+x.sum,0)),backgroundColor:'rgba(0,200,150,0.6)',borderColor:'#00c896',borderWidth:1},{label:'Расходы',data:m6.map(m=>D.expenses.filter(x=>x.date.slice(0,7)===m).reduce((s,x)=>s+x.sum,0)),backgroundColor:'rgba(240,82,82,0.5)',borderColor:'#f05252',borderWidth:1}]},base);
  // Income vs Expenses % legend
  const legend=document.getElementById('inout-legend');
  if(legend){
    const pctData=m6.map(m=>{
      const inc=D.income.filter(x=>x.date.slice(0,7)===m).reduce((s,x)=>s+x.sum,0);
      const exp=D.expenses.filter(x=>x.date.slice(0,7)===m).reduce((s,x)=>s+x.sum,0);
      return{m,inc,exp,pct:inc>0?Math.round((exp/inc)*100):null};
    }).filter(x=>x.inc>0||x.exp>0);
    legend.innerHTML=pctData.map(x=>{
      const over=x.pct>100,ok=x.pct<=70;
      const color=over?'var(--red)':ok?'var(--green)':'var(--gold)';
      const label=over?'перерасход':'профицит';
      const diff=x.pct!==null?(over?x.pct-100:100-x.pct):null;
      return`<span style="color:${color};">${monthLabel(x.m)}: ${label} ${diff!==null?diff+'%':'—'}</span>`;
    }).join('<span style="color:var(--text3);margin:0 6px;">|</span>');
  }
  // NW chart
  if(D.nwHistory.length>1){const nwB={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10},maxRotation:0,autoSkip:true,maxTicksLimit:8},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};mkChart('c-networth','line',{labels:D.nwHistory.map(h=>h.m),datasets:[{data:D.nwHistory.map(h=>h.v),borderColor:'#fbb804',backgroundColor:'rgba(251,188,4,0.06)',borderWidth:2,pointRadius:4,pointBackgroundColor:'#fbb804',fill:true,tension:.3}]},nwB);}
  // Reminders
  const items=buildReminders().slice(0,5);const dr=document.getElementById('dash-reminders'),panel=document.getElementById('dash-rem-panel');
  if(!items.length){dr.innerHTML='<div style="color:var(--text3);font-family:var(--mono);font-size:11px;">Нет срочных напоминаний</div>';panel.style.display='none';return;}
  panel.style.display='block';dr.innerHTML=remHTML(items);
  // Nav critical badge
  if(items.some(i=>i.pri==='crit')){document.querySelectorAll('.nav-btn').forEach(b=>{if(b.textContent.includes('НАПОМИНАНИЯ'))b.classList.add('crit');});}
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