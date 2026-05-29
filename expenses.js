
function renderAll(){
  updateDate();renderInvest();renderDivTable();renderDivChart();renderDeposits();renderCredits();renderAssets();
  renderIncome();renderExpenses();renderExpAnalytics();renderRent();renderGoals();renderEnpf();renderInsurance();renderSubs();renderGarage();
  renderDashboard();updInvDD();updateGoalDepDropdown();renderRewardSummary();updInsCarDropdown();renderProperty();updIncomeDepDropdown();updRentPropDropdown();renderAccounts();renderTransfers();renderPrivateDebts();renderIOweMe();renderStoList();updStoDropdowns();
}

load();migrateData();updateDate();setInterval(updateDate,60000);
setTimeout(initNumInputs,500);
// Auto-fetch FX rates on startup (silently)
setTimeout(()=>fetchFxRates(),2000);
document.addEventListener('DOMContentLoaded',()=>{const p=document.getElementById('pwd-input');if(p)p.focus();});
