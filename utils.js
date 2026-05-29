
function buildReminders(){
  // Add car tax reminder if cars exist
  const now=new Date();
  const taxDeadline=`${now.getFullYear()}-04-01`;
  const daysToTax=daysLeft(taxDeadline);
  if(D.cars.length&&daysToTax!==null&&daysToTax>=0&&daysToTax<=60){
    // Already handled below
  }
  const items=[];
  D.credits.forEach(c=>{if(c.end){const d=daysLeft(c.end);if(d!==null&&d<=90)items.push({type:'Кредит',title:c.bank,detail:'Дата закрытия: '+c.end,days:d,pri:'crit'});}});
  D.deposits.forEach(d=>{if(d.end){const dl=daysLeft(d.end);if(dl!==null&&dl<=90)items.push({type:'Депозит',title:d.bank,detail:'Дата окончания: '+d.end,days:dl,pri:dl<30?'crit':'warn'});}});
  D.insurance.forEach(i=>{const dl=daysLeft(i.end);if(dl!==null&&dl<=90)items.push({type:'Страховка',title:i.obj,detail:'Окончание: '+i.end,days:dl,pri:dl<30?'crit':'warn'});});
  D.rent.forEach(r=>{if(r.end){const dl=daysLeft(r.end);if(dl!==null&&dl<=60)items.push({type:'Аренда',title:r.addr,detail:'Договор до: '+r.end,days:dl,pri:dl<14?'crit':'warn'});}});
  D.parts.forEach(p=>{if(p.nextDate){const dl=daysLeft(p.nextDate);const car=D.cars.find(c=>c.id===p.carId);if(dl!==null&&dl<=30)items.push({type:'Гараж',title:car?car.make+' '+car.model:'',detail:'Замена: '+p.name,days:dl,pri:dl<7?'crit':'warn'});}}); 
  // Car tax reminder
  if(D.cars.length){const now2=new Date();const taxDate=`${now2.getFullYear()}-04-01`;const dtx=daysLeft(taxDate);if(dtx!==null&&dtx>=0&&dtx<=60)items.push({type:'Налог',title:'Транспортный налог',detail:`Срок уплаты: ${taxDate} (до 1 апреля)`,days:dtx,pri:dtx<14?'crit':'warn'});}
  D.privateDebts.forEach(d=>{if(d.due){const dl=daysLeft(d.due);if(dl!==null&&dl<=30)items.push({type:'Долг',title:d.name,detail:'Возврат: '+fmt(Math.max((d.returnSum||d.sum)-(d.paid||0),0),0)+' тг',days:dl,pri:dl<7?'crit':'warn'});}});
  D.iOweMe.forEach(d=>{if(d.due){const dl=daysLeft(d.due);const rest=d.sum-(d.returned||0);if(dl!==null&&dl<=30&&rest>0)items.push({type:'Мне должны',title:d.name,detail:'Ожидается: '+fmt(rest,0)+' тг',days:dl,pri:'warn'});}});
  return items.sort((a,b)=>a.days-b.days);
}

function remHTML(items){
  return items.map(i=>{const badge=i.days<0?'<span class="badge red">ПРОСРОЧЕНО</span>':i.days<30?`<span class="badge red">${i.days} дн.</span>`:i.days<60?`<span class="badge gold">${i.days} дн.</span>`:`<span class="badge green">${i.days} дн.</span>`;const cl=i.pri==='crit'?'rc':i.days<60?'rw':'rok';return`<div class="rem-item ${cl}"><div><div style="font-size:13px;color:var(--text);">${i.type}: ${i.title}</div><div style="font-size:10px;font-family:var(--mono);color:var(--text3);">${i.detail}</div></div>${badge}</div>`;}).join('');
}

function renderReminders(){const items=buildReminders();const el=document.getElementById('all-reminders');el.innerHTML=items.length?remHTML(items):'<div class="empty">Нет срочных напоминаний</div>';}

// DASHBOARD