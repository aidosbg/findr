
function addProperty(){
  const name=document.getElementById('prop-name').value.trim();
  const type=document.getElementById('prop-type').value;
  const status=document.getElementById('prop-status').value;
  const area=safeNum('prop-area')||0;
  const value=safeNum('prop-value')||0;
  const year=document.getElementById('prop-year').value;
  const notes=document.getElementById('prop-notes').value.trim();
  if(!name){alert('Введите название объекта');return;}
  D.properties.push({id:Date.now(),name,type,status,area,value,year,notes});
  save();renderProperty();
  ['prop-name','prop-area','prop-value','prop-year','prop-notes'].forEach(id=>document.getElementById(id).value='');
}


function editProperty(id){
  const p=D.properties.find(x=>x.id===id);if(!p)return;
  const html=`<div class="form-row c3">${mF('Название','name',p.name)}${mF('Тип','type',p.type,null,['Квартира','Дом','Земля','Коммерческий','Другое'])}${mF('Статус','status',p.status,null,['Проживаю','Сдаю в аренду','Пустует','Продаётся'])}</div><div class="form-row c3">${mF('Площадь','area',p.area,'number')}${mF('Стоимость','value',p.value,'number')}${mF('Год','year',p.year,'number')}</div><div class="form-row">${mF('Заметки','notes',p.notes)}</div>`;
  openModal('РЕДАКТИРОВАТЬ ОБЪЕКТ',html,()=>{p.name=mv('name');p.type=mv('type');p.status=mv('status');p.area=mvf('area');p.value=mvf('value');p.year=mv('year');p.notes=mv('notes');save();renderProperty();closeModal();});
}


function delProperty(id){
  if(!confirm('Удалить объект и все расходы по нему?'))return;
  D.properties=D.properties.filter(x=>x.id!==id);
  D.expenses=D.expenses.filter(e=>e.propId!==id);
  save();renderProperty();
}


function openAddUtil(propId){
  currentPropId=propId;
  const prop=D.properties.find(x=>x.id===propId);
  document.getElementById('add-util-panel').style.display='block';
  document.getElementById('add-util-title').textContent='РАСХОД — '+prop.name;
  document.getElementById('add-util-panel').scrollIntoView({behavior:'smooth'});
}


function closeAddUtil(){
  document.getElementById('add-util-panel').style.display='none';
  currentPropId=null;
}


function addUtility(){
  if(!currentPropId){alert('Выберите объект');return;}
  const cat=document.getElementById('util-cat').value;
  const sum=safeNum('util-sum');
  const date=document.getElementById('util-date').value;
  const period=document.getElementById('util-period').value;
  const desc=document.getElementById('util-desc').value.trim();
  const prop=D.properties.find(x=>x.id===currentPropId);
  if(isNaN(sum)||!date){alert('Заполните сумму и дату');return;}
  D.expenses.push({id:Date.now(),cat,subcat:prop?prop.name:'',sum,date,cur:'KZT',desc:desc||(cat+(period?' '+period:'')),source:'property',propId:currentPropId});
  save();renderProperty();renderExpenses();
  ['util-sum','util-date','util-period','util-desc'].forEach(id=>document.getElementById(id).value='');
}


function renderProperty(){
  const list=document.getElementById('property-list');
  if(!list)return;
  if(!D.properties.length){
    list.innerHTML='<div style="padding:32px;text-align:center;color:var(--text3);font-family:var(--mono);font-size:11px;">Объекты не добавлены</div>';
    return;
  }
  list.innerHTML=D.properties.map(prop=>{
    const propExp=D.expenses.filter(e=>e.propId===prop.id);
    const totalExp=propExp.reduce((s,e)=>s+e.sum,0);
    // Monthly breakdown
    const byMonth={};propExp.forEach(e=>{const m=e.date.slice(0,7);byMonth[m]=(byMonth[m]||0)+e.sum;});
    const months=Object.keys(byMonth).sort().slice(-3);
    const avgMonth=months.length?months.reduce((s,m)=>s+byMonth[m],0)/months.length:0;
    // By category
    const byCat={};propExp.forEach(e=>{byCat[e.cat]=(byCat[e.cat]||0)+e.sum;});
    const statusBadge=prop.status==='Сдаю в аренду'?'<span class="badge green">АРЕНДА</span>':prop.status==='Проживаю'?'<span class="badge blue">ЖИВУ</span>':prop.status==='Продаётся'?'<span class="badge red">ПРОДАЁТСЯ</span>':'<span class="badge grey">ПУСТУЕТ</span>';
    // Recent expenses
    const recentExp=[...propExp].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    const expHtml=recentExp.length?`<div class="tbl-w"><table><thead><tr><th>КАТЕГОРИЯ</th><th>ОПИСАНИЕ</th><th class="r">СУММА</th><th>ДАТА</th><th></th></tr></thead><tbody>${recentExp.map(e=>`<tr><td class="tk">${e.cat}</td><td>${e.desc||'—'}</td><td class="r neg">${fmt(e.sum,0)}</td><td>${e.date}</td><td><button class="btn sm del" onclick="delPropExp(${e.id})">✕</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Расходов нет</div>';
    const catHtml=Object.keys(byCat).map(c=>`<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;font-size:10px;font-family:var(--mono);color:var(--text2);">${c}: <span style="color:var(--red);">${fmt(byCat[c],0)}</span></span>`).join('');

    return`<div class="panel" style="border-color:var(--imp-bdr);margin-bottom:16px;">
      <div class="ph" style="background:var(--bg4);">
        <div>
          <div style="font-size:15px;font-weight:600;color:var(--text);">${prop.name}</div>
          <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:2px;">${prop.type} ${prop.area?'• '+prop.area+' кв.м':''} ${prop.year?'• '+prop.year+' г.':''} ${prop.value?'• '+fmt(prop.value,0)+' тг':''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">${statusBadge}<button class="btn sm blue-b" onclick="openAddUtil(${prop.id})">+ РАСХОД</button><button class="btn sm edit" onclick="editProperty(${prop.id})">✎</button><button class="btn sm del" onclick="delProperty(${prop.id})">✕</button></div>
      </div>
      <div class="pb">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
          <div style="background:var(--bg5);border:1px solid var(--border);padding:10px;"><div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:4px;">ВСЕГО РАСХОДОВ</div><div style="font-size:16px;font-family:var(--mono);color:var(--red);">${fmt(totalExp,0)} тг</div></div>
          <div style="background:var(--bg5);border:1px solid var(--border);padding:10px;"><div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:4px;">СРЕДНЕЕ / МЕС</div><div style="font-size:16px;font-family:var(--mono);color:var(--orange);">${fmt(avgMonth,0)} тг</div></div>
          <div style="background:var(--bg5);border:1px solid var(--border);padding:10px;"><div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:4px;">ЗАПИСЕЙ РАСХОДОВ</div><div style="font-size:16px;font-family:var(--mono);color:var(--text);">${propExp.length}</div></div>
        </div>
        ${catHtml?`<div style="margin-bottom:12px;padding:8px;background:var(--bg5);border:1px solid var(--border);">${catHtml}</div>`:''}
        <div class="sec-t" style="font-size:9px;">ПОСЛЕДНИЕ РАСХОДЫ</div>
        ${expHtml}
        ${propExp.length>5?`<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:8px;">Показано 5 из ${propExp.length}. Все расходы в разделе Расходы.</div>`:''}
      </div>
    </div>`;
  }).join('');
}


function delPropExp(id){
  if(!confirm('Удалить расход?'))return;
  D.expenses=D.expenses.filter(x=>x.id!==id);
  save();renderProperty();renderExpenses();
}


function updPropDropdown(){
  // For future use - link expenses to property
}

// ============ DATA MIGRATION ============
const CURRENT_VERSION='4.2';