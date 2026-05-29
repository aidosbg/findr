
function addIncome(){
  const type=document.getElementById('inc-type').value,sum=safeNum('inc-sum'),date=document.getElementById('inc-date').value,cur=document.getElementById('inc-cur').value,desc=document.getElementById('inc-desc').value.trim();
  const depLink=document.getElementById('inc-dep-link').value||null;
  if(isNaN(sum)||!date){alert('Заполните сумму и дату');return;}
  D.income.push({id:Date.now(),type,sum,date,cur,desc,depLink});
  // If deposit linked — add to deposit balance
  if(depLink){
    const dep=D.deposits.find(d=>String(d.id)===String(depLink));
    if(dep){dep.sum+=sum;dep.updAt=td();}
  }
  save();renderIncome();if(depLink)renderDeposits();
  ['inc-sum','inc-date','inc-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('inc-dep-link').value='';
}

function updIncomeDepDropdown(){
  const sel=document.getElementById('inc-dep-link');if(!sel)return;
  sel.innerHTML='<option value="">— не направлять —</option>'+D.deposits.map(d=>`<option value="${d.id}">${d.bank} (${fmt(d.sum,0)} ${d.cur})</option>`).join('');
}

function editIncome(id){
  const i=D.income.find(x=>x.id===id);if(!i)return;
  const html=`<div class="form-row c2">${mF('Тип','type',i.type,null,['Зарплата','ИП','Аренда','Дивиденды','Прочее'])}${mF('Сумма','sum',i.sum,'number')}</div><div class="form-row c2">${mF('Дата','date',i.date,'date')}${mF('Валюта','cur',i.cur,null,['KZT','USD','RUB'])}</div><div class="form-row">${mF('Описание','desc',i.desc)}</div>`;
  openModal('РЕДАКТИРОВАТЬ ДОХОД',html,()=>{i.type=mv('type');i.sum=mvf('sum');i.date=mv('date');i.cur=mv('cur');i.desc=mv('desc');save();renderIncome();closeModal();});
}

function delIncome(id){if(!confirm('Удалить?'))return;D.income=D.income.filter(x=>x.id!==id);save();renderIncome();}

function sortIncome(mode,el){incSort=mode;document.querySelectorAll('.st').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderIncome();}

function incRow(i){
  const rc=i.type==='Зарплата'||i.type==='ИП'?'ri':'';
  return`<tr class="${rc}"><td class="tk">${i.type}</td><td>${i.desc||'—'}</td><td class="r pos">${fmt(i.sum,0)}</td><td>${i.date}</td><td>${i.cur}</td><td style="display:flex;gap:4px;"><button class="btn sm edit" onclick="editIncome(${i.id})">✎</button><button class="btn sm del" onclick="delIncome(${i.id})">✕</button></td></tr>`;
}

function renderIncome(){
  const tb=document.getElementById('inc-tbody');
  if(!D.income.length){tb.innerHTML='<tr><td colspan="6" class="empty">—</td></tr>';return;}
  let s=[...D.income];
  if(incSort==='date')s.sort((a,b)=>b.date.localeCompare(a.date));
  else if(incSort==='type')s.sort((a,b)=>a.type.localeCompare(b.type)||b.date.localeCompare(a.date));
  else if(incSort==='amount')s.sort((a,b)=>b.sum-a.sum);
  else s.sort((a,b)=>b.date.slice(0,7).localeCompare(a.date.slice(0,7))||b.date.localeCompare(a.date));
  let html='';
  if(incSort==='type'){
    const g={};s.forEach(i=>{if(!g[i.type])g[i.type]=[];g[i.type].push(i);});
    Object.keys(g).forEach(t=>{const tot=g[t].reduce((x,i)=>x+i.sum,0);html+=`<tr><td colspan="6" style="background:var(--bg4);color:var(--blue);font-size:10px;letter-spacing:1px;padding:6px 10px;font-family:var(--mono);">▸ ${t} — ${fmt(tot,0)}</td></tr>`;g[t].forEach(i=>html+=incRow(i));});
  } else if(incSort==='month'){
    const g={};s.forEach(i=>{const m=i.date.slice(0,7);if(!g[m])g[m]=[];g[m].push(i);});
    Object.keys(g).sort((a,b)=>b.localeCompare(a)).forEach(m=>{const tot=g[m].reduce((x,i)=>x+i.sum,0);html+=`<tr><td colspan="6" style="background:var(--bg4);color:var(--gold);font-size:10px;letter-spacing:1px;padding:6px 10px;font-family:var(--mono);">▸ ${m} — ${fmt(tot,0)}</td></tr>`;g[m].forEach(i=>html+=incRow(i));});
  } else s.forEach(i=>html+=incRow(i));
  tb.innerHTML=html;
}

// EXPENSES