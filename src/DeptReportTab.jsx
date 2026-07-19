import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Eye, ClipboardList, ArrowLeft } from 'lucide-react';
import DeptReportInfoStep from './DeptReportInfoStep';
import DeptReportEntriesStep from './DeptReportEntriesStep';
import DeptReportRefineStep from './DeptReportRefineStep';
import DeptReportPreview from './DeptReportPreview';
import { API_BASE_URL } from './utils/api';
import './DeptReportForm.css';


/**
 * 진주공장 주요 업무보고 탭 컴포넌트 (Component)
 * - DocAssistPanel에서 분리된 독립 워크플로우입니다.
 * - 4단계 세분화 워크플로우(Workflow)를 관리합니다.
 *   1단계: 기본 정보 입력 (부서 및 기간 설정)
 *   2단계: 실적/계획 입력 (업무 항목 작성)
 *   3단계: AI 내용 다듬기 (말투 및 포맷 정제)
 *   4단계: 미리보기 & 내보내기 (PPTX 다운로드)
 */
const DeptReportTab = ({ messages = [], onBack }) => {
  // 현재 진행 중인 워크플로우 단계 (1 ~ 4)
  const [currentStep, setCurrentStep] = useState(1);

  // ─── 부서 및 기간 상태 (State) ─── //
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [perfStart, setPerfStart] = useState('');
  const [perfEnd, setPerfEnd] = useState('');
  const [planStart, setPlanStart] = useState('');
  const [planEnd, setPlanEnd] = useState('');

  // ─── 업무 항목 목록 상태 (State) ─── //
  const [entries, setEntries] = useState([]);

  // ─── AI 정제 완료 여부 상태 (State) ─── //
  const [isRefined, setIsRefined] = useState(false);

  // ─── 메타데이터 상태 (부서 및 카테고리) ─── //
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState({});

  // 날짜 포맷팅 함수 (YYYY-MM-DD)
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 주차 계산 헬퍼 함수
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...
    // 월요일 기준으로 주차 계산을 맞추기 위한 보정
    const adjustedDate = date.getDate() + (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    return Math.ceil(adjustedDate / 7);
  };

  // 부서 및 카테고리 리스트 조회 및 날짜 초기값 자동 설정 (Mount 시점 1회 실행)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dept-report/departments`)
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data.departments || []);
        setCategories(data.categories || {});
      })
      .catch((err) => console.error('부서 목록을 불러오는 중 오류 발생:', err));

    // 오늘 날짜 기준 기본 주차 및 기간 설정
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일, 1: 월, ...
    
    // 이번 주 월요일 ~ 일요일 계산
    const diffToMon = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const thisMon = new Date(today.getFullYear(), today.getMonth(), diffToMon);
    
    const thisSun = new Date(thisMon);
    thisSun.setDate(thisMon.getDate() + 6);
    
    // 다음 주 월요일 ~ 일요일 계산
    const nextMon = new Date(thisMon);
    nextMon.setDate(thisMon.getDate() + 7);
    
    const nextSun = new Date(nextMon);
    nextSun.setDate(nextMon.getDate() + 6);
    
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setWeek(getWeekOfMonth(today));
    setPerfStart(formatDate(thisMon));
    setPerfEnd(formatDate(thisSun));
    setPlanStart(formatDate(nextMon));
    setPlanEnd(formatDate(nextSun));
  }, []);

  // 부서 선택 시 초기 항목(실적 1개, 계획 1개) 생성
  const handleDepartmentChange = (dept) => {
    const cats = categories[dept] || [];
    setEntries([
      { category: cats[0] || '', entry_type: 'performance', content: '', date: '', note: '', isCustomCategory: false, is_key_task: false },
      { category: cats[0] || '', entry_type: 'plan', content: '', date: '', note: '', isCustomCategory: false, is_key_task: false },
    ]);
    setIsRefined(false);
  };

  // 항목 추가 헬퍼 함수
  const addEntry = (entryType) => {
    const cats = categories[department] || [];
    setEntries((prev) => [
      ...prev,
      {
        category: cats[0] || '',
        entry_type: entryType,
        content: '',
        date: '',
        note: '',
        isCustomCategory: false,
        is_key_task: false,
      },
    ]);
    setIsRefined(false);
  };

  // 항목 삭제 헬퍼 함수
  const removeEntry = (idx) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
    setIsRefined(false);
  };

  // 항목 정보 수정 헬퍼 함수
  const updateEntry = (idx, fieldOrObj, value) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i === idx) {
          if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
            return { ...e, ...fieldOrObj };
          }
          return { ...e, [fieldOrObj]: value };
        }
        return e;
      })
    );
    if (fieldOrObj === 'content' || (typeof fieldOrObj === 'object' && fieldOrObj !== null && 'content' in fieldOrObj)) {
      setIsRefined(false);
    }
  };

  // 프리뷰 및 다운로드 컴포넌트로 전달할 보고서 데이터 조립
  const buildReportData = () => {
    const cleanedEntries = entries
      .filter((e) => e.content.trim())
      .map(({ isCustomCategory, ...rest }) => rest);

    return {
      document_type: 'weekly_report',
      department,
      period: {
        year,
        month,
        week,
        performance_start: perfStart,
        performance_end: perfEnd,
        plan_start: planStart,
        plan_end: planEnd,
      },
      entries: cleanedEntries,
    };
  };

  // 워크플로우 4단계 구성 정의
  const steps = [
    { num: 1, label: '기본 정보 입력', icon: FileText, desc: '부서 및 기간 설정' },
    { num: 2, label: '실적/계획 입력', icon: ClipboardList, desc: '업무 항목 작성' },
    { num: 3, label: '내용 자동 다듬기', icon: Sparkles, desc: '말투 및 포맷 정제' },
    { num: 4, label: '미리보기 & 내보내기', icon: Eye, desc: 'PPTX 다운로드' },
  ];

  // 현재 부서에 정의된 카테고리 리스트
  const deptCategories = categories[department] || [];

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
            <h2>📊 진주공장 주요 업무보고</h2>
            <div className="content-subheader-container">
              <span className="slogan-badge">부서별 보고서</span>
              <span className="slogan-desc">부서를 선택하고 업무 내용만 입력하면 내용을 정리하여 PPT를 자동 생성합니다</span>
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

      {/* 단계별 콘텐츠 렌더링 영역 */}
      <div className="doc-assist-content">
        {currentStep === 1 && (
          <DeptReportInfoStep
            department={department}
            setDepartment={setDepartment}
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
            week={week}
            setWeek={setWeek}
            perfStart={perfStart}
            setPerfStart={setPerfStart}
            perfEnd={perfEnd}
            setPerfEnd={setPerfEnd}
            planStart={planStart}
            setPlanStart={setPlanStart}
            planEnd={planEnd}
            setPlanEnd={setPlanEnd}
            departments={departments}
            categories={categories}
            onDepartmentChange={handleDepartmentChange}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <DeptReportEntriesStep
            department={department}
            year={year}
            month={month}
            week={week}
            perfStart={perfStart}
            perfEnd={perfEnd}
            planStart={planStart}
            planEnd={planEnd}
            entries={entries}
            addEntry={addEntry}
            removeEntry={removeEntry}
            updateEntry={updateEntry}
            deptCategories={deptCategories}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <DeptReportRefineStep
            department={department}
            year={year}
            month={month}
            week={week}
            perfStart={perfStart}
            perfEnd={perfEnd}
            planStart={planStart}
            planEnd={planEnd}
            entries={entries}
            setEntries={setEntries}
            isRefined={isRefined}
            setIsRefined={setIsRefined}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <DeptReportPreview
            reportData={buildReportData()}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  );
};

export default DeptReportTab;
