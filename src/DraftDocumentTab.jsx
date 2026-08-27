import { useState, useEffect } from 'react';
import { FileText, Sparkles, Eye, ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { API_BASE_URL } from './utils/api';
import './DocAssistPanel.css';
import './DeptReportForm.css';

const DraftDocumentTab = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);

  // 부서 목록 로드
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dept-report/departments`)
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data.departments || []);
      })
      .catch((err) => console.error('부서 목록을 불러오는 중 오류 발생:', err));
  }, []);

  // ─── 1단계 기본 정보 상태 (빈 값 초기화) ─── //
  const [title, setTitle] = useState('');
  const [deptName, setDeptName] = useState('');
  const [writer, setWriter] = useState('');
  const [retention, setRetention] = useState('5년');
  const [classificationNo, setClassificationNo] = useState('');
  const [draftDate, setDraftDate] = useState(new Date().toISOString().split('T')[0]); // 오늘 날짜를 기본 YYYY-MM-DD 형태로 세팅
  const [deptOpen, setDeptOpen] = useState('공개');
  const [audit, setAudit] = useState('');
  const [ccDepts, setCcDepts] = useState('');

  // 결재선 (실제 결재칸 시각화용 - 기안자 외에는 빈 값 혹은 공란)
  const [approver1, setApprover1] = useState('');
  const [approver2, setApprover2] = useState('');
  const [approver3, setApprover3] = useState('');

  // ─── 2단계 본문 상태 (빈 값 초기화) ─── //
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
      // 품의 목적(사유) 다듬기
      if (purpose.trim()) {
        setPurpose(
          '산업안전보건법 제31조 및 동법 시행규칙 제33조의 법정의무 규정에 근거하여, ' +
          '당사 진주공장의 현업 관리감독자(반장 포함) 전원에 대한 연간 16시간 이상의 법정의무 교육을 ' +
          '안정적으로 이수 완료하도록 조치하고자 함.'
        );
      }
      
      // 품의 상세 내역 다듬기
      if (details.trim()) {
        setDetails(
          '1) 교육과정 : ① 일반 관리감독자 교육 (16H)  - 17차수 개설\n' +
          '              ② 위험성평가 담당자 교육(16H) -  6차수 개설\n' +
          '2) 교육기관 : 대한산업안전협회\n' +
          '3) 교육장소 : 진주교육장 (진주시 영천강로 177번길 29 한국국토정보공사 건물)\n' +
          '4) 교육시간 : 16시간 (2일간 집중 운영)\n' +
          '5) 교육대상자 : 진주공장 관리감독자(반장 포함) 총 56명\n' +
          '6) 실시방법 : 개별 직무 연관성에 맞춰 두 과정 중 택 1하여 신청 후 교육 이수.'
        );
      }

      // 비용처리 다듬기
      if (budget.trim()) {
        setBudget(
          '1) 총 소요비용 : 금 12,528,000원 (1인당 교육 위탁비 216,000원_58명 수강 기준 책정)\n' +
          "2) 재원 마련 : 2026년도 진주안전운영부 연간 부서 사업계획 교육 예산 범위 내 전액 집행."
        );
      }

      // 참고사항 다듬기
      if (effect.trim()) {
        setEffect(
          '1) 세부 교육 일정은 현업 생산 일정 및 교육기관 사정에 의해 일부 조정될 수 있음.\n' +
          '2) 위험성평가 담당자 교육 이수 시, 법정 의무 관리감독자 교육 시간(16시간)을 충족한 것으로 상호 인정함.\n' +
          '3) 교육 개시 전 사내 EP 시스템을 통한 외부위탁교육 출장 신청을 반드시 완료할 것.\n' +
          '4) 식대 지원 : 중식 미제공에 따라 법인카드로 개별 정산(식당 단가 10,000원 한도)하며 영수증 증빙 필수.\n' +
          '   (※ 현금 영수증 발행 시 지정 사업자등록번호 613-81-00289 활용, 타인 분과의 일괄 병합 결제 금지)'
        );
      }

      setIsRefined(true);
      setIsRefining(false);
    }, 1200);
  };

  // YYYY-MM-DD 또는 YYYYMMDD를 한국식 날짜 표기법으로 포맷팅
  const formatDateKorean = (dateStr) => {
    if (!dateStr) return '';
    // 1. YYYY-MM-DD 형식 (대시 포함)
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
      }
    }
    // 2. YYYYMMDD 형식 (숫자 8자리)
    const cleanStr = dateStr.replace(/[^0-9]/g, '');
    if (cleanStr.length === 8) {
      return `${cleanStr.substring(0, 4)}년 ${parseInt(cleanStr.substring(4, 6), 10)}월 ${parseInt(cleanStr.substring(6, 8), 10)}일`;
    }
    return dateStr;
  };

  // 가상 Word 파일 다운로드
  const handleDownload = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const docContent = 
        `품 의 서\n\n` +
        `--------------------------------------------------\n` +
        `분류 NO : ${classificationNo}\n` +
        `보존연한 : ${retention}\n` +
        `기 안 자 : ${writer}\n` +
        `기 안 일 : ${formatDateKorean(draftDate)}\n` +
        `부서내공개 : ${deptOpen}\n` +
        `기안부서 : ${deptName}\n` +
        `준법심사 : ${audit || '(없음)'}\n` +
        `사본송부처 : ${ccDepts}\n` +
        `결재선: [기안] ${writer} -> [검토] ${approver1} -> [검토] ${approver2} -> [승인] ${approver3}\n` +
        `--------------------------------------------------\n\n` +
        `제 목: ${title}\n\n` +
        `${title}을 다음과 같이 실시코저 품의합니다.\n\n` +
        `- 다 음 -\n\n` +
        `1. 목 적\n${purpose}\n\n` +
        `2. 내 용\n${details}\n\n` +
        `3. 소요예산\n${budget}\n\n` +
        `4. 특이사항\n${effect}\n\n` +
        `- 이 하 여 백 -`;

      const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `품의서_${title || '품의서'}.doc`;
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
    { num: 3, label: '품의서 미리보기', icon: Eye, desc: 'Word 품의서 내보내기' },
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
            <h2>📄 품의서</h2>
            <div className="content-subheader-container">
              <span className="slogan-badge">Word 자동 생성</span>
              <span className="slogan-desc">내용을 자유롭게 기술하면 공문서 서식으로 정제하여 표준 품의서를 완성합니다</span>
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

      {/* 콘텐츠 */}
      <div className="doc-assist-content">
        {/* 1단계 */}
        {currentStep === 1 && (
          <div className="dept-form" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* 기안 제목 */}
            <div className="dept-form-field">
              <label className="form-label">기안 제목 <span className="required">*</span></label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="예) 2026년 관리감독자 법정 의무교육 실시 품의"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 분류 NO / 보존 연한 */}
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">분류 NO</label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 본진안-173"
                  value={classificationNo}
                  onChange={(e) => setClassificationNo(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">보존 연한</label>
                <select className="dept-form-input" value={retention} onChange={(e) => setRetention(e.target.value)}>
                  <option value="1년">1년</option>
                  <option value="3년">3년</option>
                  <option value="5년">5년</option>
                  <option value="10년">10년</option>
                  <option value="영구">영구</option>
                </select>
              </div>
            </div>

            {/* 기안자 / 기안일 */}
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">기안자 성명 <span className="required">*</span></label>
                <input
                  type="text"
                  className="dept-form-input"
                  placeholder="예) 신병철"
                  value={writer}
                  onChange={(e) => setWriter(e.target.value)}
                />
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">기안일 <span className="required">*</span></label>
                <input
                  type="date"
                  className="dept-form-input"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                />
              </div>
            </div>

            {/* 부서내 공개 / 기안 부서 */}
            <div className="dept-form-row">
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">부서내공개</label>
                <select className="dept-form-input" value={deptOpen} onChange={(e) => setDeptOpen(e.target.value)}>
                  <option value="공개">공개</option>
                  <option value="비공개">비공개</option>
                </select>
              </div>
              <div className="dept-form-field" style={{ flex: 1 }}>
                <label className="form-label">기안 부서 <span className="required">*</span></label>
                <select 
                  className="dept-form-input" 
                  value={deptName} 
                  onChange={(e) => setDeptName(e.target.value)}
                >
                  <option value="">-- 부서를 선택하세요 --</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 준법심사 */}
            <div className="dept-form-field">
              <label className="form-label">준법심사</label>
              <input
                type="text"
                className="dept-form-input"
                placeholder="준법심사 의견 혹은 심사 항목 입력"
                value={audit}
                onChange={(e) => setAudit(e.target.value)}
              />
            </div>

            {/* 사본송부처 */}
            <div className="dept-form-field">
              <label className="form-label">사본송부처</label>
              <textarea
                className="dept-entry-content"
                rows={2}
                placeholder="사본 송부처 부서명 입력 (쉼표로 구분)"
                value={ccDepts}
                onChange={(e) => setCcDepts(e.target.value)}
              />
            </div>

            {/* 결재선 지정 시각화 */}
            <div style={{ marginTop: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
              <span className="form-label" style={{ display: 'block', marginBottom: '0.8rem' }}>✍️ 결재선 구성</span>
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
              <label className="form-label">1. 목적 <span className="required">*</span></label>
              <textarea
                className="dept-entry-content"
                rows={4}
                placeholder="예) 품의의 목적 및 필요성을 입력하세요."
                value={purpose}
                onChange={(e) => { setPurpose(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">2. 내용 <span className="required">*</span></label>
              <textarea
                className="dept-entry-content"
                rows={6}
                placeholder="교육 과정, 기관, 장소, 시간, 대상자 등 세부 내용을 입력하세요."
                value={details}
                onChange={(e) => { setDetails(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">3. 소요예산</label>
              <textarea
                className="dept-entry-content"
                rows={3}
                placeholder="소요 예산 및 조달 계획, 비용 처리 내역을 입력하세요."
                value={budget}
                onChange={(e) => { setBudget(e.target.value); setIsRefined(false); }}
              />
            </div>

            <div className="dept-form-field">
              <label className="form-label">4. 특이사항</label>
              <textarea
                className="dept-entry-content"
                rows={4}
                placeholder="기타 특이 사항 및 추가 지침을 입력하세요."
                value={effect}
                onChange={(e) => { setEffect(e.target.value); setIsRefined(false); }}
              />
            </div>

            {/* AI 다듬기 */}
            <div className="refine-section">
              <div className="refine-controls">
                <button
                  className="btn-refine"
                  onClick={handleRefine}
                  disabled={isRefining || (!purpose.trim() && !details.trim() && !effect.trim())}
                >
                  {isRefining ? (
                    <><Loader2 size={16} className="upload-spinner" /> 공문서 말투로 정제 중...</>
                  ) : (
                    <><Sparkles size={16} /> {isRefined ? '다시 다듬기' : '내용 다듬기'}</>
                  )}
                </button>
                {isRefined && (
                  <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ✓ 표준 공문서 양식으로 정제 완료됨
                  </span>
                )}
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
            <div className="preview-section" style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem 1rem', borderRadius: '12px' }}>
              {/* 실제 A4 규격 감성의 레이아웃 시뮬레이션 */}
              <div style={{ 
                width: '100%',
                maxWidth: '800px', 
                padding: '3rem 2.5rem', 
                backgroundColor: '#ffffff', 
                color: '#0f172a', 
                fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", "맑은 고딕", sans-serif', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: '800', textDecoration: 'underline', textUnderlineOffset: '8px', letterSpacing: '12px', marginBottom: '2.5rem', color: '#1e293b' }}>품 의 서</h2>
                
                {/* 기안 헤더 정보 및 결재칸 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'flex-end' }}>
                    * 본 문서는 실제 인쇄 및 Word 다운로드 시 표준 스타일이 적용됩니다.
                  </div>

                  {/* 결재칸 (4칸 구성: 기안, 검토1, 검토2, 승인) */}
                  <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center', width: '300px', border: '1px solid #94a3b8' }}>
                    <tbody>
                      <tr>
                        <td rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#f8fafc', width: '24px', fontWeight: 'bold', color: '#475569' }}>결<br/>재</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', width: '69px', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569' }}>기안</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', width: '69px', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569' }}>검토</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', width: '69px', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569' }}>검토</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', width: '69px', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569' }}>승인</td>
                      </tr>
                      <tr style={{ height: '60px' }}>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem' }}>
                          {writer || <span style={{ color: '#cbd5e1' }}>기안자</span>}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem', color: '#475569' }}>
                          {approver1 ? (approver1.includes(' ') ? <>{approver1.split(' ')[0]}<br/>{approver1.split(' ')[1]}</> : approver1) : <span style={{ color: '#e2e8f0' }}>-</span>}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem', color: '#475569' }}>
                          {approver2 ? (approver2.includes(' ') ? <>{approver2.split(' ')[0]}<br/>{approver2.split(' ')[1]}</> : approver2) : <span style={{ color: '#e2e8f0' }}>-</span>}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '4px', verticalAlign: 'middle', fontSize: '0.75rem', color: '#475569' }}>
                          {approver3 ? (approver3.includes(' ') ? <>{approver3.split(' ')[0]}<br/>{approver3.split(' ')[1]}</> : approver3) : <span style={{ color: '#e2e8f0' }}>-</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 실제 이미지 기반 표준 표 양식 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #94a3b8', marginBottom: '2.5rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', width: '110px', textAlign: 'center', color: '#475569' }}>분류 NO</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{classificationNo || <span style={{ color: '#cbd5e1' }}>(자동 부여)</span>}</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', width: '110px', textAlign: 'center', color: '#475569' }}>보존연한</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{retention}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>기안자</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{writer || <span style={{ color: '#cbd5e1' }}>(기안자명)</span>}</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>기안일</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{formatDateKorean(draftDate) || <span style={{ color: '#cbd5e1' }}>(기안 일자)</span>}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>부서내공개</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{deptOpen}</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>기안 부서</td>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{deptName || <span style={{ color: '#cbd5e1' }}>(부서명)</span>}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>준법심사</td>
                      <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a' }}>{audit || '\u00A0'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>사본송부처</td>
                      <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a', whiteSpace: 'normal', wordBreak: 'break-all', lineHeight: '1.5' }}>{ccDepts || <span style={{ color: '#cbd5e1' }}>(사본송부처 없음)</span>}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#475569' }}>제목</td>
                      <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '10px 8px', color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>{title || <span style={{ color: '#cbd5e1' }}>(기안 제목을 입력하세요)</span>}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 기안 내용 본문 */}
                <div style={{ fontSize: '0.92rem', lineHeight: '1.8', color: '#000000', fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif', padding: '0 0.5rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    {title}을 다음과 같이 실시코저 품의합니다.
                  </div>
                  <div style={{ textAlign: 'center', margin: '2.5rem 0', fontWeight: '800', fontSize: '1.15rem', letterSpacing: '8px', color: '#334155' }}>
                    - 다 음 -
                  </div>

                  {purpose && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                        1. 목적
                      </div>
                      <div style={{ paddingLeft: '1.5rem', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '2.0' }}>
                        {purpose}
                      </div>
                    </div>
                  )}

                  {details && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                        2. 내용
                      </div>
                      <div style={{ paddingLeft: '1.5rem', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '2.0' }}>
                        {details}
                      </div>
                    </div>
                  )}

                  {budget && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                        3. 소요예산
                      </div>
                      <div style={{ paddingLeft: '1.5rem', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '2.0' }}>
                        {budget}
                      </div>
                    </div>
                  )}

                  {effect && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                        4. 특이사항
                      </div>
                      <div style={{ paddingLeft: '1.5rem', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '2.0' }}>
                        {effect}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center', marginTop: '4.5rem', fontWeight: 'bold', letterSpacing: '4px', color: '#475569' }}>- 이 하 여 백 -</div>
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
                  <><Download size={16} /> Word 품의서 다운로드</>
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
