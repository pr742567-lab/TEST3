import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// 백엔드 API 주소
// localhost 접속 시 IPv6(::1) 연결 오류 방지를 위해 호스트명이 localhost인 경우 127.0.0.1로 포워딩
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${targetHost}:8002`;
};
const API_BASE_URL = getApiBaseUrl();

// 슬라이드 미리보기 & PPTX 내보내기 컴포넌트 (3단계)
// - 확정된 슬라이드를 카드 형태로 미리보기
// - PPTX 파일 빌드 & 다운로드
const SlidePreview = ({ templateData, slideContents, fileId, templateId }) => {
  // 현재 미리보기 중인 슬라이드 인덱스
  const [previewIdx, setPreviewIdx] = useState(0);
  // PPTX 빌드 상태
  const [buildState, setBuildState] = useState('idle'); // 'idle' | 'building' | 'done' | 'error'
  const [buildError, setBuildError] = useState('');

  // 유효한 슬라이드만 필터 (제목 또는 본문이 있는 것)
  const validSlides = slideContents.filter(s => s.title?.trim() || s.body?.trim());
  const currentSlide = validSlides[previewIdx];

  // PPTX 빌드 & 다운로드 요청
  const handleBuildDownload = async () => {
    if (buildState === 'building') return;
    setBuildState('building');
    setBuildError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/doc-assist/build-pptx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide: templateData,
          slide_contents: validSlides.map(s => ({
            index: s.index,
            title: s.title || '',
            body: s.body || '',
            fields: s.fields || {},
          })),
          file_id: fileId || null,
          template_id: templateId || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`PPTX 빌드 실패 (${response.status})`);
      }

      // 응답을 Blob으로 변환 후 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '문서_어시스트_결과.pptx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setBuildState('done');
    } catch (error) {
      console.error('PPTX 빌드 에러:', error);
      setBuildState('error');
      setBuildError(error.message || 'PPTX 생성 중 오류가 발생했습니다.');
    }
  };

  // 이전/다음 슬라이드 네비게이션
  const goPrev = () => setPreviewIdx(Math.max(0, previewIdx - 1));
  const goNext = () => setPreviewIdx(Math.min(validSlides.length - 1, previewIdx + 1));

  if (validSlides.length === 0) {
    return (
      <div className="sp-empty">
        <AlertCircle size={40} />
        <h3>미리볼 슬라이드가 없습니다</h3>
        <p>이전 단계에서 슬라이드 내용을 입력해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="slide-preview">
      {/* 슬라이드 카드 미리보기 */}
      <div className="sp-card-area">
        <button
          className="sp-nav-btn"
          onClick={goPrev}
          disabled={previewIdx === 0}
          aria-label="이전 슬라이드"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="sp-card">
          <div className="sp-card-badge">
            슬라이드 {previewIdx + 1} / {validSlides.length}
          </div>
          <div className="sp-card-title">
            {currentSlide?.title || '(제목 없음)'}
          </div>
          <div className="sp-card-body">
            {currentSlide?.fields && Object.keys(currentSlide.fields).length > 0 ? (
              <div className="sp-preview-fields" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', width: '100%', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {templateData?.slides?.[currentSlide.index]?.mutable_fields?.map(field => {
                  const val = currentSlide.fields[field.id] || '';
                  return (
                    <div key={field.id} className="sp-preview-field-item" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.4rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{field.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginTop: '0.25rem', lineHeight: '1.4' }}>
                        {val || <span style={{ color: 'var(--text-secondary)', opacity: 0.5, fontStyle: 'italic' }}>(비어 있음 - 원래 서식 유지)</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              (currentSlide?.body || '(본문 없음)').split('\n').map((line, i) => (
                <p key={i} className="sp-card-line">{line}</p>
              ))
            )}
          </div>
        </div>

        <button
          className="sp-nav-btn"
          onClick={goNext}
          disabled={previewIdx >= validSlides.length - 1}
          aria-label="다음 슬라이드"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 슬라이드 도트 인디케이터 */}
      <div className="sp-dots">
        {validSlides.map((_, idx) => (
          <button
            key={idx}
            className={`sp-dot ${previewIdx === idx ? 'active' : ''}`}
            onClick={() => setPreviewIdx(idx)}
            aria-label={`슬라이드 ${idx + 1}`}
          />
        ))}
      </div>

      {/* PPTX 다운로드 영역 */}
      <div className="sp-download-section">
        <div className="sp-download-info">
          <h3>📥 PPTX 내보내기</h3>
          <p>
            총 {validSlides.length}장의 슬라이드가 원본 템플릿의 서식을 유지한 채 PPTX 파일로 생성됩니다.
          </p>
        </div>

        <button
          className="sp-download-btn"
          onClick={handleBuildDownload}
          disabled={buildState === 'building'}
        >
          {buildState === 'building' ? (
            <><Loader size={18} className="upload-spinner" /> PPTX 생성 중...</>
          ) : buildState === 'done' ? (
            <><CheckCircle size={18} /> 다운로드 완료! 다시 받기</>
          ) : (
            <><Download size={18} /> PPTX 다운로드</>
          )}
        </button>

        {buildState === 'error' && (
          <div className="sp-error">
            <AlertCircle size={14} /> {buildError}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidePreview;
