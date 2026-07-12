import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  PlayCircle,
  ExternalLink,
  Send,
  Clock,
} from 'lucide-react';
import './OjtGuidePanel.css';

// ──────────────────────────────────────
// 진주공장 조직도 (실제 데이터)
// ──────────────────────────────────────
const ORG_DATA = {
  '공무부': ['설비관리파트', '전기제어파트'],
  '물류부': ['완정1파트', '완정2파트', '물류관리파트'],
  '생산부': ['조성파트', '생산1파트', '생산2파트', '가공1파트', '가공2파트'],
  '품질보증부': ['생산관리파트', '품질보증파트'],
  '제지기술개발부': [],
  '혁신활동사무국': [],
};

// ──────────────────────────────────────
// 시범 콘텐츠: 품질보증부 > 생산관리파트
// 학습 항목 여러 개를 리스트로 제공
// ──────────────────────────────────────
const DEMO_CONTENT = {
  // 부서 전체 메트릭
  metrics: { guides: 3, time: '45분', passScore: 80 },

  // 학습 항목 리스트
  items: [
    {
      title: '생산관리파트 업무의 이해',
      description: '생산관리파트의 조직 구성, 주요 역할, 업무 프로세스 전반을 소개합니다.',
      icon: '📋',
      duration: '25분',
      videoTitle: '생산관리파트 업무의 이해 (장원창 사원)',
      videoLink: '#',
      summary: [
        {
          icon: '📋',
          title: '생산관리파트 주요 업무 개요',
          content:
            '생산관리파트는 진주공장 전체의 생산 계획 수립, 생산 실적 집계, 원가 관리 업무를 총괄합니다. 일일·주간·월간 단위로 생산 데이터를 수집하여 경영진에게 보고하는 것이 핵심 역할입니다.',
        },
        {
          icon: '📊',
          title: '생산계획 수립 프로세스',
          content:
            '월간 생산계획은 매월 25일까지 수립하며, 영업부 수주 데이터와 재고 현황을 기반으로 PM별 생산량을 배분합니다. 계획 대비 실적 달성률은 95% 이상을 목표로 합니다.',
        },
      ],
      quiz: [
        {
          question: '월간 생산계획은 매월 며칠까지 수립해야 합니까?',
          options: ['매월 15일', '매월 20일', '매월 25일', '매월 말일'],
          correctIndex: 2,
          explanation:
            '월간 생산계획은 매월 25일까지 수립하며, 영업부 수주 데이터와 재고 현황을 기반으로 PM별 생산량을 배분합니다.',
        },
      ],
    },
    {
      title: 'MES 시스템 활용 기초',
      description: '제조실행시스템(MES)의 기본 화면 구성과 생산 데이터 입력 방법을 학습합니다.',
      icon: '💾',
      duration: '10분',
      videoTitle: 'MES 시스템 기본 교육',
      videoLink: '#',
      summary: [
        {
          icon: '💻',
          title: 'MES 시스템 개요',
          content:
            'MES(Manufacturing Execution System)는 생산 현장의 실시간 데이터를 수집·관리하는 핵심 시스템입니다. 작업 지시, 실적 수집, 품질 검사 데이터를 통합 관리합니다.',
        },
        {
          icon: '📝',
          title: '데이터 입력 규칙',
          content:
            '생산 실적은 매 교대 종료 후 30분 이내에 입력해야 합니다. 입력 시 품종코드, 생산량(톤), 불량량을 필수로 기재하며 데이터 오류율 0.1% 이하를 유지해야 합니다.',
        },
      ],
      quiz: [
        {
          question: '생산 실적은 매 교대 종료 후 몇 분 이내에 MES에 입력해야 합니까?',
          options: ['10분', '30분', '1시간', '2시간'],
          correctIndex: 1,
          explanation:
            '생산 실적은 매 교대 종료 후 30분 이내에 입력해야 하며, 품종코드·생산량·불량량을 필수로 기재합니다.',
        },
      ],
    },
    {
      title: '원가관리 및 KPI 모니터링',
      description: '원단위(원/톤) 관리 방법과 주요 생산 KPI 모니터링 절차를 학습합니다.',
      icon: '💰',
      duration: '10분',
      videoTitle: '원가관리 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '💰',
          title: '원가관리 기본 개념',
          content:
            '원단위(원/톤) 관리를 통해 생산 원가를 모니터링합니다. 주요 원가 항목은 원재료비, 에너지비, 약품비이며 매월 전월 대비 증감을 분석합니다.',
        },
        {
          icon: '📈',
          title: '주요 KPI 항목',
          content:
            '생산관리파트의 핵심 KPI는 제조원가율, 불량률(목표 2% 이하), 가동률(목표 95% 이상)이며 매월 경영회의 시 보고합니다.',
        },
      ],
      quiz: [
        {
          question: '생산관리파트에서 관리하는 불량률 목표 기준은?',
          options: ['1% 이하', '2% 이하', '3% 이하', '5% 이하'],
          correctIndex: 1,
          explanation:
            '불량률 목표는 2% 이하이며, 가동률 목표는 95% 이상입니다. 매월 경영회의 시 보고합니다.',
        },
      ],
    },
  ],
};

const MAINTENANCE_CONTENT = {
  metrics: { guides: 2, time: '20분', passScore: 80 },
  items: [
    {
      title: '예방정비(PM) 주기 관리 기준',
      description: '진주공장의 주요 기계 설비 예방 정비 활동 및 주기적 검사 프로세스를 이해합니다.',
      icon: '🔧',
      duration: '10분',
      videoTitle: 'PM 정비 및 점검 가이드 (최공무 사원)',
      videoLink: '#',
      summary: [
        {
          icon: '🔧',
          title: '예방정비(PM) 개요',
          content: '예방정비는 설비 고장을 사전에 예방하기 위해 주기적으로 정비, 점검, 윤활, 청소 등을 수행하는 활동입니다. 일일, 주간, 월간, 반기, 연간 단위로 주기적 체크리스트에 의거해 수행합니다.'
        },
        {
          icon: '📅',
          title: '주요 설비 점검 주기',
          content: '핵심 설비인 초지기 프레스 롤 베어링의 경우 매월 진동 분석 점검을 수행하며, 감속기 기어 오일은 반기(6개월)마다 수치 분석 및 필요 시 교체 조치를 실행합니다.'
        }
      ],
      quiz: [
        {
          question: '감속기 기어 오일의 수치 분석 및 분석 점검 권장 주기는 어떻게 됩니까?',
          options: ['매주', '매월', '6개월(반기) 마다', '2년 마다'],
          correctIndex: 2,
          explanation: '감속기 기어 오일은 반기(6개월)마다 수치 분석 및 점검을 수행하는 것이 기본 주기입니다.'
        }
      ]
    },
    {
      title: '설비 윤활 관리 표준 수칙',
      description: '회전 기계 장비의 조기 마모 방지를 위한 그리스 및 오일 주입 표준 절차입니다.',
      icon: '🛢️',
      duration: '10분',
      videoTitle: '설비 윤활 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🛢️',
          title: '윤활 관리의 5대 원칙',
          content: '적정유(Right Oil), 적량(Right Quantity), 적시(Right Time), 적소(Right Place), 적색(Right Cleanliness)을 준수하여 오염되지 않도록 관리해야 합니다.'
        },
        {
          icon: '⚠️',
          title: '그리스 주입 시 주의 사항',
          content: '윤활 부위에 그리스 주입 전 노즐 니플 주변의 이물질을 완전히 닦아내어야 하며, 과다 주입 시 베어링 내부 압력 증가로 고온 발열 및 씰 손상이 유발될 수 있어 정량을 준수해야 합니다.'
        }
      ],
      quiz: [
        {
          question: '그리스 과다 주입 시 발생할 수 있는 이상 현상이 아닌 것은?',
          options: ['베어링 내부 압력 증가', '베어링 고온 발열 발생', '오일 씰 파손 및 그리스 누출', '모터 회전 속도 급증'],
          correctIndex: 3,
          explanation: '그리스를 과다하게 주입하면 베어링 압력이 증가하고 마찰로 인해 고온이 발생하며 씰이 손상될 수 있지만, 모터 회전 속도가 급증하지는 않습니다.'
        }
      ]
    }
  ]
};

const COMMON_CONTENT = {
  metrics: { guides: 1, time: '10분', passScore: 80 },
  items: [
    {
      title: '무림 공통 직무 소양 교육',
      description: '신입사원으로서 알아야 할 기본 사내 규정 및 정보보안 가이드입니다.',
      icon: '🏢',
      duration: '10분',
      videoTitle: '무림인 공통 기본 소양 교육 (인재개발팀)',
      videoLink: '#',
      summary: [
        {
          icon: '🏢',
          title: '회사 사명 및 핵심 가치',
          content: '무림은 친환경 종이 및 신소재 문화를 선도하는 기업으로서 고객 지향, 도전 정신, 동반 성장의 핵심 가치를 공유합니다.'
        },
        {
          icon: '🔒',
          title: '사내 정보 보안 준수',
          content: '사내 PC는 업무 종료 시 반드시 화면 잠금을 실시해야 하며, 외부 USB 등의 저장 매체 사용은 사내 보안 프로그램(DLP)을 통해 사전 승인을 득한 후 사용할 수 있습니다.'
        }
      ],
      quiz: [
        {
          question: '업무 중 자리를 비우거나 퇴근 시 사내 보안을 위해 준수해야 할 조치는?',
          options: ['PC 켜두기', 'PC 화면 잠금(Win+L) 또는 전원 끄기', '비밀번호 포스트잇 부착', '모니터만 끄기'],
          correctIndex: 1,
          explanation: '사내 보안 유지를 위해 자리를 비우거나 퇴근할 때 PC 화면을 잠그거나 전원을 끄는 것이 기본 보안 수칙입니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────
const OjtGuidePanel = () => {
  // 스텝: 0=부서선택, 1=학습목록, 2=세부학습, 3=퀴즈
  const [step, setStep] = useState(0);

  // Step 0 상태
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Step 1 상태 - 선택한 학습 항목 인덱스
  const [selectedItemIdx, setSelectedItemIdx] = useState(null);

  // Step 2 상태
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Step 3 상태
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // 현재 선택된 부서/파트에 따라 콘텐츠 데이터 분기
  const getContentData = () => {
    if (selectedDept === '품질보증부' && selectedPart === '생산관리파트') {
      return DEMO_CONTENT;
    }
    if (selectedDept === '공무부' && selectedPart === '설비관리파트') {
      return MAINTENANCE_CONTENT;
    }
    return COMMON_CONTENT;
  };

  const activeContent = getContentData();

  // 현재 선택된 학습 항목
  const currentItem = selectedItemIdx !== null ? activeContent.items[selectedItemIdx] : null;

  // 점수 계산
  const getScore = () => {
    if (!currentItem) return 0;
    let correct = 0;
    currentItem.quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    return Math.round((correct / currentItem.quiz.length) * 100);
  };

  // 전체 초기화
  const handleReset = () => {
    setStep(0);
    setSelectedDept('');
    setSelectedPart('');
    setSelectedItemIdx(null);
    setIsConfirmed(false);
    setAnswers({});
    setSubmitted(false);
  };

  // 목록으로 돌아가기 (세부 상태 초기화)
  const handleBackToList = () => {
    setStep(1);
    setSelectedItemIdx(null);
    setIsConfirmed(false);
    setAnswers({});
    setSubmitted(false);
  };

  // ─── 렌더링 ───

  return (
    <div className="ojt-panel">
      {/* 공통 헤더 */}
      <div className="content-header">
        <h2>🌱 신입사원 OJT 가이드</h2>
        <div className="content-subheader-container">
          <span className="slogan-badge">맞춤형 직무 학습</span>
          <span className="slogan-desc">
            부서·파트를 선택하면 핵심 업무 요약과 학습 검증 퀴즈를 제공합니다
          </span>
        </div>
      </div>

      {/* 스텝 인디케이터 (1단계 이상일 때 표시) */}
      {step > 0 && (
        <div className="ojt-step-indicator">
          <div className={`ojt-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            1<span className="ojt-step-label">목록</span>
          </div>
          <div className={`ojt-step-line ${step > 1 ? 'completed' : ''}`} />
          <div className={`ojt-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            2<span className="ojt-step-label">학습</span>
          </div>
          <div className={`ojt-step-line ${step > 2 ? 'completed' : ''}`} />
          <div className={`ojt-step-dot ${step >= 3 ? 'active' : ''}`}>
            3<span className="ojt-step-label">검증</span>
          </div>
        </div>
      )}

      {/* ═══════════ Step 0: 부서/파트 선택 ═══════════ */}
      {step === 0 && (
        <div className="ojt-select-screen">
          <div className="ojt-welcome-card">
            <span className="ojt-welcome-icon">🎓</span>
            <h3>직무 맞춤형 학습을 시작하세요</h3>
            <p>
              소속 부서와 파트를 선택하면,
              <br />
              해당 직무에 필요한 핵심 가이드와 학습 검증 퀴즈를 제공합니다.
            </p>
          </div>

          <div className="ojt-select-form">
            <div className="ojt-select-row">
              <div className="ojt-select-group">
                <label>부서 선택</label>
                <select
                  className="ojt-select"
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setSelectedPart(''); }}
                >
                  <option value="">부서를 선택하세요</option>
                  {Object.keys(ORG_DATA).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="ojt-select-group">
                <label>파트 선택</label>
                <select
                  className="ojt-select"
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  disabled={!selectedDept || ORG_DATA[selectedDept]?.length === 0}
                >
                  <option value="">
                    {!selectedDept ? '부서를 먼저 선택하세요'
                      : ORG_DATA[selectedDept]?.length === 0 ? '산하 파트 없음'
                      : '파트를 선택하세요'}
                  </option>
                  {selectedDept && ORG_DATA[selectedDept]?.map((part) => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="ojt-start-btn"
              disabled={!selectedDept || (!selectedPart && ORG_DATA[selectedDept]?.length > 0)}
              onClick={() => setStep(1)}
            >
              학습 시작하기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Step 1: 학습 항목 목록 ═══════════ */}
      {step === 1 && (
        <div className="ojt-learning-screen">
          <button className="ojt-back-btn" onClick={() => setStep(0)}>
            <ChevronLeft size={16} /> 부서 선택으로 돌아가기
          </button>

          <span className="ojt-dept-badge">📍 {selectedDept} &gt; {selectedPart}</span>

          {/* 메트릭 카드 */}
          <div className="ojt-metrics">
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">📖</span>
              <div className="ojt-metric-value">{activeContent.metrics.guides}개</div>
              <div className="ojt-metric-label">필수 학습 항목</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">⏱️</span>
              <div className="ojt-metric-value">{activeContent.metrics.time}</div>
              <div className="ojt-metric-label">총 학습 권장 시간</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">🏆</span>
              <div className="ojt-metric-value">{activeContent.metrics.passScore}점</div>
              <div className="ojt-metric-label">각 항목 패스 기준</div>
            </div>
          </div>

          {/* 학습 항목 리스트 */}
          <div className="ojt-summary-title">
            <BookOpen size={18} /> 학습 항목 목록
          </div>

          <div className="ojt-item-list">
            {activeContent.items.map((item, idx) => (
              <div
                className="ojt-item-card"
                key={idx}
                onClick={() => { setSelectedItemIdx(idx); setStep(2); }}
              >
                <div className="ojt-item-card-icon">{item.icon}</div>
                <div className="ojt-item-card-body">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="ojt-item-card-meta">
                    <Clock size={14} />
                    <span>{item.duration}</span>
                  </div>
                </div>
                <div className="ojt-item-card-arrow">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ Step 2: 세부 학습 (선택한 항목) ═══════════ */}
      {step === 2 && currentItem && (
        <div className="ojt-learning-screen">
          <button className="ojt-back-btn" onClick={handleBackToList}>
            <ChevronLeft size={16} /> 학습 목록으로 돌아가기
          </button>

          <span className="ojt-dept-badge">
            📍 {selectedDept} &gt; {selectedPart} &gt; {currentItem.title}
          </span>

          <div className="ojt-scroll-content">
            {/* 요약 콘텐츠 */}
            <div className="ojt-summary-section">
              <div className="ojt-summary-title">
                <span>{currentItem.icon}</span> {currentItem.title}
              </div>
              {currentItem.summary.map((s, idx) => (
                <div className="ojt-summary-card" key={idx}>
                  <div className="ojt-summary-card-header">
                    <span className="ojt-summary-card-icon">{s.icon}</span>
                    <h4>{s.title}</h4>
                  </div>
                  <p>{s.content}</p>
                </div>
              ))}
            </div>

            {/* 영상 링크 */}
            <a
              className="ojt-video-link"
              href={currentItem.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (currentItem.videoLink === '#') e.preventDefault(); }}
            >
              <div className="ojt-video-link-icon">
                <PlayCircle size={22} />
              </div>
              <div className="ojt-video-link-text">
                <h4>🎬 {currentItem.videoTitle}</h4>
                <p>
                  {currentItem.videoLink === '#'
                    ? '영상 링크 준비 중 (네이버 카페 업로드 후 연동 예정)'
                    : '클릭하여 교육 영상 보기'}
                </p>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </a>
          </div>

          {/* 숙지 확인 → 퀴즈 이동 */}
          <div className="ojt-confirm-area">
            <label className="ojt-confirm-checkbox">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <span>위 가이드 항목을 모두 읽고 숙지했습니다</span>
            </label>
            <button
              className="ojt-next-btn"
              disabled={!isConfirmed}
              onClick={() => setStep(3)}
            >
              ✍️ 학습 검증 퀴즈 도전하기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Step 3: 퀴즈 (검증) ═══════════ */}
      {step === 3 && currentItem && (
        <div className="ojt-quiz-screen">
          <button className="ojt-back-btn" onClick={() => { setStep(2); setSubmitted(false); setAnswers({}); }}>
            <ChevronLeft size={16} /> 학습 화면으로 돌아가기
          </button>

          <div className="ojt-scroll-content">
            {/* 안내 */}
            <div className="ojt-quiz-intro">
              <span className="ojt-quiz-intro-icon">✍️</span>
              <p>
                <strong>{currentItem.title}</strong> 학습 내용을 검증합니다.
                <br />
                <strong>{activeContent.metrics.passScore}점 이상</strong>이면 통과입니다.
              </p>
            </div>

            {/* 퀴즈 문제 */}
            {currentItem.quiz.map((q, qIdx) => (
              <div className="ojt-quiz-question" key={qIdx}>
                <div className="ojt-quiz-question-header">
                  <span className="ojt-quiz-number">Q{qIdx + 1}</span>
                  <h4>{q.question}</h4>
                </div>
                <div className="ojt-quiz-options">
                  {q.options.map((opt, oIdx) => {
                    let extraClass = '';
                    if (submitted) {
                      if (oIdx === q.correctIndex) extraClass = 'correct';
                      else if (answers[qIdx] === oIdx) extraClass = 'incorrect';
                    } else if (answers[qIdx] === oIdx) {
                      extraClass = 'selected';
                    }
                    return (
                      <label className={`ojt-quiz-option ${extraClass}`} key={oIdx}>
                        <input
                          type="radio"
                          name={`quiz-${qIdx}`}
                          checked={answers[qIdx] === oIdx}
                          disabled={submitted}
                          onChange={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`ojt-quiz-feedback ${answers[qIdx] === q.correctIndex ? 'correct' : 'incorrect'}`}>
                    <span className="ojt-quiz-feedback-icon">
                      {answers[qIdx] === q.correctIndex ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </span>
                    <span>
                      {answers[qIdx] === q.correctIndex ? '정답!' : '오답.'} {q.explanation}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* 결과 카드 */}
            {submitted && (
              <div className={`ojt-result-card ${getScore() >= activeContent.metrics.passScore ? 'pass' : 'fail'}`}>
                <h3>
                  {getScore() >= activeContent.metrics.passScore
                    ? '🎉 축하합니다! 테스트를 통과했습니다'
                    : '📝 아쉽지만 기준 점수에 미달했습니다'}
                </h3>
                <div className="ojt-result-score">{getScore()}점</div>
                <p>
                  {getScore() >= activeContent.metrics.passScore
                    ? '해당 항목의 핵심 내용을 잘 숙지하셨습니다. 수고하셨습니다!'
                    : `패스 기준은 ${activeContent.metrics.passScore}점입니다. 요약 내용을 다시 확인해 보세요.`}
                </p>
                <div className="ojt-result-actions">
                  <button className="ojt-reset-btn" onClick={handleBackToList}>
                    다른 항목 학습하기
                  </button>
                  <button className="ojt-reset-btn" onClick={handleReset}>
                    처음으로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          {!submitted && (
            <button
              className="ojt-submit-btn"
              disabled={Object.keys(answers).length < currentItem.quiz.length}
              onClick={() => setSubmitted(true)}
            >
              <Send size={18} /> 정답 제출
            </button>
          )}
        </div>
      )}

      {/* ═══════════ 확대 예정 모달 ═══════════ */}
      {showModal && (
        <div className="ojt-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ojt-modal" onClick={(e) => e.stopPropagation()}>
            <span className="ojt-modal-icon">🚧</span>
            <h3>하반기 확대 예정</h3>
            <p>
              현재 <strong>{selectedDept}</strong>
              {selectedPart && <> &gt; <strong>{selectedPart}</strong></>}의
              학습 콘텐츠는 준비 중입니다.
              <br /><br />
              시범 운영 부서: <strong>품질보증부 &gt; 생산관리파트</strong>에서 먼저 체험해 보세요!
            </p>
            <button className="ojt-modal-close-btn" onClick={() => setShowModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OjtGuidePanel;
