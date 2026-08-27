import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Folder,
  ChevronLeft,
  Home,
  Sprout,
  User,
  FileText,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { STATIC_SUGGESTIONS } from './data/staticSuggestions';
import { findKnowledgeAnswer } from './data/mockKnowledgeScenarios';
import WorksAIButton from './WorksAIButton';
import LoginPage from './LoginPage';
import HomeView from './components/HomeView';
import DocNavChatView from './components/DocNavChatView';
import MyInfoView from './components/MyInfoView';

// 대형 탭 컴포넌트 지연 로딩 (Code Splitting)
const DocAssistPanel = lazy(() => import('./DocAssistPanel'));
const ImprovementProposalTab = lazy(() => import('./ImprovementProposalTab'));
const OjtGuidePanel = lazy(() => import('./OjtGuidePanel'));

const AppLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem', color: 'var(--text-secondary)' }}>
    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-color)' }} />
    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>화면 모듈을 불러오는 중입니다...</span>
  </div>
);

function App() {
  // 활성화된 메뉴 관리 (초기 화면: 홈)
  const [activeMenu, setActiveMenu] = useState('home');
  // 선택된 카테고리 탭 상태 변수 (null: 카드 형태 선택기 노출)
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 문서 어시스트 세부 서식 상태
  const [docAssistType, setDocAssistType] = useState(null);
  // OJT 가이드 세부 스텝 상태
  const [ojtState, setOjtState] = useState({
    step: 0,
    dept: '',
    part: '',
    itemIdx: null
  });

  // 홈 화면 뒤로가기 종료 안내 토스트 상태 및 타이머 Ref
  const [showExitToast, setShowExitToast] = useState(false);
  const lastExitTimeRef = useRef(0);

  // 로그인 상태 및 사용자 정보 (사내 게이트웨이 인증 세션 연동)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('moorim_is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('moorim_user_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // parsing failed
      }
    }
    return {
      name: '전현웅',
      department: '진주 스마트팩토리파트',
      position: '대리',
      employeeId: '20180090',
      lastLogin: '2026-07-19 16:15:23'
    };
  });

  // 최근 이용 내역 상태
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'chat', title: 'CM3 블레이드 빔 개방 불량 조치', date: '2026. 07.19', desc: 'CM3 블레이드 빔 개방 불량 발생 시 에어 라인 및 솔밸브...' },
    { id: 2, type: 'docAssist', title: '진주공장 위험성평가 개선 계획', date: '2026. 07.18', desc: '진주공장 2층 개구부 추락 위험에 대한 안전조치 및 계획...' },
    { id: 3, type: 'ojtGuide', title: '신입사원 OJT 공정 교육 매뉴얼', date: '2026. 07.17', desc: '공장운영부, 공무부, 물류부 신입사원 정기 직무교육...' }
  ]);

  // 통합 내비게이션 상태 변경 및 브라우저 히스토리 push 함수
  const navigateState = (target, replace = false) => {
    const nextActiveMenu = target.activeMenu !== undefined ? target.activeMenu : activeMenu;
    const nextCategory = target.selectedCategory !== undefined ? target.selectedCategory : (target.activeMenu && target.activeMenu !== activeMenu ? null : selectedCategory);
    const nextDocAssistType = target.docAssistType !== undefined ? target.docAssistType : (target.activeMenu && target.activeMenu !== activeMenu ? null : docAssistType);
    const nextOjtState = target.ojtState !== undefined ? target.ojtState : (target.activeMenu && target.activeMenu !== activeMenu ? { step: 0, dept: '', part: '', itemIdx: null } : ojtState);

    const isHome = nextActiveMenu === 'home' && nextCategory === null && nextDocAssistType === null && (nextOjtState.step === 0 || !nextOjtState.step);

    const stateObj = {
      activeMenu: nextActiveMenu,
      selectedCategory: nextCategory,
      docAssistType: nextDocAssistType,
      ojtState: nextOjtState,
      isRoot: isHome
    };

    setActiveMenu(nextActiveMenu);
    setSelectedCategory(nextCategory);
    setDocAssistType(nextDocAssistType);
    setOjtState(nextOjtState);

    if (replace) {
      window.history.replaceState(stateObj, '');
    } else {
      window.history.pushState(stateObj, '');
    }
  };

  // 브라우저 뒤로가기(모바일 제스처/하드웨어 버튼) 감지 및 연동
  useEffect(() => {
    const initialHomeState = {
      activeMenu: 'home',
      selectedCategory: null,
      docAssistType: null,
      ojtState: { step: 0, dept: '', part: '', itemIdx: null },
      isRoot: true
    };
    window.history.replaceState(initialHomeState, '');

    const handlePopState = (event) => {
      const state = event.state;
      if (state && !state.isRoot) {
        setActiveMenu(state.activeMenu || 'home');
        setSelectedCategory(state.selectedCategory !== undefined ? state.selectedCategory : null);
        setDocAssistType(state.docAssistType !== undefined ? state.docAssistType : null);
        setOjtState(state.ojtState || { step: 0, dept: '', part: '', itemIdx: null });
      } else {
        const now = Date.now();
        if (lastExitTimeRef.current && now - lastExitTimeRef.current < 2000) {
          window.history.back();
          return;
        }

        lastExitTimeRef.current = now;
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);

        setActiveMenu('home');
        setSelectedCategory(null);
        setDocAssistType(null);
        setOjtState({ step: 0, dept: '', part: '', itemIdx: null });
        window.history.pushState(initialHomeState, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 로그인 성공 콜백
  const handleLoginSuccess = (userInfo) => {
    setCurrentUser(userInfo);
    setIsLoggedIn(true);
    sessionStorage.setItem('moorim_is_authenticated', 'true');
    sessionStorage.setItem('moorim_user_info', JSON.stringify(userInfo));
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('moorim_is_authenticated');
    sessionStorage.removeItem('moorim_user_info');
    navigateState({ activeMenu: 'home', selectedCategory: null, docAssistType: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } }, true);
  };

  // 메뉴 이동 및 이용 내역 기록
  const navigateToMenu = (menuKey, menuName) => {
    navigateState({
      activeMenu: menuKey,
      selectedCategory: null,
      docAssistType: null,
      ojtState: { step: 0, dept: '', part: '', itemIdx: null }
    });
    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    let actTitle = '사내 업무 문서';
    if (menuName === '문서 네비게이션') actTitle = '문서 네비게이션 가이드';
    else if (menuName === '개선 제안') actTitle = '개선 제안 이력 조회 및 작성';
    else if (menuName === '문서 어시스트') actTitle = '업무보고서 어시스트';
    else if (menuName === '신입사원 OJT 가이드') actTitle = 'OJT 직무 교육 매뉴얼';

    const newActivity = {
      id: Date.now(),
      type: menuKey,
      title: actTitle,
      date: dateStr,
      desc: `${menuName} 관련 사내 업무 문서를 확인하고 분석을 수행했습니다.`
    };
    setRecentActivities(prev => [newActivity, ...prev.filter(act => act.type !== menuKey).slice(0, 2)]);
  };

  const handleActivityClick = (type) => {
    navigateState({
      activeMenu: type,
      selectedCategory: null,
      docAssistType: null,
      ojtState: { step: 0, dept: '', part: '', itemIdx: null }
    });
  };

  // 카테고리별 개별 대화 세션 상태
  const [chatSessions, setChatSessions] = useState({
    "트러블슈팅": [],
    "작업표준": [],
    "위험성평가": [],
    "개선제안": [],
    "업무매뉴얼": []
  });

  const messages = React.useMemo(() => {
    return selectedCategory ? (chatSessions[selectedCategory] || []) : [];
  }, [selectedCategory, chatSessions]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleResetHome = () => {
    navigateState({
      activeMenu: 'home',
      selectedCategory: null,
      docAssistType: null,
      ojtState: { step: 0, dept: '', part: '', itemIdx: null }
    });
    setIsSidebarOpen(false);
  };

  // 글로벌 커스텀 안내 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 영구 라이트 테마 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  // selectedCategory 상태 변경 시 추천 질문 계산
  const suggestions = React.useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === '트러블슈팅') {
      return [
        { text: "PM3 1P Nip 압력 불균형 점검 및 조치하려면?" },
        { text: "폐수 처리장 용존산소량(DO) 급감 시 폭기조 송풍기 점검" },
        { text: "CM3 블레이드 빔 개방 불량일 때 조치 방법" }
      ];
    }
    if (selectedCategory === '작업표준') {
      return [
        { text: "CM2 Cut Knife 교체하는 방법은?" },
        { text: "지필유도판 정전기 방지지 교체 작업표준" },
        { text: "CM3 Scanner Sensor 청소 및 교체 작업 표준은?" }
      ];
    }
    if (selectedCategory === '위험성평가') {
      return [
        { text: "CM2 가동 전 발생할 수 있는 위험 요인은?" },
        { text: "밀폐공간 내부 청소 작업 시 안전 대책" },
        { text: "독타 교체 작업 위험성 평가" }
      ];
    }
    if (selectedCategory === '개선제안') {
      return [
        { text: "MX#1.2 DIP 및 MX1 CB TOWER 투입방법 개선" },
        { text: "PM1 3번 Felt save all 설치 건" },
        { text: "PM3 Press pulper A/G & Pump 가동 감소로 전력절감" }
      ];
    }
    if (selectedCategory === '업무매뉴얼') {
      return [
        { text: "저장품 기자재 입고는 어떻게 하나요?" },
        { text: "설비 일상 보전 및 유지 관리 매뉴얼은?" },
        { text: "제품 파손시 업무 절차는?" }
      ];
    }

    const pool = STATIC_SUGGESTIONS[selectedCategory] || [];
    return pool.slice(0, 3);
  }, [selectedCategory]);

  // 질문 전송 처리 (타이핑 시뮬레이션 포함)
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading || !selectedCategory) return;

    if (!textToSend) {
      setInputText('');
    }

    // 1. 사용자 메시지 추가
    const userMsg = { role: 'user', content: query };
    setChatSessions(prev => ({
      ...prev,
      [selectedCategory]: [...(prev[selectedCategory] || []), userMsg]
    }));
    setIsLoading(true);

    // 최근 이용 내역 업데이트
    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const newActivity = {
      id: now.getTime(),
      type: 'chat',
      title: `${selectedCategory} 지식 검색`,
      date: dateStr,
      desc: `"${query.slice(0, 15)}${query.length > 15 ? '...' : ''}" 관련 RAG 탐색 및 분석 수행`
    };
    setRecentActivities(prev => [newActivity, ...prev.filter(act => act.title !== newActivity.title).slice(0, 2)]);
    setIsSidebarOpen(false);

    // 지식 검색 모듈 호출
    const { matched, fullAnswer, sources } = findKnowledgeAnswer(query, selectedCategory);

    if (matched) {
      setTimeout(() => {
        setIsLoading(false);

        setChatSessions(prev => ({
          ...prev,
          [selectedCategory]: [...(prev[selectedCategory] || []), { role: 'assistant', content: '', sources: sources, isTyping: true }]
        }));

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
              return { ...prev, [selectedCategory]: nextSession };
            });
          } else {
            setChatSessions(prev => {
              const nextSession = [...(prev[selectedCategory] || [])];
              if (nextSession.length > 0) {
                nextSession[nextSession.length - 1] = { role: 'assistant', content: fullAnswer.slice(0, currentLength), sources: sources, isTyping: true };
              }
              return { ...prev, [selectedCategory]: nextSession };
            });
          }
        }, 25);
      }, 800);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setModalMessage("본 기능은 사내 시스템 연동 후 구현 예정입니다.");
        setIsModalOpen(true);
      }, 500);
    }
  };

  const canGoBack = activeMenu !== 'home' || selectedCategory !== null || docAssistType !== null || (ojtState && ojtState.step > 0);

  const handleHeaderBack = () => {
    window.history.back();
  };

  const getPageIcon = () => {
    switch (activeMenu) {
      case 'home':
        return '🏠';
      case 'chat':
        if (selectedCategory === '트러블슈팅') return '🔧';
        if (selectedCategory === '작업표준') return '📋';
        if (selectedCategory === '위험성평가') return '⚠️';
        if (selectedCategory === '업무매뉴얼') return '📖';
        return '📂';
      case 'proposal':
        return '💡';
      case 'docAssist':
        if (docAssistType === 'weekly_report') return '📊';
        if (docAssistType === 'risk_assessment') return '⚠️';
        if (docAssistType === 'draft_document') return '📝';
        return '📄';
      case 'ojtGuide':
        return '🌱';
      case 'myInfo':
        return '👤';
      default:
        return '🏢';
    }
  };

  const getTabTitle = () => {
    switch (activeMenu) {
      case 'home':
        return '무림AI-ON';
      case 'chat':
        if (selectedCategory) return `${selectedCategory}`;
        return '문서 네비게이션';
      case 'proposal':
        return '개선 제안';
      case 'docAssist':
        if (docAssistType === 'weekly_report') return '주요 업무보고';
        if (docAssistType === 'risk_assessment') return '위험성 평가';
        if (docAssistType === 'draft_document') return '품의서 작성';
        return '문서 어시스트';
      case 'ojtGuide':
        if (ojtState.step === 1) return 'OJT > 학습 목록';
        if (ojtState.step === 2) return 'OJT > 세부 학습';
        if (ojtState.step === 3) return 'OJT > 학습 검증';
        return 'OJT 가이드';
      case 'myInfo':
        return '내 정보';
      default:
        return '무림AI-ON';
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <>
      <div className="app-container">
        {/* 모바일 가상 상태 표시줄 */}
        <div className="mobile-status-bar">
          <span className="status-bar-title">{getTabTitle()}</span>
        </div>

        {/* 모바일 상단 헤더 */}
        <header className="mobile-header">
          {activeMenu === 'home' ? (
            <div className="mobile-logo-container" onClick={handleResetHome}>
              <img
                src="/logo.png"
                alt="무림 로고"
                className="mobile-brand-logo"
              />
              <span className="mobile-logo-divider"></span>
              <span className="mobile-service-name">AI-ON</span>
            </div>
          ) : (
            <div className="mobile-page-header-title">
              <span className="page-header-icon">{getPageIcon()}</span>
              <span className="page-header-text">{getTabTitle()}</span>
            </div>
          )}
        </header>

        {/* 모바일 사이드바 오버레이 */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* 데스크톱/태블릿 사이드바 */}
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
              <Folder size={18} />
              <span>📂 문서 네비게이션</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'proposal' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('proposal');
                setIsSidebarOpen(false);
              }}
            >
              <Lightbulb size={18} />
              <span>💡 개선 제안</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('docAssist');
                setIsSidebarOpen(false);
              }}
            >
              <FileText size={18} />
              <span>📄 문서 어시스트</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('ojtGuide');
                setIsSidebarOpen(false);
              }}
            >
              <Sprout size={18} />
              <span>🌱 OJT 가이드</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'myInfo' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('myInfo');
                setIsSidebarOpen(false);
              }}
            >
              <User size={18} />
              <span>👤 내 정보</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <WorksAIButton />
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 영역 */}
        <main className="content-area">
          {activeMenu === 'home' && (
            <HomeView
              currentUser={currentUser}
              isLoggedIn={isLoggedIn}
              recentActivities={recentActivities}
              onNavigateToMenu={navigateToMenu}
              onActivityClick={handleActivityClick}
              onClearActivities={() => setRecentActivities([])}
            />
          )}

          {activeMenu === 'chat' && (
            <DocNavChatView
              selectedCategory={selectedCategory}
              messages={messages}
              suggestions={suggestions}
              inputText={inputText}
              isLoading={isLoading}
              onSelectCategory={(category) => navigateState({ activeMenu: 'chat', selectedCategory: category })}
              onBackToCategories={() => window.history.back()}
              onInputChange={setInputText}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeMenu === 'proposal' && (
            <Suspense fallback={<AppLoadingFallback />}>
              <ImprovementProposalTab
                onBack={() => window.history.back()}
              />
            </Suspense>
          )}

          {activeMenu === 'docAssist' && (
            <Suspense fallback={<AppLoadingFallback />}>
              <DocAssistPanel
                messages={messages}
                selectedDocType={docAssistType}
                onSelectDocType={(type) => navigateState({ activeMenu: 'docAssist', docAssistType: type })}
                onBack={() => window.history.back()}
              />
            </Suspense>
          )}

          {activeMenu === 'ojtGuide' && (
            <Suspense fallback={<AppLoadingFallback />}>
              <OjtGuidePanel
                ojtState={ojtState}
                onOjtStateChange={(next, replace) => navigateState({ activeMenu: 'ojtGuide', ojtState: next }, replace)}
                onBack={() => window.history.back()}
              />
            </Suspense>
          )}

          {activeMenu === 'myInfo' && (
            <MyInfoView
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* 좌측 하단 플로팅 뒤로가기 버튼 */}
        {canGoBack && (
          <button
            className="floating-back-btn"
            onClick={handleHeaderBack}
            title="이전 화면으로 이동"
            aria-label="이전 화면으로 이동"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* 모바일 화면용 고정형 하단 네비게이션 탭바 */}
        <div className="mobile-bottom-tab-bar">
          <button
            className={`mobile-tab-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'home', selectedCategory: null, docAssistType: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } })}
            title="홈"
          >
            <Home size={20} />
            <span>홈</span>
          </button>
          <button
            className={`mobile-tab-item ${activeMenu === 'chat' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'chat', selectedCategory: null, docAssistType: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } })}
            title="문서 네비"
          >
            <Folder size={20} />
            <span>문서 네비</span>
          </button>
          <button
            className={`mobile-tab-item ${activeMenu === 'proposal' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'proposal', selectedCategory: null, docAssistType: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } })}
            title="개선 제안"
          >
            <Lightbulb size={20} />
            <span>개선 제안</span>
          </button>
          <button
            className={`mobile-tab-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'docAssist', docAssistType: null, selectedCategory: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } })}
            title="문서 어시스트"
          >
            <FileText size={20} />
            <span>문서 어시스트</span>
          </button>
          <button
            className={`mobile-tab-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'ojtGuide', ojtState: { step: 0, dept: '', part: '', itemIdx: null }, selectedCategory: null, docAssistType: null })}
            title="OJT 가이드"
          >
            <Sprout size={20} />
            <span>OJT 가이드</span>
          </button>
          <button
            className={`mobile-tab-item ${activeMenu === 'myInfo' ? 'active' : ''}`}
            onClick={() => navigateState({ activeMenu: 'myInfo', selectedCategory: null, docAssistType: null, ojtState: { step: 0, dept: '', part: '', itemIdx: null } })}
            title="내 정보"
          >
            <User size={20} />
            <span>내 정보</span>
          </button>
        </div>

        {/* 뒤로가기 종료 방어 안내 토스트 */}
        {showExitToast && (
          <div className="mobile-exit-toast">
            <span>뒤로가기 버튼을 한 번 더 누르면 종료됩니다.</span>
          </div>
        )}

        {/* 글로벌 알림 모달 창 */}
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
