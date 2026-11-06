# Korea Data Tools (en-datatool.zinnote.kr)

All-English free calculators for foreigners in Korea.

- `pages/*.html` – page bodies (JSON meta header on top)
- `layout.html` – shared header/footer, AdSense script
- `public/` – static files copied as-is (CSS/JS in `public/assets/`, ads.txt, CNAME)
- `node build.mjs` → `dist/` (no dependencies). Pushing to `main` deploys to GitHub Pages.

To add a tool: create `pages/<slug>.html` (+ `public/assets/<slug>.js`), add a card on `pages/index.html` and a nav link in `layout.html` if needed.

## 배포 설정 (처음 한 번)

1. 저장소 Settings → Pages → Source 를 **GitHub Actions** 로 바꿉니다.
2. 같은 화면 Custom domain 에 `en-datatool.zinnote.kr` 입력 후 저장, 인증서가 나오면 **Enforce HTTPS** 켜기.
3. 가비아 DNS 관리: 호스트 `en-datatool`, 타입 `CNAME`, 값 `seungzin35.github.io.`
