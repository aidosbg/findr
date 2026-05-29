
function showDebtTab(tab,el){
  document.querySelectorAll('.debt-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.debt-pane').forEach(p=>{p.style.display='none';p.classList.remove('active');});
  el.classList.add('active');
  const pane=document.getElementById('debt-'+tab);
  if(pane){pane.style.display='block';pane.classList.add('active');}
}

function togglePdRate(){
  const type=document.getElementById('pd-rate-type').value;
  const wrap=document.getElementById('pd-rate-wrap');
  const label=document.getElementById('pd-rate-label');
  if(type==='none'){wrap.style.display='none';}
  else{wrap.style.display='grid';label.textContent=type==='percent'?'Ставка % годовых':'Фиксированная сумма возврата';}
}

function addPrivateDebt(){
  const name=document.getElementById('pd-name').value.trim();
  const contact=document.getElementById('pd-contact').value.trim();
  const sum=safeNum('pd-sum');
  const date=document.getElementById('pd-date').value;
  const due=document.getElementById('pd-due').value;
  const rateType=document.getElementById('pd-rate-type').value;
  const rateVal=safeNum('pd-rate-val')||0;
  const terms=document.getElementById('pd-terms').value.trim();
  if(!name||isNaN(sum)||sum<=0){alert('Заполните имя и сумму');return;}
  const returnSum=rateType==='fixed'?rateVal:rateType==='percent'?sum*(1+rateVal/100):sum;
  D.privateDebts.push({id:Date.now(),name,contact,sum,date,due,rateType,rateVal,returnSum,terms,paid:0});
  save();renderPrivateDebts();
  ['pd-name','pd-contact','pd-sum','pd-date','pd-due','pd-rate-val','pd-terms'].forEach(id=>document.getElementById(id).value='');
}

function payPrivateDebt(id){
  const d=D.privateDebts.find(x=>x.id===id);if(!d)return;
  const amount=safeParseFloat(prompt('Сумма платежа:'));
  if(isNaN(amount)||amount<=0)return;
  d.paid=(d.paid||0)+amount;
  D.expenses.push({id:Date.now(),cat:'Долг',subcat:'Частный займ',sum:amount,date:td(),cur:'KZT',desc:'Погашение долга — '+d.name,source:'debt'});
  save();renderPrivateDebts();renderExpenses();
}

function delPrivateDebt(id){if(!confirm('Удалить?'))return;D.privateDebts=D.privateDebts.filter(x=>x.id!==id);save();renderPrivateDebts();}

function renderPrivateDebts(){
  const tb=document.getElementById('pd-tbody');if(!tb)return;
  if(!D.privateDebts.length){tb.innerHTML='<tr><td colspan="9" class="empty">—</td></tr>';return;}
  tb.innerHTML=D.privateDebts.map(d=>{
    const rest=Math.max((d.returnSum||d.sum)-(d.paid||0),0);
    const pct=d.returnSum?(((d.paid||0)/d.returnSum)*100):0;
    const left=d.due?daysLeft(d.due):null;
    const lcl=left!==null&&left<30?'neg':left!==null&&left<7?'neg':'';
    return`<tr class="rc"><td class="nm">${d.name}</td><td style="font-size:10px;color:var(--text3);">${d.contact||'—'}</td><td class="r">${fmt(d.sum,0)}</td><td class="r">${fmt(d.returnSum,0)}</td><td class="r neg">${fmt(rest,0)}</td><td>${d.date||'—'}</td><td class="${lcl}">${d.due||'—'}</td><td style="font-size:10px;">${d.terms||'—'}</td><td style="display:flex;gap:4px;"><button class="btn sm grn" onclick="payPrivateDebt(${d.id})" title="Внести платёж">✓</button><button class="btn sm del" onclick="delPrivateDebt(${d.id})">✕</button></td></tr>`;
  }).join('');
}

function addIOweMe(){
  const name=document.getElementById('iom-name').value.trim();
  const contact=document.getElementById('iom-contact').value.trim();
  const sum=safeNum('iom-sum');
  const date=document.getElementById('iom-date').value;
  const due=document.getElementById('iom-due').value;
  const note=document.getElementById('iom-note').value.trim();
  if(!name||isNaN(sum)||sum<=0){alert('Заполните имя и сумму');return;}
  D.iOweMe.push({id:Date.now(),name,contact,sum,date,due,note,returned:0});
  save();renderIOweMe();
  ['iom-name','iom-contact','iom-sum','iom-date','iom-due','iom-note'].forEach(id=>document.getElementById(id).value='');
}

function returnIOweMe(id){
  const d=D.iOweMe.find(x=>x.id===id);if(!d)return;
  const amount=safeParseFloat(prompt('Сумма возврата:'));
  if(isNaN(amount)||amount<=0)return;
  d.returned=(d.returned||0)+amount;
  D.income.push({id:Date.now(),type:'Прочее',sum:amount,date:td(),cur:'KZT',desc:'Возврат долга — '+d.name});
  save();renderIOweMe();renderIncome();
}

function delIOweMe(id){if(!confirm('Удалить?'))return;D.iOweMe=D.iOweMe.filter(x=>x.id!==id);save();renderIOweMe();}

function renderIOweMe(){
  const tb=document.getElementById('iom-tbody');if(!tb)return;
  if(!D.iOweMe.length){tb.innerHTML='<tr><td colspan="9" class="empty">—</td></tr>';return;}
  tb.innerHTML=D.iOweMe.map(d=>{
    const rest=Math.max(d.sum-(d.returned||0),0);
    const left=d.due?daysLeft(d.due):null;
    const lcl=left!==null&&left<30?'neg':'';
    return`<tr class="ri"><td class="nm">${d.name}</td><td style="font-size:10px;color:var(--text3);">${d.contact||'—'}</td><td class="r">${fmt(d.sum,0)}</td><td class="r pos">${fmt(d.returned||0,0)}</td><td class="r ${rest>0?'neg':'pos'}">${fmt(rest,0)}</td><td>${d.date||'—'}</td><td class="${lcl}">${d.due||'—'}</td><td style="font-size:10px;">${d.note||'—'}</td><td style="display:flex;gap:4px;"><button class="btn sm grn" onclick="returnIOweMe(${d.id})" title="Вернули">✓</button><button class="btn sm del" onclick="delIOweMe(${d.id})">✕</button></td></tr>`;
  }).join('');
}

// ============ PROPERTY SYSTEM ============
let currentPropId=null;
