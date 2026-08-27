import { useState, useEffect } from 'react';
import { Layout, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// 백엔드 API 주소
// localhost 접속 시 IPv6(::1) 연결 오류 방지를 위해 호스트명이 localhost인 경우 127.0.0.1로 포워딩
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${targetHost}:8002`;
};
const API_BASE_URL = getApiBaseUrl();

// 사내 표준 PPT 템플릿 선택 컴포넌트 (1단계 대체용)
// - 백엔드 API로부터 사용 가능한 표준 PPT 템플릿 목록 조회
// - 사용자가 템플릿을 선택하면 즉시 분석 단계를 트리거하여 스타일 가이드 반환
const TemplateSelector = ({ onAnalysisComplete }) => {
  // 템플릿 목록 상태
  const [templates, setTemplates] = useState([]);
  // 현재 선택된 템플릿 ID
  const [selectedId, setSelectedId] = useState('');
  // 로딩 및 에러 상태
  const [loadingState, setLoadingState] = useState('idle'); // 'idle' | 'loading' | 'analyzing' | 'done' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // 컴포넌트 마운트 시 내장 템플릿 목록 조회
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingState('loading');
      setErrorMessage('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/doc-assist/templates`);
        if (!response.ok) {
          throw new Error(`템플릿 목록 조회 실패 (${response.status})`);
        }
        const data = await response.json();
        setTemplates(data || []);
        
        // 첫 번째 템플릿 자동 선택
        if (data && data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoadingState('idle');
      } catch (error) {
        console.error('템플릿 목록 조회 오류:', error);
        setLoadingState('error');
        setErrorMessage(error.message || '템플릿 목록을 가져오지 못했습니다.');
      }
    };

    fetchTemplates();
  }, []);

  // 선택된 템플릿 분석 요청 처리
  const handleSelectTemplate = async () => {
    if (!selectedId || loadingState === 'analyzing') return;

    setLoadingState('analyzing');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/doc-assist/analyze-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedId }),
      });

      if (!response.ok) {
        throw new Error(`템플릿 분석 실패 (${response.status})`);
      }

      const analysisData = await response.json();
      setLoadingState('done');

      // 부모 컴포넌트에 분석 완료 및 템플릿 ID 전달
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData, null, selectedId);
      }
    } catch (error) {
      console.error('템플릿 분석 오류:', error);
      setLoadingState('error');
      setErrorMessage(error.message || '템플릿 분석 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="template-selector">
      {loadingState === 'loading' && (
        <div className="upload-progress">
          <Loader size={40} className="upload-spinner" />
          <h3>📥 사내 표준 템플릿 목록 로드 중...</h3>
          <p>서버에 등록된 표준 보고서/제안서 서식 목록을 가져오고 있습니다.</p>
        </div>
      )}

      {loadingState === 'error' && (
        <div className="upload-error">
          <AlertCircle size={40} />
          <h3>⚠️ 오류 발생</h3>
          <p>{errorMessage}</p>
          <button className="upload-retry-btn" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      )}

      {(loadingState === 'idle' || loadingState === 'analyzing' || loadingState === 'done') && (
        <div className="selector-container">
          <div className="selector-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              사내 표준 양식을 선택해 주세요
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
              준비된 표준 템플릿의 레이아웃과 디자인 서식을 100% 보존한 채 새 문서가 완성됩니다.
            </p>
          </div>

          {/* 템플릿 리스트 (카드 뷰) */}
          <div className="template-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.2rem',
            marginBottom: '2rem'
          }}>
            {templates.map(tmpl => {
              const isSelected = selectedId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  className={`template-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedId(tmpl.id)}
                  style={{
                    border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.04)' : 'var(--card-bg)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.08)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--primary-color)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b'
                    }}>
                      <Layout size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{tmpl.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>총 {tmpl.slide_count} 슬라이드</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 작업 진행 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="se-next-btn"
              onClick={handleSelectTemplate}
              disabled={!selectedId || loadingState === 'analyzing'}
              style={{
                padding: '0.8rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer'
              }}
            >
              {loadingState === 'analyzing' ? (
                <><Loader size={18} className="upload-spinner" /> 템플릿 분석 중...</>
              ) : (
                <><CheckCircle size={18} /> 이 양식으로 문서 만들기</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
