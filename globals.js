
function addAccount(){
  const name=document.getElementById('acc-name').value.trim();
  const type=document.getElementById('acc-type').value;
  const balance=safeNum('acc-balance')||0;
  const cur=document.getElementById('acc-cur').value;
  if(!name){alert('Введите название счёта');return;}
  D.accounts.push({id:Date.now(),name,type,balance,cur});
  save();renderAccounts();updTransferDropdowns();
  document.getElementById('acc-name').value='';
  document.getElementById('acc-balance').value='';
}

function editAccount(id){
  const a=D.accounts.find(x=>x.id===id);if(!a)return;
  const html=`<div class="form-row c2">${mF('Название','name',a.name)}${mF('Тип','type',a.type,null,['Карта','Наличные','Текущий счёт','Другое'])}</div><div class="form-row c2">${mF('Баланс','bal',a.balance,'text')}${mF('Валюта','cur',a.cur,null,['KZT','USD','EUR'])}</div>`;
  openModal('РЕДАКТИРОВАТЬ СЧЁТ',html,()=>{a.name=mv('name');a.type=mv('type');a.balance=safeParseFloat(mv('bal'))||0;a.cur=mv('cur');save();renderAccounts();updTransferDropdowns();closeModal();});
}

function delAccount(id){if(!confirm('Удалить счёт?'))return;D.accounts=D.accounts.filter(x=>x.id!==id);save();renderAccounts();updTransferDropdowns();}

function renderAccounts(){
  const list=document.getElementById('accounts-list');if(!list)return;
  if(!D.accounts.length&&!D.deposits.length){list.innerHTML='<div class="empty">Счета не добавлены</div>';return;}
  let html='';
  // Show manual accounts
  D.accounts.forEach(a=>{
    html+=`<div class="acc-card"><div><div style="font-size:13px;font-weight:500;color:var(--text);">${a.name}</div><div style="font-size:10px;font-family:var(--mono);color:var(--text3);">${a.type}</div></div><div style="display:flex;align-items:center;gap:10px;"><div style="font-family:var(--mono);font-size:14px;color:var(--green);">${fmt(a.balance,0)} ${a.cur}</div><button class="btn sm edit" onclick="editAccount(${a.id})">✎</button><button class="btn sm del" onclick="delAccount(${a.id})">✕</button></div></div>`;
  });
  // Show deposits as accounts
  if(D.deposits.length){
    html+=`<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin:10px 0 6px;letter-spacing:1px;">ДЕПОЗИТЫ:</div>`;
    D.deposits.forEach(d=>{html+=`<div class="acc-card" style="border-color:var(--imp-bdr);"><div><div style="font-size:13px;font-weight:500;color:var(--blue);">${d.bank}</div><div style="font-size:10px;font-family:var(--mono);color:var(--text3);">Депозит</div></div><div style="font-family:var(--mono);font-size:14px;color:var(--green);">${fmt(d.sum,0)} ${d.cur}</div></div>`;});
  }
  list.innerHTML=html;
}

function updTransferDropdowns(){
  const allAccounts=[
    ...D.accounts.map(a=>({id:'acc_'+a.id,label:a.name+' ('+a.cur+')',balance:a.balance})),
    ...D.deposits.map(d=>({id:'dep_'+d.id,label:d.bank+' депозит ('+d.cur+')',balance:d.sum})),
    {id:'external',label:'Внешний источник / Наличные',balance:0}
  ];
  ['tr-from','tr-to'].forEach(selId=>{
    const sel=document.getElementById(selId);if(!sel)return;
    sel.innerHTML='<option value="">— выберите —</option>'+allAccounts.map(a=>`<option value="${a.id}">${a.label}</option>`).join('');
  });
}

function addTransfer(){
  const fromId=document.getElementById('tr-from').value;
  const toId=document.getElementById('tr-to').value;
  const sum=safeNum('tr-sum');
  const date=document.getElementById('tr-date').value;
  const note=document.getElementById('tr-note').value.trim();
  if(!fromId||!toId||isNaN(sum)||sum<=0||!date){alert('Заполните все поля');return;}
  if(fromId===toId){alert('Откуда и куда не могут совпадать');return;}
  // Update balances
  if(fromId.startsWith('acc_')){const a=D.accounts.find(x=>x.id===parseInt(fromId.slice(4)));if(a)a.balance-=sum;}
  if(fromId.startsWith('dep_')){const d=D.deposits.find(x=>x.id===parseInt(fromId.slice(4)));if(d)d.sum-=sum;}
  if(toId.startsWith('acc_')){const a=D.accounts.find(x=>x.id===parseInt(toId.slice(4)));if(a)a.balance+=sum;}
  if(toId.startsWith('dep_')){const d=D.deposits.find(x=>x.id===parseInt(toId.slice(4)));if(d)d.sum+=sum;}
  // Get labels
  const allAccs=[...D.accounts.map(a=>({id:'acc_'+a.id,label:a.name})),...D.deposits.map(d=>({id:'dep_'+d.id,label:d.bank+' (депозит)'})),{id:'external',label:'Внешний источник'}];
  const fromLabel=allAccs.find(x=>x.id===fromId)?.label||fromId;
  const toLabel=allAccs.find(x=>x.id===toId)?.label||toId;
  D.transfers.push({id:Date.now(),fromId,toId,fromLabel,toLabel,sum,date,note});
  save();renderAccounts();renderTransfers();renderDeposits();updTransferDropdowns();
  document.getElementById('tr-sum').value='';document.getElementById('tr-date').value='';document.getElementById('tr-note').value='';
}

function delTransfer(id){
  if(!confirm('Удалить перевод? Балансы не восстановятся автоматически.'))return;
  D.transfers=D.transfers.filter(x=>x.id!==id);save();renderTransfers();
}

function renderTransfers(){
  const tb=document.getElementById('transfers-tbody');if(!tb)return;
  if(!D.transfers.length){tb.innerHTML='<tr><td colspan="6" class="empty">—</td></tr>';return;}
  const sorted=[...D.transfers].sort((a,b)=>b.date.localeCompare(a.date));
  tb.innerHTML=sorted.map(t=>`<tr><td>${t.date}</td><td class="tk">${t.fromLabel}</td><td class="nm">${t.toLabel}</td><td class="r pos">${fmt(t.sum,0)}</td><td>${t.note||'—'}</td><td><button class="btn sm del" onclick="delTransfer(${t.id})">✕</button></td></tr>`).join('');
}

// ============ DEBTS SYSTEM ============