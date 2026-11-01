# 학원四季 내부 도구 빌드: *.src.html → 게시용 html (로고·주소 채우기)
lg=open('logo_s.b64').read().strip();bn=open('banner.b64').read().strip()
U={'__URL_DIAG__':'https://claude.ai/artifact/J4mKkVHAho1KQfYHLUNWEn','__URL_PL__':'https://claude.ai/artifact/WRPse7ehuNJVKq7uoSMjjo','__URL_PROP__':'https://claude.ai/artifact/BTCL2JKnEDwaf5GUG9tQC5'}
for s,o in [('area.src.html','sagye-area-report.html'),('verify.src.html','sagye-verify.html'),('pl-sheet.src.html','sagye-pl-sheet.html'),('open.src.html','sagye-open-planner.html'),('ops.src.html','sagye-ops.html')]:
  h=open(s).read().replace('__LOGO__',lg).replace('__BANNER__',bn)
  for k,v in U.items(): h=h.replace(k,v)
  assert not any(x in h for x in ['__LOGO__','__URL_','__BANNER__']),s
  open(o,'w').write(h);print(o)
