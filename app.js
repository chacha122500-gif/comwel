(function(){
  var TODAY = new Date(2026,9,1);
  var STEPS = ["신청접수","서류검토","심사","처리완료"];
  var DATA = [
    {id:1, svc:"생활안정자금융자", no:"2026-0820-0147", date:"2026.08.20", st:"action", stage:"서류보완", result:"심사 중", issue:"", step:2,
     due:"2026.10.10", reason:"재직 여부와 소득 확인을 위해 최근 발급된 증빙서류가 필요합니다.",
     docs:[{name:"재직증명서",desc:"최근 1개월 이내 발급분",files:[]},{name:"소득금액증명원",desc:"2025년 귀속, 홈택스 발급 가능",files:[]}]},
    {id:2, svc:"이차보전추천신청", no:"2026-0818-0093", date:"2026.08.18", st:"done", stage:"처리완료", result:"추천서 발급", issue:"예시-0002", step:4}
  ];
  var BADGE = {action:["b-action","i-alert"],progress:["b-progress","i-clock"],done:["b-done","i-check"]};
  var state = {months:3, svc:"", status:"all"};
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  function parse(d){var p=d.split(".");return new Date(+p[0],+p[1]-1,+p[2])}
  function fmt(d){return d.getFullYear()+"."+("0"+(d.getMonth()+1)).slice(-2)+"."+("0"+d.getDate()).slice(-2)}
  function dday(d){return Math.round((parse(d)-TODAY)/864e5)}
  function badge(r){var b=BADGE[r.st];return '<span class="badge '+b[0]+'"><svg class="ico"><use href="#'+b[1]+'"/></svg>'+r.stage+'</span>'}
  function issue(r){return r.issue?'<span class="issued num">'+r.issue+'</span>':'<span class="muted">미발급</span>'}
  function prog(r,lg){
    return '<ol class="prog'+(lg?' prog-lg':'')+'" aria-label="처리 진행 단계">'+STEPS.map(function(s,i){
      var n=i+1, c = r.step===4 ? "done" : (n<r.step?"done":(n===r.step?"now"+(r.st==="action"?" act":""):""));
      var label = (n===r.step && r.st==="action") ? "서류보완" : s;
      return '<li class="'+c+'"'+(n===r.step?' aria-current="step"':'')+'>'+label+'</li>';
    }).join("")+'</ol>';
  }
  function base(){var from=new Date(TODAY);from.setMonth(from.getMonth()-state.months);
    return DATA.filter(function(r){return (!state.svc||r.svc===state.svc)&&parse(r.date)>=from})}

  function renderList(){
    var from=new Date(TODAY);from.setMonth(from.getMonth()-state.months);
    $("#rangeTxt").textContent = fmt(from)+" ~ "+fmt(TODAY)+" 신청분";
    var b=base(), cnt={all:b.length,action:0,progress:0,done:0};
    b.forEach(function(r){cnt[r.st]++});
    $$("[data-c]").forEach(function(el){var k=el.dataset.c;el.textContent=cnt[k];el.classList.toggle("has",k==="action"&&cnt[k]>0)});
    var rows = state.status==="all"?b:b.filter(function(r){return r.st===state.status});
    $("#resultCount").innerHTML = '조회결과 <b>'+rows.length+'건</b>';
    if(!rows.length){
      var e='<div class="empty"><svg class="ico"><use href="#i-inbox"/></svg><p>조건에 맞는 신청 내역이 없습니다.</p><p class="muted">조회기간을 늘리거나 서비스·처리상태를 ‘전체’로 바꿔 보세요.</p></div>';
      $("#tbody").innerHTML='<tr><td colspan="6" class="td-empty">'+e+'</td></tr>'; $("#cards").innerHTML='<li>'+e+'</li>'; return;
    }
    $("#tbody").innerHTML = rows.map(function(r){
      return '<tr class="'+(r.st==="action"?"row-action":"")+'"><td class="svc"><strong>'+r.svc+'</strong><span class="num">신청번호 '+r.no+'</span></td>'+
        '<td class="num">'+r.date+'</td><td>'+badge(r)+'</td><td>'+r.result+'</td><td>'+issue(r)+'</td>'+
        '<td><div class="cell-actions"><button type="button" class="btn btn-line btn-sm" data-detail="'+r.id+'" aria-label="'+r.svc+' 상세 보기">보기</button>'+
        (r.st==="action"?'<button type="button" class="btn btn-primary btn-sm" data-goreq>보완</button>':'')+'</div></td></tr>';
    }).join("");
    $("#cards").innerHTML = rows.map(function(r){
      return '<li class="card'+(r.st==="action"?" act":"")+'"><div class="card-top"><h3>'+r.svc+'<span class="no num">신청번호 '+r.no+'</span></h3>'+badge(r)+'</div>'+
        prog(r)+
        '<dl class="kv"><div><dt>신청일자</dt><dd class="num">'+r.date+'</dd></div><div><dt>처리결과</dt><dd>'+r.result+'</dd></div>'+
        '<div class="full"><dt>보증번호/추천번호</dt><dd>'+issue(r)+'</dd></div></dl>'+
        '<div class="card-actions"><button type="button" class="btn btn-line" data-detail="'+r.id+'">상세보기</button>'+
        (r.st==="action"?'<button type="button" class="btn btn-primary" data-goreq><svg class="ico"><use href="#i-upload"/></svg>보완서류 등록</button>':'')+'</div></li>';
    }).join("");
  }

  /* ---------- 보완 요청 패널 ---------- */
  var REQ = DATA[0], submitted=false;
  function renderReq(){
    var area=$("#reqArea");
    if(submitted){
      area.innerHTML='<div class="req-done" role="status"><span class="ic"><svg class="ico ico-lg"><use href="#i-check"/></svg></span><div><h3>보완서류 제출이 완료되었습니다</h3><p>'+REQ.svc+' 신청 건은 서류검토 단계로 넘어갔습니다. 결과는 문자와 마이페이지로 알려 드립니다.</p></div></div>';
      return;
    }
    var d=dday(REQ.due);
    area.innerHTML =
      '<section class="req" id="req" aria-labelledby="reqTitle">'+
        '<div class="req-head"><span class="ic" aria-hidden="true"><svg class="ico ico-lg"><use href="#i-alert"/></svg></span>'+
          '<div class="req-meta"><h3 id="reqTitle">보완 요청 안내</h3><p>'+REQ.svc+' · 신청번호 <span class="num">'+REQ.no+'</span></p></div>'+
          '<div class="dday"><b class="num">D-'+d+'</b><span>제출기한 '+REQ.due+'까지</span></div></div>'+
        '<div class="req-body">'+
          '<p class="reason"><strong>요청 사유</strong><span>'+REQ.reason+'</span></p>'+
          '<div class="docs-head"><h4>요청 서류</h4><span class="prog-txt" id="docProg" aria-live="polite"></span></div>'+
          '<ul class="docs" id="docs"></ul>'+
          '<div class="req-foot"><p><svg class="ico ico-sm"><use href="#i-info"/></svg>PDF·JPG·PNG·HWP, 파일당 10MB 이하. 촬영 시 서류 네 모서리가 모두 보이게 찍어 주세요.</p>'+
          '<button type="button" class="btn btn-primary" id="reqSubmit" disabled>보완서류 제출</button></div>'+
        '</div></section>';
    renderDocs();
  }
  function renderDocs(){
    var ul=$("#docs"); if(!ul) return;
    ul.innerHTML = REQ.docs.map(function(doc,i){
      var ok=doc.files.length>0;
      return '<li class="doc'+(ok?' ok':'')+'" data-doc="'+i+'">'+
        '<div class="doc-top"><span class="doc-no" aria-hidden="true">'+(ok?'<svg class="ico ico-sm ico-bold"><use href="#i-check"/></svg>':(i+1))+'</span>'+
          '<div class="doc-name"><strong>'+doc.name+'</strong><span>'+doc.desc+'</span></div>'+
          '<span class="doc-state">'+(ok?'첨부 '+doc.files.length+'개':'미첨부')+'</span></div>'+
        '<div class="attach" role="group" aria-label="'+doc.name+' 첨부 방법">'+
          '<label class="att mobile"><input type="file" accept="image/*" capture="environment" data-in="'+i+'"><svg class="ico"><use href="#i-camera"/></svg>촬영</label>'+
          '<label class="att mobile"><input type="file" accept="image/*" multiple data-in="'+i+'"><svg class="ico"><use href="#i-image"/></svg>갤러리</label>'+
          '<label class="att"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.hwp" multiple data-in="'+i+'"><svg class="ico"><use href="#i-file"/></svg>파일 선택</label>'+
          '<span class="drop-hint">또는 이 영역으로 파일을 끌어다 놓으세요</span></div>'+
        (ok?'<ul class="fchips">'+doc.files.map(function(f,j){
          return '<li class="fchip">'+(f.url?'<img class="thumb" src="'+f.url+'" alt="">':'<span class="thumb"><svg class="ico"><use href="#i-file"/></svg></span>')+
            '<span>'+esc(f.name)+'</span><button type="button" data-rm="'+i+'-'+j+'" aria-label="'+esc(f.name)+' 삭제"><svg class="ico ico-sm"><use href="#i-close"/></svg></button></li>';
        }).join("")+'</ul>':'')+
      '</li>';
    }).join("");
    var done=REQ.docs.filter(function(d){return d.files.length}).length, total=REQ.docs.length;
    $("#docProg").innerHTML='<b>'+done+'</b> / '+total+' 첨부 완료';
    var btn=$("#reqSubmit"); btn.disabled = done<total;
    btn.textContent = done<total ? "서류를 모두 첨부하면 제출할 수 있어요 ("+done+"/"+total+")" : "보완서류 제출";
  }
  function addFiles(i,list){
    [].forEach.call(list,function(f){
      if(f.size>10*1024*1024){toast(f.name+": 10MB를 넘어 첨부할 수 없습니다.");return}
      if(!/\.(pdf|jpe?g|png|hwp|heic)$/i.test(f.name)&&!/^image\//.test(f.type)){toast(f.name+": 지원하지 않는 형식입니다.");return}
      REQ.docs[i].files.push({name:f.name,url:/^image\//.test(f.type)?URL.createObjectURL(f):""});
    });
    renderDocs();
    toast(REQ.docs[i].name+" 첨부됨");
  }
  document.addEventListener("change",function(e){var t=e.target;if(t.dataset&&t.dataset.in!=null){addFiles(+t.dataset.in,t.files);t.value=""}});
  ["dragenter","dragover"].forEach(function(ev){document.addEventListener(ev,function(e){var d=e.target.closest&&e.target.closest(".doc");if(d){e.preventDefault();d.classList.add("drag")}})});
  ["dragleave","drop"].forEach(function(ev){document.addEventListener(ev,function(e){var d=e.target.closest&&e.target.closest(".doc");if(!d)return;
    if(ev==="dragleave"&&d.contains(e.relatedTarget))return; d.classList.remove("drag");
    if(ev==="drop"){e.preventDefault();addFiles(+d.dataset.doc,e.dataTransfer.files)}})});

  /* ---------- 공통 클릭 ---------- */
  document.addEventListener("click",function(e){
    var t;
    if(t=e.target.closest("[data-rm]")){var p=t.dataset.rm.split("-");REQ.docs[+p[0]].files.splice(+p[1],1);renderDocs();return}
    if(t=e.target.closest("#reqSubmit")){
      submitted=true; REQ.st="progress"; REQ.stage="서류검토"; REQ.result="심사 중";
      renderReq(); renderList(); updateDock(); $("#lnbTag").remove();
      toast("보완서류가 제출되었습니다."); return;
    }
    if(t=e.target.closest("[data-goreq], #dockBtn")){
      closeAll(); var reqEl=$("#req"); if(reqEl){reqEl.scrollIntoView({block:"start"}); setTimeout(function(){var f=$(".doc:not(.ok) .att input",reqEl)||$("#reqSubmit");if(f)f.focus()},350)} return;
    }
    if(t=e.target.closest("[data-detail]")){
      var r=DATA.filter(function(x){return x.id===Number(t.dataset.detail)})[0];
      $("#detailTitle").textContent=r.svc;
      $("#detailBody").innerHTML = prog(r,true)+
        '<dl class="dl"><dt>신청번호</dt><dd class="num">'+r.no+'</dd><dt>신청일자</dt><dd class="num">'+r.date+'</dd><dt>처리단계</dt><dd>'+badge(r)+'</dd><dt>처리결과</dt><dd>'+r.result+'</dd><dt>보증/추천번호</dt><dd>'+issue(r)+'</dd>'+
        (r.st==="action"?'<dt>보완 기한</dt><dd class="num">'+r.due+' (D-'+dday(r.due)+')</dd>':'')+'</dl>';
      $("#detailFoot").innerHTML = '<button type="button" class="btn btn-line" data-close>닫기</button>'+
        (r.st==="action"?'<button type="button" class="btn btn-primary" data-goreq><svg class="ico"><use href="#i-upload"/></svg>보완서류 등록</button>'
        : r.issue?'<button type="button" class="btn btn-primary" data-toast="추천서를 내려받습니다."><svg class="ico"><use href="#i-dl"/></svg>추천서 내려받기</button>':'');
      openModal($("#detailModal")); return;
    }
    if(t=e.target.closest("[data-close]")){closeAll();return}
    if(t=e.target.closest("[data-toast]")){toast(t.dataset.toast)}
    if(t=e.target.closest(".sum")){
      $$(".sum").forEach(function(x){x.setAttribute("aria-pressed",x===t)}); state.status=t.dataset.s; renderList();
    }
  });

  /* 필터 */
  $$(".seg button").forEach(function(b){b.addEventListener("click",function(){$$(".seg button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})})});
  $("#filterForm").addEventListener("submit",function(e){e.preventDefault();state.svc=$("#svc").value;state.months=+$(".seg [aria-pressed=true]").dataset.m;renderList()});
  $("#searchForm").addEventListener("submit",function(e){e.preventDefault();toast("‘"+($("#q").value||"")+"’ 검색 결과로 이동합니다.")});

  /* 탭 */
  var tabs=$$(".tab");
  function selectTab(t){tabs.forEach(function(x){var on=x===t;x.setAttribute("aria-selected",on);x.tabIndex=on?0:-1;$("#"+x.getAttribute("aria-controls")).hidden=!on});t.focus();updateDock()}
  tabs.forEach(function(t,i){t.addEventListener("click",function(){selectTab(t)});
    t.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();selectTab(tabs[(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length])}})});
  $("[data-goto-temp]").addEventListener("click",function(e){e.preventDefault();selectTab($("#tab-temp"))});
  $("#lnbSel").addEventListener("change",function(){if(this.value==="임시저장 내역")selectTab($("#tab-temp"));else if(this.value!=="나의 서류조회")toast("‘"+this.value+"’ 화면으로 이동합니다.")});

  /* 모달·드로어 */
  var lastFocus;
  function openModal(m){lastFocus=document.activeElement;m.classList.add("on");document.body.style.overflow="hidden";var f=$(".modal-head .icon-btn",m);f&&f.focus()}
  function closeAll(){
    $$(".modal.on").forEach(function(m){m.classList.remove("on")});
    $("#drawer").classList.remove("on");$("#overlay").classList.remove("on");
    document.body.style.overflow="";
  }
  $("#menuOpen").addEventListener("click",function(){lastFocus=document.activeElement;$("#drawer").classList.add("on");$("#overlay").classList.add("on");document.body.style.overflow="hidden";$("#menuClose").focus()});
  $("#menuClose").addEventListener("click",function(){closeAll();lastFocus&&lastFocus.focus()});
  $("#overlay").addEventListener("click",function(){closeAll();lastFocus&&lastFocus.focus()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeAll();lastFocus&&lastFocus.focus()}});
  $("#searchToggle").addEventListener("click",function(){var o=$("#searchForm").classList.toggle("open");this.setAttribute("aria-expanded",o);if(o)$("#q").focus()});

  /* 모바일 하단 고정 바: 보완 패널이 화면에 보이면 숨김 */
  var reqVisible=false, io;
  function updateDock(){
    var show = !submitted && !$("#panel-apply").hidden && !reqVisible;
    $("#dock").classList.toggle("on",show); $("#dock").setAttribute("aria-hidden",!show);
    $("#dockBtn").tabIndex = show?0:-1; document.body.classList.toggle("has-dock",!submitted);
    $("#dockTxt").textContent = REQ.svc+" · D-"+dday(REQ.due);
  }
  function watchReq(){
    if(!("IntersectionObserver" in window))return;
    io=new IntersectionObserver(function(en){reqVisible=en[0].isIntersecting;updateDock()},{threshold:.15});
    var r=$("#req"); r&&io.observe(r);
  }

  /* 글자크기 */
  var levels=[90,100,110,120,130], lv=1;
  try{var saved=localStorage.getItem("fs");if(saved!==null&&levels[+saved])lv=+saved}catch(e){/* 저장소 사용 불가 시 기본값 유지 */}
  function applyFs(){document.documentElement.style.fontSize=levels[lv]+"%";$("#fsOut").textContent=levels[lv]+"%";
    $("[data-fs='-1']").disabled=lv===0;$("[data-fs='1']").disabled=lv===levels.length-1;try{localStorage.setItem("fs",lv)}catch(e){/* 저장 실패는 무시 */}}
  $$("[data-fs]").forEach(function(b){b.addEventListener("click",function(){lv=Math.min(levels.length-1,Math.max(0,lv+(+b.dataset.fs)));applyFs()})});
  applyFs();

  var tt; window.toast=function(m){var t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on")},2400)};
  function toast(m){window.toast(m)}

  renderReq(); renderList(); watchReq(); updateDock();

  /* ---------- html.to.design 캡처용 상태 파라미터 ----------
     ?capture=1                 라이트 테마 고정, 고정 바·토스트 숨김
     &state=detail              상세조회 모달
     &state=attached            보완서류 일부 첨부된 상태
     &state=ready               보완서류 모두 첨부(제출 가능)
     &state=done                제출 완료
     &state=action              '보완 필요' 필터 적용
     &state=empty               조회결과 없음
     &state=temp                임시저장 탭
     &state=menu                전체메뉴 열림 */
  var qs = new URLSearchParams(location.search);
  if (qs.get("capture")) { document.documentElement.setAttribute("data-theme","light"); document.documentElement.classList.add("capture"); }
  var st = qs.get("state");
  function fake(i,n){REQ.docs[i].files.push({name:n,url:""})}
  if (st==="detail") { var b=document.querySelector("[data-detail='1']"); b&&b.click(); }
  else if (st==="attached") { fake(0,"재직증명서_20260925.pdf"); renderDocs(); }
  else if (st==="ready") { fake(0,"재직증명서_20260925.pdf"); fake(1,"소득금액증명원_2025.pdf"); renderDocs(); }
  else if (st==="done") { fake(0,"a.pdf"); fake(1,"b.pdf"); renderDocs(); document.getElementById("reqSubmit").click(); }
  else if (st==="action") { document.querySelector(".sum[data-s='action']").click(); }
  else if (st==="empty") { document.querySelector(".seg [data-m='1']").click(); document.querySelector(".btn-search").click(); }
  else if (st==="temp") { selectTab(document.getElementById("tab-temp")); }
  else if (st==="menu") { document.getElementById("menuOpen").click(); }
  if (qs.get("capture")) { var tEl=document.getElementById("toast"); tEl.classList.remove("on"); window.scrollTo(0,0); }
})();
