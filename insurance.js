
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070b12;--bg2:#0c1118;--bg3:#101720;--bg4:#151e2d;--bg5:#1a2438;
  --border:rgba(251,188,4,0.12);--border2:rgba(251,188,4,0.25);--border3:rgba(251,188,4,0.4);
  --gold:#fbb804;--gold2:#ffd04d;--blue:#3b8cf8;--green:#00c896;--red:#f05252;--purple:#a78bfa;--cyan:#22d3ee;--orange:#f97316;
  --text:#eef0f4;--text2:#8a9ab5;--text3:#4a5568;
  --mono:'IBM Plex Mono',monospace;--sans:'IBM Plex Sans',sans-serif;
  --crit:#f05252;--crit-bg:rgba(240,82,82,0.08);--crit-bdr:rgba(240,82,82,0.3);
  --imp:#3b8cf8;--imp-bg:rgba(59,140,248,0.08);--imp-bdr:rgba(59,140,248,0.3);
  --rtn:#4a5568;--rtn-bg:rgba(74,85,104,0.08);--rtn-bdr:rgba(74,85,104,0.2);
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--sans);}
#login-screen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:24px;}
.login-box{background:var(--bg3);border:1px solid var(--border3);padding:48px;width:360px;text-align:center;}
.login-logo{font-family:var(--mono);font-size:11px;letter-spacing:3px;color:var(--gold);margin-bottom:8px;}
.login-title{font-size:22px;font-weight:600;color:var(--text);margin-bottom:32px;font-family:var(--mono);}
.lf{margin-bottom:16px;text-align:left;}
.lf label{font-size:10px;font-family:var(--mono);color:var(--text3);letter-spacing:1px;display:block;margin-bottom:6px;}
.lf input{width:100%;background:var(--bg5);border:1px solid var(--border2);color:var(--text);font-family:var(--mono);font-size:13px;padding:10px 12px;outline:none;}
.lf input:focus{border-color:var(--gold);}
.login-btn{width:100%;background:var(--gold);color:#000;font-family:var(--mono);font-size:12px;font-weight:600;padding:11px;border:none;cursor:pointer;letter-spacing:2px;margin-top:8px;}
.login-btn:hover{background:var(--gold2);}
.login-err{color:var(--red);font-size:11px;font-family:var(--mono);margin-top:8px;display:none;}
#app{display:none;height:100vh;max-height:100vh;flex-direction:column;}
#app.visible{display:flex;}
.topbar{background:var(--bg2);border-bottom:1px solid var(--border2);padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:48px;flex-shrink:0;}
.t-logo{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--gold);letter-spacing:2px;}
.t-date{font-family:var(--mono);font-size:10px;color:var(--text3);}
.t-right{display:flex;align-items:center;gap:10px;}
.live-dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:blink 2s infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
.t-live{font-family:var(--mono);font-size:10px;color:var(--green);letter-spacing:1px;}
.t-timer{font-family:var(--mono);font-size:10px;color:var(--text3);}
.t-btn{font-family:var(--mono);font-size:10px;color:var(--text3);cursor:pointer;border:1px solid var(--border);padding:3px 10px;background:none;}
.t-btn:hover{color:var(--gold);border-color:var(--gold);}
.nav{background:var(--bg2);border-bottom:1px solid var(--border);display:flex;overflow-x:auto;flex-shrink:0;scrollbar-width:none;}
.nav::-webkit-scrollbar{display:none;}
.nav-btn{padding:10px 14px;font-size:11px;font-family:var(--mono);color:var(--text3);cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;white-space:nowrap;letter-spacing:.5px;transition:all .15s;}
.nav-btn:hover{color:var(--text2);}
.nav-btn.active{color:var(--gold);border-bottom-color:var(--gold);}
.nav-btn.crit{color:var(--crit)!important;}
.nav-btn.crit.active{border-bottom-color:var(--crit)!important;}
.main{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;min-height:0;}
.section{display:none;min-height:200px;color:var(--text);background:transparent;}
.section.active{display:block;visibility:visible;opacity:1;position:relative;z-index:1;min-height:300px;padding-top:4px;}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:20px;}
.kpi{background:var(--bg3);border:1px solid var(--border);padding:14px 16px;position:relative;overflow:hidden;}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.kpi.crit{border-color:var(--crit-bdr);background:linear-gradient(180deg,var(--crit-bg),var(--bg3));}
.kpi.crit::before{background:var(--crit);}
.kpi.imp{border-color:var(--imp-bdr);}
.kpi.imp::before{background:var(--imp);}
.kpi.pos-k::before{background:linear-gradient(90deg,var(--gold),transparent);}
.kpi.rtn{opacity:.8;}
.kpi.rtn::before{background:var(--rtn);}
.kpi-label{font-size:9px;font-family:var(--mono);color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;}
.kpi-val{font-size:20px;font-family:var(--mono);font-weight:500;line-height:1;}
.kpi-val.gold{color:var(--gold);}
.kpi-val.green{color:var(--green);}
.kpi-val.red{color:var(--red);}
.kpi-val.blue{color:var(--blue);}
.kpi-sub{font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:4px;}
.kpi-upd{font-size:9px;font-family:var(--mono);color:var(--text3);margin-top:3px;opacity:.55;}
.panel{background:var(--bg3);border:1px solid var(--border);margin-bottom:16px;}
.panel.crit{border-color:var(--crit-bdr);}
.panel.imp{border-color:var(--imp-bdr);}
.ph{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;}
.pt{font-size:10px;font-family:var(--mono);color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;}
.pt.crit{color:var(--crit);}
.pt.imp{color:var(--imp);}
.pb{padding:14px;}
.two-c{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.three-c{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;}
.tbl-w{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:12px;font-family:var(--mono);}
thead tr{background:var(--bg5);border-bottom:1px solid var(--border2);}
th{padding:8px 10px;text-align:left;color:var(--gold);font-size:10px;letter-spacing:1px;font-weight:500;white-space:nowrap;}
th.r{text-align:right;}
td{padding:7px 10px;color:var(--text2);border-bottom:1px solid rgba(251,188,4,0.05);white-space:nowrap;vertical-align:middle;}
td.r{text-align:right;}
td.pos{color:var(--green);}
td.neg{color:var(--red);}
td.nm{color:var(--text);font-weight:500;}
td.tk{color:var(--gold2);}
tbody tr:hover{background:rgba(251,188,4,0.03);}
tr.rc{background:rgba(240,82,82,0.05)!important;}
tr.ri{background:rgba(59,140,248,0.04)!important;}
tr.rr td{color:var(--text3);}
.empty{text-align:center;padding:28px;color:var(--text3);font-size:11px;}
.grp-row td{background:var(--bg4);color:var(--gold);font-weight:600;font-size:11px;letter-spacing:1px;padding:6px 10px;}
.form-row{display:grid;gap:10px;margin-bottom:12px;}
.c2{grid-template-columns:1fr 1fr;}
.c3{grid-template-columns:1fr 1fr 1fr;}
.c4{grid-template-columns:1fr 1fr 1fr 1fr;}
.f{display:flex;flex-direction:column;gap:4px;}
.f label{font-size:9px;font-family:var(--mono);color:var(--text3);letter-spacing:1px;text-transform:uppercase;}
.f input,.f select{background:var(--bg5);border:1px solid var(--border2);color:var(--text);font-family:var(--mono);font-size:12px;padding:7px 10px;outline:none;width:100%;}
.f input:focus,.f select:focus{border-color:var(--gold);}
.f select option{background:var(--bg4);}
.btn{background:var(--gold);color:#000;font-family:var(--mono);font-size:11px;font-weight:600;padding:8px 20px;border:none;cursor:pointer;letter-spacing:1px;}
.btn:hover{background:var(--gold2);}
.btn.sm{padding:3px 8px;font-size:10px;}
.btn.del{background:none;border:1px solid var(--crit-bdr);color:var(--red);}
.btn.del:hover{background:var(--crit-bg);}
.btn.edit{background:none;border:1px solid var(--border2);color:var(--text2);}
.btn.edit:hover{border-color:var(--gold);color:var(--gold);}
.btn.blue-b{background:var(--blue);color:#fff;}
.btn.grn{background:var(--green);color:#000;}
.num-input{background:var(--bg5);border:1px solid var(--border2);color:var(--text);font-family:var(--mono);font-size:12px;padding:7px 10px;outline:none;width:100%;text-align:left;}
.num-input:focus{border-color:var(--gold);}
.num-input.error{border-color:var(--red);}
.btn.grn:hover{background:#00e6a8;}
.pw{background:var(--bg5);height:7px;overflow:hidden;margin:4px 0;}
.pb-bar{height:100%;transition:width .4s;}
.pb-bar.gold{background:linear-gradient(90deg,var(--gold),var(--gold2));}
.pb-bar.green{background:linear-gradient(90deg,#00c896,#34d399);}
.pb-bar.blue{background:linear-gradient(90deg,var(--blue),var(--cyan));}
.pb-bar.red{background:linear-gradient(90deg,var(--red),#f87171);}
.badge{display:inline-block;padding:2px 7px;font-size:9px;font-family:var(--mono);letter-spacing:1px;}
.badge.green{background:rgba(0,200,150,0.15);color:var(--green);border:1px solid rgba(0,200,150,0.3);}
.badge.red{background:var(--crit-bg);color:var(--red);border:1px solid var(--crit-bdr);}
.badge.gold{background:rgba(251,188,4,0.15);color:var(--gold);border:1px solid rgba(251,188,4,0.3);}
.badge.blue{background:var(--imp-bg);color:var(--blue);border:1px solid var(--imp-bdr);}
.badge.grey{background:var(--rtn-bg);color:var(--text3);border:1px solid var(--rtn-bdr);}
.anom-item{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;margin-bottom:6px;border-left:3px solid transparent;}
.anom-item.up{border-left-color:var(--red);background:var(--crit-bg);}
.anom-item.dn{border-left-color:var(--green);background:rgba(0,200,150,0.07);}
.ins-block{background:var(--bg4);border:1px solid var(--border2);padding:14px;margin-bottom:10px;}
.ins-title{font-size:10px;font-family:var(--mono);color:var(--gold);letter-spacing:1px;margin-bottom:8px;}
.ins-text{font-size:12px;color:var(--text2);line-height:1.7;}
.ins-text span.pos{color:var(--green);}
.ins-text span.neg{color:var(--red);}
.ins-text span.gold{color:var(--gold);}
.sort-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}
.st{font-family:var(--mono);font-size:10px;padding:4px 10px;cursor:pointer;border:1px solid var(--border2);color:var(--text3);background:none;letter-spacing:.5px;}
.st.active{border-color:var(--gold);color:var(--gold);background:rgba(251,188,4,0.08);}
.sec-t{font-size:10px;font-family:var(--mono);color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border);}
.goal-card{background:var(--bg4);border:1px solid var(--border);padding:14px;margin-bottom:10px;}
.rem-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;margin-bottom:6px;border-left:3px solid transparent;}
.rem-item.rc{border-left-color:var(--red);background:var(--crit-bg);}
.rem-item.rw{border-left-color:var(--gold);background:rgba(251,188,4,0.06);}
.rem-item.rok{border-left-color:var(--green);background:rgba(0,200,150,0.05);}
.sub-item{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);}
.sub-item:last-child{border-bottom:none;}
.enp-g{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.enp-s{background:var(--bg4);border:1px solid var(--border);padding:14px;margin-bottom:10px;}
.enp-l{font-size:9px;font-family:var(--mono);color:var(--text3);letter-spacing:1px;margin-bottom:6px;}
.enp-v{font-size:22px;font-family:var(--mono);font-weight:500;color:var(--gold);}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;}
.modal{background:var(--bg3);border:1px solid var(--border3);padding:24px;width:580px;max-width:95vw;max-height:90vh;overflow-y:auto;}
.modal-t{font-family:var(--mono);font-size:12px;color:var(--gold);letter-spacing:2px;margin-bottom:20px;text-transform:uppercase;}
.modal-a{display:flex;gap:10px;margin-top:16px;}
.car-card{background:var(--bg4);border:1px solid var(--imp-bdr);padding:16px;margin-bottom:16px;}
.debt-tab{padding:10px 18px;font-size:11px;font-family:var(--mono);color:var(--text3);cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;letter-spacing:.5px;transition:all .15s;}
.debt-tab:hover{color:var(--text2);}
.debt-tab.active{color:var(--gold);border-bottom-color:var(--gold);}
.debt-pane{display:none;}
.debt-pane.active{display:block;}
.acc-card{background:var(--bg4);border:1px solid var(--border);padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;color:var(--text);}
.car-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.car-title{font-size:15px;font-weight:600;color:var(--blue);}
.car-meta{font-size:10px;font-family:var(--mono);color:var(--text3);}
