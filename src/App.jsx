import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Send, 
  Settings, 
  Folder, 
  BookOpen, 
  RefreshCw, 
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  Home,
  Compass,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import DocAssistPanel from './DocAssistPanel';
import OjtGuidePanel from './OjtGuidePanel';
import { STATIC_SUGGESTIONS } from './data/staticSuggestions';
import { processCitations, renderMarkdown, parseToAccordion } from './utils/chatUtils';
import { API_BASE_URL } from './utils/api';
import WorksAIButton from './WorksAIButton';


// 아코디언 컴포넌트 제거 -> 일반 마크다운 및 타이핑 애니메이션 적용 컴포넌트로 변경
const AccordionMessage = React.memo(({ content, sources = [], isTyping = false }) => {
  const { cleanText, citationList } = React.useMemo(() => {
    return processCitations(content, sources);
  }, [content, sources]);

  const renderReferenceList = () => {
    if (citationList.length === 0) return null;
    return (
      <div className="reference-list-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={16} /> <span>참고 문서 출처</span>
        </div>
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {citationList.sort((a, b) => a.num - b.num).map(cit => (
            <li key={cit.num} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="chat-citation-link" style={{ flexShrink: 0 }}>
                [{cit.num}]
              </span>
              <span style={{ color: 'var(--text-primary)', textDecoration: 'none' }} className="citation-filename-link">
                {cit.title}
              </span>
              {cit.score !== undefined && cit.score !== null && (
                <span className="citation-score-badge" style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontWeight: '500',
                  marginLeft: '0.25rem',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {(cit.score * 100).toFixed(1)}% 유사
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="markdown-wrapper">
      <div 
        className="markdown-content"
        style={{ position: 'relative', display: 'inline-block', width: '100%' }}
      >
        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanText) }} />
        {isTyping && <span className="typing-cursor">█</span>}
      </div>
      {!isTyping && renderReferenceList()}
    </div>
  );
});

function App() {
  // 활성화된 메뉴 관리 (초기 화면을 홈으로 설정)
  const [activeMenu, setActiveMenu] = useState('home');
  
  // 선택된 카테고리 탭 상태 변수 (디폴트: '트러블슈팅')
  const [selectedCategory, setSelectedCategory] = useState('트러블슈팅');

  // 카테고리별 개별 대화 세션 상태 (트러블슈팅, 작업표준, 위험성평가, 개선제안)
  const [chatSessions, setChatSessions] = useState({
    "트러블슈팅": [],
    "작업표준": [],
    "위험성평가": [],
    "개선제안": []
  });

  // 현재 카테고리에 해당하는 메시지 목록 유도 (기존 messages 변수 참조 코드 호환성 유지)
  const messages = chatSessions[selectedCategory] || [];
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 모바일 사이드바 열림 상태 제어 (사이드바 제거로 미사용 처리 가능)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 홈 화면 초기화 리셋 함수 (로고 클릭 시 홈 화면으로 이동)
  const handleResetHome = () => {
    setChatSessions({
      "트러블슈팅": [],
      "작업표준": [],
      "위험성평가": [],
      "개선제안": []
    });
    setActiveMenu('home');
    setIsSidebarOpen(false);
  };
  
  // 글로벌 커스텀 안내 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // 동적 추천 질문 목록 상태
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);

  // 컴포넌트 마운트 시 영구적으로 라이트 테마 강제 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  // selectedCategory 상태 변경 시 추천 질문을 로컬에서 즉시 갱신하는 useEffect (Mocking)
  useEffect(() => {
    const pool = STATIC_SUGGESTIONS[selectedCategory] || [];
    let suggestionsList = [...pool];
    
    // 만약 '트러블슈팅' 카테고리라면, 맨 앞에 시연용 핵심 질문을 강제 고정!
    if (selectedCategory === '트러블슈팅') {
      const targetQuestion = "PM3 1P Nip 압력 불균형 점검 및 조치하려면?";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion);
      suggestionsList.unshift({ text: targetQuestion });
    }
    
    // 무작위 셔플 후 상위 3개만 매핑 (고정 질문은 무조건 처음에 유지)
    if (selectedCategory === '트러블슈팅') {
      const targetQuestion = "PM3 1P Nip 압력 불균형 점검 및 조치하려면?";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion }, ...shuffledRest.slice(0, 2)]);
    } else {
      const shuffled = [...suggestionsList].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 3));
    }
  }, [selectedCategory]);

  // 대화 추가 시 자동 스크롤
  useEffect(() => {
    if (activeMenu === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeMenu]);

  // 질문 전송 처리 (사용자 질의응답 - 하드코딩 및 타이핑 효과 시뮬레이션 적용)
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    if (!textToSend) {
      setInputText('');
    }

    // 1. 사용자 메시지 화면 추가
    const userMsg = { role: 'user', content: query };
    setChatSessions(prev => ({
      ...prev,
      [selectedCategory]: [...(prev[selectedCategory] || []), userMsg]
    }));
    setIsLoading(true);

    // 모바일 환경일 경우 질문 전송 시 사이드바를 자동으로 닫음
    setIsSidebarOpen(false);

    // 질문 검색 매칭 분석을 위한 정형화
    const normalizedQuery = query.replace(/\s+/g, '').toLowerCase();
    
    // 1. 트러블슈팅: PM3 닙 압력 관련
    const isNipPressureScenario = 
      normalizedQuery.includes("nip") || 
      normalizedQuery.includes("닙압력") || 
      normalizedQuery.includes("압력불균형") || 
      normalizedQuery.includes("압력저하") ||
      normalizedQuery.includes("pm3");

    // 2. 작업표준: CM2 언와인더 BP대차 이송
    const isBpCarrierScenario =
      normalizedQuery.includes("bp대차") ||
      normalizedQuery.includes("이송작업표준") ||
      normalizedQuery.includes("대차이송") ||
      (normalizedQuery.includes("작업표준") && normalizedQuery.includes("언와인더"));

    // 3. 위험성평가: 초지기 와이어 고압 세척
    const isWireWashScenario =
      normalizedQuery.includes("와이어고압세척") ||
      normalizedQuery.includes("고압세척작업") ||
      (normalizedQuery.includes("위험성평가") && normalizedQuery.includes("와이어"));

    // 4. 개선제안: 초지기 건조부 스팀 응축수 회수율 제고
    const isSteamCondensateScenario =
      normalizedQuery.includes("응축수회수") ||
      normalizedQuery.includes("스팀응축수") ||
      (normalizedQuery.includes("개선제안") && normalizedQuery.includes("건조부")) ||
      (normalizedQuery.includes("개선방안") && normalizedQuery.includes("응축수"));

    let fullAnswer = "";
    let sources = [];
    let matched = false;

    if (isNipPressureScenario) {
      matched = true;
      fullAnswer = `PM3 1P Nip 압력 불균형 점검 및 조치에 대한 내용은 아래와 같습니다.

---

### 1. PM3 1P Nip 압력 불균형 점검 기준
PM3 1P Nip의 압력 불균형 또는 압력 저하를 점검하기 위한 제한 조건은 **329-PIC-3032**를 기준으로 합니다.
* **압력 High 조건**: 최대 **120kg/cm²**를 초과하지 않아야 합니다.
* **SV(Set Value)와 PV(Process Value) 값 차이**:
  * **상위**: **5kg/cm²**를 초과하지 않아야 합니다.
  * **하위**: **5kg/cm²**를 초과하지 않아야 합니다.
  * *이 값 이상으로 차이가 발생하면 압력 불균형 또는 저하를 의미합니다.*
* **MV(Manipulated Variable) 값 조건**: 최대 **100%**를 초과하지 않아야 합니다.

---

### 2. Nip 압력 제어 메커니즘 (일반)
Nip 압력은 스풀 중량, 클램프 압력, 리프팅 압력의 균형을 통해 제어됩니다. 특히 압력 변동 감지 및 유압 조정 과정을 통해 일정한 압력을 유지합니다.
* **Nip 압력 계산**: 
  N = 스풀 중량 + 클램프 압력 (프라이머리 클램프) - 리프팅 압력
  * 클램프 압력은 **36kg/㎠**으로 일정하게 유지됩니다.
  * 리프팅 압력은 필요한 닙 압력을 달성하기 위해 동적으로 조정됩니다.
* **Nip 압력 유지 메커니즘**: Nip 압력은 일반적으로 **2~4kg/㎠** 수준으로 유지됩니다. 이 과정은 다음 일련의 프로세스를 수행하여 Nip 압력 변화에 대응합니다.
  1. **플랫 센서**: 압력 변동을 지속적으로 감지합니다.
  2. **리프팅 실린더**: 플랫 센서의 감지 결과에 따라 유압을 조정합니다.
  3. **비례 제어 밸브**: 스풀 중량 증가(종이 무게 증가)나 접선 각도 변화에 따른 선압 감소와 같이 프라이머리 암 이동에 따라 발생하는 스풀 중량의 Nip 압력 영향을 상쇄합니다.

리프팅 실린더는 플랫 센서로부터 지속적인 피드백을 받아 Nip 압력을 안정적으로 유지합니다.`;
      sources = [
        { num: 1, title: '3.3.6_PM3 1P Nip 압력저하 원인 및 대책_20250528_V2.0.pptx', score: 0.764, url: '#' },
        { num: 2, title: '3.3.6_PM3 1P Nip 압력저하 원인 및 대책_20250528.pptx', score: 0.764, url: '#' },
        { num: 3, title: '5.1.5.1_와인더프라이머리 플렛센서 작동不_240724.pptx', score: 0.748, url: '#' }
      ];
    } else if (isBpCarrierScenario) {
      matched = true;
      fullAnswer = `CM2 언와인더 BP대차 이송 시 표준 작업 절차는 아래와 같습니다.

---

### 1. 작업 전 안전 점검 (Safety Check)
* **대차 브레이크 작동 상태**: 기계식 브레이크가 확실하게 해제 및 체결되는지 확인합니다.
* **이송 경로 내 장애물 제거**: 대차 바퀴 및 레일 주위에 낙지(폐지)나 이물질이 없는지 육안 점검합니다.
* **개인 보호구 착용 필수**: 안전모, 안전화, 안전장갑 착용 상태를 점검합니다.

---

### 2. 이송 작업 표준 절차
1. **BP 원지 권출 및 정렬**: 대차 위에 적재된 BP(Black Paper) 원지의 중심선과 권출 릴의 센터가 일치하는지 정렬합니다.
2. **이송 구동 활성화**: 수동 이송 핸들을 잡고 서서히 전진시키며, 크레인과의 간섭이 없는지 상시 모니터링합니다.
3. **도크 진입 및 고정**: 언와인더 프레임 도크(Dock)에 밀착시킨 후 레일 잠금 레버를 아래로 내려 차체를 완전히 고정합니다.
4. **리프팅 핀 결합**: 유압 실린더를 조작하여 대차의 리프팅 핀이 원지 샤프트 홈에 완벽히 체결되었는지 감지 센서 LED를 확인합니다.

---

### 3. 주요 주의 사항 (Key Points)
* **급출발 및 급제동 금지**: 원지 낙하로 인한 협착 재해 우려가 있으므로 이송 속도는 1.0m/s 이하로 제한합니다.
* **센서 오작동 시**: 대차 진입 센서가 정상 동작하지 않을 경우, 즉시 수동 제어로 전환하고 정비 조치 요청을 수행합니다.`;
      sources = [
        { num: 1, title: '1.1.2_CM2 언와인더 BP대차 이송작업표준서_20250210.pdf', score: 0.812, url: '#' },
        { num: 2, title: '1.1.4_CM2 언와인더 기동전 점검 체크리스트_20250115.xlsx', score: 0.735, url: '#' }
      ];
    } else if (isWireWashScenario) {
      matched = true;
      fullAnswer = `초지기 와이어(Wire) 고압 세척 작업에 대한 위험성평가 및 안전 조치 사항은 아래와 같습니다.

---

### 1. 핵심 유해·위험 요인 (Hazard Identification)
* **고압 살수기 반발력에 의한 상해**: 최대 **150bar** 이상의 고압 수압으로 인해 작업자가 살수 노즐을 놓쳐 얼굴이나 신체 부위 충격 위험이 있습니다.
* **미끄러짐 및 낙하**: 와이어 피트 주변 바닥에 남아있는 슬라임(Slime) 및 백수로 인해 미끄러져 추락할 위험이 상존합니다.
* **화학 물질 노출**: 세척제(산성/알칼리성 세제) 분사 시 비산된 약품이 안구에 들어가거나 호흡기로 흡입될 위험이 있습니다.

---

### 2. 위험성 감소 대책 (Risk Mitigation)
* **노즐 파지용 보조 안전 핸들 장착**: 살수 노즐에 물리적 트리거 락 및 이중 손잡이를 적용하여 갑작스러운 고압 반발력에 대비합니다.
* **미끄럼 방지 작업화 및 안전대 의무화**: 추락 위험 구역 작업 시 상부 생명선에 안전대를 확실하게 체결합니다.
* **보호구 착용 가이드**: 안면보호구(Face Shield), 화학 물질용 방수 장갑, 방수 작업복을 착용해야 합니다.

---

### 3. 작업 전 필수 체크 리스트
1. **LOTO(Lock-Out, Tag-Out)**: 와이어 구동 모터 전원을 차단하고 시동 스위치에 안전 잠금 장치 및 표지판을 부착했는가?
2. **세척 펌프 압력 게이지**: 기동 전 압력 조절 밸브가 최저 위치에 있는지 확인하고 서서히 압력을 높인다.`;
      sources = [
        { num: 1, title: '4.2.1_초지기 와이어 고압 세척작업 위험성평가표_20250412.xlsx', score: 0.845, url: '#' },
        { num: 2, title: '4.2.2_초지파트 안전보건 작업수칙 가이드_20250320.docx', score: 0.791, url: '#' }
      ];
    } else if (isSteamCondensateScenario) {
      matched = true;
      fullAnswer = `초지기 건조부(Dryer Part) 스팀 응축수 회수율 제고를 위한 개선 제안 요약은 아래와 같습니다.

---

### 1. 현황 및 개선 배경 (Background)
* **드라이 부 스팀 트랩 누출**: 고온/고압 스팀 라인에 설치된 디스크 타입 스팀 트랩 마모로 인해 미량의 생스팀이 응축수 라인으로 직접 누출되어 열 손실 발생.
* **응축수 탱크 플래시 스팀 배출**: 응축수 탱크 압력 제어 불안정으로 다량의 플래시 스팀(Flash Steam)이 대기 중으로 방출되어 급수 온도 저하 원인 제공.

---

### 2. 주요 개선 방안 (Action Plans)
* **오리피스 플레이트 스팀 트랩 도입**: 구동부가 없어 마모 우려가 없는 오리피스형 스팀 트랩으로 전면 대체하여 스팀 누출량을 최소화합니다.
* **MVR(Mechanical Vapor Recompressor) 재압축기 설치**: 방출되는 플래시 스팀을 고압으로 재압축하여 저압 드라이어 스팀 헤더로 리사이클 공급합니다.
* **응축수 배관 단열 보강**: 드라이어 파트 하부 응축수 수거 배관에 에어로겔 단열재를 시공하여 복사 열손실을 방지합니다.

---

### 3. 기대 효과 (Expected Benefits)
* **연간 에너지 비용 절감**: 보일러 연료(LNG) 사용량 약 **3.2%** 감소 (연간 약 **1.2억원** 절감 예상).
* **탄소 배출 저감**: 연간 탄소 배출량 약 **450톤 CO₂-eq** 감축 효과 기대.`;
      sources = [
        { num: 1, title: '6.3.1_초지건조부 응축수 회수율 증대 개선제안서_20250615.pptx', score: 0.824, url: '#' },
        { num: 2, title: '6.3.5_공정 에너지 진단 보고서(초지파트)_20250110.pdf', score: 0.776, url: '#' }
      ];
    }

    if (matched) {
      // 0.8초간 대기 (AI 요약 스피너 활성화)
      setTimeout(() => {
        setIsLoading(false); // 로딩 스피너 비활성화
        
        // 어시스턴트 메시지 버블을 처음에 빈 텍스트로 추가 (isTyping: true)
        setChatSessions(prev => ({
          ...prev,
          [selectedCategory]: [...(prev[selectedCategory] || []), { role: 'assistant', content: '', sources: sources, isTyping: true }]
        }));

        // 30ms 간격으로 12글자씩 실시간 타이핑 렌더링 시뮬레이션
        let currentLength = 0;
        const stepSize = 12;
        const interval = setInterval(() => {
          currentLength += stepSize;
          if (currentLength >= fullAnswer.length) {
            clearInterval(interval);
            setChatSessions(prev => {
              const nextSession = [...(prev[selectedCategory] || [])];
              if (nextSession.length > 0) {
                nextSession[nextSession.length - 1] = { role: 'assistant', content: fullAnswer, sources: sources, isTyping: false };
              }
              return {
                ...prev,
                [selectedCategory]: nextSession
              };
            });
          } else {
            setChatSessions(prev => {
              const nextSession = [...(prev[selectedCategory] || [])];
              if (nextSession.length > 0) {
                nextSession[nextSession.length - 1] = { role: 'assistant', content: fullAnswer.slice(0, currentLength), sources: sources, isTyping: true };
              }
              return {
                ...prev,
                [selectedCategory]: nextSession
              };
            });
          }
        }, 25);
      }, 800);
    } else {
      // 핵심 질문이 아니면 0.5초 로딩 스피너 작동 후 "준비중" 경고 창 팝업
      setTimeout(() => {
        setIsLoading(false);
        setModalMessage("본 기능은 사내 시스템 연동 후 구현 예정입니다.");
        setIsModalOpen(true);
      }, 500);
    }
  };

  // 현재 활성화된 메뉴 명칭 반환 (상태 표시줄 및 헤더에 표시할 텍스트)
  const getTabTitle = () => {
    switch (activeMenu) {
      case 'home':
        return '무림AI-ON';
      case 'chat':
        return '문서 네비게이션';
      case 'docAssist':
        return '문서 어시스트';
      case 'ojtGuide':
        return 'OJT 가이드';
      default:
        return '무림AI-ON';
    }
  };

  return (
    <>
      <div className="app-container">
        {/* 모바일 가상 상태 표시줄 (Status Bar) */}
        <div className="mobile-status-bar">
          <span className="status-bar-title">{getTabTitle()}</span>
        </div>

        <header className="mobile-header">
          <div className="mobile-logo-container" onClick={handleResetHome}>
            <img 
              src="/logo.png" 
              alt="무림 로고" 
              className="mobile-brand-logo" 
            />
            <span className="mobile-logo-divider"></span>
            <span className="mobile-service-name">AI-ON</span>
          </div>
        </header>

        {/* 모바일 화면용 오버레이배경 */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <img src="/logo.png" alt="무림 로고" className="brand-logo" />
            <p className="brand-subtitle" style={{ marginTop: '0.8rem' }}>사내 지식 플랫폼</p>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeMenu === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('home');
                setIsSidebarOpen(false);
              }}
            >
              <Home size={18} />
              <span>🏠 홈 화면</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('chat');
                setIsSidebarOpen(false);
              }}
            >
              <Compass size={18} />
              <span>📂 문서 네비게이션</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('docAssist');
                setIsSidebarOpen(false);
              }}
            >
              <Sparkles size={18} />
              <span>📄 문서 어시스트</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('ojtGuide');
                setIsSidebarOpen(false);
              }}
            >
              <GraduationCap size={18} />
              <span>🌱 신입사원 OJT 가이드</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            {/* 설정 등 추가 메뉴 공간 (테마 버튼 제거됨) */}
            <WorksAIButton />
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 영역 */}
        <main className="content-area">
          {activeMenu === 'home' && (
            <div className="home-dashboard">
              {/* 심플한 타이틀 헤더 */}
              <div className="home-simple-header">
                <span className="home-subtitle">무림 사내 지식 플랫폼</span>
                <h1>AI-ON</h1>
                <p>무림의 사내 업무 지식을 스마트하게 탐색하세요.</p>
              </div>

              {/* 심플한 메뉴 버튼 목록 */}
              <div className="home-menu-list">
                <button className="home-menu-btn chat-btn" onClick={() => setActiveMenu('chat')}>
                  <span className="btn-icon">📂</span>
                  <div className="btn-text">
                    <h3>문서 네비게이션</h3>
                    <p>사내 문서 요약 및 출처 검색</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>

                <button className="home-menu-btn assist-btn" onClick={() => setActiveMenu('docAssist')}>
                  <span className="btn-icon">📄</span>
                  <div className="btn-text">
                    <h3>문서 어시스트</h3>
                    <p>AI 보고서 요약 및 실시간 분석</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>

                <button className="home-menu-btn ojt-btn" onClick={() => setActiveMenu('ojtGuide')}>
                  <span className="btn-icon">🌱</span>
                  <div className="btn-text">
                    <h3>신입사원 OJT 가이드</h3>
                    <p>교육 매뉴얼 및 업무 용어 사전</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'chat' && (
            <div className="chat-interface">
              {/* 데스크톱용 콘텐츠 타이틀 헤더 */}
              <div className="content-header">
                <h2>📂 문서 네비게이션</h2>
                <div className="content-subheader-container">
                  <span className="slogan-badge">사내 지식 검색 엔진</span>
                  <span className="slogan-desc">정확한 출처 기반의 지식 요약으로 원하는 답변만 쏙쏙!</span>
                </div>
              </div>

              {/* 카테고리 선택 탭바 */}
              <div className="category-tabs">
                {['트러블슈팅', '작업표준', '위험성평가', '개선제안'].map(cat => (
                  <button 
                    key={cat} 
                    className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 대화 시작 전: 웰컴 카드 + 기능 안내 + 추천 질문 (OJT 패밀리룩) */}
              {messages.length === 0 && (
                <div className="nav-welcome-screen">
                  <div className="nav-welcome-card">
                    <span className="nav-welcome-icon">🔍</span>
                    <h3>사내 문서에서 답을 찾아보세요</h3>
                    <p>
                      작업표준, 트러블슈팅, 위험성평가, 개선제안 등<br />
                      사내 문서를 AI가 분석하여 정확한 출처와 함께 요약해 드립니다.
                    </p>
                  </div>

                  {/* 기능 안내 카드 */}
                  <div className="nav-feature-cards">
                    <div className="nav-feature-card">
                      <span className="nav-feature-card-icon">📋</span>
                      <div className="nav-feature-card-body">
                        <h4>출처 기반 답변</h4>
                        <p>관련 문서의 정확한 출처를 함께 제공하여 신뢰할 수 있는 답변을 받을 수 있습니다.</p>
                      </div>
                    </div>
                    <div className="nav-feature-card">
                      <span className="nav-feature-card-icon">⚡</span>
                      <div className="nav-feature-card-body">
                        <h4>카테고리별 검색</h4>
                        <p>트러블슈팅, 작업표준, 위험성평가, 개선제안 카테고리를 선택하여 범위를 좁힐 수 있습니다.</p>
                      </div>
                    </div>
                    <div className="nav-feature-card">
                      <span className="nav-feature-card-icon">💡</span>
                      <div className="nav-feature-card-body">
                        <h4>스마트 요약</h4>
                        <p>긴 문서도 핵심 내용만 추출하여 소제목별 아코디언 형태로 정리해 드립니다.</p>
                      </div>
                    </div>
                  </div>

                  {/* 추천 질문 */}
                  <div className="suggestion-container">
                    <div className="suggestion-title">💡 이런 질문을 해보세요:</div>
                    <div className="suggestion-grid">
                      {suggestions.map((sug, idx) => (
                        <button 
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => handleSendMessage(sug.text)}
                        >
                          🔍 {sug.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 대화 진행 중: 채팅 메시지 표시 */}
              {messages.length > 0 && (
                <div className="chat-container">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className={`chat-avatar ${msg.role}`}>
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="chat-bubble">
                        <AccordionMessage content={msg.content} sources={msg.sources} />
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="chat-message assistant">
                      <div className="chat-avatar">🤖</div>
                      <div className="chat-bubble loading-bubble">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* 대화 진행 중인 경우, 입력창 상단에 가로 스크롤 형태의 추천 질문 칩 상시 노출 */}
              {messages.length > 0 && (
                <div className="chat-suggestion-chips-inline">
                  <span className="chips-label">💡 추천 질문:</span>
                  {suggestions.map((sug, idx) => (
                    <button 
                      key={idx}
                      className="inline-suggestion-chip"
                      disabled={isLoading}
                      onClick={() => handleSendMessage(sug.text)}
                    >
                      {sug.text}
                    </button>
                  ))}
                </div>
              )}

              {/* 입력란 고정 피드 */}
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="설비 트러블슈팅, 작업표준 등 검색..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={isLoading}
                />
                <button 
                  className="send-btn" 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
          {activeMenu === 'docAssist' && <DocAssistPanel messages={messages} />}
          {activeMenu === 'ojtGuide' && <OjtGuidePanel />}
        </main>

        {/* 모바일 화면용 고정형 하단 네비게이션 탭바 */}
        <div className="mobile-bottom-tab-bar">
          <button 
            className={`mobile-tab-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => setActiveMenu('home')}
          >
            <Home size={18} />
            <span>홈</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveMenu('chat')}
          >
            <Compass size={18} />
            <span>문서 네비</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
            onClick={() => setActiveMenu('docAssist')}
          >
            <Sparkles size={18} />
            <span>문서 어시스트</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
            onClick={() => setActiveMenu('ojtGuide')}
          >
            <GraduationCap size={18} />
            <span>OJT 가이드</span>
          </button>
        </div>

        {/* 글로벌 알림 모달 창 (준비 중 안내 목적) */}
        {isModalOpen && (
          <div className="custom-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
              <div className="custom-modal-header">
                <h3>💡 안내</h3>
                <button className="custom-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>
              <div className="custom-modal-body">
                <p>{modalMessage}</p>
              </div>
              <div className="custom-modal-footer">
                <button className="custom-modal-confirm-btn" onClick={() => setIsModalOpen(false)}>확인</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
