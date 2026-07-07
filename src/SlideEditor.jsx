import React, { useState } from 'react';
import { Sparkles, Wand2, Loader, ChevronRight, AlertCircle } from 'lucide-react';

// 백엔드 API 주소
// localhost 접속 시 IPv6(::1) 연결 오류 방지를 위해 호스트명이 localhost인 경우 127.0.0.1로 포워딩
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${targetHost}:8002`;
};
const API_BASE_URL = getApiBaseUrl();

// 슬라이드 내용 편집 컴포넌트 (2단계)
// - 키워드 입력 → AI 초안 생성
// - 슬라이드별 제목/본문 직접 편집
// - 선택 텍스트 인라인 AI 수정
const SlideEditor = ({ templateData, slideContents, setSlideContents, messages = [], onNext }) => {
  // AI 초안 생성 관련 상태
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // 인라인 AI 수정 관련 상태
  const [refineTarget, setRefineTarget] = useState(null); // { slideIdx, field } 형태
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // 현재 선택된 슬라이드 인덱스
  const [activeSlide, setActiveSlide] = useState(0);

  // 검색 결과에서 AI 답변만 추출하여 컨텍스트로 사용
  const searchContext = messages
    .filter(m => m.role === 'assistant' && m.content)
    .map(m => m.content)
    .join('\n\n')
    .slice(0, 3000); // 토큰 제한 방지

  // AI 초안 생성 요청
  const handleGenerateDraft = async () => {
    if (!keywords.trim() || isGenerating) return;
    setIsGenerating(true);
    setGenerateError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/doc-assist/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide: templateData,
          keywords: keywords,
          search_context: searchContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`초안 생성 실패 (${response.status})`);
      }

      const data = await response.json();
      const drafts = data.drafts || [];

      // 생성된 초안을 슬라이드 데이터에 반영
      setSlideContents(prev =>
        prev.map((slide, idx) => ({
          ...slide,
          title: drafts[idx]?.title || slide.title,
          body: drafts[idx]?.body || slide.body,
          fields: drafts[idx]?.fields || slide.fields,
        }))
      );
    } catch (error) {
      console.error('AI 초안 생성 에러:', error);
      setGenerateError(error.message || '초안 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 인라인 AI 텍스트 수정 요청
  const handleRefineText = async (slideIdx, field) => {
    const isCustomField = !['title', 'body'].includes(field);
    const text = isCustomField
      ? (slideContents[slideIdx]?.fields?.[field] || '')
      : (slideContents[slideIdx]?.[field] || '');

    if (!text.trim() || !refineInstruction.trim() || isRefining) return;

    setIsRefining(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/doc-assist/refine-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          instruction: refineInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error(`수정 실패 (${response.status})`);
      }

      const data = await response.json();

      // 수정된 텍스트를 해당 슬라이드에 반영
      setSlideContents(prev =>
        prev.map((slide, idx) => {
          if (idx !== slideIdx) return slide;
          if (isCustomField) {
            return {
              ...slide,
              fields: {
                ...slide.fields,
                [field]: data.refined_text,
              },
            };
          } else {
            return { ...slide, [field]: data.refined_text };
          }
        })
      );

      // 수정 UI 초기화
      setRefineTarget(null);
      setRefineInstruction('');
    } catch (error) {
      console.error('텍스트 수정 에러:', error);
    } finally {
      setIsRefining(false);
    }
  };

  // 슬라이드 텍스트 변경 핸들러
  const handleSlideChange = (idx, field, value) => {
    const isCustomField = !['title', 'body'].includes(field);
    setSlideContents(prev =>
      prev.map((slide, i) => {
        if (i !== idx) return slide;
        if (isCustomField) {
          return {
            ...slide,
            fields: {
              ...slide.fields,
              [field]: value,
            },
          };
        } else {
          return { ...slide, [field]: value };
        }
      })
    );
  };

  // 내용이 하나라도 있는지 확인 (다음 단계 진행 조건)
  const hasContent = slideContents.some(s => 
    s.title?.trim() || 
    s.body?.trim() || 
    Object.values(s.fields || {}).some(v => v?.trim())
  );

  return (
    <div className="slide-editor">
      {/* AI 초안 생성 영역 */}
      <div className="se-generate-section">
        <div className="se-generate-header">
          <Sparkles size={20} />
          <span>AI 초안 생성</span>
        </div>
        <p className="se-generate-desc">
          키워드나 주제를 입력하면 AI가 각 슬라이드에 맞는 초안을 자동으로 작성합니다.
          {searchContext && (
            <span className="se-context-badge">💡 검색 결과 자동 연동됨</span>
          )}
        </p>
        <div className="se-generate-input-row">
          <input
            type="text"
            className="se-keyword-input"
            placeholder="예: 2026년 설비 개선 성과 보고"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerateDraft(); }}
            disabled={isGenerating}
          />
          <button
            className="se-generate-btn"
            onClick={handleGenerateDraft}
            disabled={isGenerating || !keywords.trim()}
          >
            {isGenerating ? (
              <><Loader size={16} className="upload-spinner" /> 생성 중...</>
            ) : (
              <><Sparkles size={16} /> 초안 생성</>
            )}
          </button>
        </div>
        {generateError && (
          <div className="se-error">
            <AlertCircle size={14} /> {generateError}
          </div>
        )}
      </div>

      {/* 슬라이드 편집 영역 */}
      <div className="se-editor-layout">
        {/* 좌측: 슬라이드 목록 */}
        <div className="se-slide-list">
          <div className="se-slide-list-header">슬라이드 목록</div>
          {slideContents.map((slide, idx) => (
            <div
              key={idx}
              className={`se-slide-thumb ${activeSlide === idx ? 'active' : ''}`}
              onClick={() => setActiveSlide(idx)}
            >
              <span className="se-slide-num">{idx + 1}</span>
              <span className="se-slide-title-preview">
                {slide.title?.trim() || `슬라이드 ${idx + 1}`}
              </span>
            </div>
          ))}
        </div>

        {/* 우측: 선택된 슬라이드 편집 */}
        <div className="se-slide-detail">
          {slideContents[activeSlide] && (
            <>
              <div className="se-field-group">
                <div className="se-field-label-row">
                  <label className="se-field-label">제목</label>
                  <button
                    className="se-refine-toggle"
                    onClick={() =>
                      setRefineTarget(
                        refineTarget?.slideIdx === activeSlide && refineTarget?.field === 'title'
                          ? null
                          : { slideIdx: activeSlide, field: 'title' }
                      )
                    }
                    disabled={!slideContents[activeSlide]?.title?.trim()}
                    title="AI로 수정하기"
                  >
                    <Wand2 size={14} /> AI 수정
                  </button>
                </div>
                <input
                  type="text"
                  className="se-title-input"
                  placeholder="슬라이드 제목을 입력하세요"
                  value={slideContents[activeSlide]?.title || ''}
                  onChange={e => handleSlideChange(activeSlide, 'title', e.target.value)}
                />
                {/* 제목 인라인 AI 수정 */}
                {refineTarget?.slideIdx === activeSlide && refineTarget?.field === 'title' && (
                  <div className="se-refine-bar">
                    <input
                      type="text"
                      className="se-refine-input"
                      placeholder="수정 지시: 예) 좀 더 간결하게"
                      value={refineInstruction}
                      onChange={e => setRefineInstruction(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRefineText(activeSlide, 'title');
                      }}
                      disabled={isRefining}
                    />
                    <button
                      className="se-refine-btn"
                      onClick={() => handleRefineText(activeSlide, 'title')}
                      disabled={isRefining || !refineInstruction.trim()}
                    >
                      {isRefining ? <Loader size={14} className="upload-spinner" /> : '적용'}
                    </button>
                  </div>
                )}
              </div>

              {/* 슬라이드 템플릿의 가변 필드 리스트 조건부 렌더링 */}
              {templateData?.slides?.[activeSlide]?.mutable_fields?.length > 0 ? (
                <div className="se-fields-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                  <div className="se-fields-header" style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    📑 슬라이드 상세 내용 입력 (표 및 텍스트 상자 영역)
                  </div>
                  {templateData.slides[activeSlide].mutable_fields.map((field) => {
                    const originalText = field.original_text || '';
                    const isLongText = originalText.includes('\n') || originalText.length >= 30;
                    const currentValue = slideContents[activeSlide]?.fields?.[field.id] ?? '';

                    return (
                      <div className="se-field-group" key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div className="se-field-label-row">
                          <label className="se-field-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{field.label}</label>
                          <button
                            className="se-refine-toggle"
                            onClick={() =>
                              setRefineTarget(
                                refineTarget?.slideIdx === activeSlide && refineTarget?.field === field.id
                                  ? null
                                  : { slideIdx: activeSlide, field: field.id }
                              )
                            }
                            disabled={!currentValue.trim()}
                            title="AI로 수정하기"
                          >
                            <Wand2 size={13} /> AI 수정
                          </button>
                        </div>
                        {isLongText ? (
                          <textarea
                            className="se-body-textarea"
                            placeholder={`${field.label} 내용을 입력하세요`}
                            value={currentValue}
                            onChange={e => handleSlideChange(activeSlide, field.id, e.target.value)}
                            rows={4}
                          />
                        ) : (
                          <input
                            type="text"
                            className="se-title-input"
                            placeholder={`${field.label} 내용을 입력하세요`}
                            value={currentValue}
                            onChange={e => handleSlideChange(activeSlide, field.id, e.target.value)}
                          />
                        )}
                        {/* 개별 가변 필드 인라인 AI 수정 */}
                        {refineTarget?.slideIdx === activeSlide && refineTarget?.field === field.id && (
                          <div className="se-refine-bar">
                            <input
                              type="text"
                              className="se-refine-input"
                              placeholder="수정 지시: 예) 비즈니스 톤으로 수정해줘"
                              value={refineInstruction}
                              onChange={e => setRefineInstruction(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRefineText(activeSlide, field.id);
                              }}
                              disabled={isRefining}
                            />
                            <button
                              className="se-refine-btn"
                              onClick={() => handleRefineText(activeSlide, field.id)}
                              disabled={isRefining || !refineInstruction.trim()}
                            >
                              {isRefining ? <Loader size={14} className="upload-spinner" /> : '적용'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="se-field-group">
                  <div className="se-field-label-row">
                    <label className="se-field-label">본문</label>
                    <button
                      className="se-refine-toggle"
                      onClick={() =>
                        setRefineTarget(
                          refineTarget?.slideIdx === activeSlide && refineTarget?.field === 'body'
                            ? null
                            : { slideIdx: activeSlide, field: 'body' }
                        )
                      }
                      disabled={!slideContents[activeSlide]?.body?.trim()}
                      title="AI로 수정하기"
                    >
                      <Wand2 size={14} /> AI 수정
                    </button>
                  </div>
                  <textarea
                    className="se-body-textarea"
                    placeholder="슬라이드 본문 내용을 입력하세요 (줄바꿈: 불릿 포인트 구분)"
                    value={slideContents[activeSlide]?.body || ''}
                    onChange={e => handleSlideChange(activeSlide, 'body', e.target.value)}
                    rows={8}
                  />
                  {/* 본문 인라인 AI 수정 */}
                  {refineTarget?.slideIdx === activeSlide && refineTarget?.field === 'body' && (
                    <div className="se-refine-bar">
                      <input
                        type="text"
                        className="se-refine-input"
                        placeholder="수정 지시: 예) 불릿 포인트를 5개로 줄여줘"
                        value={refineInstruction}
                        onChange={e => setRefineInstruction(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRefineText(activeSlide, 'body');
                        }}
                        disabled={isRefining}
                      />
                      <button
                        className="se-refine-btn"
                        onClick={() => handleRefineText(activeSlide, 'body')}
                        disabled={isRefining || !refineInstruction.trim()}
                      >
                        {isRefining ? <Loader size={14} className="upload-spinner" /> : '적용'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 다음 단계 버튼 */}
      <div className="se-footer">
        <button
          className="se-next-btn"
          onClick={onNext}
          disabled={!hasContent}
        >
          미리보기 & 내보내기 <ChevronRight size={18} />
        </button>
        {!hasContent && (
          <span className="se-footer-hint">슬라이드 내용을 입력하거나 AI 초안을 생성해 주세요</span>
        )}
      </div>
    </div>
  );
};

export default SlideEditor;
