
function addCredit(){
  const bank=document.getElementById('cr-bank').value.trim(),total=safeNum('cr-total'),rest=safeNum('cr-rest');
  const pay=safeNum('cr-pay')||0,rate=safeNum('cr-rate')||0,end=document.getElementById('cr-end').value,type=document.getElementById('cr-type').value;
  if(!bank||isNaN(total)||isNaN(rest)){alert('Заполните обязательные поля');return;}
  D.credits.push({id:Date.now(),bank,total,rest,pay,rate,end,type,updAt:td()});
  save();renderCredits();
  ['cr-bank','cr-total','cr-rest','cr-pay','cr-rate','cr-end'].forEach(id=>document.getElementById(id).value='');
}

function editCredit(id){
  const c=D.credits.find(x=>x.id===id);if(!c)return;
  const html=`<div class="form-row c3">${mF('Банк','bank',c.bank)}${mF('Тип','type',c.type,null,['Ипотека','Потребительский','Автокредит','Бизнес','Другое'])}${mF('Начальная','total',c.total,'number')}</div><div class="form-row c3">${mF('Остаток','rest',c.rest,'number')}${mF('Платёж/мес','pay',c.pay,'number')}${mF('Ставка %','rate',c.rate,'number')}</div><div class="form-row">${mF('Дата закрытия','end',c.end,'date')}</div>`;
  openModal('РЕДАКТИРОВАТЬ КРЕДИТ',html,()=>{c.bank=mv('bank');c.type=mv('type');c.total=mvf('total');c.rest=mvf('rest');c.pay=mvf('pay');c.rate=mvf('rate');c.end=mv('end');c.updAt=td();save();renderCredits();closeModal();});
}

function delCredit(id){if(!confirm('Удалить?'))return;D.credits=D.credits.filter(x=>x.id!==id);save();renderCredits();}

function renderCredits(){
  const tb=document.getElementById('cr-tbody');
  if(!D.credits.length){tb.innerHTML='<tr><td colspan="10" class="empty">—</td></tr>';return;}
  tb.innerHTML=D.credits.map(c=>{
    const pct=c.total?(((c.total-c.rest)/c.total)*100):0;
    return`<tr class="rc"><td class="nm">${c.bank}</td><td>${c.type}</td><td class="r">${fmt(c.total,0)}</td><td class="r neg">${fmt(c.rest,0)}</td><td class="r">${fmt(c.pay,0)}</td><td class="r">${fmt(c.rate,1)}%</td><td>${c.end||'—'}</td><td class="r"><div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;min-width:50px;"><div class="pw" style="margin:0;"><div class="pb-bar green" style="width:${Math.min(pct,100)}%"></div></div></div><span style="font-size:10px;color:var(--text2)">${fmt(pct,0)}%</span></div></td><td style="font-size:10px;color:var(--text3);">${c.updAt||'—'}</td><td style="display:flex;gap:4px;"><button class="btn sm edit" onclick="editCredit(${c.id})">✎</button><button class="btn sm del" onclick="delCredit(${c.id})">✕</button></td></tr>`;
  }).join('');
}

// ASSETS