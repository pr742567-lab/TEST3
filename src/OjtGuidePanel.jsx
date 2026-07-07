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

  // 시범 부서 여부
  const isDemo = selectedDept === '품질보증부' && selectedPart === '생산관리파트';

  // 현재 선택된 학습 항목
  const currentItem = selectedItemIdx !== null ? DEMO_CONTENT.items[selectedItemIdx] : null;

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
              onClick={() => isDemo ? setStep(1) : setShowModal(true)}
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
              <div className="ojt-metric-value">{DEMO_CONTENT.metrics.guides}개</div>
              <div className="ojt-metric-label">필수 학습 항목</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">⏱️</span>
              <div className="ojt-metric-value">{DEMO_CONTENT.metrics.time}</div>
              <div className="ojt-metric-label">총 학습 권장 시간</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">🏆</span>
              <div className="ojt-metric-value">{DEMO_CONTENT.metrics.passScore}점</div>
              <div className="ojt-metric-label">각 항목 패스 기준</div>
            </div>
          </div>

          {/* 학습 항목 리스트 */}
          <div className="ojt-summary-title">
            <BookOpen size={18} /> 학습 항목 목록
          </div>

          <div className="ojt-item-list">
            {DEMO_CONTENT.items.map((item, idx) => (
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
                <strong>{DEMO_CONTENT.metrics.passScore}점 이상</strong>이면 통과입니다.
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
              <div className={`ojt-result-card ${getScore() >= DEMO_CONTENT.metrics.passScore ? 'pass' : 'fail'}`}>
                <h3>
                  {getScore() >= DEMO_CONTENT.metrics.passScore
                    ? '🎉 축하합니다! 테스트를 통과했습니다'
                    : '📝 아쉽지만 기준 점수에 미달했습니다'}
                </h3>
                <div className="ojt-result-score">{getScore()}점</div>
                <p>
                  {getScore() >= DEMO_CONTENT.metrics.passScore
                    ? '해당 항목의 핵심 내용을 잘 숙지하셨습니다. 수고하셨습니다!'
                    : `패스 기준은 ${DEMO_CONTENT.metrics.passScore}점입니다. 요약 내용을 다시 확인해 보세요.`}
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
