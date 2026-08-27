import { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 제출 처리 함수
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const normalizedUser = username.trim().toLowerCase();
      const normalizedPw = password.trim().toLowerCase();

      // Moorim / Moorim 또는 기본 계정 허용
      if (
        (normalizedUser === 'moorim' && normalizedPw === 'moorim') ||
        (normalizedUser === '20180090' && (normalizedPw === 'moorim' || normalizedPw === '1234' || normalizedPw === 'password')) ||
        (normalizedUser === 'admin' && normalizedPw === 'admin')
      ) {
        setIsLoading(false);
        const userInfo = {
          name: normalizedUser === 'admin' ? '관리자' : '전현웅',
          department: '진주 스마트팩토리파트',
          position: normalizedUser === 'admin' ? '책임' : '대리',
          employeeId: normalizedUser === 'admin' ? 'ADMIN001' : '20180090',
          lastLogin: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        };
        onLogin(userInfo);
      } else {
        setIsLoading(false);
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    }, 200);
  };

  return (
    <div className="app-container login-app-wrapper">
      {/* 모바일 가상 상태 표시줄 */}
      <div className="mobile-status-bar">
        <span className="status-bar-title">무림AI-ON</span>
      </div>

      {/* 모바일 상단 헤더 */}
      <header className="mobile-header">
        <div className="mobile-header-left"></div>
        <div className="mobile-logo-container">
          <img
            src="/logo.png"
            alt="무림 로고"
            className="mobile-brand-logo"
          />
          <span className="mobile-logo-divider"></span>
          <span className="mobile-service-name">AI-ON</span>
        </div>
        <div className="mobile-header-right"></div>
      </header>

      {/* 로그인 본문 영역 */}
      <main className="content-area login-content-area">
        <div className="login-native-container">
          {/* 심플한 로그인 카드 */}
          <div className="login-card-native">
            <div className="login-simple-header">
              <h1 className="login-title">로그인</h1>
              <p className="login-desc">사내 지식 플랫폼 AI-ON을 시작합니다.</p>
            </div>

            <form className="login-form-inner" onSubmit={handleSubmit}>
              {/* 아이디 입력 */}
              <div className="native-input-group">
                <label htmlFor="native-login-id">아이디</label>
                <div className="native-input-box">
                  <User size={16} className="box-icon" />
                  <input
                    id="native-login-id"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="native-input-group">
                <label htmlFor="native-login-pw">비밀번호</label>
                <div className="native-input-box">
                  <Lock size={16} className="box-icon" />
                  <input
                    id="native-login-pw"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="box-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label="비밀번호 표시 전환"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 알림 */}
              {errorMessage && (
                <div className="native-error-box">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="native-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? <span>로그인 중...</span> : <span>로그인</span>}
              </button>
            </form>

            {/* 초기 아이디 / 비밀번호 안내 */}
            <div className="native-guide-box">
              <p className="guide-text">
                초기 아이디, 비밀번호는 <strong>moorim</strong> / <strong>moorim</strong> 입니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
