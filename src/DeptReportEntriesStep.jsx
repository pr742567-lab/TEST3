import React from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import './DeptReportForm.css';


/**
 * 2단계: 실적 및 계획 입력 컴포넌트 (Component)
 * - 부서별 실적 및 계획 항목들을 가이드에 따라 입력하고 편집합니다.
 */
const DeptReportEntriesStep = ({
  department,
  year,
  month,
  week,
  perfStart,
  perfEnd,
  planStart,
  planEnd,
  entries,
  addEntry,
  removeEntry,
  updateEntry,
  deptCategories = [],
  onNext,
  onBack
}) => {
  // 실적과 계획 항목들을 필터링(Filtering)하여 분류
  const perfEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter((e) => e.entry_type === 'performance');

  const planEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter((e) => e.entry_type === 'plan');

  // 업무 내용(Content)이 최소 하나 이상 입력되었는지 검사
  const hasContent = entries.some((e) => e.content.trim());

  return (
    <div className="dept-form">
      {/* 부서/기간 요약 정보 표시 줄 */}
      <div className="dept-form-summary-bar">
        <span className="dept-form-dept-badge">{department}</span>
        <span className="dept-form-period-badge">
          {year}년 {month}월 {week}주차
        </span>
        <button className="dept-form-back-btn" onClick={onBack}>
          <ChevronLeft size={14} /> 기본 정보 수정
        </button>
      </div>

      {/* 실적 및 계획 가로 배치를 위한 컨테이너 (Container) */}
      <div className="dept-form-sections-container">
        {/* 실적 입력 섹션 (Section) */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">
            📊 실적 ({perfStart} ~ {perfEnd})
          </div>

          {perfEntries.map((entry) => (
            <div className="dept-entry-card" key={entry._idx}>
              <div className="dept-entry-header">
                <select
                  value={entry.isCustomCategory ? '__custom__' : entry.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      updateEntry(entry._idx, { category: '', isCustomCategory: true });
                    } else {
                      updateEntry(entry._idx, { category: val, isCustomCategory: false });
                    }
                  }}
                  className="dept-entry-cat-select"
                >
                  {deptCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">직접 입력</option>
                </select>
                <button
                  className="dept-entry-remove-btn"
                  onClick={() => removeEntry(entry._idx)}
                  title="항목 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {entry.isCustomCategory && (
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="카테고리를 직접 입력하세요"
                  value={entry.category}
                  onChange={(e) => updateEntry(entry._idx, 'category', e.target.value)}
                />
              )}

              <textarea
                className="dept-entry-content"
                placeholder="업무 내용을 입력하세요 (대략적으로 적어도 됩니다. 다음 단계에서 AI가 정밀하게 다듬어 줍니다)"
                value={entry.content}
                onChange={(e) => updateEntry(entry._idx, 'content', e.target.value)}
                rows={3}
              />

              <div className="dept-entry-meta-row">
                <div className="dept-entry-meta-field">
                  <label>일자</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="예: 4/28일"
                    value={entry.date}
                    onChange={(e) => updateEntry(entry._idx, 'date', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field">
                  <label>비고</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="선택사항"
                    value={entry.note}
                    onChange={(e) => updateEntry(entry._idx, 'note', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field key-task-field">
                  <label className="dept-checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!entry.is_key_task}
                      onChange={(e) => updateEntry(entry._idx, 'is_key_task', e.target.checked)}
                    />
                    <span>핵심 업무 지정</span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button className="dept-add-entry-btn" onClick={() => addEntry('performance')}>
            <Plus size={16} /> 실적 항목 추가
          </button>
        </div>

        {/* 계획 입력 섹션 (Section) */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">
            📋 계획 ({planStart} ~ {planEnd})
          </div>

          {planEntries.map((entry) => (
            <div className="dept-entry-card" key={entry._idx}>
              <div className="dept-entry-header">
                <select
                  value={entry.isCustomCategory ? '__custom__' : entry.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      updateEntry(entry._idx, { category: '', isCustomCategory: true });
                    } else {
                      updateEntry(entry._idx, { category: val, isCustomCategory: false });
                    }
                  }}
                  className="dept-entry-cat-select"
                >
                  {deptCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">직접 입력</option>
                </select>
                <button
                  className="dept-entry-remove-btn"
                  onClick={() => removeEntry(entry._idx)}
                  title="항목 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {entry.isCustomCategory && (
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="카테고리를 직접 입력하세요"
                  value={entry.category}
                  onChange={(e) => updateEntry(entry._idx, 'category', e.target.value)}
                />
              )}

              <textarea
                className="dept-entry-content"
                placeholder="계획 내용을 입력하세요 (대략적으로 적어도 됩니다. 다음 단계에서 AI가 정밀하게 다듬어 줍니다)"
                value={entry.content}
                onChange={(e) => updateEntry(entry._idx, 'content', e.target.value)}
                rows={3}
              />

              <div className="dept-entry-meta-row">
                <div className="dept-entry-meta-field">
                  <label>일자</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="예: 5/8일"
                    value={entry.date}
                    onChange={(e) => updateEntry(entry._idx, 'date', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field">
                  <label>비고</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="선택사항"
                    value={entry.note}
                    onChange={(e) => updateEntry(entry._idx, 'note', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field key-task-field">
                  <label className="dept-checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!entry.is_key_task}
                      onChange={(e) => updateEntry(entry._idx, 'is_key_task', e.target.checked)}
                    />
                    <span>핵심 업무 지정</span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button className="dept-add-entry-btn" onClick={() => addEntry('plan')}>
            <Plus size={16} /> 계획 항목 추가
          </button>
        </div>
      </div>

      {/* 하단 액션 버튼 영역 */}
      <div className="dept-form-actions" style={{ marginTop: '24px' }}>
        <div className="dept-form-footer">
          <button className="dept-form-back-btn" onClick={onBack}>
            <ChevronLeft size={18} /> 이전 단계
          </button>
          
          <div>
            <button
              className="dept-form-next-btn"
              onClick={onNext}
              disabled={!hasContent}
            >
              AI로 내용 다듬기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {!hasContent && (
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <span className="dept-form-hint">업무 내용을 최소 하나 이상 입력해주세요</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeptReportEntriesStep;
