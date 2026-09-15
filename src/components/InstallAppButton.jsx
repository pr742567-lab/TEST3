import React, { useState, useEffect } from 'react';
import { Smartphone, X, Share, PlusSquare, ArrowDownToLine } from 'lucide-react';

/**
 * PWA 앱 설치 버튼 컴포넌트
 * - 로그인 후 홈화면 우측 상단에 작고 깔끔하게 노출
 * - 이미 앱으로 실행 중(Standalone)이거나 설치 완료 시 자동 숨김
 * - 안드로이드/데스크톱 크롬: 네이티브 설치 대화상자 호출
 * - iOS 사파리: 홈 화면 추가 안내 모달 표시
 */
export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. 이미 PWA 단독 창으로 실행 중인지 확인
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. iOS 환경 감지 (아이폰, 아이패드 등)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Chromium 브라우저의 beforeinstallprompt 이벤트 가로채기
    const handleBeforeInstallPrompt = (e) => {
      // 기본 미니 인포바 방지
      e.preventDefault();
      // 이벤트 객체 저장
      setDeferredPrompt(e);
    };

    // 4. 앱 설치 완료 이벤트 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 이미 설치되어 앱으로 접속 중이거나 방금 설치 완료한 경우 버튼 숨김
  if (isStandalone || isInstalled) {
    return null;
  }

  // 설치 버튼 클릭 핸들러
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // 크롬/웨일/엣지 등 네이티브 설치 프롬프트 지원 브라우저
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('설치 프롬프트 오류:', err);
      }
    } else {
      // iOS 사파리 또는 브라우저 프롬프트가 직접 호출되지 않는 환경
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* 홈화면 우측상단 미니멀 설치 버튼 */}
      <button
        type="button"
        className="pwa-install-mini-btn"
        onClick={handleInstallClick}
        title="홈 화면에 앱 설치하기"
        aria-label="홈 화면에 앱 설치하기"
      >
        <ArrowDownToLine size={13} className="install-icon" />
        <span>앱 설치</span>
      </button>

      {/* iOS 사파리 및 일반 브라우저 수동 설치 안내 모달 */}
      {showGuideModal && (
        <div className="pwa-guide-modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="pwa-guide-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pwa-guide-modal-header">
              <div className="modal-title-wrap">
                <Smartphone size={18} className="modal-title-icon" />
                <h3>무림AI-ON 앱 설치 안내</h3>
              </div>
              <button
                type="button"
                className="pwa-guide-close-btn"
                onClick={() => setShowGuideModal(false)}
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pwa-guide-modal-body">
              {isIOS ? (
                <div className="pwa-ios-instructions">
                  <p className="guide-desc">
                    아이폰/아이패드(사파리)는 아래 2단계로 홈 화면에 앱을 추가할 수 있습니다:
                  </p>
                  <ol className="guide-steps">
                    <li>
                      <div className="step-icon-badge">
                        <Share size={14} />
                      </div>
                      <span>
                        화면 하단의 <strong>[공유(내보내기)]</strong> 아이콘을 탭합니다.
                      </span>
                    </li>
                    <li>
                      <div className="step-icon-badge">
                        <PlusSquare size={14} />
                      </div>
                      <span>
                        메뉴 목록을 내려 <strong>[홈 화면에 추가]</strong>를 누른 후 우측 상단의 <strong>[추가]</strong>를 선택합니다.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="pwa-desktop-instructions">
                  <p className="guide-desc">
                    브라우저의 메뉴에서 앱을 간편하게 설치할 수 있습니다:
                  </p>
                  <ul className="guide-steps">
                    <li>
                      <span>
                        브라우저 상단 주소창 우측의 <strong>[설치(컴퓨터/다운로드 아이콘)]</strong>을 클릭하거나,
                      </span>
                    </li>
                    <li>
                      <span>
                        브라우저 우측 상단 더보기 <strong>[⋮]</strong> 메뉴에서 <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong>를 선택해 주세요.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pwa-guide-modal-footer">
              <button
                type="button"
                className="pwa-guide-confirm-btn"
                onClick={() => setShowGuideModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
