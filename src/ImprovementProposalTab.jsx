import React, { useState } from 'react';
import { FileText, Sparkles, Eye, ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from './utils/api';
import './DocAssistPanel.css';
import './DeptReportForm.css';


/**
 * 개선 제안서 탭 컴포넌트 (Component)
 * - 3단계 워크플로우:
 *   1단계: 기본 정보 입력 (부서, 날짜, 제목, 구분, 소속, 사번, 성명)
 *   2단계: 핵심 내용 입력 + AI 다듬기 (문제점, 개선안, 기대효과)
 *   3단계: 미리보기 & Excel 다운로드
 */
const ImprovementProposalTab = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // ─── 기본 정보 상태 ─── //
  const [department, setDepartment] = useState('');
  const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [writingDate, setWritingDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [affiliation, setAffiliation] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [proposerName, setProposerName] = useState('');

  // ─── 핵심 내용 상태 ─── //
  const [problem, setProblem] = useState('');
  const [improvement, setImprovement] = useState('');
  const [improvementStatus, setImprovementStatus] = useState('');
  const [expectedEffect, setExpectedEffect] = useState('');
  const [effectType, setEffectType] = useState('');

  // ─── AI 다듬기 상태 ─── //
  const [isRefining, setIsRefining] = useState(false);
  const [isRefined, setIsRefined] = useState(false);
  const [refineLevel, setRefineLevel] = useState('B');

  // ─── 다운로드 상태 ─── //
  const [isBuilding, setIsBuilding] = useState(false);

  // 제안 구분 선택지 정의
  const categoryOptions = [
    '원가절감', '생산성향상', '품질향상', '신기술',
    '표준화', '신규유망투자', '관리혁신', '직무개선', '기타'
  ];

  // 카테고리 토글 핸들러
  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // AI 다듬기 실행
  const handleRefine = async () => {
    if (!problem.trim() && !improvement.trim() && !expectedEffect.trim()) return;
    setIsRefining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/proposal/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          improvement,
          expected_effect: expectedEffect,
          refine_level: refineLevel,
        }),
      });
      if (!response.ok) throw new Error('AI 다듬기 실패');
      const data = await response.json();
      const refined = data.refined || {};
      if (refined.problem) setProblem(refined.problem);
      if (refined.improvement) setImprovement(refined.improvement);
      if (refined.expected_effect) setExpectedEffect(refined.expected_effect);
      setIsRefined(true);
    } catch (err) {
      console.error('AI 다듬기 오류:', err);
      alert('AI 다듬기 중 오류가 발생했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  // Excel 다운로드 실행
  const handleDownload = async () => {
    setIsBuilding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/proposal/build-xlsx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          proposal_date: proposalDate,
          writing_date: writingDate,
          title,
          categories,
          affiliation,
          employee_id: employeeId,
          proposer_name: proposerName,
          problem,
          improvement,
          improvement_status: improvementStatus,
          expected_effect: expectedEffect,
          effect_type: effectType,
        }),
      });
      if (!response.ok) throw new Error('Excel 빌드 실패');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '개선_제안서.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Excel 다운로드 오류:', err);
      alert('Excel 빌드 중 오류가 발생했습니다.');
    } finally {
      setIsBuilding(false);
    }
  };

  // 내용 변경 시 다듬기 상태 초기화
  const handleContentChange = (setter) => (e) => {
    setter(e.target.value);
    setIsRefined(false);
  };

  // 1단계 유효성 검사
  const isStep1Valid = title.trim() && affiliation.trim() && proposerName.trim();
  // 2단계 유효성 검사
  const isStep2Valid = problem.trim() || improvement.trim();

  // 워크플로우 3단계 구성 정의
  const steps = [
    { num: 1, label: '기본 정보 입력', icon: FileText, desc: '부서, 제목, 인적사항' },
    { num: 2, label: '핵심 내용 작성', icon: Sparkles, desc: '문제점, 개선안, 기대효과' },
    { num: 3, label: '미리보기 & 다운로드', icon: Eye, desc: 'Excel 내보내기' },
  ];

  return (
    <div className="doc-assist-panel">
      {/* 헤더 영역 */}
      <div className="content-header">
        <div className="doc-assist-header-row">
          <button className="doc-assist-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>문서 선택</span>
          </button>
          <div>
            <h2>💡 개선 제안서</h2>
            <div className="content-subheader-container">
              <span className="slogan-badge">Excel 자동 생성</span>
              <span className="slogan-desc">문제점과 개선안을 입력하면 내용을 정리하여 제안서 양식 Excel을 자동 생성합니다</span>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 단계 헤더 표시기 */}
      <div className="doc-assist-current-step">
        <div className="current-step-number">{currentStep}</div>
        <div className="current-step-body">
          <span className="current-step-label">{steps[currentStep - 1]?.label}</span>
          <span className="current-step-desc">{steps[currentStep - 1]?.desc}</span>
        </div>
      </div>

      {/* 단계별 콘텐츠 */}
      <div className="doc-assist-content">
        {/* ─── 1단계: 기본 정보 입력 ─── */}
        {currentStep === 1 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* 제안 제목 */}
            <div className="dept-form-field">
              <label className="form-label">제안 제목 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) PM3 석션 롤 냉각수 분사 개선"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 제안 구분 */}
            <div className="dept-form-field">
              <label className="form-label">제안 구분</label>
              <div className="proposal-category-grid">
                {categoryOptions.map(cat => (
                  <button
                    key={cat}
                    className={`proposal-category-chip ${categories.includes(cat) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {categories.includes(cat) ? '✓ ' : ''}{cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 제안 부서 & 날짜 */}
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">제안 실시일</label>
                <input
                  type="date"
                  className="dept-form-input"
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">제안 작성일</label>
                <input
                  type="date"
                  className="dept-form-input"
                  value={writingDate}
                  onChange={(e) => setWritingDate(e.target.value)}
                />
              </div>
            </div>

            {/* 인적사항 */}
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">소속 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 초지부 PM3파트"
                  value={affiliation}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAffiliation(val);
                    setDepartment(val); // 소속 값을 부서 상태에도 함께 설정하여 Excel API 호환성 유지
                  }}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">사번</label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 20261234"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">제안자 성명 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 홍길동"
                  value={proposerName}
                  onChange={(e) => setProposerName(e.target.value)}
                />
              </div>
            </div>

            {/* 다음 단계 버튼 */}
            <div className="dept-form-footer">
              <button
                className="dept-form-next-btn"
                disabled={!isStep1Valid}
                onClick={() => setCurrentStep(2)}
              >
                다음 단계 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── 2단계: 핵심 내용 작성 + AI 다듬기 ─── */}
        {currentStep === 2 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* 문제점(현상) */}
            <div className="dept-form-field">
              <label className="form-label">문제점(현상)</label>
              <textarea
                className="dept-entry-content"
                rows={5}
                placeholder="현재 발생하고 있는 문제점이나 개선이 필요한 현상을 기술하세요"
                value={problem}
                onChange={handleContentChange(setProblem)}
              />
            </div>

            {/* 개선안(대책) */}
            <div className="dept-form-field">
              <div className="se-field-label-row">
                <label className="form-label">개선안(대책)</label>
                <div className="proposal-status-toggle">
                  <label className={`status-option ${improvementStatus === 'completed' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="improvementStatus"
                      value="completed"
                      checked={improvementStatus === 'completed'}
                      onChange={() => setImprovementStatus('completed')}
                    />
                    완료
                  </label>
                  <label className={`status-option ${improvementStatus === 'not_implemented' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="improvementStatus"
                      value="not_implemented"
                      checked={improvementStatus === 'not_implemented'}
                      onChange={() => setImprovementStatus('not_implemented')}
                    />
                    미실시
                  </label>
                </div>
              </div>
              <textarea
                className="dept-entry-content"
                rows={5}
                placeholder="문제점을 해결하기 위한 개선 방안이나 대책을 기술하세요"
                value={improvement}
                onChange={handleContentChange(setImprovement)}
              />
            </div>

            {/* 기대효과 */}
            <div className="dept-form-field">
              <div className="se-field-label-row">
                <label className="form-label">기대효과</label>
                <div className="proposal-status-toggle">
                  <label className={`status-option ${effectType === '유형' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="effectType"
                      value="유형"
                      checked={effectType === '유형'}
                      onChange={() => setEffectType('유형')}
                    />
                    유형 효과
                  </label>
                  <label className={`status-option ${effectType === '무형' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="effectType"
                      value="무형"
                      checked={effectType === '무형'}
                      onChange={() => setEffectType('무형')}
                    />
                    무형 효과
                  </label>
                </div>
              </div>
              <textarea
                className="dept-entry-content"
                rows={5}
                placeholder="개선 후 기대되는 효과를 기술하세요 (비용 절감, 생산성 향상 등)"
                value={expectedEffect}
                onChange={handleContentChange(setExpectedEffect)}
              />
            </div>

            {/* AI 다듬기 영역 */}
            <div className="refine-section">
              <div className="refine-header">
                <Sparkles size={18} />
                <span>내용 자동 다듬기</span>
                {isRefined && <span className="refined-badge"><CheckCircle2 size={14} /> 다듬기 완료</span>}
              </div>
              <div className="refine-controls">
                <button
                  className="btn-refine"
                  onClick={handleRefine}
                  disabled={isRefining || (!problem.trim() && !improvement.trim() && !expectedEffect.trim())}
                >
                  {isRefining ? (
                    <><Loader2 size={16} className="upload-spinner" /> 다듬는 중...</>
                  ) : (
                    <><Sparkles size={16} /> 내용 다듬기</>
                  )}
                </button>
              </div>
            </div>

            {/* 이전/다음 버튼 */}
            <div className="dept-form-footer">
              <button className="dept-preview-back-btn" onClick={() => setCurrentStep(1)}>
                <ChevronLeft size={16} /> 이전
              </button>
              <button
                className="dept-form-next-btn"
                disabled={!isStep2Valid}
                onClick={() => setCurrentStep(3)}
              >
                다음 단계 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── 3단계: 미리보기 & 다운로드 ─── */}
        {currentStep === 3 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="preview-section">
              <h3 className="preview-title">📋 제안서 요약</h3>

              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">제안 제목</span>
                  <span className="preview-value">{title || '(미입력)'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">소속</span>
                  <span className="preview-value">{affiliation || '(미입력)'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">제안자</span>
                  <span className="preview-value">{proposerName || '(미입력)'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">제안 구분</span>
                  <span className="preview-value">{categories.length > 0 ? categories.join(', ') : '(미선택)'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">제안 실시일</span>
                  <span className="preview-value">{proposalDate || '(미입력)'}</span>
                </div>
              </div>

              <div className="preview-text-block">
                <span className="preview-label">문제점(현상)</span>
                <div className="preview-text-content">{problem || '(미입력)'}</div>
              </div>
              <div className="preview-text-block">
                <span className="preview-label">개선안(대책) {improvementStatus && `[${improvementStatus === 'completed' ? '완료' : '미실시'}]`}</span>
                <div className="preview-text-content">{improvement || '(미입력)'}</div>
              </div>
              <div className="preview-text-block">
                <span className="preview-label">기대효과 {effectType && `[${effectType} 효과]`}</span>
                <div className="preview-text-content">{expectedEffect || '(미입력)'}</div>
              </div>
            </div>

            {/* 이전/다운로드 버튼 */}
            <div className="dept-form-footer">
              <button className="dept-preview-back-btn" onClick={() => setCurrentStep(2)}>
                <ChevronLeft size={16} /> 이전
              </button>
              <button
                className="btn-download"
                onClick={handleDownload}
                disabled={isBuilding}
              >
                {isBuilding ? (
                  <><Loader2 size={16} className="upload-spinner" /> 생성 중...</>
                ) : (
                  <><Download size={16} /> Excel 다운로드</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementProposalTab;
