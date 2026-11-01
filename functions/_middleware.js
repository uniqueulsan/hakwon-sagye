// 학원四季사계 사이트 비밀번호 잠금 (Cloudflare Pages Functions)
// 환경 변수: SITE_PASSWORD (필수, 비밀값) · PUBLIC_PATHS (선택, 예: "/,/diagnosis/" — 비밀번호 없이 열 경로)
const COOKIE = 'sg_auth';
const DAYS = 30;

async function sha(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const tokenFor = pw => sha('sagye-site::' + pw);
function getCookie(req, name) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function isPublic(path, env) {
  const list = String(env.PUBLIC_PATHS || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.some(p => p === '/' ? (path === '/' || path === '/index.html') : path.startsWith(p));
}
function page(msg, next, status = 200) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>학원四季사계</title>
<style>:root{--iv:#F5F1E6;--fg:#1F3D2F;--ink:#3C4447;--line:#E2DCCD;--gold:#8a6a30}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--iv);color:var(--ink);font:16px/1.6 "Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;padding:16px}
.card{width:100%;max-width:380px;background:#FBF8F1;border:1px solid var(--line);border-top:4px solid var(--fg);border-radius:14px;padding:28px 24px}
h1{font:700 1.5rem "Nanum Myeongjo","Noto Serif KR",serif;color:var(--fg);margin:0 0 4px}h1 i{font-style:normal;color:var(--gold)}
p{margin:0 0 18px;font-size:.92rem}label{display:block;font-weight:600;font-size:.88rem;margin-bottom:6px}
input{width:100%;font:inherit;padding:12px;border:1.5px solid var(--line);border-radius:10px;background:#fff}input:focus{outline:2px solid var(--fg);border-color:var(--fg)}
button{margin-top:14px;width:100%;font:inherit;font-weight:700;padding:12px;border:0;border-radius:10px;background:var(--fg);color:#fff;cursor:pointer}
.err{color:#a4451f;font-size:.88rem;margin:10px 0 0}.foot{margin-top:18px;font-size:.78rem;color:#6b7275;letter-spacing:.08em}</style></head>
<body><form class="card" method="post" action="/__login"><h1>학원<i>四季</i>사계</h1><p>준비 중인 사이트입니다. 비밀번호를 입력해 주세요.</p>
<label for="pw">비밀번호</label><input id="pw" name="pw" type="password" autocomplete="current-password" required autofocus>
<input type="hidden" name="next" value="${esc(next)}"><button type="submit">들어가기</button>${msg ? `<p class="err">${esc(msg)}</p>` : ''}
<div class="foot">ACADEMY BUSINESS ADVISORY</div></form></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  const pw = env.SITE_PASSWORD;
  if (!pw) return page('관리자: SITE_PASSWORD가 설정되지 않았습니다.', url.pathname, 503);

  if (url.pathname === '/__logout') {
    return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (url.pathname === '/__login' && request.method === 'POST') {
    const f = await request.formData();
    const dest = String(f.get('next') || '/');
    const safe = dest.startsWith('/') && !dest.startsWith('//') ? dest : '/';
    if (String(f.get('pw') || '') !== pw) {
      await new Promise(r => setTimeout(r, 800));
      return page('비밀번호가 맞지 않습니다.', safe, 401);
    }
    return new Response(null, { status: 302, headers: { Location: safe, 'Set-Cookie': `${COOKIE}=${await tokenFor(pw)}; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (isPublic(url.pathname, env)) return next();
  if (getCookie(request, COOKIE) === await tokenFor(pw)) {
    const res = await next();
    const r = new Response(res.body, res);
    r.headers.set('X-Robots-Tag', 'noindex');
    return r;
  }
  return page('', url.pathname + url.search, 401);
}
