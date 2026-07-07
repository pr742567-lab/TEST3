import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Plus, Trash2, Sparkles, Loader, AlertCircle, Check,
  Building2, Calendar, Clock
} from 'lucide-react';
import './DeptReportForm.css';
import { API_BASE_URL } from './utils/api';

/**
 * 부서별 보고서 입력 폼 컴포넌트
 * - 1단계: 부서/기간 기본 정보 입력
 * - 2단계: 업무 항목(실적/계획) 가이드형 입력 + AI 다듬기
 */
const DeptReportForm = ({ onComplete }) => {
  // ─── 기본 정보 상태 ─── //
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState({});
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [perfStart, setPerfStart] = useState('');
  const [perfEnd, setPerfEnd] = useState('');
  const [planStart, setPlanStart] = useState('');
  const [planEnd, setPlanEnd] = useState('');

  // ─── 업무 항목 상태 ─── //
  const [entries, setEntries] = useState([]);

  // ─── UI 상태 ─── //
  const [step, setStep] = useState('info'); // 'info' | 'entries'
  const [isRefining, setIsRefining] = useState(false);
  const [refineLevel, setRefineLevel] = useState('B');
  const [refineError, setRefineError] = useState('');
  const [isRefined, setIsRefined] = useState(false);

  // 부서/카테고리 목록 로드
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dept-report/departments`)
      .then(res => res.json())
      .then(data => {
        setDepartments(data.departments || []);
        setCategories(data.categories || {});
      })
      .catch(err => console.error('부서 목록 로드 실패:', err));
  }, []);

  // 부서 선택 시 초기 항목 생성
  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
    const cats = categories[dept] || [];
    // 첫 번째 카테고리로 빈 실적/계획 항목 1개씩 초기 생성
    setEntries([
      { category: cats[0] || '', entry_type: 'performance', content: '', date: '', note: '', isCustomCategory: false },
      { category: cats[0] || '', entry_type: 'plan', content: '', date: '', note: '', isCustomCategory: false },
    ]);
    setIsRefined(false);
  };

  // 항목 추가
  const addEntry = (entryType) => {
    const cats = categories[department] || [];
    setEntries(prev => [...prev, {
      category: cats[0] || '',
      entry_type: entryType,
      content: '',
      date: '',
      note: '',
      isCustomCategory: false,
    }]);
    setIsRefined(false);
  };

  // 항목 삭제
  const removeEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
    setIsRefined(false);
  };

  // 항목 필드 변경
  const updateEntry = (idx, field, value) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    if (field === 'content') setIsRefined(false);
  };

  // AI 다듬기 요청
  const handleRefine = async () => {
    if (isRefining) return;
    const nonEmptyEntries = entries.filter(e => e.content.trim());
    if (nonEmptyEntries.length === 0) {
      setRefineError('내용이 입력된 항목이 없습니다.');
      return;
    }

    setIsRefining(true);
    setRefineError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/dept-report/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_data: _buildReportData(),
          refine_level: refineLevel,
        }),
      });

      if (!response.ok) throw new Error(`AI 다듬기 실패 (${response.status})`);

      const data = await response.json();
      const refined = data.refined_entries || [];

      // 다듬어진 내용을 entries에 반영
      setEntries(prev =>
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
      console.error('AI 다듬기 에러:', error);
      setRefineError(error.message || 'AI 다듬기 중 오류가 발생했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  // 보고서 데이터 구조체 생성
  const _buildReportData = () => {
    // 백엔드로 전송할 때 UI 전용 속성(isCustomCategory)을 제거하여 가공합니다.
    const cleanedEntries = entries
      .filter(e => e.content.trim())
      .map(({ isCustomCategory, ...rest }) => rest);

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

  // 기본 정보 유효성 검사
  const isInfoValid = department && perfStart && perfEnd && planStart && planEnd;

  // 내용 유효성 검사
  const hasContent = entries.some(e => e.content.trim());

  // 실적/계획 항목 분리
  const perfEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter(e => e.entry_type === 'performance');
  const planEntries = entries
    .map((e, idx) => ({ ...e, _idx: idx }))
    .filter(e => e.entry_type === 'plan');

  // 현재 부서의 카테고리 옵션
  const deptCategories = categories[department] || [];

  // ═══ 렌더링 ═══ //

  // 1단계: 기본 정보 입력
  if (step === 'info') {
    return (
      <div className="dept-form">
        <div className="dept-form-info-container">
          <div className="dept-form-info-header">
            <div className="dept-form-info-title">📋 보고서 기본 정보</div>
            <p className="dept-form-info-desc">부서와 주차 정보 및 보고 대상 기간을 설정합니다.</p>
          </div>

          <div className="dept-form-grid">
            {/* 왼쪽 컬럼: 부서 및 주차 선택 */}
            <div className="dept-form-column">
              <div className="dept-form-field">
                <label className="dept-form-field-label-with-icon">
                  <Building2 size={14} className="field-icon" />
                  부서 선택
                </label>
                <select
                  value={department}
                  onChange={e => handleDepartmentChange(e.target.value)}
                  className="dept-form-select"
                >
                  <option value="">-- 부서를 선택하세요 --</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="dept-form-row">
                <div className="dept-form-field dept-form-field-sm">
                  <label className="dept-form-field-label-with-icon">
                    <Calendar size={14} className="field-icon" />
                    연도
                  </label>
                  <input
                    type="number" value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="dept-form-input"
                  />
                </div>
                <div className="dept-form-field dept-form-field-sm">
                  <label className="dept-form-field-label-with-icon">
                    <Clock size={14} className="field-icon" />
                    월
                  </label>
                  <select
                    value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                    className="dept-form-select"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                </div>
                <div className="dept-form-field dept-form-field-sm">
                  <label className="dept-form-field-label-with-icon">
                    <Clock size={14} className="field-icon" />
                    주차
                  </label>
                  <select
                    value={week}
                    onChange={e => setWeek(Number(e.target.value))}
                    className="dept-form-select"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>{w}주차</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼: 기간 설정 */}
            <div className="dept-form-column">
              <div className="dept-form-period">
                <span className="dept-form-period-label-with-icon">
                  📊 실적 기간
                </span>
                <div className="dept-form-date-row">
                  <input type="date" value={perfStart} onChange={e => setPerfStart(e.target.value)} className="dept-form-input" />
                  <span className="dept-form-tilde">~</span>
                  <input type="date" value={perfEnd} onChange={e => setPerfEnd(e.target.value)} className="dept-form-input" />
                </div>
              </div>

              <div className="dept-form-period">
                <span className="dept-form-period-label-with-icon">
                  📋 계획 기간
                </span>
                <div className="dept-form-date-row">
                  <input type="date" value={planStart} onChange={e => setPlanStart(e.target.value)} className="dept-form-input" />
                  <span className="dept-form-tilde">~</span>
                  <input type="date" value={planEnd} onChange={e => setPlanEnd(e.target.value)} className="dept-form-input" />
                </div>
              </div>
            </div>
          </div>

          <div className="dept-form-footer info-footer">
            <button
              className="dept-form-next-btn"
              onClick={() => setStep('entries')}
              disabled={!isInfoValid}
            >
              업무 항목 입력으로 <ChevronRight size={18} />
            </button>
            {!isInfoValid && (
              <span className="dept-form-hint">부서와 기간을 모두 입력해주세요</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2단계: 업무 항목 입력
  return (
    <div className="dept-form">
      {/* 부서/기간 요약 뱃지 */}
      <div className="dept-form-summary-bar">
        <span className="dept-form-dept-badge">{department}</span>
        <span className="dept-form-period-badge">
          {year}년 {month}월 {week}주차
        </span>
        <button className="dept-form-back-btn" onClick={() => setStep('info')}>
          기본 정보 수정
        </button>
      </div>

      {/* 실적 및 계획 가로 배치를 위한 컨테이너 */}
      <div className="dept-form-sections-container">
        {/* 실적 섹션 */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">
            📊 실적 ({perfStart} ~ {perfEnd})
          </div>

          {perfEntries.map((entry) => (
            <div className="dept-entry-card" key={entry._idx}>
              <div className="dept-entry-header">
                <select
                  value={entry.isCustomCategory ? '__custom__' : entry.category}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setEntries(prev => prev.map((ent, i) => i === entry._idx ? { ...ent, category: '', isCustomCategory: true } : ent));
                    } else {
                      setEntries(prev => prev.map((ent, i) => i === entry._idx ? { ...ent, category: val, isCustomCategory: false } : ent));
                    }
                    setIsRefined(false);
                  }}
                  className="dept-entry-cat-select"
                >
                  {deptCategories.map(c => (
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
                  onChange={e => updateEntry(entry._idx, 'category', e.target.value)}
                />
              )}

              <textarea
                className="dept-entry-content"
                placeholder="업무 내용을 입력하세요 (대략적으로 적어도 됩니다. AI가 다듬어줍니다)"
                value={entry.content}
                onChange={e => updateEntry(entry._idx, 'content', e.target.value)}
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
                    onChange={e => updateEntry(entry._idx, 'date', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field">
                  <label>비고</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="선택사항"
                    value={entry.note}
                    onChange={e => updateEntry(entry._idx, 'note', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button className="dept-add-entry-btn" onClick={() => addEntry('performance')}>
            <Plus size={16} /> 실적 항목 추가
          </button>
        </div>

        {/* 계획 섹션 */}
        <div className="dept-form-section">
          <div className="dept-form-section-title">
            📋 계획 ({planStart} ~ {planEnd})
          </div>

          {planEntries.map((entry) => (
            <div className="dept-entry-card" key={entry._idx}>
              <div className="dept-entry-header">
                <select
                  value={entry.isCustomCategory ? '__custom__' : entry.category}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setEntries(prev => prev.map((ent, i) => i === entry._idx ? { ...ent, category: '', isCustomCategory: true } : ent));
                    } else {
                      setEntries(prev => prev.map((ent, i) => i === entry._idx ? { ...ent, category: val, isCustomCategory: false } : ent));
                    }
                    setIsRefined(false);
                  }}
                  className="dept-entry-cat-select"
                >
                  {deptCategories.map(c => (
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
                  onChange={e => updateEntry(entry._idx, 'category', e.target.value)}
                />
              )}

              <textarea
                className="dept-entry-content"
                placeholder="계획 내용을 입력하세요 (대략적으로 적어도 됩니다. AI가 다듬어줍니다)"
                value={entry.content}
                onChange={e => updateEntry(entry._idx, 'content', e.target.value)}
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
                    onChange={e => updateEntry(entry._idx, 'date', e.target.value)}
                  />
                </div>
                <div className="dept-entry-meta-field">
                  <label>비고</label>
                  <input
                    type="text"
                    className="dept-form-input dept-form-input-sm"
                    placeholder="선택사항"
                    value={entry.note}
                    onChange={e => updateEntry(entry._idx, 'note', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button className="dept-add-entry-btn" onClick={() => addEntry('plan')}>
            <Plus size={16} /> 계획 항목 추가
          </button>
        </div>
      </div>

      {/* AI 다듬기 & 다음 단계 */}
      <div className="dept-form-actions">
        <div className="dept-refine-row">
          <button
            className="dept-refine-btn"
            onClick={handleRefine}
            disabled={isRefining || !hasContent}
          >
            {isRefining ? (
              <><Loader size={16} className="dept-spinner" /> 다듬는 중...</>
            ) : isRefined ? (
              <><Check size={16} /> 다듬기 완료! 다시 다듬기</>
            ) : (
              <><Sparkles size={16} /> AI로 내용 다듬기</>
            )}
          </button>
        </div>

        {refineError && (
          <div className="dept-error">
            <AlertCircle size={14} /> {refineError}
          </div>
        )}

        <div className="dept-form-footer">
          <button
            className="dept-form-next-btn"
            onClick={() => onComplete(_buildReportData())}
            disabled={!hasContent}
          >
            미리보기 & 내보내기 <ChevronRight size={18} />
          </button>
          {!hasContent && (
            <span className="dept-form-hint">업무 내용을 하나 이상 입력해주세요</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeptReportForm;
