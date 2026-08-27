import { useState } from 'react';
import { Sparkles, Loader, Check, AlertCircle, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { API_BASE_URL } from './utils/api';
import './DeptReportForm.css';


/**
 * 3단계: AI로 업무 내용 다듬기 컴포넌트 (Component)
 * - 입력한 실적과 계획의 카테고리별 내용을 한눈에 확인하고,
 * - 말투나 포맷을 원하는 레벨(Level)로 선택하여 AI가 정교하게 다듬도록 요청합니다.
 * - 다듬어진 문장을 최종 검토하고 직접 수정할 수도 있습니다.
 */
const DeptReportRefineStep = ({
  department,
  year,
  month,
  week,
  perfStart,
  perfEnd,
  planStart,
  planEnd,
  entries,
  setEntries,
  isRefined,
  setIsRefined,
  onNext,
  onBack
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState('');

  // 실적과 계획 항목들을 분리
  const perfEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter((e) => e.entry_type === 'performance' && e.content.trim());

  const planEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter((e) => e.entry_type === 'plan' && e.content.trim());

  // 백엔드(Backend) 전송용 보고서 데이터 빌드
  const _buildReportData = () => {
    const cleanedEntries = entries
      .filter((e) => e.content.trim())
      .map((e) => {
        const item = { ...e };
        delete item.isCustomCategory;
        return item;
      });

    return {
      document_type: 'weekly_report',
      department,
      period: {
        year, month, week,
        performance_start: perfStart,
        performance_end: perfEnd,
        plan_start: planStart,
        plan_end: planEnd,
      },
      entries: cleanedEntries,
    };
  };

  // AI 다듬기 API 호출
  const handleRefine = async () => {
    if (isRefining) return;
    setIsRefining(true);
    setRefineError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/dept-report/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_data: _buildReportData(),
          refine_level: 'B',
        }),
      });

      if (!response.ok) {
        throw new Error(`내용 다듬기 서버 통신 실패 (상태 코드: ${response.status})`);
      }

      const data = await response.json();
      const refined = data.refined_entries || [];

      // 다듬어진 내용을 기존 entries의 content 필드에 반영
      setEntries((prev) =>
        prev.map((entry, idx) => {
          const match = refined[idx];
          if (match && match.content) {
            return { ...entry, content: match.content };
          }
          return entry;
        })
      );
      setIsRefined(true);
    } catch (error) {
      console.error('AI 다듬기 에러 발생:', error);
      setRefineError(error.message || '내용을 다듬는 과정에서 문제가 발생했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  // 개별 항목 수정을 위한 텍스트 변경 이벤트 핸들러
  const handleContentChange = (idx, value) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, content: value } : e))
    );
    setIsRefined(false); // 수동 수정 시 다듬기 완료 상태 초기화하여 다시 다듬을 수 있도록 함
  };

  return (
    <div className="dept-form">
      {/* 요약 헤더 배너 */}
      <div className="dept-form-summary-bar">
        <span className="dept-form-dept-badge">{department}</span>
        <span className="dept-form-period-badge">
          {year}년 {month}월 {week}주차
        </span>
        <button className="dept-form-back-btn" onClick={onBack}>
          <ChevronLeft size={14} /> 입력 수정하기
        </button>
      </div>

      <div className="dept-form-refinement-desc-box">
        <Sparkles size={18} className="desc-icon" style={{ color: '#0f766e' }} />
        <div>
          <h4>내용 자동 다듬기</h4>
          <p>입력한 내용을 토대로 비즈니스 문서에 알맞은 어조로 정형화하고 깔끔한 보고 형식으로 다듬어 줍니다. 내용 다듬기를 실행해 보세요.</p>
        </div>
      </div>

      {/* AI 다듬기 설정 행 */}
      <div className="dept-refine-action-panel">
        <div className="dept-refine-row" style={{ justifyContent: 'center', margin: '20px 0' }}>
          <button
            className="dept-refine-btn"
            onClick={handleRefine}
            disabled={isRefining}
            style={{ padding: '0 24px', fontSize: '15px' }}
          >
            {isRefining ? (
              <>
                <Loader size={16} className="dept-spinner" /> 작성 내용을 분석하여 다듬고 있습니다...
              </>
            ) : isRefined ? (
              <>
                <Check size={16} /> 다듬기 성공! 다시 다듬기
              </>
            ) : (
              <>
                <Sparkles size={16} /> 내용 다듬기
              </>
            )}
          </button>
        </div>

        {refineError && (
          <div className="dept-error" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={14} /> {refineError}
          </div>
        )}
      </div>

      {/* 최종 확인용 항목 리스트 */}
      <div className="dept-form-sections-container">
        {/* 실적 목록 */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">📊 실적 검토 ({perfStart} ~ {perfEnd})</div>
          {perfEntries.length === 0 ? (
            <p className="no-entries-msg">입력된 실적 항목이 없습니다.</p>
          ) : (
            perfEntries.map((entry) => (
              <div className={`dept-entry-card review-card ${entry.is_key_task ? 'key-task-card' : ''}`} key={entry._idx}>
                <div className="review-card-header">
                  <span className="review-cat-badge">{entry.category || '직접 입력'}</span>
                  {entry.is_key_task && <span className="review-key-task-badge">⭐ 핵심 업무</span>}
                  {entry.date && <span className="review-date-badge">{entry.date}</span>}
                </div>
                <div className="review-card-body">
                  <label className="textarea-label">
                    <Edit3 size={12} /> 최종 편집 가능
                  </label>
                  <textarea
                    className="dept-entry-content review-textarea"
                    value={entry.content}
                    onChange={(e) => handleContentChange(entry._idx, e.target.value)}
                    rows={4}
                    placeholder="내용을 검토하고 수동으로 직접 고칠 수 있습니다."
                  />
                </div>
                {entry.note && (
                  <div className="review-card-note">
                    <strong>비고:</strong> {entry.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 계획 목록 */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">📋 계획 검토 ({planStart} ~ {planEnd})</div>
          {planEntries.length === 0 ? (
            <p className="no-entries-msg">입력된 계획 항목이 없습니다.</p>
          ) : (
            planEntries.map((entry) => (
              <div className={`dept-entry-card review-card ${entry.is_key_task ? 'key-task-card' : ''}`} key={entry._idx}>
                <div className="review-card-header">
                  <span className="review-cat-badge">{entry.category || '직접 입력'}</span>
                  {entry.is_key_task && <span className="review-key-task-badge">⭐ 핵심 업무</span>}
                  {entry.date && <span className="review-date-badge">{entry.date}</span>}
                </div>
                <div className="review-card-body">
                  <label className="textarea-label">
                    <Edit3 size={12} /> 최종 편집 가능
                  </label>
                  <textarea
                    className="dept-entry-content review-textarea"
                    value={entry.content}
                    onChange={(e) => handleContentChange(entry._idx, e.target.value)}
                    rows={4}
                    placeholder="내용을 검토하고 수동으로 직접 고칠 수 있습니다."
                  />
                </div>
                {entry.note && (
                  <div className="review-card-note">
                    <strong>비고:</strong> {entry.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 하단 제어 행 */}
      <div className="dept-form-actions" style={{ marginTop: '24px' }}>
        <div className="dept-form-footer">
          <button className="dept-form-back-btn" onClick={onBack}>
            <ChevronLeft size={18} /> 이전 단계
          </button>
          
          <button
            className="dept-form-next-btn"
            onClick={onNext}
            style={{ background: isRefined ? '#0d9488' : '#64748b' }}
          >
            {isRefined ? '최종 미리보기 및 다운로드' : '다듬지 않고 다음 단계'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeptReportRefineStep;
