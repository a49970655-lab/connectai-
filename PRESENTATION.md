# 🎬 Connect AI — 100% 로컬에서 돌아가는 1인 기업
## 발표용 슬라이드 콘텐츠 (전문 + 재미 + 교육 fusion)

> **포맷**: 슬라이드 한 페이지당 한 섹션. 마크다운 그대로 Keynote·PowerPoint·Notion·Slidev·Marp에 붙여넣기 가능.

---

## 🎴 SLIDE 1 — 타이틀

```
       ✨

  AI 1인 기업,
  100% 로컬에서.

  ── 인터넷 끊고도 일하는 9명 AI 직원의 회사

       wonseokjung
       2026.05
```

**Speaker note**: 첫 5초 박혀야 함. 와이파이 아이콘 카메라에 보여주면서.

---

## 🎴 SLIDE 2 — 문제 정의 (Why)

### 클라우드 AI의 3가지 한계

| 한계 | 현실 |
|---|---|
| 💸 **비용** | ChatGPT Plus $20/월 × N명 = 회사 운영비 |
| 🔒 **프라이버시** | 모든 대화·코드가 OpenAI 서버로 |
| 🌐 **인터넷 의존** | 비행기·산속·시연장 와이파이 끊기면 무력 |

**→ Local-first 가 답이다.**

---

## 🎴 SLIDE 3 — Solution (What)

### Connect AI 의 핵심 가치

```
🤖 AI 1인 기업 = CEO + 9명 specialist agents
   100% 로컬 · 100% 무료 · 100% 오프라인 가능
```

- **CEO**: 작업 분배 (orchestrator)
- **9명 specialist**: YouTube, Designer, Writer, Coder(응팔), Business(현빈), Researcher, Editor, Instagram, Secretary
- **LLM 엔진**: Ollama / LM Studio (로컬)
- **두뇌**: 마크다운 폴더 (Git sync)

---

## 🎴 SLIDE 4 — 📚 THEORY 1 / Multi-Agent System (MAS)

### 학술적 배경

**Multi-Agent System (MAS)** — 1980년대 분산 AI 연구에서 시작

```
   ┌───────────┐
   │   CEO     │ ← Orchestrator (Planner)
   └─────┬─────┘
         │ task decomposition
   ┌─────┴──────────────────────┐
   ↓        ↓        ↓         ↓
 응팔   현빈     보미    지아   ...
 (Spec)  (Spec)  (Spec)  (Spec)
         peer context sharing
```

**핵심 원리:**
1. **Decentralized cognition** — 각 agent는 자기 도메인 전문가
2. **Hierarchical orchestration** — CEO가 분해·분배·통합
3. **Peer context** — 다른 에이전트 산출물을 컨텍스트로 공유
4. **Hallucination guard** — 진짜 데이터 prefetch → LLM에 강제 주입

**참고문헌:**
- Wooldridge, M. (2009). *An Introduction to MultiAgent Systems*.
- Park et al. (2023). *Generative Agents: Interactive Simulacra of Human Behavior* (Stanford).
- AutoGPT, AutoGen, CrewAI, Claude Code (오픈소스 멀티에이전트 패턴 비교)

---

## 🎴 SLIDE 5 — 📚 THEORY 2 / 왜 로컬이어야 하나

### "AI Sovereignty" — Andrej Karpathy

> "The future of AI is **personal**, **private**, and **persistent**."

**3가지 trade-off:**

| 항목 | Cloud LLM | Local LLM |
|---|---|---|
| 능력 | GPT-4o (1.8T) | qwen2.5 (7B) — 모바일 SLM |
| 응답 속도 | 200ms (API) | 30~500ms (로컬 추론) |
| 비용 | $20+/월 | $0 |
| 프라이버시 | ❌ 데이터 학습 | ✅ 로컬 |
| 오프라인 | ❌ | ✅ |

**Connect AI 의 선택**: **로컬 우선 + 작은 모델 + 똑똑한 orchestration**.  
= 능력 격차를 **시스템 설계로 보완**.

---

## 🎴 SLIDE 6 — 📚 THEORY 3 / Hallucination 방어

### LLM 환각의 3가지 원인 + 우리 해결책

| 원인 | 우리 해결 |
|---|---|
| **데이터 없음** | `prefetch` — 도구 실행 결과를 system prompt 에 강제 주입 |
| **추측 본능** | strict rule — "데이터 없으면 '데이터 없음' 답해" |
| **README 우회** | `shortcut` — LLM 무시하고 도구 결과 직접 표시 |

```python
# 예시: 현빈이 매출 분석 시
prefetch_data = run("paypal_revenue.py")  # 진짜 API 호출
system_prompt = base + f"[실시간 데이터]\n{prefetch_data}\n위 숫자 외에 추측 금지"
answer = llm(system_prompt, user_question)
```

**=> 작은 LLM(2B)도 진짜 숫자로 답함. 환각 0.**

---

## 🎴 SLIDE 7 — 🏗 아키텍처 (한 장)

```
┌───────────────────────────────────────────────────────┐
│                  USER  (사용자)                        │
└───────────────┬───────────────────────────────────────┘
                ↓ 자연어 명령
┌───────────────────────────────────────────────────────┐
│   Connect AI (Anti-Gravity · VS Code Extension)       │
├───────────────────────────────────────────────────────┤
│  ┌─Bridge─┐  ┌──Sidebar──┐  ┌─Office Panel─┐         │
│  │ :4825  │  │  Chat UI  │  │  Pixel Office│         │
│  └────────┘  └─────┬─────┘  └──────────────┘         │
│                    ↓                                  │
│      ┌────────────────────────────┐                  │
│      │      CEO (Orchestrator)     │                  │
│      └──┬─────────┬─────────┬──────┘                  │
│         ↓         ↓         ↓                         │
│      응팔     현빈      보미   ... (9 agents)        │
│         │         │         │                         │
│         ↓         ↓         ↓                         │
│    [tools]   [tools]   [tools]                       │
│   pack_apply  paypal_rev  my_videos_check             │
└───────────────────────────────────────────────────────┘
                ↓ LLM call
┌───────────────────────────────────────────────────────┐
│   LM Studio / Ollama  (로컬 — 인터넷 X)               │
│   qwen2.5-7b · llama-3.2-3b · gemma · ...             │
└───────────────────────────────────────────────────────┘
                ↓ persistent
┌───────────────────────────────────────────────────────┐
│   두뇌 (~/Downloads/지식메모리/)                       │
│   10_지식 · 20_결정 · 40_템플릿 · 90_스킬 · _company/  │
└───────────────────────────────────────────────────────┘
```

---

## 🎴 SLIDE 8 — 🎬 시연 시작 (오프라인 충격)

```
ACT 1: 와이파이 끊기

  📡 Wi-Fi OFF →
  사이드바: "안녕"
  →  Connect AI: "사장님, 안녕하세요. 무엇을 도와드릴까요?"

  ❗ "이게 진짜 오프라인이라고?"
```

**Speaker note**: 카메라가 와이파이 아이콘 비추도록 5초 멈춤.

---

## 🎴 SLIDE 9 — 🎬 ACT 2 / 30초에 게임이 만들어진다

```
사용자: "응팔아, 병아리 키우는 게임 만들어줘"

  0초 → CEO 우회 (명시적 호출 감지)
  5초 → 응팔 단독 dispatch + 키트 매칭 (점수 30)
 10초 → pack_apply 실행 → 파일 복사
 20초 → 브라우저 자동 오픈
 30초 → 🐤 다마고치 등장!
```

**시청자**: *"비코더도 이게 가능?"*

---

## 🎴 SLIDE 10 — 📚 THEORY 4 / 키트 시스템 (Template Pack)

### 코드 = 재고 (Inventory)

**전통적 코딩** → AI 가 백지에서 코드 생성 → 환각·버그·반복

**Connect AI 방식** — *"Verified code as inventory"*:
1. **키트 카탈로그** (EZER AI) — 검증된 코드 묶음
2. **manifest.json** — keywords + apply 규칙
3. **자동 매칭** — 사용자 의도 → 점수 → 최적 키트
4. **pack_apply** — 복사 + placeholder 교체 + 의존성 설치
5. **운영자 자격증명 자동 inline** — Gemini/PayPal 키 빌드 시 박힘

```
사용자 의도 → 점수 매칭 → 검증 코드 → 즉시 작동
   (자연어)   (keyword)   (재고)    (30초)
```

---

## 🎴 SLIDE 11 — 🎬 ACT 3 / 사무실 시네마틱 (메인 클라이맥스)

```
사용자: "이번 달 종합 보고서 — 유튜브 + 매출 + 다음 전략"

  📋 DISPATCH PROTOCOL 글리치 배너
        ↓
  CEO 책상 폭발 펄스 + 화이트보드
        ↓
  📺 보미·💼 현빈이 책상에서 walk → CEO 회의실
        ↓
  cyan/violet 광선 + 황금 점 꼬리 발사
        ↓
  도착 시 12개 색색 파티클 폭발
        ↓
  회의 chatter ("알겠습니다!", "🚀 ON IT")
        ↓
  ✨ MEETING COMPLETE 배너
        ↓
  자기 자리로 walk 복귀 + working
```

**시청자**: *"AI 회사 직원들이 진짜 일하네 ㅋㅋ"*

---

## 🎴 SLIDE 12 — 📚 THEORY 5 / Agentic UI Pattern

### "Show, don't tell" — 시각화의 인지심리학

**Agentic systems** 의 핵심 UX 과제:
- LLM 호출은 *눈에 안 보임*
- 사용자는 "뭐 하고 있는지" 모름 → 답답함 → 불신

**우리 해결**:
| 패턴 | 인지 효과 |
|---|---|
| 광선 발사 | "task가 흘러간다" (action visualization) |
| 책상 펄스 | "지금 일하고 있다" (status indicator) |
| Chatter 말풍선 | "협업한다" (anthropomorphism) |
| 글리치 배너 | "큰 변화가 일어났다" (event salience) |

**참고**: Nielsen, J. *Visibility of System Status* (UX heuristic #1, 1995).

---

## 🎴 SLIDE 13 — 🎬 ACT 4 / 매출 대시보드

```
🌌 매트릭스 글리프 비 배경
$0 → $1,190  (count-up 1.1s)
   18건 거래
   ┌─────────────────┐
   │ 게임별 도넛       │  step-4 43% · step-3 21% · ...
   │ 30일 sparkline    │  황금 peak dot
   │ 라이브 거래 피드   │  새 결제 → burst alert
   └─────────────────┘
```

**기술**: easeOutCubic 카운트업 · SVG stroke-dasharray 도넛 · drop-shadow glow

---

## 🎴 SLIDE 14 — 🎬 ACT 5 / 결제 = AI 마법 폭발

### 한국 사주 × AI × PayPal (글로벌 1인 기업 케이스)

```
"AI 회사야, 강아지 사주 글로벌 서비스 만들어줘. 월 $1000 목표."
   ↓
사무실 시네마틱 (5명 walk)
   ↓
응팔 → doggie-mystic-kit 매칭 + 적용
   ↓
🔐 운영자 자격증명 자동 inline (Gemini + PayPal)
   ↓
🌸 Doggie Mystic 사이트 등장 (K-Cute Sanrio 디자인)
   ↓
강아지 사진 + 이름 → Gemini 3-카드 무료 사주
   ↓
"$4.99 Generate AI Mystic Card" → PayPal 결제
   ↓
Imagen 3 카드 PNG 생성 + 풀 5섹션 사주
   ↓
매출 대시보드: $0 → $4.99 + burst alert
```

**핵심 메시지**: *"AI 가 만든 게임에서 실제로 돈이 들어왔어"*

---

## 🎴 SLIDE 15 — 📚 THEORY 6 / K-Culture + AI 글로벌 모델

### Why K-Mystic for Dogs Works

| 트렌드 | 데이터 |
|---|---|
| K-pop 글로벌 시장 | $12B (2024) |
| Pet industry | $260B 글로벌 |
| AI consumer apps | $50B (Co-Star, Replika 등) |

**3개 교차점:**
```
K-culture × AI × Pet
     ↓
"미국·유럽엔 없는 신선함"
+ "AI 분석의 권위"
+ "내 강아지에 대한 무한 애정"
     ↓
높은 conversion rate
```

**참고**: Pew Research (2023). *Generational shifts in pet ownership: 70% of Gen Z own a pet, 53% identify as "pet parent".*

---

## 🎴 SLIDE 16 — 🎬 ACT 6 / 자율 운영 (24시간)

```
사용자 자리 비움 30분 →
   CEO 자동 작동:
     "회사 목표 검토 → 다음 액션 결정"

새벽 03:00 — UK 사용자 결제 $4.99 →
   💰 지아 텔레그램 푸시: "새 결제 도착!"

매일 09:00 → 데일리 브리핑:
   - 어제 매출
   - 미해결 할 일
   - CEO 다음 액션 제안
```

**= 사람이 자고 있어도 1인 AI 기업이 돌아감.**

---

## 🎴 SLIDE 17 — 📚 THEORY 7 / Recursive Self-Improvement

### "AI 회사가 스스로를 개선한다"

**현재 구현 (v2.89.153)**:
1. **자가 학습** — 결정 로그를 두뇌에 저장 → 다음 LLM 호출에 컨텍스트로
2. **자가 평가** — 모든 작업이 `📊 평가: 완료/진행중/대기` 자가 보고
3. **자가 회복** — fuzzy path hint, 키트 자동 매칭, shortcut 우회

**다음 단계 (로드맵):**
- Agent loop (list → think → edit → verify)
- 작업 결과 학습 (성공한 패턴 두뇌에 저장)
- A/B 실험 자동화 (가격 테스트, UI 변형)

**참고**: Schmidhuber, J. *Gödel Machine* (2003) — self-referential improvement systems.

---

## 🎴 SLIDE 18 — 🛠 기술 스택

```
Frontend (Webview)
├─ Vanilla JS + SVG animations
├─ Matrix glyph rain
├─ Cyber-Korean palette
└─ Floating reactive cinematic

Backend (Extension Host)
├─ TypeScript / Node 18
├─ esbuild (1.3MB single bundle)
├─ HTTP Bridge :4825
├─ Multi-agent dispatcher
└─ Python tools (subprocess)

LLM Layer
├─ LM Studio :1234 (default)
├─ Ollama :11434 (fallback)
└─ Stream + JSON-mode + scope check

Storage
├─ 두뇌 (~/Downloads/지식메모리)
├─ Git sync
└─ .gitignore secrets

External APIs
├─ Gemini (text + Imagen 3)
├─ PayPal (Transaction Search)
├─ YouTube Data API
└─ Telegram Bot
```

---

## 🎴 SLIDE 19 — 📊 비교표 (vs 경쟁)

| 기능 | ChatGPT Plus | Claude Code | **Connect AI** |
|---|---|---|---|
| 가격 | $20/월 | $200/월 | **무료** |
| 로컬 LLM | ❌ | ❌ | ✅ |
| 오프라인 | ❌ | ❌ | ✅ |
| 멀티 에이전트 | ❌ | 부분 | ✅ 9명 |
| 비주얼 사무실 | ❌ | ❌ | ✅ |
| 자율 사이클 | ❌ | ❌ | ✅ 24h |
| 키트 카탈로그 | ❌ | ❌ | ✅ EZER |
| 결제 통합 | ❌ | ❌ | ✅ PayPal |
| 매출 대시보드 | ❌ | ❌ | ✅ |
| 한국어 우선 | 부분 | 부분 | ✅ |

---

## 🎴 SLIDE 20 — 💎 핵심 차별점 (한 줄)

```
"AI 1인 기업 = 사람 X + AI 9명 + 로컬 + 무료 + 시각화 + 매출"
```

**다른 도구**: AI 어시스턴트  
**Connect AI**: AI 회사

---

## 🎴 SLIDE 21 — 🎯 누가 써야 하나

### 타겟 페르소나 3개

**1️⃣ K-Creator (Solo founder)**
- "내 브랜드를 글로벌로"
- K-culture 컨텐츠 + AI + 자동화

**2️⃣ 1인 SaaS 개발자**
- "코드 작성·테스트·배포 다 혼자"
- 응팔가 24시간 코드 일

**3️⃣ Content Creator**
- "유튜브·인스타·블로그 다 운영"
- 보미·인스타·작가가 콘텐츠 분담

---

## 🎴 SLIDE 22 — 📦 4개 검증된 키트 (지금 사용 가능)

```
🐤 병아리게임 샘플팩       — 첫 결과물 (vanilla HTML)
🌌 네온서바이버 샘플팩     — 게임 + PayPal 결제
🏠 Landing Kit              — SaaS 랜딩 (React 6 섹션)
🔮 강아지사주 (Doggie Mystic) — Gemini × PayPal × K-culture
```

**EZER AI 카탈로그에서 클릭 한 번으로 자기 두뇌에 주입.**

---

## 🎴 SLIDE 23 — 🚀 시작하는 법 (3분)

```bash
# 1. Anti-Gravity 또는 VS Code 설치
https://antigravity.google/

# 2. Connect AI vsix 다운로드 + 설치
code --install-extension connect-ai-lab-2.89.153.vsix --force

# 3. LM Studio (또는 Ollama) 설치 + 모델 다운로드
qwen2.5-7b-instruct 또는 llama-3.2-3b (16K context)

# 4. EZER AI 열기 → 키트 클릭 → 두뇌 주입

# 5. 채팅: "AI 회사야, 강아지 사주 서비스 만들어줘"

→ 30초 안에 첫 결과물 + 결제 가능한 사이트
```

---

## 🎴 SLIDE 24 — 🌐 보안 + 윤리

### Security by Design

| 영역 | 방어 |
|---|---|
| API 키 노출 | HTTP Referer 제한 권장 (Google Cloud Console) |
| 시크릿 git push | .gitignore + GitHub Push Protection |
| 데이터 프라이버시 | 100% 로컬 — OpenAI/Anthropic 으로 안 감 |
| 결제 보안 | PayPal SDK (PCI compliant) |
| 두뇌 시크릿 | _agents/*/oauth.local.json 자동 .gitignore |

**윤리:**
- 사주는 *오락 목적* (의료 조언 X)
- Gemini · PayPal 이용약관 준수
- 사용자 데이터 = 사용자 PC 에만

---

## 🎴 SLIDE 25 — 🗺 로드맵 (12개월)

```
✅ Q1 2026  - 9명 에이전트 + 매트릭스 사무실 + 4개 키트
🔄 Q2 2026  - Agent loop (다단계 도구 사용)
              파일 watcher (프로젝트 진척 자동 분석)
              cron 새 결제 알림
📅 Q3 2026  - 키트 마켓플레이스 (커뮤니티 큐레이션)
              한국어 음성 입력 (Whisper 로컬)
              모바일 webview (PWA)
📅 Q4 2026  - Vision agent (스크린샷 → 분석)
              자율 마케팅 (인스타·유튜브 자동 발행)
              사용자 정의 에이전트 (DIY)
```

---

## 🎴 SLIDE 26 — 💡 핵심 메시지 (closing)

```
   "AI 가 일하고
    내가 산다."

   인터넷 끊고 100% 로컬
   AI 9명이 24시간 협업
   내 게임에서 진짜 돈
   자고 있어도 매출 알림
```

**= 누구나 1인 기업이 될 수 있다.**

---

## 🎴 SLIDE 27 — 🙋 Q&A 자주 묻는 질문

**Q1. LLM 작아서 똑똑한 답 나오나?**  
→ Prefetch + shortcut + strict guard 로 보완. 7B 모델로도 충분.

**Q2. 정말 무료?**  
→ vsix 무료 + LM Studio 무료 + Ollama 무료. PayPal/Gemini 만 운영자가 발급 (둘 다 무료 tier).

**Q3. 매출 어디서?**  
→ 키트로 만든 사이트 (사주·게임 등) 에서 PayPal 결제. 운영자 계정으로 입금.

**Q4. 윈도우 됨?**  
→ v2.89.152 부터 윈도우 호환 (mkdir, env vars, open 자동 분기).

**Q5. 데이터 어디 저장?**  
→ 100% 로컬. ~/Downloads/지식메모리/. 옵션으로 GitHub 동기화.

---

## 🎴 SLIDE 28 — 📥 다운로드 + 연락

```
🌐 https://github.com/wonseokjung/connect-ai
📧 wonseokjung1987@gmail.com
🎥 YouTube: @wonseokjung
📦 Latest: connect-ai-lab-2.89.153.vsix
```

**Made with 💕 in Korea — for the world.**

---

## 🎤 SPEAKER NOTES (전체 흐름 요약)

| 슬라이드 | 시간 | 핵심 |
|---|---|---|
| 1-3 | 2분 | 문제 → 해결책 |
| 4-7 | 5분 | 학술 배경 + 아키텍처 |
| 8-11 | 7분 | 라이브 시연 클라이맥스 |
| 12-17 | 5분 | 시각화 이론 + 자율 운영 |
| 18-22 | 4분 | 기술 스택 + 차별점 |
| 23-25 | 3분 | 시작하기 + 로드맵 |
| 26-28 | 2분 | 클로징 + Q&A 시작 |

**총 28분 + Q&A 12분 = 40분 강연 표준.**

---

## 🎨 디자인 톤 가이드 (슬라이드 만들 때)

```
Color palette:
  배경: #fef9f3 (cream) 또는 #050816 (matrix dark)
  강조: #ec4899 (pink) + #a78bfa (lavender) + #fbbf24 (gold)
  보조: #67e8f9 (cyan) + #34d399 (mint)

Typography:
  헤더: Fredoka 700 / Pretendard Bold
  본문: Comfortaa / Pretendard Regular
  코드: SF Mono / JetBrains Mono
  한국미: Nanum Pen Script (액센트만)

Imagery:
  - 강아지 SVG 마스코트
  - 글리프 비 (한복명운태극음양오행)
  - 별자리 라인
  - 매트릭스 카드 reveal
  - Sanrio 풍 둥근 곡선 (border-radius 24-32px)
```

---

*v1 — 2026.05.12 · Connect AI v2.89.153*
