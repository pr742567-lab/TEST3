import React, { useRef, useEffect } from 'react';
import { Folder, Send } from 'lucide-react';
import { processCitations, renderMarkdown } from '../utils/chatUtils';

// 일반 마크다운 및 타이핑 애니메이션 적용 컴포넌트
export const AccordionMessage = React.memo(({ content, sources = [], isTyping = false }) => {
  const { cleanText, citationList } = React.useMemo(() => {
    return processCitations(content, sources);
  }, [content, sources]);

  const renderReferenceList = () => {
    const listToRender = citationList.length > 0 ? citationList : (sources || []).map(src => ({
      num: src.num || src.number || 1,
      title: src.title || src.file_name || '',
      url: src.url || src.web_view_link || '#',
      score: src.score
    }));

    if (listToRender.length === 0) return null;
    return (
      <div className="reference-list-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={16} /> <span>참고 문서 출처</span>
        </div>
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {listToRender.sort((a, b) => a.num - b.num).map(cit => (
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

/**
 * 문서 네비게이션 및 지식 검색 대화 화면 컴포넌트
 */
function DocNavChatView({
  selectedCategory,
  messages,
  suggestions,
  inputText,
  isLoading,
  onSelectCategory,
  onBackToCategories,
  onInputChange,
  onSendMessage
}) {
  const messagesEndRef = useRef(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-interface">
      {/* 1. 카테고리 미선택 상태: 허브 화면 */}
      {selectedCategory === null ? (
        <div className="nav-welcome-screen" style={{ gap: '0.4rem', paddingBottom: '0.5rem' }}>
          {/* 허브 타이틀 */}
          <div className="nav-welcome-card" style={{ marginTop: '0.2rem', padding: '0.6rem 0.8rem' }}>
            <span className="nav-welcome-icon" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>🔍</span>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.15rem' }}>사내 문서에서 답을 찾아보세요</h3>
            <p style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
              사내 문서를 AI가 분석하여 정확한 출처와 함께 요약해 드립니다.<br />
              원하는 카테고리를 선택해 보세요.
            </p>
          </div>

          {/* 4대 카테고리 카드 그리드 */}
          <div className="nav-card-selector" style={{ gap: '0.45rem', marginBottom: '0.2rem' }}>
            <div className="nav-card" onClick={() => onSelectCategory('트러블슈팅')} style={{ padding: '0.7rem 1rem' }}>
              <div className="nav-card-icon troubleshooting" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>🔧</div>
              <div className="nav-card-content">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>트러블슈팅</h3>
                <p style={{ fontSize: '0.74rem' }}>설비 장애 현상에 따른 원인 분석 및 대책 검색</p>
              </div>
              <div className="nav-card-arrow">→</div>
            </div>

            <div className="nav-card" onClick={() => onSelectCategory('작업표준')} style={{ padding: '0.7rem 1rem' }}>
              <div className="nav-card-icon work-standard" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>📋</div>
              <div className="nav-card-content">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>작업표준</h3>
                <p style={{ fontSize: '0.74rem' }}>안전하고 효율적인 공정별 표준 작업 절차 가이드</p>
              </div>
              <div className="nav-card-arrow">→</div>
            </div>

            <div className="nav-card" onClick={() => onSelectCategory('위험성평가')} style={{ padding: '0.7rem 1rem' }}>
              <div className="nav-card-icon risk-assessment" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>⚠️</div>
              <div className="nav-card-content">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>위험성평가</h3>
                <p style={{ fontSize: '0.74rem' }}>공정별 핵심 유해·위험 요인 및 감소 대책 가이드</p>
              </div>
              <div className="nav-card-arrow">→</div>
            </div>

            <div className="nav-card" onClick={() => onSelectCategory('업무매뉴얼')} style={{ padding: '0.7rem 1rem' }}>
              <div className="nav-card-icon work-manual" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>📖</div>
              <div className="nav-card-content">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>업무매뉴얼</h3>
                <p style={{ fontSize: '0.74rem' }}>각 부서별 표준 업무 절차 및 매뉴얼 상세 안내</p>
              </div>
              <div className="nav-card-arrow">→</div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. 카테고리 선택 완료 상태: 1:1 대화방 */
        <>
          {/* 상단 액티브 카테고리 헤더 */}
          <div className="chat-category-header">
            <button className="chat-back-btn" onClick={onBackToCategories}>
              ← 전체 카테고리
            </button>
            <div className="active-category-title">
              <span className="category-icon">
                {selectedCategory === '트러블슈팅' && '🔧'}
                {selectedCategory === '작업표준' && '📋'}
                {selectedCategory === '위험성평가' && '⚠️'}
                {selectedCategory === '업무매뉴얼' && '📖'}
              </span>
              <h3>{selectedCategory}</h3>
            </div>
          </div>

          {/* 대화 시작 전: 심플 웰컴 문구 + 추천 질문 리스트 */}
          {messages.length === 0 && (
            <div className="nav-welcome-screen" style={{ justifyContent: 'center', minHeight: '300px' }}>
              <div className="nav-welcome-card" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <span className="nav-welcome-icon" style={{ fontSize: '2.5rem' }}>
                  {selectedCategory === '트러블슈팅' && '🔧'}
                  {selectedCategory === '작업표준' && '📋'}
                  {selectedCategory === '위험성평가' && '⚠️'}
                  {selectedCategory === '업무매뉴얼' && '📖'}
                </span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{selectedCategory} AI 지식 검색</h3>
                <p style={{ fontSize: '0.85rem' }}>
                  이 카테고리와 관련된 궁금한 사항을 자유롭게 물어보세요.<br />
                  아래의 추천 질문 중 하나를 클릭하면 빠르게 탐색할 수 있습니다.
                </p>
              </div>

              {/* 추천 질문 */}
              <div className="suggestion-container" style={{ marginTop: '1rem' }}>
                <div className="suggestion-title">💡 이런 질문을 해보세요:</div>
                <div className="suggestion-grid">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      className="suggestion-chip"
                      onClick={() => onSendMessage(sug.text)}
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
                    <AccordionMessage content={msg.content} sources={msg.sources} isTyping={msg.isTyping} />
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
                  onClick={() => onSendMessage(sug.text)}
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
              placeholder={`${selectedCategory} 관련 내용 검색...`}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSendMessage();
              }}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => onSendMessage()}
              disabled={isLoading || !inputText.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(DocNavChatView);
