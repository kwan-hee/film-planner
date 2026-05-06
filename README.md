# 🎬 필름 플래너 — AI 영상 기획서 제작 도구

한글로 입력하면 AI가 자동으로 번역하고 전체 영상 기획서를 완성해주는 도구입니다.

## ✨ 주요 기능

- 한글 입력 → 영어 번역 → 플래너 전체 자동 입력
- 장르 프리셋 8종 (럭셔리 광고, 뷰티 광고, 패션 필름 등)
- 스토리보드 & 샷 리스트 자동 생성
- AI 이미지 프롬프트 자동 생성 (Midjourney / DALL-E / Stable Diffusion)
- 완성형 프로덕션 시트 뷰
- 마크다운 / JSON 내보내기

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 저장소 생성
1. GitHub에서 새 저장소 생성: `film-planner`
2. 이 폴더 전체를 업로드하거나 아래 명령어 실행

```bash
git init
git add .
git commit -m "init: film planner"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/film-planner.git
git push -u origin main
```

### 2단계 — GitHub Pages 설정
1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `GitHub Actions` 선택
3. 저장

### 3단계 — 완료!
`main` 브랜치에 push하면 자동으로 빌드 & 배포됩니다.

🌐 배포 URL: `https://<YOUR_USERNAME>.github.io/film-planner/`

---

## 💻 로컬 개발

```bash
npm install
npm run dev
```

## 🔧 빌드

```bash
npm run build
```
