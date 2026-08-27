import React from 'react';
import { FileText } from 'lucide-react';

/**
 * 홈 대시보드 화면 컴포넌트
 */
function HomeView({
  currentUser,
  isLoggedIn,
  recentActivities,
  onNavigateToMenu,
  onActivityClick,
  onClearActivities
}) {
  return (
    <div className="home-dashboard">
      {/* 사용자 인사말 헤더 */}
      <div className="home-simple-header">
        {isLoggedIn ? (
          <div className="home-greeting-container">
            <h2 className="home-greeting">안녕하세요, {currentUser.name}님! 👋</h2>
            <p className="home-greeting-sub">무림의 사내 업무 지식을 스마트하게 탐색하세요.</p>
          </div>
        ) : (
          <div className="home-greeting-container">
            <h2 className="home-greeting">무림 사내 지식 플랫폼</h2>
            <p className="home-greeting-sub">무림의 사내 업무 지식을 스마트하게 탐색하세요.</p>
          </div>
        )}
      </div>

      {/* 주요 메뉴 바로가기 버튼 목록 */}
      <div className="home-menu-list">
        <button className="home-menu-btn chat-btn" onClick={() => onNavigateToMenu('chat', '문서 네비게이션')}>
          <span className="btn-icon">📂</span>
          <div className="btn-text">
            <h3>문서 네비게이션</h3>
            <p>사내 문서 요약 및 출처 검색</p>
          </div>
          <span className="btn-arrow">→</span>
        </button>

        <button className="home-menu-btn proposal-btn" onClick={() => onNavigateToMenu('proposal', '개선 제안')}>
          <span className="btn-icon">💡</span>
          <div className="btn-text">
            <h3>개선 제안</h3>
            <p>과거 제안 이력 조회 및 제안서 작성</p>
          </div>
          <span className="btn-arrow">→</span>
        </button>

        <button className="home-menu-btn assist-btn" onClick={() => onNavigateToMenu('docAssist', '문서 어시스트')}>
          <span className="btn-icon">📄</span>
          <div className="btn-text">
            <h3>문서 어시스트</h3>
            <p>문서 자동 생성 및 작성 지원</p>
          </div>
          <span className="btn-arrow">→</span>
        </button>

        <button className="home-menu-btn ojt-btn" onClick={() => onNavigateToMenu('ojtGuide', 'OJT 가이드')}>
          <span className="btn-icon">🌱</span>
          <div className="btn-text">
            <h3>OJT 가이드</h3>
            <p>교육 매뉴얼 및 업무 용어 사전</p>
          </div>
          <span className="btn-arrow">→</span>
        </button>
      </div>

      {/* 최근 이용 내역 섹션 */}
      <div className="recent-activity-section">
        <div className="recent-activity-header">
          <h3>🕒 최근 이용한 문서</h3>
          {recentActivities.length > 0 && (
            <button className="clear-history-btn" onClick={onClearActivities}>전체 삭제</button>
          )}
        </div>
        {recentActivities.length === 0 ? (
          <div className="no-activity">최근 이용한 내역이 없습니다.</div>
        ) : (
          <div className="recent-activity-list-horizontal">
            {recentActivities.map(act => (
              <div key={act.id} className="recent-activity-card" onClick={() => onActivityClick(act.type)}>
                <div className="card-top">
                  <span className="card-doc-icon-wrapper">
                    <FileText size={14} />
                  </span>
                  <span className="card-title" title={act.title}>{act.title}</span>
                </div>
                <span className="card-date">{act.date}</span>
                <p className="card-desc">{act.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(HomeView);
