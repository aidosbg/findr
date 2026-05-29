
function toggleInsObj(){
  // Could hide/show fields based on type in future
}

function updInsCarDropdown(){
  const sel=document.getElementById('ins-car-link');if(!sel)return;
  sel.innerHTML='<option value="">— не авто —</option>'+D.cars.map(c=>`<option value="${c.id}">${c.make} ${c.model} ${c.year||''} ${c.plate||''}</option>`).join('');
}

function addInsurance(){
  const type=document.getElementById('ins-type').value;
  const comp=document.getElementById('ins-comp').value.trim();
  const carId=document.getElementById('ins-car-link').value||null;
  const carObj=carId?D.cars.find(c=>String(c.id)===String(carId)):null;
  const objInput=document.getElementById('ins-obj').value.trim();
  const obj=carObj?(carObj.make+' '+carObj.model+(carObj.plate?' ('+carObj.plate+')':'')):objInput;
  const cover=safeNum('ins-cover')||0;
  const prem=safeNum('ins-prem')||0;
  const start=document.getElementById('ins-start').value;
  const end=document.getElementById('ins-end').value;
  if(!obj){alert('Укажите объект страхования или выберите автомобиль');return;}
  if(!end){alert('Укажите дату окончания');return;}
  const insId=Date.now();
  D.insurance.push({id:insId,obj,comp,type,cover,prem,start,end,carId:carId?parseInt(carId):null});
  // Auto-create expense
  if(prem>0){
    D.expenses.push({id:insId+1,cat:'Страховка',subcat:type,sum:prem,date:start||td(),cur:'KZT',desc:type+' — '+obj,source:'insurance'});
  }
  save();renderInsurance();renderExpenses();updInsCarDropdown();
  ['ins-obj','ins-comp','ins-cover','ins-prem','ins-start','ins-end'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function editInsurance(id){
  const i=D.insurance.find(x=>x.id===id);if(!i)return;
  const html=`<div class="form-row c3">${mF('Объект','obj',i.obj)}${mF('Компания','comp',i.comp)}${mF('Тип','type',i.type,null,['КАСКО','ОГПО','Имущество','Жизнь','Здоровье','Другое'])}</div><div class="form-row c3">${mF('Покрытие','cover',i.cover,'number')}${mF('Стоимость','prem',i.prem,'number')}${mF('Окончание','end',i.end,'date')}</div>`;
  openModal('РЕДАКТИРОВАТЬ СТРАХОВКУ',html,()=>{i.obj=mv('obj');i.comp=mv('comp');i.type=mv('type');i.cover=mvf('cover');i.prem=mvf('prem');i.end=mv('end');save();renderInsurance();closeModal();});
}

function delInsurance(id){if(!confirm('Удалить?'))return;D.insurance=D.insurance.filter(x=>x.id!==id);save();renderInsurance();}

function renderInsurance(){
  const tb=document.getElementById('ins-tbody'),panel=document.getElementById('ins-tbl-panel');
  if(!D.insurance.length){tb.innerHTML='<tr><td colspan="9" class="empty">—</td></tr>';return;}
  let hasCrit=false;
  tb.innerHTML=D.insurance.map(i=>{
    const left=daysLeft(i.end),exp=left<0,soon=left<30;
    if(exp||soon)hasCrit=true;
    const badge=exp?'<span class="badge red">ИСТЕКЛА</span>':soon?`<span class="badge red">${left} дн.</span>`:left<90?`<span class="badge gold">${left} дн.</span>`:'<span class="badge green">АКТИВНА</span>';
    const rc=exp||soon?'rc':left<90?'ri':'';
    const carLink=i.carId?D.cars.find(c=>c.id===i.carId):null;
    const objLabel=carLink?`🚗 ${carLink.make} ${carLink.model}`:i.obj;
    return`<tr class="${rc}">
      <td class="nm">${objLabel}</td>
      <td>${i.type}</td>
      <td>${i.comp||'—'}</td>
      <td style="font-size:10px;color:var(--text3);">${i.start||'—'}</td>
      <td>${i.end}</td>
      <td class="r">${fmt(i.cover,0)}</td>
      <td class="r">${fmt(i.prem,0)}</td>
      <td>${badge}</td>
      <td style="display:flex;gap:4px;"><button class="btn sm edit" onclick="editInsurance(${i.id})">✎</button><button class="btn sm del" onclick="delInsurance(${i.id})">✕</button></td>
    </tr>`;
  }).join('');
  panel.className=hasCrit?'panel crit':'panel';
}

// SUBS