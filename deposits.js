
function updateSubcat(){document.getElementById('subcat-wrap').style.display=document.getElementById('exp-cat').value==='Личный транспорт'?'flex':'none';}

function addExpense(){
  const cat=document.getElementById('exp-cat').value,subcat=cat==='Личный транспорт'?document.getElementById('exp-subcat').value:'';
  const sum=safeNum('exp-sum'),date=document.getElementById('exp-date').value,cur=document.getElementById('exp-cur').value,desc=document.getElementById('exp-desc').value.trim();
  if(isNaN(sum)||!date){alert('Заполните сумму и дату');return;}
  D.expenses.push({id:Date.now(),cat,subcat,sum,date,cur,desc});
  save();renderExpenses();renderExpAnalytics();
  ['exp-sum','exp-date','exp-desc'].forEach(id=>document.getElementById(id).value='');
}

function editExpense(id){
  const e=D.expenses.find(x=>x.id===id);if(!e)return;
  const cats=['Продукты','Коммунальные','Личный транспорт','Рестораны','Одежда','Здоровье','Образование','Развлечения','Дети','Путешествия','Связь','Разное'];
  const sc=['Бензин','Мойка','Техобслуживание','Запчасти','Штрафы','Парковка','Прочее'];
  const html=`<div class="form-row c2">${mF('Категория','cat',e.cat,null,cats)}${mF('Подкатегория','subcat',e.subcat,null,sc)}</div><div class="form-row c2">${mF('Сумма','sum',e.sum,'number')}${mF('Дата','date',e.date,'date')}</div><div class="form-row c2">${mF('Валюта','cur',e.cur,null,['KZT','USD'])}${mF('Описание','desc',e.desc)}</div>`;
  openModal('РЕДАКТИРОВАТЬ РАСХОД',html,()=>{e.cat=mv('cat');e.subcat=mv('subcat');e.sum=mvf('sum');e.date=mv('date');e.cur=mv('cur');e.desc=mv('desc');save();renderExpenses();renderExpAnalytics();closeModal();});
}

function delExpense(id){if(!confirm('Удалить?'))return;D.expenses=D.expenses.filter(x=>x.id!==id);save();renderExpenses();renderExpAnalytics();}

function renderExpenses(){
  const tb=document.getElementById('exp-tbody');
  if(!D.expenses.length){tb.innerHTML='<tr><td colspan="7" class="empty">—</td></tr>';renderExpCharts();return;}
  const s=[...D.expenses].sort((a,b)=>b.date.localeCompare(a.date));
  const cc=['Коммунальные','Налог на транспорт'],ic=['Здоровье','Личный транспорт','Образование','Подписки'];
  tb.innerHTML=s.map(e=>{const rc=cc.includes(e.cat)?'rc':ic.includes(e.cat)?'ri':'';const srcBadge=e.source?`<span class="badge grey" style="margin-left:4px;font-size:8px;">${e.source}</span>`:'';return`<tr class="${rc}"><td class="tk">${e.cat}</td><td>${e.subcat||'—'}</td><td>${e.desc||'—'}${srcBadge}</td><td class="r neg">${fmt(e.sum,0)}</td><td>${e.date}</td><td>${e.cur}</td><td style="display:flex;gap:4px;">${e.source?'':'<button class="btn sm edit" onclick="editExpense('+e.id+')">✎</button>'}<button class="btn sm del" onclick="delExpense(${e.id})">✕</button></td></tr>`;}).join('');
  renderExpCharts();
}

function renderExpCharts(){
  const ymN=ymOf();const tm=D.expenses.filter(e=>e.date.slice(0,7)===ymN);
  if(tm.length){const by={};tm.forEach(e=>{const k=e.cat+(e.subcat?'/'+e.subcat:'');by[k]=(by[k]||0)+e.sum;});const lb=Object.keys(by),dt=lb.map(k=>by[k]),bg=lb.map((_,i)=>CLR[i%CLR.length]);mkChart('c-exp-pie','doughnut',{labels:lb,datasets:[{data:dt,backgroundColor:bg,borderColor:'#070b12',borderWidth:2}]},{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}});}
  const bm={};D.expenses.forEach(e=>{const m=e.date.slice(0,7);bm[m]=(bm[m]||0)+e.sum;});
  const ms=Object.keys(bm).sort().slice(-6);
  if(ms.length){const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};mkChart('c-exp-bar','bar',{labels:ms,datasets:[{data:ms.map(m=>bm[m]),backgroundColor:'rgba(240,82,82,0.6)',borderColor:'#f05252',borderWidth:1}]},base);}
}

function byCat(m){const r={};D.expenses.filter(e=>e.date.slice(0,7)===m).forEach(e=>{r[e.cat]=(r[e.cat]||0)+e.sum;});return r;}

function renderExpAnalytics(){
  const now=new Date(),ymN=ymOf();
  const m3=[];for(let i=2;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);m3.push(ymOf(d));}
  const prev=m3[1],curr=byCat(ymN),prevC=byCat(prev);
  const avg3={};m3.forEach(m=>{const b=byCat(m);Object.keys(b).forEach(k=>{avg3[k]=(avg3[k]||0)+b[k]/3;});});
  // Anomalies
  const ab=document.getElementById('anom-body');
  const allC=[...new Set([...Object.keys(curr),...Object.keys(avg3)])];
  const anoms=allC.map(cat=>{const c=curr[cat]||0,a=avg3[cat]||0;if(a===0)return null;const d=((c-a)/a)*100;return{cat,c,a,d};}).filter(x=>x&&Math.abs(x.d)>=20).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));
  ab.innerHTML=anoms.length?anoms.map(a=>{const up=a.d>0,cl=up?'up':'dn',col=up?'var(--red)':'var(--green)',ic=up?'▲':'▼';return`<div class="anom-item ${cl}"><div><div style="font-size:12px;color:var(--text);">${a.cat}</div><div style="font-size:10px;font-family:var(--mono);color:var(--text3);">Ср. за 3 мес: ${fmt(a.a,0)} тг</div></div><div style="font-family:var(--mono);font-size:12px;color:${col};">${ic} ${fmt(Math.abs(a.d),0)}% | ${fmt(a.c,0)} тг</div></div>`;}).join(''):'<div class="empty">Аномалий не обнаружено</div>';
  // MTM
  const mb=document.getElementById('mtm-body');
  if(!Object.keys(prevC).length){mb.innerHTML='<div class="empty">Нет данных за прошлый месяц</div>';return;}
  const totC=Object.values(curr).reduce((s,v)=>s+v,0),totP=Object.values(prevC).reduce((s,v)=>s+v,0),totD=totP?((totC-totP)/totP)*100:0;
  let html=`<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
    <div class="ins-block" style="flex:1;min-width:160px;"><div class="ins-title">ЭТОТ МЕСЯЦ</div><div style="font-size:20px;font-family:var(--mono);color:var(--text);">${fmt(totC,0)}</div></div>
    <div class="ins-block" style="flex:1;min-width:160px;"><div class="ins-title">ПРОШЛЫЙ МЕСЯЦ</div><div style="font-size:20px;font-family:var(--mono);color:var(--text2);">${fmt(totP,0)}</div></div>
    <div class="ins-block" style="flex:1;min-width:160px;"><div class="ins-title">ИЗМЕНЕНИЕ</div><div style="font-size:20px;font-family:var(--mono);" class="${totD>0?'neg':'pos'}">${totD>=0?'+':''}${fmt(totD,1)}%</div></div>
  </div><div class="tbl-w"><table><thead><tr><th>КАТЕГОРИЯ</th><th class="r">ПРОШЛЫЙ МЕС</th><th class="r">ЭТОТ МЕС</th><th class="r">ИЗМЕНЕНИЕ</th><th class="r">%</th></tr></thead><tbody>`;
  const allM=[...new Set([...Object.keys(curr),...Object.keys(prevC)])];
  allM.forEach(cat=>{const c=curr[cat]||0,p=prevC[cat]||0,d=c-p,dp=p?(d/p)*100:0;const cl=d>0?'neg':'pos',rc=d>0&&dp>30?'rc':d>0?'ri':'';html+=`<tr class="${rc}"><td class="tk">${cat}</td><td class="r">${fmt(p,0)}</td><td class="r">${fmt(c,0)}</td><td class="r ${cl}">${d>=0?'+':''}${fmt(d,0)}</td><td class="r ${cl}">${d>=0?'+':''}${fmt(dp,1)}%</td></tr>`;});
  mb.innerHTML=html+'</tbody></table></div>';
}

// RENT