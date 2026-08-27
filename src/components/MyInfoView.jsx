import React from 'react';
import { User } from 'lucide-react';

/**
 * 내 정보 및 사용자 프로필 화면 컴포넌트
 */
function MyInfoView({ currentUser, onLogout }) {
  return (
    <div className="my-info-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-main-info">
            <h2>{currentUser.name} {currentUser.position}</h2>
            <p>{currentUser.department}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">사번</span>
            <span className="detail-value">{currentUser.employeeId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">소속 부서</span>
            <span className="detail-value">{currentUser.department}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">직급</span>
            <span className="detail-value">{currentUser.position}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">최근 로그인</span>
            <span className="detail-value">{currentUser.lastLogin}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default React.memo(MyInfoView);
