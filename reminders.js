
function saveEnpf(){
  const balance=safeNum('enpf-bal'),threshold=safeNum('enpf-thr'),date=document.getElementById('enpf-date').value||td(),note=document.getElementById('enpf-note').value.trim();
  if(isNaN(balance)){alert('Введите остаток');return;}
  D.enpf.push({id:Date.now(),balance,threshold,date,note});save();renderEnpf();
}

function delEnpf(id){D.enpf=D.enpf.filter(x=>x.id!==id);save();renderEnpf();}

function renderEnpf(){
  const last=D.enpf.length?D.enpf[D.enpf.length-1]:null;
  const st=document.getElementById('enpf-stats');
  if(last){const pct=last.threshold?(Math.min(last.balance/last.threshold,1)*100):0,left=last.threshold?Math.max(last.threshold-last.balance,0):0,bc=pct>=100?'green':pct>=70?'gold':'blue';st.innerHTML=`<div class="enp-s"><div class="enp-l">ОСТАТОК</div><div class="enp-v">${fmt(last.balance,0)} тг</div><div class="kpi-upd">Обновлено: ${last.date}</div></div><div class="enp-s"><div class="enp-l">ПОРОГ СНЯТИЯ</div><div class="enp-v" style="color:var(--blue)">${fmt(last.threshold,0)} тг</div></div><div class="enp-s"><div class="enp-l">ПРОГРЕСС</div><div style="font-size:20px;font-family:var(--mono);color:${pct>=100?'var(--green)':'var(--text)'};">${fmt(pct,1)}%</div><div class="pw"><div class="pb-bar ${bc}" style="width:${Math.min(pct,100)}%"></div></div><div style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-top:4px;">До порога: <span style="color:var(--red)">${fmt(left,0)} тг</span></div>${pct>=100?'<div style="margin-top:6px;"><span class="badge green">✓ МОЖНО СНЯТЬ</span></div>':''}</div>`;}
  else st.innerHTML='<div class="empty">Внесите данные</div>';
  const tb=document.getElementById('enpf-tbody');
  if(!D.enpf.length){tb.innerHTML='<tr><td colspan="6" class="empty">—</td></tr>';return;}
  const s=[...D.enpf].sort((a,b)=>b.date.localeCompare(a.date));
  tb.innerHTML=s.map(e=>`<tr><td>${e.date}</td><td class="r pos">${fmt(e.balance,0)}</td><td class="r">${fmt(e.threshold,0)}</td><td class="r neg">${fmt(Math.max((e.threshold||0)-e.balance,0),0)}</td><td>${e.note||'—'}</td><td><button class="btn sm del" onclick="delEnpf(${e.id})">✕</button></td></tr>`).join('');
}

// INSURANCE