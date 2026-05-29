
function save(){try{localStorage.setItem('fd3',JSON.stringify(D));}catch(e){}}

function load(){try{const d=localStorage.getItem('fd3');if(d)D={...D,...JSON.parse(d)};}catch(e){}}


function exportData(){const b=new Blob([JSON.stringify(D,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='finance_v3_'+td()+'.json';a.click();}

function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{D={...D,...JSON.parse(ev.target.result)};save();renderAll();alert('Данные загружены!');}catch(err){alert('Ошибка файла');}};r.readAsText(f);e.target.value='';}

let idleSec=0,timerIv;
const IDLE=1800;

function migrateData(){
  const ver=D._version||'0';
  if(ver===CURRENT_VERSION)return;
  console.log('Migrating data from',ver,'to',CURRENT_VERSION);
  
  // Ensure all arrays exist
  const arrays=['invest','dividends','iHistory','nwHistory','deposits','credits','assets','income','expenses','rent','goals','enpf','insurance','subs','cars','parts','services','govPremiums','properties','accounts','transfers','privateDebts','iOweMe','stos'];
  arrays.forEach(k=>{if(!D[k])D[k]=[];});
  
  // Ensure settings exist
  if(!D.settings)D.settings={usdRate:450,eurRate:500};
  
  // Migration: add missing fields to existing records
  // Investments: add source field
  D.invest.forEach(p=>{if(!p.source)p.source='purchased';if(!p.updAt)p.updAt='';});
  
  // Insurance: add carId, start fields
  D.insurance.forEach(i=>{if(!i.carId)i.carId=null;if(!i.start)i.start='';});
  
  // Deposits: add type field
  D.deposits.forEach(d=>{if(!d.type)d.type='fixed';if(!d.updAt)d.updAt='';});
  
  // Credits: add updAt
  D.credits.forEach(c=>{if(!c.updAt)c.updAt='';});
  
  // Assets: add cat field
  D.assets.forEach(a=>{if(!a.cat)a.cat='base';if(!a.salePrice===undefined)a.salePrice=null;});
  
  // Dividends: add total field
  D.dividends.forEach(d=>{if(d.total===undefined)d.total=d.amount*(d.qty||0);});
  
  // Goals: add depId, monthlyContrib
  D.goals.forEach(g=>{if(!g.depId)g.depId=null;if(!g.monthlyContrib)g.monthlyContrib=0;});
  
  // Expenses: add source, propId fields
  D.expenses.forEach(e=>{if(!e.source)e.source='manual';if(!e.propId)e.propId=null;});
  
  // Rent: add propId
  D.rent.forEach(r=>{if(!r.propId)r.propId=null;});
  
  // Cars: ensure mileage
  D.cars.forEach(c=>{if(!c.mileage)c.mileage=0;});
  
  // Private debts: add paid field
  D.privateDebts.forEach(d=>{if(!d.paid)d.paid=0;});
  
  // IOweMe: add returned field
  D.iOweMe.forEach(d=>{if(!d.returned)d.returned=0;});
  
  D._version=CURRENT_VERSION;
  save();
  console.log('Migration complete');
}