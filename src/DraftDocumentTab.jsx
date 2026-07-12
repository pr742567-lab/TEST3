import React, { useState } from 'react';
import { FileText, Sparkles, Eye, ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import './DocAssistPanel.css';
import './DeptReportForm.css';

const DraftDocumentTab = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // ─── 1단계 기본 정보 상태 ─── //
  const [title, setTitle] = useState('');
  const [deptName, setDeptName] = useState('');
  const [writer, setWriter] = useState('');
  const [retention, setRetention] = useState('3년');
  
  // 결재선
  const [approver1, setApprover1] = useState('홍길동 파트장');
  const [approver2, setApprover2] = useState('이몽룡 부장');
  const [approver3, setApprover3] = useState('성춘향 공장장');

  // ─── 2단계 본문 상태 ─── //
  const [purpose, setPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [effect, setEffect] = useState('');

  // ─── AI 정제 상태 ─── //
  const [isRefining, setIsRefining] = useState(false);
  const [isRefined, setIsRefined] = useState(false);

  // ─── 다운로드 상태 ─── //
  const [isBuilding, setIsBuilding] = useState(false);

  // AI 기안서 내용 다듬기 시뮬레이션
  const handleRefine = () => {
    if (!purpose.trim() && !details.trim() && !budget.trim() && !effect.trim()) return;
    setIsRefining(true);
    
    setTimeout(() => {
      // 품의 목적 다듬기
      if (purpose.trim()) {
        setPurpose(
          `1. 품의 목적:\n` +
          `   - 현행 노후화 및 부식으로 인한 설비 구동 효율 저하 요인을 해결하고자 함.\n` +
          `   - 정기 수리 기간을 활용한 적기 부품 교체로 불시 정지 사고를 사전 예방하고 생산성 및 공정 신뢰성을 확보하기 위함.`
        );
      }
      
      // 품의 상세 내역 다듬기
      if (details.trim()) {
        setDetails(
          `2. 주요 품의 내용:\n` +
          `   가. 대상 설비: 진주공장 초지파트 PM3 Reel부 주요 소모 부품\n` +
          `   나. 정비 범위:\n` +
          `       - 노후 실링 고무 및 마모 롤 베어링 전면 탈거 후 신품 교체 설치\n` +
          `       - 교체 후 축 정밀 정렬(Aligning) 및 무부하 가동 테스트 실시\n` +
          `   다. 일정 계획: 차기 정기 대정비 기간(SD) 내 3일간 진행`
        );
      }

      // 기대효과 다듬기
      if (effect.trim()) {
        setEffect(
          `3. 기대 효과:\n` +
          `   - 베어링 및 씰 부품 신규 교체를 통한 운전 소음 감소 및 기계적 진동 이상치 15% 하향 안정화\n` +
          `   - 설비 마모로 인한 압력 누출 예방을 통해 제품 규격 품질 편차 최소화 및 설비 종합 가동률 제고`
        );
      }

      setIsRefined(true);
      setIsRefining(false);
    }, 1200);
  };

  // 가상 Word 파일 다운로드
  const handleDownload = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const docContent = 
        `기 안 문\n\n` +
        `문서번호: 무림-진주-${new Date().getFullYear()}-001\n` +
        `기안부서: ${deptName}\n` +
        `기안자: ${writer}\n` +
        `기안일자: ${new Date().toLocaleDateString()}\n` +
        `보존연한: ${retention}\n` +
        `결재선: [기안] ${writer} -> [검토] ${approver1} -> [검토] ${approver2} -> [승인] ${approver3}\n\n` +
        `제목: ${title}\n\n` +
        `1. 품의 목적\n${purpose}\n\n` +
        `2. 상세 내역\n${details}\n\n` +
        `3. 소요 예산\n${budget}\n\n` +
        `4. 기대 효과\n${effect}\n\n` +
        `상기와 같이 기안하오니 재가하여 주시기 바랍니다.`;

      const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `기안문_${title || '데모'}.doc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsBuilding(false);
    }, 1000);
  };

  const isStep1Valid = title.trim() && deptName.trim() && writer.trim();
  const isStep2Valid = purpose.trim() || details.trim();

  const steps = [
    { num: 1, label: '기본 정보 입력', icon: FileText, desc: '제목 및 결재선 지정' },
    { num: 2, label: '품의 본문 작성', icon: Sparkles, desc: '목적, 예산, 내용 작성' },
    { num: 3, label: '기안문 미리보기', icon: Eye, desc: 'Word 기안문 내보내기' },
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
            <h2>📄 품의서 (기안문)</h2>
            <div className="content-subheader-container">
              <span className="slogan-badge">Word 자동 생성</span>
              <span className="slogan-desc">내용을 자유롭게 기술하면 AI가 공문서 서식으로 정제하여 표준 기안문을 완성합니다</span>
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
            <div className="dept-form-field">
              <label className="form-label">기안 제목 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) PM3 릴 메거진 유압 펌프 예비품 도입 품의"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">기안 부서 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 공무부 전기제어파트"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">기안자 성명 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 김기안 대리"
                  value={writer}
                  onChange={(e) => setWriter(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">보존 연한</label>
                <select className="dept-form-input" value={retention} onChange={(e) => setRetention(e.target.value)}>
                  <option value="1년">1년</option>
                  <option value="3년">3년</option>
                  <option value="5년">5년</option>
                  <option value="영구">영구</option>
                </select>
              </div>
            </div>

            {/* 결재선 지정 시각화 */}
            <div style={{ marginTop: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
              <span className="form-label" style={{ display: 'block', marginBottom: '0.8rem' }}>✍️ 결재선 구성 (데모용 배정)</span>
              <div className="dept-form-row" style={{ gap: '1rem' }}>
                <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>1차 검토자</label>
                  <input type="text" className="dept-form-input" style={{ fontSize: '0.85rem' }} value={approver1} onChange={(e) => setApprover1(e.target.value)} />
                </div>
                <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>2차 검토자</label>
                  <input type="text" className="dept-form-input" style={{ fontSize: '0.85rem' }} value={approver2} onChange={(e) => setApprover2(e.target.value)} />
                </div>
                <div className="dept-form-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>최종 승인자</label>
                  <input type="text" className="dept-form-input" style={{ fontSize: '0.85rem' }} value={approver3} onChange={(e) => setApprover3(e.target.value)} />
                </div>
              </div>
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
              <label className="form-label">품의 목적 및 필요성 <span className="required">*</span></label>
              <textarea
                className="dept-entry-content"
                rows={4}
                placeholder="예) 현재 사용 중인 유압 펌프가 5년 이상 경과하여 오작동 가능성이 높아, 예비품을 선제 확보하여 가동 정지 고장 시간을 예방하고자 함."
                value={purpose}
                onChange={(e) => { setPurpose(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">품의 상세 내용</label>
              <textarea
                className="dept-entry-content"
                rows={4}
                placeholder="상세 규격, 수량, 인도 조건, 설치 공정 일정 등을 입력하세요."
                value={details}
                onChange={(e) => { setDetails(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">소요 예산 및 조달 계획</label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) 일금 4,500,000원 (부가가치세 별도, 당해 년도 예산 범위 내 집행)"
                value={budget}
                onChange={(e) => { setBudget(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">기대 효과</label>
              <textarea
                className="dept-entry-content"
                rows={3}
                placeholder="업무 효율성 증대, 공정 고장 시간 단축 등 기대 효과를 기술하세요."
                value={effect}
                onChange={(e) => { setEffect(e.target.value); setIsRefined(false); }}
              />
            </div>

            {/* AI 다듬기 */}
            <div className="refine-section">
              <div className="refine-header">
                <Sparkles size={18} />
                <span>AI 기안서 문체 정제</span>
                {isRefined && <span className="refined-badge"><CheckCircle2 size={14} /> 정제 완료</span>}
              </div>
              <div className="refine-controls">
                <button
                  className="btn-refine"
                  onClick={handleRefine}
                  disabled={isRefining || (!purpose.trim() && !details.trim() && !effect.trim())}
                >
                  {isRefining ? (
                    <><Loader2 size={16} className="upload-spinner" /> 공문서 말투로 정제 중...</>
                  ) : (
                    <><Sparkles size={16} /> AI 기안서 다듬기</>
                  )}
                </button>
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
              {/* 전통적인 회사 기안문 테두리 및 양식 시뮬레이션 */}
              <div style={{ border: '2px solid #334155', padding: '2rem', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Courier New, monospace', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '8px', marginBottom: '2rem' }}>기 안 문</h2>
                
                {/* 기안 헤더 정보 및 결재칸 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <table style={{ width: '50%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold', width: '80px' }}>기안 부서</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{deptName}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>기 안 자</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{writer}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>기안 일자</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>보존 연한</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{retention}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 결재칸 */}
                  <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center', width: '240px' }}>
                    <tbody>
                      <tr>
                        <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f1f5f9', width: '20px', fontWeight: 'bold' }}>결<br/>재</td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '70px', backgroundColor: '#f8fafc' }}>기안</td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '70px', backgroundColor: '#f8fafc' }}>검토</td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '70px', backgroundColor: '#f8fafc' }}>승인</td>
                      </tr>
                      <tr style={{ height: '55px' }}>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>{writer}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem', color: '#64748b' }}>{approver1.split(' ')[0]}<br/>{approver1.split(' ')[1]}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem', color: '#64748b' }}>{approver3.split(' ')[0]}<br/>{approver3.split(' ')[1]}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr style={{ border: '1px solid #000', marginBottom: '1.5rem' }} />

                {/* 기안 제목 */}
                <div style={{ marginBottom: '1.5rem', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  제 목 : {title}
                </div>

                {/* 기안 내용 본문 */}
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {purpose && <div style={{ marginBottom: '1.5rem' }}>{purpose}</div>}
                  {details && <div style={{ marginBottom: '1.5rem' }}>{details}</div>}
                  {budget && <div style={{ marginBottom: '1.5rem' }}><strong>[소요 예산 및 계획]</strong><br/>{budget}</div>}
                  {effect && <div style={{ marginBottom: '1.5rem' }}>{effect}</div>}
                  <div style={{ textAlign: 'center', marginTop: '3rem', fontWeight: 'bold' }}>- 이 하 여 백 -</div>
                </div>
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
                  <><Loader2 size={16} className="upload-spinner" /> 빌드 중...</>
                ) : (
                  <><Download size={16} /> Word 기안문 다운로드</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftDocumentTab;
