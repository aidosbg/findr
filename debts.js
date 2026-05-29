
function applyStoSvc(){
  const sel=document.getElementById('svc-where-sel');
  const inp=document.getElementById('svc-where');
  if(!sel||!inp)return;
  if(sel.value&&sel.value!=='__manual')inp.value=sel.value;
  else if(sel.value==='__manual')inp.value='';
}

function addService(){
  if(!currentCarId){alert('Выберите автомобиль');return;}
  const desc=document.getElementById('svc-desc').value.trim();
  const labor=safeNum('svc-labor')||0;
  const date=document.getElementById('svc-date').value;
  const mileage=safeNum('svc-mileage')||0;
  const partId=document.getElementById('svc-part').value||null;
  const diy=document.getElementById('svc-diy').checked;
  if(!desc||!date){alert('Заполните описание и дату');return;}
  const actualLabor=diy?0:labor;
  D.services.push({id:Date.now(),carId:currentCarId,desc,labor:actualLabor,diy,date,mileage,partId});
  if(actualLabor>0){
    const car=D.cars.find(x=>x.id===currentCarId);
    D.expenses.push({id:Date.now()+2,cat:'Личный транспорт',subcat:'Техобслуживание',sum:actualLabor,date,cur:'KZT',desc:desc+(car?' — '+car.make+' '+car.model:''),source:'garage'});
    renderExpenses();
  }
  const car=D.cars.find(x=>x.id===currentCarId);if(car&&mileage>car.mileage)car.mileage=mileage;
  save();renderGarage();
  ['svc-desc','svc-labor','svc-date','svc-mileage'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('svc-diy').checked=false;
}

function delService(id){if(!confirm('Удалить?'))return;D.services=D.services.filter(x=>x.id!==id);save();renderGarage();}

function renderGarage(){
  const list=document.getElementById('garage-list');
  if(!list)return;
  if(!D.cars.length){list.innerHTML='<div style="padding:32px;text-align:center;color:var(--text3);font-family:var(--mono);font-size:11px;">Автомобили не добавлены</div>';return;}
  let html='';
  D.cars.forEach(function(car){
    const cp=D.parts.filter(function(p){return p.carId===car.id;}).sort(function(a,b){return b.date.localeCompare(a.date);});
    const svcs=D.services?D.services.filter(function(s){return s.carId===car.id;}).sort(function(a,b){return b.date.localeCompare(a.date);}):[];
    const spent=cp.reduce(function(s,p){return s+p.price;},0);
    const totalSvc=svcs.reduce(function(s,x){return s+x.labor;},0);
    const carIns=D.insurance.filter(function(i){return String(i.carId)===String(car.id);});
    // Insurance HTML
    let insHtml='';
    if(carIns.length){
      insHtml='<div style="margin-bottom:12px;background:var(--imp-bg);border:1px solid var(--imp-bdr);padding:10px;">';
      insHtml+='<div class="sec-t" style="font-size:9px;color:var(--imp);">СТРАХОВКИ АВТО</div>';
      carIns.forEach(function(i){
        var left=daysLeft(i.end);
        var badge=left<0?'<span class="badge red">ИСТЕКЛА</span>':left<30?'<span class="badge red">'+left+' дн.</span>':left<90?'<span class="badge gold">'+left+' дн.</span>':'<span class="badge green">АКТИВНА</span>';
        insHtml+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(59,140,248,0.15);font-size:11px;font-family:var(--mono);">';
        insHtml+='<span style="color:var(--text);">'+i.type+(i.comp?' — '+i.comp:'')+'</span>';
        insHtml+='<div style="display:flex;align-items:center;gap:8px;">'+badge+'<span style="color:var(--text3);font-size:10px;">'+i.end+'</span></div></div>';
      });
      insHtml+='<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:6px;">Управление в разделе Страховки</div></div>';
    }
    // Upcoming replacements
    var upcoming=cp.filter(function(p){return p.nextDate||p.nextMil;});
    let upHtml='';
    if(upcoming.length){
      upHtml='<div style="margin-bottom:12px;"><div class="sec-t" style="font-size:9px;">ПРЕДСТОЯЩИЕ ЗАМЕНЫ</div>';
      upcoming.forEach(function(p){
        var dl=p.nextDate?daysLeft(p.nextDate):null;
        var mileLeft=p.nextMil?(p.nextMil-car.mileage):null;
        var soon=(dl!==null&&dl<30)||(mileLeft!==null&&mileLeft<2000);
        var badge=soon?'<span class="badge red">СКОРО</span>':'<span class="badge gold">ПЛАН</span>';
        upHtml+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;font-family:var(--mono);">';
        upHtml+='<span style="color:var(--text);">'+p.name+'</span>';
        upHtml+='<span style="color:var(--text3);">'+(p.nextDate?'до '+p.nextDate:'')+' '+(mileLeft!==null?'/ ещё '+fmt(mileLeft,0)+' км':'')+' '+badge+'</span></div>';
      });
      upHtml+='</div>';
    }
    // Services HTML
    let svcsHtml='';
    if(svcs.length){
      svcsHtml='<div class="tbl-w" style="margin-bottom:12px;"><div class="sec-t" style="font-size:9px;">РАБОТЫ / УСЛУГИ</div>';
      svcsHtml+='<table><thead><tr><th>ОПИСАНИЕ</th><th class="r">СТОИМОСТЬ</th><th>ДАТА</th><th class="r">ПРОБЕГ</th><th>ТИП</th><th></th></tr></thead><tbody>';
      svcs.forEach(function(s){
        svcsHtml+='<tr><td class="nm">'+s.desc+'</td>';
        svcsHtml+='<td class="r">'+(s.diy?'<span class="badge green">DIY</span>':fmt(s.labor,0)+' тг')+'</td>';
        svcsHtml+='<td>'+s.date+'</td>';
        svcsHtml+='<td class="r">'+(s.mileage?fmt(s.mileage,0)+' км':'—')+'</td>';
        svcsHtml+='<td>'+(s.partId?'<span class="badge gold">+ЗАПЧАСТЬ</span>':'—')+'</td>';
        svcsHtml+='<td><button class="btn sm del" onclick="delService('+s.id+')">&#x2715;</button></td></tr>';
      });
      svcsHtml+='</tbody></table></div>';
    }
    // Parts HTML
    let partsHtml='';
    if(cp.length){
      partsHtml='<div class="tbl-w"><table><thead><tr><th>НАЗВАНИЕ</th><th>НОМЕР ЗАПЧАСТИ</th><th>КАТЕГОРИЯ</th><th class="r">ЦЕНА</th><th>ДАТА</th><th class="r">ПРОБЕГ</th><th>ГДЕ</th><th>СЛЕД. ЗАМЕНА</th><th></th></tr></thead><tbody>';
      cp.forEach(function(p){
        partsHtml+='<tr><td class="nm">'+p.name+'</td>';
        partsHtml+='<td style="font-family:var(--mono);color:var(--cyan);font-size:11px;">'+(p.number||'—')+'</td>';
        partsHtml+='<td>'+p.cat+'</td><td class="r">'+fmt(p.price,0)+'</td><td>'+p.date+'</td>';
        partsHtml+='<td class="r">'+(p.mileage?fmt(p.mileage,0)+' км':'—')+'</td>';
        partsHtml+='<td>'+(p.where||'—')+'</td>';
        partsHtml+='<td style="font-size:10px;color:var(--text3);">'+(p.nextDate||'')+' '+(p.nextMil?fmt(p.nextMil,0)+' км':'')+'</td>';
        partsHtml+='<td><button class="btn sm del" onclick="delPart('+p.id+')">&#x2715;</button></td></tr>';
      });
      partsHtml+='</tbody></table></div>';
    } else {
      partsHtml='<div class="empty">История пуста</div>';
    }
    // Car card
    html+='<div class="car-card">';
    html+='<div class="car-hd"><div>';
    html+='<div class="car-title">'+car.make+' '+car.model+' '+(car.year||'')+'</div>';
    html+='<div class="car-meta">'+(car.plate||'')+' &bull; Пробег: '+fmt(car.mileage,0)+' км &bull; Запчасти: '+fmt(spent,0)+' тг &bull; Работы: '+fmt(totalSvc,0)+' тг &bull; Итого: '+fmt(spent+totalSvc,0)+' тг</div>';
    html+='</div>';
    html+='<div style="display:flex;gap:6px;flex-wrap:wrap;">';
    html+='<button class="btn sm blue-b" onclick="openAddPart('+car.id+')">+ ЗАПЧАСТЬ</button>';
    html+='<button class="btn sm blue-b" onclick="openAddSvc('+car.id+')">+ РАБОТА</button>';
    html+='<button class="btn sm edit" onclick="editCar('+car.id+')">&#x270E;</button>';
    html+='<button class="btn sm del" onclick="delCar('+car.id+')">&#x2715;</button>';
    html+='</div></div>';
    html+=insHtml+upHtml+svcsHtml;
    html+='<div class="sec-t" style="font-size:9px;">ЗАПЧАСТИ</div>';
    html+=partsHtml;
    html+='</div>';
  });
  list.innerHTML=html;
}


function addCar(){
  const make=document.getElementById('car-make').value.trim(),model=document.getElementById('car-model').value.trim(),year=document.getElementById('car-year').value,mileage=safeNum('car-mileage')||0,plate=document.getElementById('car-plate').value.trim();
  if(!make||!model){alert('Заполните марку и модель');return;}
  D.cars.push({id:Date.now(),make,model,year,mileage,plate});save();renderGarage();
  ['car-make','car-model','car-year','car-mileage','car-plate'].forEach(id=>document.getElementById(id).value='');
}

function editCar(id){
  const c=D.cars.find(x=>x.id===id);if(!c)return;
  const html=`<div class="form-row c2">${mF('Марка','make',c.make)}${mF('Модель','model',c.model)}</div><div class="form-row c3">${mF('Год','year',c.year,'number')}${mF('Пробег (км)','mileage',c.mileage,'number')}${mF('Гос. номер','plate',c.plate)}</div>`;
  openModal('РЕДАКТИРОВАТЬ АВТО',html,()=>{c.make=mv('make');c.model=mv('model');c.year=mv('year');c.mileage=mvf('mileage');c.plate=mv('plate');save();renderGarage();closeModal();});
}

function delCar(id){if(!confirm('Удалить автомобиль и всю историю?'))return;D.cars=D.cars.filter(x=>x.id!==id);D.parts=D.parts.filter(x=>x.carId!==id);save();renderGarage();}

function openAddPart(cid){currentCarId=cid;const car=D.cars.find(x=>x.id===cid);document.getElementById('add-part-panel').style.display='block';document.getElementById('add-part-title').textContent=`ДОБАВИТЬ ЗАПИСЬ — ${car.make} ${car.model}`;document.getElementById('add-part-panel').scrollIntoView({behavior:'smooth'});}

function closeAddPart(){document.getElementById('add-part-panel').style.display='none';currentCarId=null;}

function openAddSvc(cid){
  currentCarId=cid;
  const car=D.cars.find(x=>x.id===cid);
  // Build parts dropdown for linking
  const carParts=D.parts.filter(p=>p.carId===cid);
  const pOpts='<option value="">— без запчасти —</option>'+carParts.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  document.getElementById('svc-part').innerHTML=pOpts;
  document.getElementById('add-svc-panel').style.display='block';
  document.getElementById('add-svc-title').textContent=`ДОБАВИТЬ РАБОТУ — ${car.make} ${car.model}`;
  document.getElementById('add-svc-panel').scrollIntoView({behavior:'smooth'});
}

function closeAddSvc(){document.getElementById('add-svc-panel').style.display='none';}

function addPart(){
  if(!currentCarId){alert('Выберите автомобиль');return;}
  const name=document.getElementById('part-name').value.trim(),number=document.getElementById('part-number').value.trim(),cat=document.getElementById('part-cat').value;
  const price=safeNum('part-price')||0,date=document.getElementById('part-date').value,mileage=safeNum('part-mileage')||0;
  const nextMil=safeNum('part-next-mil')||null,where=document.getElementById('part-where').value.trim(),nextDate=document.getElementById('part-next-date').value;
  if(!name||!date){alert('Заполните название и дату');return;}
  D.parts.push({id:Date.now(),carId:currentCarId,name,number,cat,price,date,mileage,nextMil,where,nextDate});
  const car2=D.cars.find(x=>x.id===currentCarId);if(car2&&mileage>car2.mileage)car2.mileage=mileage;
  if(price>0){D.expenses.push({id:Date.now()+1,cat:'Личный транспорт',subcat:cat,sum:price,date,cur:'KZT',desc:name+(car2?' — '+car2.make+' '+car2.model:''),source:'garage'});}
  save();renderGarage();
  ['part-name','part-number','part-price','part-date','part-mileage','part-next-mil','part-where','part-next-date'].forEach(id=>document.getElementById(id).value='');
}

function delPart(id){if(!confirm('Удалить запись?'))return;D.parts=D.parts.filter(x=>x.id!==id);save();renderGarage();}

function toggleStoPanel(){
  const body=document.getElementById('sto-panel-body');
  const icon=document.getElementById('sto-panel-icon');
  if(!body)return;
  const open=body.style.display==='block';
  body.style.display=open?'none':'block';
  if(icon)icon.textContent=open?'▼ РАЗВЕРНУТЬ':'▲ СВЕРНУТЬ';
}

function addSto(){
  const name=document.getElementById('sto-name').value.trim();
  if(!name){alert('Введите название СТО');return;}
  const addr=document.getElementById('sto-addr').value.trim();
  const phone=document.getElementById('sto-phone').value.trim();
  const spec=document.getElementById('sto-spec').value;
  const notes=document.getElementById('sto-notes').value.trim();
  D.stos.push({id:Date.now(),name,addr,phone,spec,notes});
  save();renderStoList();updStoDropdowns();
  ['sto-name','sto-addr','sto-phone','sto-notes'].forEach(id=>document.getElementById(id).value='');
}

function delSto(id){
  if(!confirm('Удалить СТО?'))return;
  D.stos=D.stos.filter(x=>x.id!==id);save();renderStoList();updStoDropdowns();
}

function renderStoList(){
  const list=document.getElementById('sto-list');if(!list)return;
  if(!D.stos.length){list.innerHTML='<div class="empty">СТО не добавлены</div>';return;}
  list.innerHTML=D.stos.map(s=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-size:13px;font-weight:500;color:var(--text);">${s.name}</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);">${s.spec}${s.addr?' • '+s.addr:''}</div>
        ${s.phone?`<div style="font-size:11px;font-family:var(--mono);color:var(--blue);">${s.phone}</div>`:''}
        ${s.notes?`<div style="font-size:10px;color:var(--text3);">${s.notes}</div>`:''}
      </div>
      <button class="btn sm del" onclick="delSto(${s.id})">✕</button>
    </div>`).join('');
}

function updStoDropdowns(){
  ['svc-where-sel','part-where-sel'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    sel.innerHTML='<option value="">— выбрать СТО —</option>'+D.stos.map(s=>`<option value="${s.name}">${s.name}${s.spec?' ('+s.spec+')':''}</option>`).join('')+'<option value="__manual">Ввести вручную</option>';
  });
}
// ============ ACCOUNTS & TRANSFERS ============