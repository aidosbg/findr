

load();migrateData();updateDate();setInterval(updateDate,60000);
setTimeout(initNumInputs,500);
// Auto-fetch FX rates on startup (silently)
setTimeout(()=>fetchFxRates(),2000);
document.addEventListener('DOMContentLoaded',()=>{const p=document.getElementById('pwd-input');if(p)p.focus();});
