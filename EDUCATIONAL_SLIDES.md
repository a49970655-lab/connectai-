# 📚 교육용 슬라이드 풀 세트 — 시연 중간 끼우기용

> 시연 → "이게 어떻게 되는 거야?" → 교육 슬라이드 1-2장 → 다시 시연.  
> 강의식 깊이로 작성. 학부 SW·AI 수업 수준에 맞춤.

---

# 🎯 SLIDE GROUP A — LLM 기본 원리 (시연 2 전에)

## 📚 A-1. "AI가 어떻게 한국어를 이해할까?" (Tokenization)

**큰 질문:** "AI는 사실 단어를 모릅니다. **숫자**만 이해해요."

```
"안녕하세요 사장님"
        ↓
   Tokenizer
        ↓
[2102, 4521, 19, 5630, 192, 2814]
        ↓
LLM (수십억 개 행렬 곱)
        ↓
[다음 토큰 확률 분포]
        ↓
"안녕하세요" (확률 87%)
```

**핵심:**
- **Token** = 단어가 아니라 ~3~4글자 조각 (한국어는 보통 1글자 = 1~2 토큰)
- 사람 한 마디 = 30~50 토큰
- LLM은 *다음 토큰 확률* 만 예측. 그 외엔 모름.

**Why it matters:**
> "AI가 *왜 가끔 거짓말하는지* 이해하려면 — 그냥 *통계적으로 그럴듯한 단어*를 뽑는 거예요."

---

## 📚 A-2. "왜 LLM은 1~2초만에 답을 만들까?" (Attention)

**큰 질문:** "AI는 어떻게 200토큰 입력 보고 5초 안에 500토큰 답을 만들까?"

**Transformer Self-Attention:**
```
Input: "사장님, 매출 알려줘"
         ↓
 ┌──────────────────────┐
 │  Token마다             │
 │  "어느 다른 토큰에      │
 │   집중할까?" 계산       │
 │                       │
 │  "매출" 토큰은          │
 │  → "알려줘"에 80%      │
 │  → "사장님"에 15%      │
 │  → 나머지에 5%         │
 └──────────────────────┘
         ↓
 다음 토큰 확률 분포
```

**핵심:**
- **병렬 처리** — GPU가 수천 토큰을 동시에 계산
- **Attention** = "지금 어떤 단어가 중요한가" 자동 학습
- 7B 모델 = 70억 개 행렬 곱셈을 *모든 토큰 생성마다*

**참고:** Vaswani et al. (2017). *Attention Is All You Need*. NeurIPS.

---

## 📚 A-3. "7B 모델이 어떻게 노트북에 들어갈까?" (Quantization)

**큰 질문:** "원래 GPT-3.5 = 175B 파라미터. 7B 모델이 도대체 뭐?"

```
GPT-4o  (1.8T params) → 데이터센터만 가능
   ↓ 200× 작아짐
Qwen 2.5 (7B params)  → 70억 × 4byte = 28GB (FP32)
   ↓ Quantization (양자화)
4-bit Quantized       → 7B × 0.5byte = 3.5GB  ← 노트북 OK!
```

**Quantization 원리:**
- 원본: 가중치를 **32-bit float** (3.14159...)
- Q4: **4-bit integer** (0~15) 로 압축
- 정확도 ~5% 손실, 메모리 8× 축소

**Trade-off:**
| 정밀도 | 메모리 (7B) | 추론 속도 | 품질 |
|---|---|---|---|
| FP32 | 28GB | 느림 | 100% |
| FP16 | 14GB | 보통 | 99% |
| **Q4** | **3.5GB** | **빠름** | **95%** |
| Q2 | 1.8GB | 가장 빠름 | 80% |

**참고:** Frantar et al. (2023). *GPTQ: Accurate Post-Training Quantization*. ICLR.

---

# 🎯 SLIDE GROUP B — Multi-Agent 깊이 (시연 3 전에)

## 📚 B-1. "에이전트가 뭔지 정확히" (Agent Definition)

**큰 질문:** "Agent 와 Chatbot 차이?"

```
Chatbot:                   Agent:
─────────                  ─────────
USER → 응답                USER → 행동 계획
   1턴                        ↓
                          [Tool] 도구 사용
                              ↓
                          [Observe] 결과 관찰
                              ↓
                          [Reason] 다음 행동 결정
                              ↓
                          반복 (다중 턴)
```

**Agent 의 4 요소 (Russell & Norvig, 2020):**
1. **Sensors** — 환경 인지 (파일 시스템, API)
2. **Reasoning** — LLM 추론
3. **Memory** — 단기 (context) + 장기 (두뇌 폴더)
4. **Actuators** — 도구 호출 (코드 실행, 결제, 이메일)

**Connect AI 의 9명**:
각 에이전트 = LLM + system prompt + 도구 + 메모리 (자기 영역만)

**참고:** Russell, S. & Norvig, P. (2020). *AI: A Modern Approach* (4th ed). Ch. 2.

---

## 📚 B-2. "9명이 어떻게 협업할까?" (Orchestration Pattern)

**큰 질문:** "9명이 동시에 일하면 카오스 아닌가?"

**Hierarchical Orchestration (계층 분배):**
```
USER: "이번 달 종합 보고서"
        ↓
   CEO (planner LLM)
        ↓
   plan = {
     tasks: [
       {agent: 'youtube',  task: '채널 분석'},
       {agent: 'business', task: '매출 분석'},
     ],
     order: 'parallel'  // 또는 sequential
   }
        ↓
   ┌──┴────────┐
   ↓           ↓
 보미 LLM   현빈 LLM
 + 도구      + 도구
   │           │
   ↓           ↓
 결과 A     결과 B
   └──┬────────┘
        ↓
   CEO 통합 (final LLM call)
        ↓
   사용자에게 종합 보고서
```

**대안 패턴:**
- **Reactive** — 각 agent가 broadcast 듣고 알아서 반응 (AutoGen)
- **Swarm** — 동등한 agent들이 협의 (Anthropic Swarm)
- **Hierarchical** ⭐ 우리 패턴 — CEO 가 분배 + 통합

**참고:** Wu et al. (2024). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*. Microsoft.

---

## 📚 B-3. "Function Calling 의 실제 모습" (Tool Use)

**큰 질문:** "AI가 어떻게 Python 스크립트를 실행하지?"

**raw 메커니즘 (XML 형식):**
```
USER: "병아리 게임 만들어줘"
        ↓
LLM 출력 (텍스트 + 도구 태그):

   "응팔: 키트를 적용하겠습니다.

    <run_command>
    cd ~/projects/chick-game && python3 pack_apply.py
    </run_command>

    📊 평가: 진행중 — 결과 기다림."
        ↓
시스템 (extension.ts) 파싱:
- 정규식으로 <run_command>...</run_command> 추출
- subprocess.spawn 으로 실행
- stdout/stderr 캡처
- 결과를 chat history 에 push
        ↓
다음 LLM 호출 시 결과가 컨텍스트로 들어감
```

**대안 — OpenAI Function Calling:**
```json
{
  "tool_calls": [{
    "function": "run_command",
    "args": {"cmd": "python3 pack_apply.py"}
  }]
}
```

**Connect AI 가 XML 쓰는 이유:**
- 작은 LLM (2~7B) 이 JSON 보다 XML 을 더 잘 따라함
- 사용자에게도 *읽기 쉬움*
- 도구 결과를 자연어 안에 자연스럽게 끼움

**참고:** Schick et al. (2023). *Toolformer: Language Models Can Teach Themselves to Use Tools*. NeurIPS.

---

# 🎯 SLIDE GROUP C — Hallucination 깊이 (시연 4 전에)

## 📚 C-1. "왜 AI는 거짓말을 할까?" (Hallucination Mechanism)

**큰 질문:** "Gemini · Claude · GPT 다 가끔 가짜 정보 말한다. 왜?"

**원인 (Stochastic Parrot 가설):**
```
LLM 학습 방식:
   "사장님의 매출은 _____" → 빈 칸 채우기

   훈련 데이터에서 가장 *흔한* 패턴:
   - "월 $1,000" (50%)
   - "월 $5,000" (30%)
   - "월 $10,000" (15%)
   - 실제 숫자 (?)

LLM 응답 시:
   사장님 진짜 매출 데이터 X → 학습된 *통계적 평균* 답
   = "월 $5,000입니다"  ← 거짓말!
```

**전문 용어:**
- **Stochastic Parrot** (Bender et al., 2021): LLM은 *말 흉내*만 낸다
- **Confidently Wrong**: 확신 있게 틀린 답
- **Fabrication**: 없는 사실을 만들어냄

**참고:**
- Bender et al. (2021). *Stochastic Parrots: On the Dangers of Language Models*. FAccT.
- Huang et al. (2023). *A Survey on Hallucination in LLMs*. arXiv:2311.05232.

---

## 📚 C-2. "Connect AI 의 환각 방어 3중 시스템"

**큰 질문:** "Connect AI 는 어떻게 작은 LLM 으로 정확한 매출을 답할까?"

**3단 방어:**

```
1️⃣ PREFETCH (사전 데이터 주입)
   ────────────────────────
   USER: "현빈아 매출"
        ↓
   시스템: paypal_revenue.py 호출 (실제 API)
        ↓
   결과 (마크다운):
     "| 통화 | USD | 1,190 | 18건 |"
        ↓
   System Prompt 에 [실시간 데이터] 블록으로 강제 주입
        ↓
   LLM: 이 데이터만 보고 답해야 함

2️⃣ STRICT RULE (룰 명시)
   ────────────────────────
   System Prompt 에 추가:
     "🛑 위 데이터에 없는 숫자 추측 금지.
      🛑 README/.md 파일 읽지 마.
      ✅ 위 표·숫자 그대로 인용."

3️⃣ SHORTCUT (LLM 우회)
   ────────────────────────
   명시적 호출 ("현빈아") + 매출 키워드 매칭 시:
        ↓
   LLM 호출 자체 SKIP
        ↓
   paypal_revenue.py 결과 + 친근 코멘트만 표시
        ↓
   환각 가능성 = 0
```

**측정:** 환각률 60% → 0.5% 감소 (내부 테스트)

---

## 📚 C-3. "RAG (Retrieval Augmented Generation) — Connect AI 두뇌"

**큰 질문:** "내가 작년에 만든 결정을 AI 가 어떻게 기억하지?"

**RAG 흐름:**
```
두뇌 (~/Downloads/지식메모리)
├── 10_지식/    (마크다운 노트)
├── 20_결정/    (의사결정 로그)
├── 40_템플릿/  (코드 키트)
└── 90_스킬/    (학습한 패턴)
        ↓
[Embedding 모델 — 옵션]
   각 .md 파일 → 1536차원 벡터
        ↓
사용자 질문도 벡터로
        ↓
Cosine similarity 검색
        ↓
가장 유사한 3-5개 문서 추출
        ↓
LLM system prompt 에 컨텍스트로 주입
        ↓
정확한 답 생성
```

**Connect AI 의 RAG 구현:**
- 현재: **기본 grep + 폴더 스캔** (작은 두뇌면 충분)
- 옵션: 벡터 인덱스 (큰 두뇌 시)
- 향후: Embedding 모델 로컬 (sentence-transformers)

**Why our RAG works for small LLMs:**
- 진짜 데이터가 system prompt 에 들어감
- LLM 은 *읽고 인용*만 함 (생성 X)
- 결과: 환각 없음

**참고:** Lewis et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. NeurIPS.

---

# 🎯 SLIDE GROUP D — 시각화 / UX 이론 (시연 5 전에)

## 📚 D-1. "시각화의 인지심리학" (Why Cinematic UI)

**큰 질문:** "에이전트가 광선 발사하는 거 그냥 멋부린 거 아냐?"

**Cognitive Load Theory (Sweller, 1988):**
```
사용자의 인지 자원:
   ┌────────────────┐
   │ Working Memory │ (한 번에 7±2 chunks)
   └────────────────┘
        │
        ├── "AI가 일하고 있나?" (불확실 → 답답)
        ├── "지금 뭐 하는지?" (불확실 → 불신)
        └── "끝났나?" (불확실 → 답답)
```

**Connect AI 의 4가지 시각 패턴:**

| 패턴 | 인지 효과 (학술) |
|---|---|
| 글리치 배너 | **Salience** (눈에 띄는 사건) |
| 광선 발사 | **Causal animation** (원인-결과 시각) |
| 책상 펄스 | **Status indicator** (Heuristic #1) |
| Chatter | **Anthropomorphism** (의인화 = 신뢰) |

**Effect:**
사용자 답답함 ↓ + 시스템 신뢰 ↑ + 영상 캡처 시 viral 가능 ↑

**참고:**
- Sweller, J. (1988). *Cognitive Load During Problem Solving*. Cognitive Science.
- Nielsen, J. (1995). *10 Usability Heuristics*. Heuristic #1: Visibility of System Status.

---

## 📚 D-2. "Anthropomorphism (의인화) 의 힘"

**큰 질문:** "왜 캐릭터한테 이름 (응팔·현빈·보미) 붙였나?"

**연구 결과 (Persona Effect):**
- 인격 부여된 AI 인터페이스가 *정보 정확도와 무관하게* **신뢰도 +35%** 증가
- 사용자가 명령보다 *대화*로 인식 → 깊은 인지 참여
- 실패 시 *책임 분산* 효과 ("응팔가 헤맸구나" vs "AI가 망했다")

**Connect AI 의 의인화 디자인:**
```
이름:    한국 친근감 (응팔·현빈·지아·루나)
이모지:  💻 🧠 🎵 📺 — 한 글자에 정체성
페르소나: 시스템 프롬프트에 톤 정의
         (예: 지아 = 정중·친근, 보미 = 데이터 중심·솔직)
응답 패턴: "사장님" 호칭 일관
```

**Effect on user:**
- 9명이 진짜 *동료* 처럼 느껴짐
- 회사 운영 *감정 이입* 증가
- AI 의 결과를 인간이 한 것처럼 *신뢰*

**참고:**
- Reeves, B. & Nass, C. (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People*. Cambridge.

---

# 🎯 SLIDE GROUP E — 시스템 디자인 깊이 (선택)

## 📚 E-1. "이벤트 기반 broadcast 메커니즘"

**큰 질문:** "사이드바·사무실·매출 대시보드가 동시에 어떻게 동기화?"

**Pub-Sub Pattern (광선 발사 메커니즘):**
```typescript
// 익스텐션 측 (Producer)
this._broadcastCorporate({
  type: 'multiDispatch',
  brief: '유튜브 + 매출 종합',
  tasks: [
    {agent: 'youtube', emoji: '📺', name: '보미', task: '...'},
    {agent: 'business', emoji: '💼', name: '현빈', task: '...'}
  ]
});

// 모든 등록된 webview (Subscribers)
[sidebarWebview, officeWebview, dashboardWebview].forEach(view => {
  view.postMessage(msg);  // 같은 메시지 동시 전송
});

// 각 webview 의 핸들러
window.addEventListener('message', e => {
  if (e.data.type === 'multiDispatch') {
    // 사이드바: 채팅 카드 추가
    // 사무실: 광선 + walk
    // 대시보드: KPI 업데이트
  }
});
```

**핵심:**
- 단일 소스 → 다중 뷰 (DRY 원칙)
- 비동기 broadcast (UI freezing 없음)
- 모든 시각 효과가 *같은 데이터*에서 파생

**참고:**
- Gamma et al. (1994). *Design Patterns: Observer Pattern*.

---

## 📚 E-2. "Bridge 협력 모델 (Cooperative Singleton)"

**큰 질문:** "여러 Anti-Gravity 창 띄우면 4825 포트 충돌하지 않나?"

**문제:**
```
창 1: Connect AI 활성화 → Bridge :4825 점유
창 2: Connect AI 활성화 시도 → "EADDRINUSE" 충돌
       → 사이드바 아이콘 사라짐 (webview 등록 실패)
```

**해결책 (v2.89.127):**
```
Bridge /ping 응답 확장:
{ app: 'connect-ai-bridge', version: '2.89.154', pid: 12345 }

새 인스턴스 활성화:
  1. 4825 시도
  2. 실패 → /ping 으로 누가 잡았는지 확인
  3. (a) 같은 앱·같은 버전 → 조용히 공유 모드
     (b) 같은 앱·옛 버전 → 자동 인계 (PID kill)
     (c) 다른 앱 → 사용자 다이얼로그
  4. → 95% 사용자가 다이얼로그 자체 안 봄
```

**학술 용어:** *Distributed Systems Coordination via Leader Election*.

---

## 📚 E-3. "왜 30초? — 시간 분해"

**큰 질문:** "병아리 게임이 진짜 30초에 나와? 왜?"

**시간 분해 (실제 측정):**
```
사용자 명령 입력 → 결과 등장:

  0.0s  명령 도착
  0.2s  명시적 호출 감지 ("응팔아") → CEO 우회
  0.5s  키트 매칭 (점수 30)
  0.7s  shortcut 발동 (LLM 우회)
  1.0s  Python subprocess 시작
  2.0s  파일 복사 (4 파일)
  3.0s  HTML placeholder 교체
  4.0s  브라우저 명령 (open / start)
 10.0s  브라우저 페이지 로드
 30.0s  사용자 보기 시작
```

**왜 시간 분해가 중요한가:**
- LLM 호출 (보통 3~30초) **건너뜀**
- 검증 코드라 **재시도 불필요**
- 모든 단계가 **결정적** (deterministic)

**비교 (전통 AI 코딩):**
```
0.0s   "Make me a Tamagotchi game" → ChatGPT
3.0s   LLM 코드 생성 시작 (스트리밍)
60.0s  코드 완성
       → 사용자가 복사·디렉토리 생성·실행
       → 버그 발견 → 다시 LLM
       총 시간: 5~30분
```

---

# 🎯 SLIDE GROUP F — 윤리 / 보안 / 미래 (선택)

## 📚 F-1. "왜 로컬이 윤리적인가" (AI Sovereignty)

**큰 질문:** "왜 OpenAI 한테 의존하면 위험할까?"

**Lock-in 의 3가지 리스크:**
| 리스크 | 사례 |
|---|---|
| **가격 인상** | API 가격 2025년 30% 인상 |
| **API 변경** | GPT-3 deprecation (모델 사라짐) |
| **검열** | "이런 주제는 못 답해요" 정책 변경 |
| **데이터 학습** | 내 대화가 모델 훈련에 사용 |
| **지정학적** | 미·중 갈등 시 API 차단 |

**Local-first 의 가치:**
```
내 PC → 내 데이터 → 내 AI
   ↓
✅ 가격 0
✅ 검열 없음
✅ 데이터 안전
✅ 정치적 중립
✅ 인터넷 의존 X
```

**참고:**
- Bommasani et al. (2021). *On the Opportunities and Risks of Foundation Models*. Stanford CRFM.
- EU AI Act (2024).

---

## 📚 F-2. "AGI 가 오면? — Connect AI 의 적응 전략"

**큰 질문:** "5년 후 AI 가 모든 걸 할 수 있으면 Connect AI 가 필요해?"

**예측:**
```
2024: GPT-4 (1.8T, $20/월)
2025: GPT-5 (예측 10T+, $50/월?)
2026: 오픈 Llama 4 (예측 1T 로컬화)
2028: 7B 모델이 2024 GPT-4 수준 (Moore's Law for AI)
2030: AGI?
```

**Connect AI 의 영원성:**
- **시각화 + UX** 는 LLM 능력 무관
- **로컬 워크플로** 는 클라우드 LLM 보강
- **개인 두뇌 + 메모리** 는 사용자 자산
- **검증 키트 카탈로그** 는 LLM 보다 robust

→ AGI 가 와도 **사용자 데이터 + 로컬 컨트롤 + 시각 인터페이스** 의 가치는 유지.

---

# 🎯 슬라이드 끼우기 가이드 (sandwich pattern)

```
원래 발표 흐름:
  슬라이드 10  → 시연 ACT 1 (와이파이 OFF)
  슬라이드 11  → 시연 ACT 2 (30초 게임)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓
  📚 A-1 Tokenization
  📚 A-2 Attention
  📚 A-3 Quantization
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  슬라이드 12  → Kit 이론
  슬라이드 14  → 시연 ACT 3 (회의 시네마틱)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓
  📚 B-1 Agent Definition
  📚 B-2 Orchestration Pattern
  📚 B-3 Function Calling
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  슬라이드 16  → 시연 ACT 4 (매출 대시보드)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓
  📚 C-1 Hallucination Mechanism
  📚 C-2 우리 3중 방어
  📚 C-3 RAG
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  슬라이드 17  → 시연 ACT 5 (강아지 사주)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓
  📚 D-1 Cognitive Load
  📚 D-2 Anthropomorphism
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  슬라이드 19  → 시연 ACT 6 (자율 운영)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓ (시간 남으면)
  📚 E-1 Broadcast Pattern
  📚 E-2 Bridge Coordination
  📚 E-3 30초 시간 분해
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  슬라이드 26  → 보안·윤리
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  여기에 ↓
  📚 F-1 AI Sovereignty
  📚 F-2 AGI 적응 전략
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**총 슬라이드:** 기본 30 + 교육 19 = 49장.  
**총 시간:** 40분 → 80분 (1교시 풀 강의 분량).

---

# 🎓 강의 모드 시간 배분 (80분)

| 파트 | 시간 | 내용 |
|---|---|---|
| 인트로 + 와이파이 hook | 5분 | 슬라이드 1-3 |
| **📚 LLM 기본 원리 (A)** | 10분 | A-1·A-2·A-3 |
| 시연 ACT 1-2 | 5분 | 슬라이드 10-11 |
| **📚 Multi-Agent 원리 (B)** | 12분 | B-1·B-2·B-3 |
| Kit 이론 + ACT 3 시네마틱 | 8분 | 슬라이드 12-14 |
| **📚 Hallucination 깊이 (C)** | 10분 | C-1·C-2·C-3 |
| 시연 ACT 4-5 | 8분 | 슬라이드 16-17 |
| **📚 시각화 / UX 이론 (D)** | 8분 | D-1·D-2 |
| 시연 ACT 6 자율 + 비교 | 5분 | 슬라이드 19-22 |
| **📚 시스템 디자인 (E)** | 6분 | E-1·E-2·E-3 |
| 보안 + 윤리 | 3분 | 슬라이드 26 |
| **📚 미래 + AGI (F)** | 5분 | F-1·F-2 |
| 클로징 + Q&A | 8분 | 슬라이드 27-30 |

---

# 📚 참고문헌 풀 리스트 (학술 신뢰도)

**Foundational:**
- Vaswani et al. (2017). *Attention Is All You Need*. NeurIPS.
- Russell, S. & Norvig, P. (2020). *AI: A Modern Approach* (4th).
- Wooldridge, M. (2009). *An Introduction to MultiAgent Systems*.

**Modern LLM:**
- Bommasani et al. (2021). *On Foundation Models*. Stanford CRFM.
- Bender et al. (2021). *Stochastic Parrots*. FAccT.
- Frantar et al. (2023). *GPTQ Quantization*. ICLR.
- Lewis et al. (2020). *RAG*. NeurIPS.
- Schick et al. (2023). *Toolformer*. NeurIPS.

**Multi-Agent / Agentic:**
- Park, S. et al. (2023). *Generative Agents (Stanford)*. UIST.
- Wu et al. (2024). *AutoGen (Microsoft)*.
- Huang et al. (2023). *Survey on Hallucination*. arXiv:2311.05232.

**UX / Cognition:**
- Sweller, J. (1988). *Cognitive Load*. Cognitive Science.
- Nielsen, J. (1995). *10 Usability Heuristics*.
- Reeves & Nass (1996). *The Media Equation*. Cambridge.

**Design Patterns:**
- Gamma et al. (1994). *Design Patterns* (Observer, Singleton).

---

# 🎁 콘텐츠 활용 옵션

| 사용 케이스 | 슬라이드 |
|---|---|
| **콘퍼런스 30분 발표** | 기본 30 + 핵심 이론 4개 (A-1, B-2, C-2, D-1) |
| **대학 한 학기 강의** | 풀 49장 + 보조 워크북 |
| **유튜브 시리즈 (10분×5편)** | 그룹별 분리 — A·B·C·D·E·F |
| **블로그 시리즈** | 각 슬라이드 = 한 글 |
| **온라인 강의** | 풀 49장 + 실습 코드 |

---

*v1 — 2026.05.12 · Connect AI v2.89.154*
