/* 의뢰 파일: 앱 사이에서 한 의뢰의 값을 한 덩어리로 주고받는다. 앱별 어댑터 CF가 먼저 정의되어 있어야 한다. */
(function(A){
 const FK='sagye_casefile_v1';
 const st={get(){try{return JSON.parse(localStorage.getItem(FK)||'null')}catch(e){return null}},set(v){try{localStorage.setItem(FK,JSON.stringify(v))}catch(e){}}};
 let file=st.get();
 const el=id=>document.getElementById(id);
 function show(){el('cfName').textContent=file&&file.case&&file.case.name?file.case.name:'열린 의뢰 없음';el('cfDate').textContent=file&&file.saved?`마지막 복사 ${file.saved}`:''}
 function pack(){
  const info=A.caseInfo()||{};
  file=file||{v:1,case:{}};file.v=1;file.case=file.case||{};
  Object.entries(info).forEach(([k,v])=>{if(v&&!file.case[k])file.case[k]=v});
  file[A.app]=JSON.parse(JSON.stringify(A.get()));
  if(A.handoff){const h=A.handoff();if(h)file.handoff=h}
  file.saved=new Date().toLocaleDateString('sv');st.set(file);show();
  return '[학원四季 의뢰 파일 v1]\n'+JSON.stringify(file)+'\n[끝]';
 }
 function fromDiag(t){const h=t.match(/\[학원 경영 진단 결과지\]\s*(.+?)\s·\s(\d{4}-\d{2}-\d{2})/);if(!h)return null;const c=(t.match(/의뢰자:\s*([^\n]*)/)||[])[1]||'';const [nm,,ar]=c.split('/').map(x=>(x||'').trim());return {v:1,case:{name:`${ar||''} ${h[1]}`.trim(),client:nm||'',kind:h[1],diagDate:h[2]},diag:t.trim()}}
 function unpack(t){const d=fromDiag(t);if(d)return d;const i=t.indexOf('{'),j=t.lastIndexOf('}');if(i<0||j<i)throw new Error('형식');const o=JSON.parse(t.slice(i,j+1));if(o.v!==1||!o.case)throw new Error('형식');return o}
 function open(o){
  file=o;st.set(file);
  if(o[A.app]){A.set(o[A.app]);A.toast(`'${o.case.name||'의뢰'}'의 ${A.label} 값을 불러왔습니다`)}
  else{A.prefill(o);A.toast(`'${o.case.name||'의뢰'}'를 열었습니다. 다른 화면의 값으로 채울 수 있는 칸을 채웠습니다`)}
  show();el('cfPanel').hidden=true;el('cfOpenBtn').setAttribute('aria-expanded','false');el('cfText').value='';
 }
 el('cfCopy').onclick=()=>{const t=pack();const out=el('cfOut');
  const fail=()=>{out.hidden=false;out.value=t;out.focus();out.select();A.toast('자동 복사가 막혀 있어 글을 선택해 두었습니다. 직접 복사해 주세요')};
  try{navigator.clipboard.writeText(t).then(()=>{out.hidden=true;A.toast('의뢰 파일을 복사했습니다. 메모장 등에 붙여 넣어 보관하세요')},fail)}catch(e){fail()}};
 el('cfOpenBtn').onclick=()=>{const p=el('cfPanel');p.hidden=!p.hidden;el('cfOpenBtn').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)el('cfText').focus()};
 el('cfLoad').onclick=()=>{try{open(unpack(el('cfText').value))}catch(e){A.toast('의뢰 파일 형식이 아닙니다. [학원四季 의뢰 파일 v1]로 시작하는 글 전체를 붙여 넣어 주세요')}};
 el('cfFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{open(unpack(String(r.result)))}catch(err){A.toast('파일 내용이 의뢰 파일 형식이 아닙니다')}};r.readAsText(f);e.target.value=''};
 (A.newIds||[]).forEach(id=>{const b=el(id);if(b)b.addEventListener('click',()=>{file=null;st.set(null);show()})});
 show();
})(CF);
