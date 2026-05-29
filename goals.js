
function addAsset(){
  const name=document.getElementById('ast-name').value.trim(),type=document.getElementById('ast-type').value,cat=document.getElementById('ast-cat').value;
  const buy=safeNum('ast-buy'),year=document.getElementById('ast-year').value,cur2=document.getElementById('ast-cur2').value,status=document.getElementById('ast-status').value;
  if(!name||isNaN(buy)){alert('Заполните название и цену');return;}
  D.assets.push({id:Date.now(),name,type,cat,buy,year,cur2,status,salePrice:null});
  save();renderAssets();
  ['ast-name','ast-buy','ast-year'].forEach(id=>document.getElementById(id).value='');
}

function editAsset(id){
  const a=D.assets.find(x=>x.id===id);if(!a)return;
  const html=`<div class="form-row c3">${mF('Название','name',a.name)}${mF('Тип','type',a.type,null,['Недвижимость','Автомобиль','Земля','Бизнес','Прочее'])}${mF('Категория','cat',a.cat,null,['income','base'])}</div><div class="form-row c3">${mF('Цена покупки','buy',a.buy,'number')}${mF('Цена продажи','sale',a.salePrice,'number')}${mF('Год','year',a.year,'number')}</div><div class="form-row c2">${mF('Статус','status',a.status,null,['Владею','Сдаю в аренду','Продаю','Продан'])}${mF('Валюта','cur2',a.cur2,null,['KZT','USD'])}</div>`;
  openModal('РЕДАКТИРОВАТЬ АКТИВ',html,()=>{a.name=mv('name');a.type=mv('type');a.cat=mv('cat');a.buy=mvf('buy');a.salePrice=mv('sale')?mvf('sale'):null;a.year=mv('year');a.status=mv('status');a.cur2=mv('cur2');save();renderAssets();closeModal();});
}

function delAsset(id){if(!confirm('Удалить?'))return;D.assets=D.assets.filter(x=>x.id!==id);save();renderAssets();}

function astRows(items){
  if(!items.length)return'<tr><td colspan="9" class="empty">—</td></tr>';
  return items.map(a=>{
    const sold=a.salePrice!=null&&!isNaN(a.salePrice),profit=sold?a.salePrice-a.buy:null;
    const cl=profit===null?'':profit>=0?'pos':'neg',rc=a.cat==='income'?'ri':'rr';
    return`<tr class="${rc}"><td class="nm">${a.name}</td><td>${a.type}</td><td class="r">${fmt(a.buy,0)}</td><td class="r">${sold?fmt(a.salePrice,0):'—'}</td><td class="r ${cl}">${sold?(profit>=0?'+':'')+fmt(profit,0):'—'}</td><td>${a.year||'—'}</td><td>${a.status}</td><td>${a.cur2}</td><td style="display:flex;gap:4px;"><button class="btn sm edit" onclick="editAsset(${a.id})">✎</button><button class="btn sm del" onclick="delAsset(${a.id})">✕</button></td></tr>`;
  }).join('');
}

function renderAssets(){
  document.getElementById('ast-inc-tbody').innerHTML=astRows(D.assets.filter(a=>a.cat==='income'));
  document.getElementById('ast-base-tbody').innerHTML=astRows(D.assets.filter(a=>a.cat==='base'||!a.cat));
}

// INCOME