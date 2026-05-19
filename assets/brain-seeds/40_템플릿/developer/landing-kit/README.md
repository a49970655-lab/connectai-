# 📋 Landing Kit — 1인 기업·SaaS 랜딩 페이지

검증된 6-섹션 구조. 사용자가 5분 안에 본인 사이트 만들 수 있게.

## 언제 쓰나
- 새 제품·서비스 런칭 페이지
- 1인 기업 메인 사이트  
- 리드 수집용 단일 페이지
- 강의·전자책·뉴스레터 가입 페이지

## 6-섹션 구조 (이 순서가 검증된 conversion 패턴)

1. **Hero** — 첫 5초에 결정. H1 한 줄 + sub 한 줄 + CTA 2개 (primary + ghost).
2. **Features** — 3개 핵심 가치. 아이콘 + 제목 + 한 줄 설명.
3. **Pricing** — 1~3개 플랜. 가운데가 "추천" 강조.
4. **FAQ** — 자주 묻는 질문 5~7개. accordion.
5. **CTA** — 본문 끝 강조 액션 박스. 한 번 더 가입 유도.
6. **Footer** — 회사 정보, 소셜, 카피라이트.

## 사용법

### 1. web_init 으로 vite-react 프로젝트 만들기
```
TEMPLATE: vite-react
PROJECT_NAME: my-saas
```

### 2. 의존성 추가
```bash
cd ~/connect-ai-projects/my-saas
npm install lucide-react
```

### 3. 이 폴더의 6개 파일을 `src/components/` 로 복사
```
files/Hero.tsx       → src/components/Hero.tsx
files/Features.tsx   → src/components/Features.tsx
files/Pricing.tsx    → src/components/Pricing.tsx
files/FAQ.tsx        → src/components/FAQ.tsx
files/CTA.tsx        → src/components/CTA.tsx
files/Footer.tsx     → src/components/Footer.tsx
```

### 4. `src/App.tsx` 교체
```tsx
import Hero from './components/Hero'
import Features from './components/Features'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
```

### 5. 텍스트만 수정
각 컴포넌트의 props 또는 인라인 텍스트를 본인 제품에 맞게 바꾸기.

## 컨벤션 (응팔가 따라야 할 규칙)

- **모든 섹션** = `<section className="py-16 sm:py-24 px-6">` 패턴
- **컨테이너** = `<div className="max-w-6xl mx-auto">` 패턴
- **H2** = `text-3xl sm:text-4xl font-bold tracking-tight`
- **CTA 버튼 primary** = `bg-gray-900 text-white hover:bg-gray-800`
- **CTA 버튼 ghost** = `border border-gray-300 hover:bg-gray-50`
- **간격** = 섹션 사이 자체 padding, App 레벨 추가 margin X
- **반응형** = 모바일 first, `sm: md: lg:` 순으로 확장
- **아이콘** = lucide-react만 사용

## 텍스트 카피 가이드

- **Hero H1**: "[행동] without [고통]" 또는 "[숫자] [결과] in [시간]"
  - 예: "Build a SaaS without writing backend"
  - 예: "AI 1인 기업 100% 무료로 시작"
- **Hero sub**: 1줄에 무엇·누구·결과를 응축
- **CTA**: 명사 X, 동사로. "지금 시작" "무료 체험" "데모 보기"
- **Features**: 기능 X, 결과 O. ❌"API 통합" → ⭕"외부 도구가 자동으로 일함"
- **Pricing**: 부담 낮은 진입 가격 + 추천 플랜 + 풀 기능 플랜
- **FAQ**: 진짜 사용자가 망설이는 것. 가격·취소·보안·환불 우선.

## 베스트 프랙티스

- 한 페이지에 CTA 3번 이상 노출 (Hero·중간·CTA 섹션·Footer)
- 사용자 후기 또는 로고 2~3개 (Hero 아래 또는 Features 다음)
- 모바일에서 H1 → CTA 한 화면 내 보이게
- 폰트 2개 이상 X (system font + 1개 디스플레이 폰트 max)
- 색은 1 primary + 1 accent + grayscale

## 모바일 앱처럼 만들기

PWA로 변환하려면 `pwa_setup` 도구 실행:
```
PROJECT_PATH: ~/connect-ai-projects/my-saas
APP_NAME: My SaaS
ICON_EMOJI: 🚀
```
