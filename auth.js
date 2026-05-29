
function paySubNow(id){
  const s=D.subs.find(x=>x.id===id);if(!s)return;
  const date=td();
  D.expenses.push({id:Date.now(),cat:'Подписки',subcat:s.cat,sum:s.sum,date,cur:s.cur,desc:s.name,source:'subscription',subId:id});
  save();renderSubs();renderExpenses();
  alert('Платёж зафиксирован: '+s.name+' — '+fmt(s.sum,0)+' '+s.cur);
}

function addSub(){
  const name=document.getElementById('sub-name').value.trim(),sum=safeNum('sub-sum'),day=parseInt(document.getElementById('sub-day').value)||1,cur=document.getElementById('sub-cur').value,cat=document.getElementById('sub-cat').value;
  if(!name||isNaN(sum)){alert('Заполните название и сумму');return;}
  D.subs.push({id:Date.now(),name,sum,day,cur,cat});save();renderSubs();
  ['sub-name','sub-sum','sub-day'].forEach(id=>document.getElementById(id).value='');
}

function editSub(id){
  const s=D.subs.find(x=>x.id===id);if(!s)return;
  const html=`<div class="form-row c2">${mF('Название','name',s.name)}${mF('Сумма/мес','sum',s.sum,'number')}</div><div class="form-row c3">${mF('День','day',s.day,'number')}${mF('Валюта','cur',s.cur,null,['KZT','USD'])}${mF('Категория','cat',s.cat,null,['Развлечения','Связь','Работа','Здоровье','Другое'])}</div>`;
  openModal('РЕДАКТИРОВАТЬ ПОДПИСКУ',html,()=>{s.name=mv('name');s.sum=mvf('sum');s.day=parseInt(mv('day'))||1;s.cur=mv('cur');s.cat=mv('cat');save();renderSubs();closeModal();});
}

function delSub(id){if(!confirm('Удалить?'))return;D.subs=D.subs.filter(x=>x.id!==id);save();renderSubs();}

function renderSubs(){
  const list=document.getElementById('sub-list'),tot=document.getElementById('sub-total');
  if(!D.subs.length){list.innerHTML='<div class="empty">—</div>';tot.innerHTML='';return;}
  list.innerHTML=D.subs.map(s=>{
    const payments=D.expenses.filter(e=>e.subId===s.id);
    const lastPay=payments.length?[...payments].sort((a,b)=>b.date.localeCompare(a.date))[0]:null;
    const lastPayStr=lastPay?`<span style="color:var(--text3);font-size:9px;">последний: ${lastPay.date}</span>`:'<span style="color:var(--red);font-size:9px;">не оплачено</span>';
    return`<div class="sub-item">
      <div>
        <div style="font-size:13px;color:var(--text);">${s.name}</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);">${s.cat} • ${s.day}-го числа • ${lastPayStr}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="font-family:var(--mono);font-size:13px;color:var(--text2);">${fmt(s.sum,0)} ${s.cur}/мес</div>
        <button class="btn sm grn" onclick="paySubNow(${s.id})" title="Зафиксировать платёж">✓ ОПЛАТИЛ</button>
        <button class="btn sm edit" onclick="editSub(${s.id})">✎</button>
        <button class="btn sm del" onclick="delSub(${s.id})">✕</button>
      </div>
    </div>`;
  }).join('');
  const kzt=D.subs.filter(s=>s.cur==='KZT').reduce((s,x)=>s+x.sum,0),usd=D.subs.filter(s=>s.cur==='USD').reduce((s,x)=>s+x.sum,0);
  let t='<span style="color:var(--gold);">ИТОГО/МЕС: </span>';
  if(kzt)t+=`<span style="color:var(--text);margin-right:12px;">${fmt(kzt,0)} KZT</span>`;
  if(usd)t+=`<span style="color:var(--text);">${fmt(usd,0)} USD</span>`;
  tot.innerHTML=t;
}

// GARAGE