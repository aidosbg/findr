
function addInvest(){
  const name=document.getElementById('i-name').value.trim(),ticker=document.getElementById('i-ticker').value.trim().toUpperCase(),date=document.getElementById('i-date').value;
  const qty=safeNum('i-qty'),price=safeNum('i-price');
  const cur=safeNum('i-cur')||price,currency=document.getElementById('i-currency').value,notes=document.getElementById('i-notes').value.trim();
  if(!name||!ticker||!date||isNaN(qty)||isNaN(price)){alert('Заполните обязательные поля');return;}
  const source=document.getElementById('i-source').value||'purchased';
  D.invest.push({id:Date.now(),name,ticker,date,qty,price,currentPrice:cur,currency,notes,updAt:td(),source});
  D.iHistory.push({date:td(),value:D.invest.reduce((s,p)=>s+p.qty*p.currentPrice,0)});
  save();renderInvest();updInvDD();
  ['i-name','i-ticker','i-date','i-qty','i-price','i-cur','i-notes'].forEach(id=>document.getElementById(id).value='');
}

function updateInvestPrice(){
  const t=document.getElementById('i-upd-t').value,p=safeNum('i-upd-p');
  if(!t||isNaN(p))return;
  D.invest.forEach(x=>{if(x.ticker===t){x.currentPrice=p;x.updAt=td();}});
  D.iHistory.push({date:td(),value:D.invest.reduce((s,x)=>s+x.qty*x.currentPrice,0)});
  save();renderInvest();document.getElementById('i-upd-p').value='';
}

function editInvest(id){
  const p=D.invest.find(x=>x.id===id);if(!p)return;
  const html=`<div class="form-row c3">${mF('Наименование','name',p.name)}${mF('Тикер','ticker',p.ticker)}${mF('Дата','date',p.date,'date')}</div><div class="form-row c4">${mF('Количество','qty',p.qty,'number')}${mF('Цена покупки','price',p.price,'number')}${mF('Текущая цена','cur',p.currentPrice,'number')}${mF('Валюта','cur2',p.currency,null,['USD','KZT','RUB','EUR'])}</div><div class="form-row c2">${mF('Заметки','notes',p.notes)}${mF('Тип','src',p.source||'purchased',null,['purchased','cashback'])}</div>`;
  openModal('РЕДАКТИРОВАТЬ ПОЗИЦИЮ',html,()=>{p.name=mv('name');p.ticker=mv('ticker').toUpperCase();p.date=mv('date');p.qty=mvf('qty');p.price=mvf('price');p.currentPrice=mvf('cur');p.currency=mv('cur2');p.notes=mv('notes');p.source=mv('src');p.updAt=td();save();renderInvest();closeModal();});
}

function delInvest(id){if(!confirm('Удалить?'))return;D.invest=D.invest.filter(x=>x.id!==id);save();renderInvest();updInvDD();}
let invGrouped=false;

function toggleInvView(){
  invGrouped=!invGrouped;
  const btn=document.getElementById('inv-view-btn');
  const flat=document.getElementById('invest-flat');
  const grouped=document.getElementById('invest-grouped');
  if(btn)btn.textContent=invGrouped?'▶ ПЛОСКИЙ ВИД':'▼ ГРУППИРОВАТЬ';
  if(flat)flat.style.display=invGrouped?'none':'block';
  if(grouped)grouped.style.display=invGrouped?'block':'none';
  if(invGrouped)renderInvestGrouped();
}

function renderInvestGrouped(){
  const el=document.getElementById('invest-grouped');if(!el)return;
  if(!D.invest.length){el.innerHTML='<div class="empty">Портфель пуст</div>';return;}
  const totCur=D.invest.reduce((s,p)=>s+p.qty*p.currentPrice,0);
  // Group by ticker
  const groups={};
  D.invest.forEach(p=>{
    if(!groups[p.ticker])groups[p.ticker]=[];
    groups[p.ticker].push(p);
  });
  el.innerHTML=Object.keys(groups).map(ticker=>{
    const lots=groups[ticker];
    const totalQty=lots.reduce((s,p)=>s+p.qty,0);
    const totalInv=lots.reduce((s,p)=>s+p.qty*p.price,0);
    const avgPrice=totalQty?totalInv/totalQty:0;
    const curPrice=lots[lots.length-1].currentPrice;
    const totalCur=totalQty*curPrice;
    const pnl=totalCur-totalInv;
    const pct=totalInv?(pnl/totalInv)*100:0;
    const share=totCur?(totalCur/totCur)*100:0;
    const currency=lots[0].currency;
    const divTotal=D.dividends.filter(d=>d.ticker===ticker).reduce((s,d)=>d.total!=null?s+d.total:s+d.amount*(d.qty||0),0);
    const cl=pnl>=0?'pos':'neg';
    const groupId='grp_'+ticker;
    return`<div style="margin-bottom:8px;border:1px solid var(--border);background:var(--bg3);">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;background:var(--bg4);" onclick="toggleInvGroup('${groupId}')">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:var(--mono);font-size:14px;font-weight:600;color:var(--gold);">${ticker}</span>
          <span style="font-size:11px;font-family:var(--mono);color:var(--text2);">${fmt(totalQty)} шт • ${lots.length} лот${lots.length>1?'а':''}</span>
          ${lots.some(p=>p.source==='cashback')?'<span class="badge blue" style="font-size:8px;">КЭШБЭК</span>':''}
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-family:var(--mono);font-size:12px;color:var(--text2);">Ср. цена: ${fmt(avgPrice,2)}</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--text);">${fmt(totalCur,0)} ${currency}</span>
          <span style="font-family:var(--mono);font-size:12px;" class="${cl}">${pnl>=0?'+':''}${fmt(pnl,0)} (${fmtP(pct)})</span>
          <span style="font-family:var(--mono);font-size:11px;color:var(--text3);">${fmt(share,1)}%</span>
          ${divTotal>0?`<span style="font-family:var(--mono);font-size:11px;color:var(--green);">Дивид: ${fmt(divTotal,0)}</span>`:''}
          <span style="color:var(--text3);font-size:12px;" id="${groupId}_icon">▼</span>
        </div>
      </div>
      <div id="${groupId}" style="display:none;padding:10px 14px;">
        <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:var(--mono);">
          <thead><tr style="background:var(--bg5);"><th style="padding:6px 8px;text-align:left;color:var(--text3);font-size:10px;">ДАТА</th><th style="padding:6px 8px;text-align:right;color:var(--text3);font-size:10px;">КОЛ-ВО</th><th style="padding:6px 8px;text-align:right;color:var(--text3);font-size:10px;">ЦЕНА ПОКУПКИ</th><th style="padding:6px 8px;text-align:right;color:var(--text3);font-size:10px;">ВЛОЖЕНО</th><th style="padding:6px 8px;text-align:left;color:var(--text3);font-size:10px;">ТИП</th><th style="padding:6px 8px;text-align:left;color:var(--text3);font-size:10px;">ЗАМЕТКИ</th><th></th></tr></thead>
          <tbody>${lots.map(p=>`<tr style="border-bottom:1px solid var(--border);"><td style="padding:5px 8px;color:var(--text2);">${p.date}</td><td style="padding:5px 8px;text-align:right;color:var(--text);">${fmt(p.qty)}</td><td style="padding:5px 8px;text-align:right;color:var(--text2);">${fmt(p.price,2)}</td><td style="padding:5px 8px;text-align:right;color:var(--text2);">${fmt(p.qty*p.price,0)}</td><td style="padding:5px 8px;">${p.source==='cashback'?'<span class="badge blue" style="font-size:8px;">КЭШБЭК</span>':'<span class="badge grey" style="font-size:8px;">КУПЛЕНО</span>'}</td><td style="padding:5px 8px;color:var(--text3);max-width:100px;overflow:hidden;text-overflow:ellipsis;">${p.notes||'—'}</td><td style="padding:5px 8px;"><button class="btn sm edit" onclick="editInvest(${p.id})">✎</button></td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  }).join('');
}

function toggleInvGroup(id){
  const el=document.getElementById(id);
  const icon=document.getElementById(id+'_icon');
  if(el){el.style.display=el.style.display==='none'?'block':'none';}
  if(icon){icon.textContent=el.style.display==='none'?'▼':'▲';}
}

function renderInvest(){
  const tbody=document.getElementById('invest-tbody');
  if(!D.invest.length){tbody.innerHTML='<tr><td colspan="14" class="empty">Портфель пуст</td></tr>';renderPieCharts();renderLineChart();renderDivChart();return;}
  const totCur=D.invest.reduce((s,p)=>s+p.qty*p.currentPrice,0);
  const avg={};D.invest.forEach(p=>{if(!avg[p.ticker])avg[p.ticker]={tc:0,tq:0};avg[p.ticker].tc+=p.qty*p.price;avg[p.ticker].tq+=p.qty;});
  tbody.innerHTML=D.invest.map(p=>{
    const inv=p.qty*p.price,cur=p.qty*p.currentPrice,pnl=cur-inv,pct=inv?(pnl/inv)*100:0,share=totCur?(cur/totCur)*100:0;
    const cl=pnl>=0?'pos':'neg',rc=pnl<-10?'rc':pnl>0?'ri':'';
    const srcBadge=p.source==='cashback'?'<span class="badge blue" style="font-size:8px;">КЭШБЭК</span>':'';
    return`<tr class="${rc}"><td class="nm">${p.name} ${srcBadge}</td><td class="tk">${p.ticker}</td><td>${p.date}</td><td class="r">${fmt(p.qty)}</td><td class="r">${fmt(p.price,2)}</td><td class="r">${p.source==='cashback'?'<span style="color:var(--blue);">награда</span>':fmt(inv,0)}</td><td class="r">${fmt(p.currentPrice,2)}</td><td class="r">${fmt(cur,0)}</td><td class="r ${cl}">${pnl>=0?'+':''}${fmt(pnl,0)}</td><td class="r ${cl}">${fmtP(pct)}</td><td class="r">${fmt(share,1)}%</td><td>${p.currency}</td><td style="max-width:80px;overflow:hidden;text-overflow:ellipsis;">${p.notes||'—'}</td><td style="display:flex;gap:4px;"><button class="btn sm edit" onclick="editInvest(${p.id})">✎</button><button class="btn sm del" onclick="delInvest(${p.id})">✕</button></td></tr>`;
  }).join('');
  renderPieCharts();renderLineChart();renderRewardSummary();
}

function renderRewardSummary(){
  const rewards=D.invest.filter(p=>p.source==='cashback');
  const panel=document.getElementById('reward-panel');
  const summary=document.getElementById('reward-summary');
  if(!rewards.length){if(panel)panel.style.display='none';return;}
  if(panel)panel.style.display='block';
  const totalVal=rewards.reduce((s,p)=>s+p.qty*p.currentPrice,0);
  const totalCost=rewards.reduce((s,p)=>s+p.qty*p.price,0);
  summary.innerHTML=`<div style="display:flex;gap:16px;flex-wrap:wrap;">${rewards.map(p=>{const val=p.qty*p.currentPrice;return`<div style="background:var(--bg4);border:1px solid var(--imp-bdr);padding:10px 14px;min-width:160px;"><div style="font-size:11px;font-family:var(--mono);color:var(--blue);margin-bottom:4px;">${p.ticker}</div><div style="font-size:13px;font-family:var(--mono);color:var(--text);">${fmt(val,0)} ${p.currency}</div><div style="font-size:10px;font-family:var(--mono);color:var(--text3);">${fmt(p.qty)} шт • ${fmt(p.currentPrice,2)}</div></div>`;}).join('')}<div style="background:var(--bg4);border:1px solid var(--gold);padding:10px 14px;min-width:160px;"><div style="font-size:11px;font-family:var(--mono);color:var(--gold);margin-bottom:4px;">ИТОГО НАГРАД</div><div style="font-size:13px;font-family:var(--mono);color:var(--gold);">${fmt(totalVal,0)}</div></div></div>`;
}

function renderPieCharts(){
  if(!D.invest.length){['c-pie-val','c-pie-qty'].forEach(id=>{if(CH[id])CH[id].destroy();document.getElementById('l-pie-'+(id==='c-pie-val'?'val':'qty')).innerHTML='';});return;}
  const totV=D.invest.reduce((s,p)=>s+p.qty*p.currentPrice,0),totQ=D.invest.reduce((s,p)=>s+p.qty,0);
  const gV={},gQ={};D.invest.forEach(p=>{gV[p.ticker]=(gV[p.ticker]||0)+p.qty*p.currentPrice;gQ[p.ticker]=(gQ[p.ticker]||0)+p.qty;});
  const lV=Object.keys(gV),dV=lV.map(t=>gV[t]),bV=lV.map((_,i)=>CLR[i%CLR.length]);
  const lQ=Object.keys(gQ),dQ=lQ.map(t=>gQ[t]),bQ=lQ.map((_,i)=>CLR[i%CLR.length]);
  const po=(cb)=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:cb}}}});
  mkChart('c-pie-val','doughnut',{labels:lV,datasets:[{data:dV,backgroundColor:bV,borderColor:'#070b12',borderWidth:2}]},po(ctx=>{const p=totV?((ctx.parsed/totV)*100).toFixed(1):0;return` ${ctx.label}: ${fmt(ctx.parsed,0)} (${p}%)` ;}));
  mkChart('c-pie-qty','doughnut',{labels:lQ,datasets:[{data:dQ,backgroundColor:bQ,borderColor:'#070b12',borderWidth:2}]},po(ctx=>{const p=totQ?((ctx.parsed/totQ)*100).toFixed(1):0;return` ${ctx.label}: ${fmt(ctx.parsed)} шт (${p}%)`;}));
  const lv=document.getElementById('l-pie-val'),lq=document.getElementById('l-pie-qty');
  if(lv)lv.innerHTML=lV.map((l,i)=>{const p=totV?((gV[l]/totV)*100).toFixed(1):0;return`<span style="display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;background:${bV[i]};display:inline-block;"></span>${l} ${p}%</span>`;}).join('');
  if(lq)lq.innerHTML=lQ.map((l,i)=>{const p=totQ?((gQ[l]/totQ)*100).toFixed(1):0;return`<span style="display:flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;background:${bQ[i]};display:inline-block;"></span>${l} ${fmt(gQ[l])} шт (${p}%)</span>`;}).join('');
}

function renderLineChart(){
  if(!D.iHistory.length)return;
  const gr={};D.iHistory.forEach(h=>{gr[h.date]=h.value;});
  const dates=Object.keys(gr).sort(),vals=dates.map(d=>gr[d]);
  const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10},maxRotation:0,autoSkip:true,maxTicksLimit:6},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};
  mkChart('c-line','line',{labels:dates,datasets:[{data:vals,borderColor:'#3b8cf8',backgroundColor:'rgba(59,140,248,0.07)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#3b8cf8',fill:true,tension:.3}]},base);
}

function updInvDD(){
  const tt=[...new Set(D.invest.map(p=>p.ticker))];
  ['i-upd-t','d-t'].forEach(id=>{const s=document.getElementById(id);if(!s)return;s.innerHTML=tt.length?tt.map(t=>`<option>${t}</option>`).join(''):'<option>—</option>';});
}

function addDiv(){
  const ticker=document.getElementById('d-t').value;
  const date=document.getElementById('d-date').value;
  const amount=safeNum('d-amt');
  const eligible=safeNum('d-eligible');
  const override=safeNum('d-override');
  if(!ticker||!date||isNaN(amount)||amount<=0){alert('Заполните тикер, дату и дивиденд на акцию');return;}
  const qty=(!isNaN(eligible)&&eligible>0)?eligible:0;
  if(qty===0&&!(override>0)){alert('Укажите кол-во eligible акций или ручную сумму от брокера');return;}
  const total=override>0?override:amount*qty;
  D.dividends.push({id:Date.now(),ticker,date,amount,qty,override:override>0?override:null,total});
  save();renderDivTable();renderDivChart();
  ['d-date','d-amt','d-eligible','d-override'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
}

function delDiv(id){D.dividends=D.dividends.filter(d=>d.id!==id);save();renderDivTable();renderDivChart();}

function renderDivTable(){
  const tb=document.getElementById('div-tbody'),st=document.getElementById('div-sum-tbody');
  if(!D.dividends.length){tb.innerHTML='<tr><td colspan="6" class="empty">—</td></tr>';st.innerHTML='<tr><td colspan="2" class="empty">—</td></tr>';return;}
  const s=[...D.dividends].sort((a,b)=>b.date.localeCompare(a.date));
  tb.innerHTML=s.map(d=>`<tr><td class="tk">${d.ticker}</td><td>${d.date}</td><td class="r">${fmt(d.amount,2)}</td><td class="r">${fmt(d.qty)}</td><td class="r pos">${fmt(d.amount*d.qty,0)}</td><td><button class="btn sm del" onclick="delDiv(${d.id})">✕</button></td></tr>`).join('');
  const by={};D.dividends.forEach(d=>{const t=d.total!=null?d.total:(d.amount*d.qty);by[d.ticker]=(by[d.ticker]||0)+t;});
  st.innerHTML=Object.keys(by).map(t=>`<tr><td class="tk">${t}</td><td class="r pos">${fmt(by[t],0)}</td></tr>`).join('');
}

function renderDivChart(){
  if(!D.dividends.length)return;
  const by={};D.dividends.forEach(d=>{const y=d.date.slice(0,4);by[y]=(by[y]||0)+d.amount*d.qty;});
  const yrs=Object.keys(by).sort();
  const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.05)'}},y:{ticks:{color:'#4a5568',font:{family:'IBM Plex Mono',size:10}},grid:{color:'rgba(251,188,4,0.07)'}}}};
  mkChart('c-div','bar',{labels:yrs,datasets:[{data:yrs.map(y=>by[y]),backgroundColor:'rgba(0,200,150,0.6)',borderColor:'#00c896',borderWidth:1}]},base);
}

// DEPOSITS