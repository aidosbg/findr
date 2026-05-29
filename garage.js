
function addRent(){
  const addr=document.getElementById('rent-addr').value.trim(),tenant=document.getElementById('rent-tenant').value.trim(),sum=safeNum('rent-sum'),start=document.getElementById('rent-start').value,end=document.getElementById('rent-end').value,cur=document.getElementById('rent-cur').value;
  const propIdEl=document.getElementById('rent-prop-link');
  const propId=propIdEl?propIdEl.value||null:null;
  if(!addr||isNaN(sum)){alert('Заполните адрес и сумму');return;}
  D.rent.push({id:Date.now(),addr,tenant,sum,start,end,cur,propId});
  save();renderRent();['rent-addr','rent-tenant','rent-sum','rent-start','rent-end'].forEach(id=>document.getElementById(id).value='');
  if(propIdEl)propIdEl.value='';
}

function recordRentPayment(id){
  const r=D.rent.find(x=>x.id===id);if(!r)return;
  D.income.push({id:Date.now(),type:'Аренда',sum:r.sum,date:td(),cur:r.cur,desc:'Аренда — '+r.addr});
  save();renderIncome();alert('Платёж зафиксирован: '+fmt(r.sum,0)+' '+r.cur);
}

function updRentPropDropdown(){
  const sel=document.getElementById('rent-prop-link');if(!sel)return;
  sel.innerHTML='<option value="">— без привязки —</option>'+D.properties.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
}

function editRent(id){
  const r=D.rent.find(x=>x.id===id);if(!r)return;
  const html=`<div class="form-row c2">${mF('Адрес','addr',r.addr)}${mF('Арендатор','tenant',r.tenant)}</div><div class="form-row c3">${mF('Сумма/мес','sum',r.sum,'number')}${mF('Начало','start',r.start,'date')}${mF('Окончание','end',r.end,'date')}</div><div class="form-row">${mF('Валюта','cur',r.cur,null,['KZT','USD'])}</div>`;
  openModal('РЕДАКТИРОВАТЬ АРЕНДУ',html,()=>{r.addr=mv('addr');r.tenant=mv('tenant');r.sum=mvf('sum');r.start=mv('start');r.end=mv('end');r.cur=mv('cur');save();renderRent();closeModal();});
}

function delRent(id){if(!confirm('Удалить?'))return;D.rent=D.rent.filter(x=>x.id!==id);save();renderRent();}

function renderRent(){
  const tb=document.getElementById('rent-tbody');
  if(!D.rent.length){tb.innerHTML='<tr><td colspan="8" class="empty">—</td></tr>';return;}
  const propMap={};D.properties.forEach(p=>{propMap[p.id]=p.name;});
  tb.innerHTML=D.rent.map(r=>{const left=r.end?daysLeft(r.end):null,cl=left===null?'':left<30?'neg':left<90?'tk':'pos',rc=left!==null&&left<30?'rc':'ri';return`<tr class="${rc}"><td class="nm">${r.addr}</td><td>${r.tenant||'—'}</td><td class="r pos">${fmt(r.sum,0)}</td><td>${r.start||'—'}</td><td>${r.end||'—'}</td><td class="r ${cl}">${left!==null?left:'—'}</td><td>${r.cur}</td><td style="font-size:10px;color:var(--blue);">${r.propId&&propMap[r.propId]?propMap[r.propId]:'—'}</td><td style="display:flex;gap:4px;"><button class="btn sm grn" onclick="recordRentPayment(${r.id})" title="Получил оплату">✓</button><button class="btn sm edit" onclick="editRent(${r.id})">✎</button><button class="btn sm del" onclick="delRent(${r.id})">✕</button></td></tr>`;}).join('');
}

// GOALS