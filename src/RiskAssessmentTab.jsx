import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Eye, ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import './DocAssistPanel.css';
import './DeptReportForm.css';

const RiskAssessmentTab = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // ─── 1단계 기본 정보 상태 ─── //
  const [processName, setProcessName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assessDate, setAssessDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessor, setAssessor] = useState('');

  // ─── 2단계 위험 요인 상태 ─── //
  const [taskStep, setTaskStep] = useState('');
  const [hazard, setHazard] = useState('');
  
  // 현재 위험성 (빈도, 강도)
  const [currFreq, setCurrFreq] = useState(3);
  const [currSev, setCurrSev] = useState(3);
  const currLevel = currFreq * currSev;

  const [mitigation, setMitigation] = useState('');

  // 개선 후 위험성 (빈도, 강도)
  const [postFreq, setPostFreq] = useState(2);
  const [postSev, setPostSev] = useState(2);
  const postLevel = postFreq * postSev;

  // ─── AI 분석 상태 ─── //
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // ─── 다운로드 상태 ─── //
  const [isBuilding, setIsBuilding] = useState(false);

  // AI 위험성 분석 시뮬레이션
  const handleAIAnalyze = () => {
    if (!hazard.trim() && !mitigation.trim()) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // 그럴듯한 AI 보완 문구 생성
      if (hazard.includes('세척') || taskName.includes('세척') || taskName.includes('와이어')) {
        setMitigation(
          '1. 고압수 노즐 파지용 보조 안전 핸들(이중 제어 밸브) 장착 상태를 정기 점검합니다.\n' +
          '2. 추락 위험 구역 작업 시 상부 생명선에 안전대 체결을 의무화하고 감시인을 배치합니다.\n' +
          '3. 비산되는 약품으로부터 보호를 위해 안면보호구(Face Shield) 및 내화학용 긴팔 장갑을 필히 착용 조치합니다.'
        );
      } else {
        setMitigation(
          `1. 작업 시작 전 전원을 완전히 차단하고 LOTO(Lock-Out, Tag-Out) 및 오작동 방지 표지판을 부착합니다.\n` +
          `2. 회전체 및 구동부 인근 작업 시 안전 가드를 설치하고 2인 1조 표준 작업 수칙을 준수합니다.\n` +
          `3. 작업장 바닥 슬러지 및 이물질 수시 청소로 작업자 미끄러짐 전도 재해 요인을 제거합니다.`
        );
      }
      // 위험 감소 대책이 적용되었으므로 개선 후 위험도 자동 낮춤 조정
      setPostFreq(2);
      setPostSev(2);
      setIsAnalyzed(true);
      setIsAnalyzing(false);
    }, 1200);
  };

  // 가상 Excel 다운로드 실행
  const handleDownload = () => {
    setIsBuilding(true);
    setTimeout(() => {
      // 텍스트 파일 형태의 가상 xlsx 다운로드
      const csvContent = 
        `위험성평가표\n` +
        `공정명,${processName}\n` +
        `작업명,${taskName}\n` +
        `평가일,${assessDate}\n` +
        `평가자,${assessor}\n\n` +
        `작업단계,유해위험요인,현재 빈도,현재 강도,현재 등급,감소대책,개선후 빈도,개선후 강,개선후 등급\n` +
        `"${taskStep}","${hazard.replace(/"/g, '""')}",${currFreq},${currSev},${currLevel},"${mitigation.replace(/"/g, '""')}",${postFreq},${postSev},${postLevel}\n`;

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `위험성평가표_${taskName || '데모'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsBuilding(false);
    }, 1000);
  };

  // 1단계 유효성 검사
  const isStep1Valid = processName.trim() && taskName.trim() && assessor.trim();
  // 2단계 유효성 검사
  const isStep2Valid = taskStep.trim() && hazard.trim() && mitigation.trim();

  const steps = [
    { num: 1, label: '기본 정보 입력', icon: FileText, desc: '대상 공정 및 작업 설정' },
    { num: 2, label: '위험 요인 및 대책', icon: Sparkles, desc: '위험도 평가 및 AI 대책 보완' },
    { num: 3, label: '평가표 미리보기', icon: Eye, desc: '엑셀(CSV) 다운로드' },
  ];

  return (
    <div className="doc-assist-panel">
      {/* 헤더 */}
      <div className="content-header">
        <div className="doc-assist-header-row">
          <button className="doc-assist-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>문서 선택</span>
          </button>
          <div>
            <h2>⚠️ 위험성 평가</h2>
            <div className="content-subheader-container">
              <span className="slogan-badge">Excel 자동 생성</span>
              <span className="slogan-desc">공정의 작업 단계를 입력하면 AI가 안전 대책을 검토하고 위험성평가표를 완성합니다</span>
            </div>
          </div>
        </div>
      </div>

      {/* 스테퍼 */}
      <div className="doc-assist-stepper">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div
              className={`stepper-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
              onClick={() => { if (step.num <= currentStep) setCurrentStep(step.num); }}
            >
              <div className="stepper-circle">
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <div className="stepper-label">
                <span className="stepper-title">{step.label}</span>
                <span className="stepper-desc">{step.desc}</span>
              </div>
            </div>
            {idx < steps.length - 1 && <div className="stepper-connector" />}
          </React.Fragment>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="doc-assist-content">
        {/* 1단계 */}
        {currentStep === 1 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">평가 대상 공정 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 초지부 PM3 파트"
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">평가 일자</label>
                <input
                  type="date"
                  className="dept-form-input"
                  value={assessDate}
                  onChange={(e) => setAssessDate(e.target.value)}
                />
              </div>
            </div>

            <div className="dept-form-field">
              <label className="form-label">작업명 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) 초지기 와이어 고압 세척작업"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">평가자 성명 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) 박안전 대리"
                value={assessor}
                onChange={(e) => setAssessor(e.target.value)}
              />
            </div>

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

        {/* 2단계 */}
        {currentStep === 2 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="dept-form-field">
              <label className="form-label">현재 작업 단계 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) 고압 분사 노즐 조작 및 세척 실시"
                value={taskStep}
                onChange={(e) => setTaskStep(e.target.value)}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">유해/위험 요인 <span className="required">*</span></label>
              <textarea
                className="dept-entry-content"
                rows={3}
                placeholder="예) 고압 노즐의 수압 반발력에 밀려 작업자 안구 손상 또는 비산 약품 접촉 위험"
                value={hazard}
                onChange={(e) => { setHazard(e.target.value); setIsAnalyzed(false); }}
              />
            </div>

            {/* 현재 위험성 평가 매트릭스 */}
            <div className="dept-form-row" style={{ gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">현재 빈도(가능성: 1~5)</label>
                <select className="dept-form-input" value={currFreq} onChange={(e) => setCurrFreq(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">현재 강도(중대성: 1~5)</label>
                <select className="dept-form-input" value={currSev} onChange={(e) => setCurrSev(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="dept-form-field" style={{ width: '100px', flex: 'none', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="form-label" style={{ marginBottom: '0.4rem' }}>위험도 등급</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currLevel >= 9 ? '#ef4444' : '#f97316' }}>{currLevel}</span>
              </div>
            </div>

            <div className="dept-form-field">
              <label className="form-label">위험성 감소 대책 <span className="required">*</span></label>
              <textarea
                className="dept-entry-content"
                rows={4}
                placeholder="위험 요인을 예방하기 위한 대책을 작성하세요. (AI 분석을 누르면 내용이 자동 보완됩니다)"
                value={mitigation}
                onChange={(e) => { setMitigation(e.target.value); setIsAnalyzed(false); }}
              />
            </div>

            {/* AI 분석 */}
            <div className="refine-section">
              <div className="refine-header">
                <Sparkles size={18} />
                <span>AI 안전 대책 보완</span>
                {isAnalyzed && <span className="refined-badge"><CheckCircle2 size={14} /> 안전 대책 최적화 완료</span>}
              </div>
              <div className="refine-controls">
                <button
                  className="btn-refine"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || (!hazard.trim() && !mitigation.trim())}
                >
                  {isAnalyzing ? (
                    <><Loader2 size={16} className="upload-spinner" /> 대책 검토 중...</>
                  ) : (
                    <><Sparkles size={16} /> AI 위험성 분석</>
                  )}
                </button>
              </div>
            </div>

            {/* 개선 후 위험성 평가 매트릭스 */}
            <div className="dept-form-row" style={{ gap: '1rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">개선 후 빈도(1~5)</label>
                <select className="dept-form-input" value={postFreq} onChange={(e) => setPostFreq(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">개선 후 강도(1~5)</label>
                <select className="dept-form-input" value={postSev} onChange={(e) => setPostSev(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="dept-form-field" style={{ width: '100px', flex: 'none', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="form-label" style={{ marginBottom: '0.4rem' }}>위험도 등급</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{postLevel}</span>
              </div>
            </div>

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

        {/* 3단계 */}
        {currentStep === 3 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="preview-section">
              <h3 className="preview-title">📋 위험성 평가 결과 요약</h3>

              <div className="preview-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="preview-item">
                  <span className="preview-label">대상 공정</span>
                  <span className="preview-value">{processName}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">작업명</span>
                  <span className="preview-value">{taskName}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">평가 일자</span>
                  <span className="preview-value">{assessDate}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">평가자</span>
                  <span className="preview-value">{assessor}</span>
                </div>
              </div>

              <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>작업 단계</th>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>유해위험요인</th>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'center', width: '90px' }}>현재 위험도</th>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>감소 대책</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '90px' }}>개선후 위험도</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>{taskStep}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>{hazard}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#ef4444' }}>
                        {currFreq} × {currSev} = {currLevel}
                      </td>
                      <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top', whiteSpace: 'pre-line' }}>{mitigation}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#22c55e' }}>
                        {postFreq} × {postSev} = {postLevel}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

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
                  <><Loader2 size={16} className="upload-spinner" /> 다운로드 준비 중...</>
                ) : (
                  <><Download size={16} /> Excel(CSV) 다운로드</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessmentTab;
