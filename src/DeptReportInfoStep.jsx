import React from 'react';
import { Building2, Calendar, Clock, ChevronRight } from 'lucide-react';
import './DeptReportForm.css';


/**
 * 1단계: 부서 및 기간 입력 컴포넌트 (Component)
 * - 부서 정보와 보고서 작성 대상 주차, 기간(실적/계획)을 설정합니다.
 */
const DeptReportInfoStep = ({
  department,
  setDepartment,
  year,
  setYear,
  month,
  setMonth,
  week,
  setWeek,
  perfStart,
  setPerfStart,
  perfEnd,
  setPerfEnd,
  planStart,
  setPlanStart,
  planEnd,
  setPlanEnd,
  departments = [],
  categories = {},
  onNext,
  onDepartmentChange // 부서가 바뀔 때 초기 항목을 생성하기 위한 콜백 함수
}) => {
  // 입력 값들이 모두 입력되었는지 검증(Validation)하는 조건
  const isInfoValid = department && perfStart && perfEnd && planStart && planEnd;

  const handleDeptChange = (e) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);
    if (onDepartmentChange) {
      onDepartmentChange(selectedDept);
    }
  };

  return (
    <div className="dept-form">
      <div className="dept-form-info-container">
        <div className="dept-form-info-header">
          <div className="dept-form-info-title">📋 보고서 기본 정보</div>
          <p className="dept-form-info-desc">부서와 주차 정보 및 보고 대상 기간을 설정합니다.</p>
        </div>

        <div className="dept-form-grid">
          {/* 왼쪽 열(Column): 부서 및 주차 선택 */}
          <div className="dept-form-column">
            <div className="dept-form-field">
              <label className="dept-form-field-label-with-icon">
                <Building2 size={14} className="field-icon" />
                부서 선택
              </label>
              <select
                value={department}
                onChange={handleDeptChange}
                className="dept-form-select"
              >
                <option value="">-- 부서를 선택하세요 --</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="dept-form-row dept-form-row-inline">
              <div className="dept-form-field dept-form-field-sm">
                <label className="dept-form-field-label-with-icon">
                  <Calendar size={14} className="field-icon" />
                  연도
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
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
                  onChange={(e) => setMonth(Number(e.target.value))}
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
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="dept-form-select"
                >
                  {[1, 2, 3, 4, 5].map((w) => (
                    <option key={w} value={w}>{w}주차</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 오른쪽 열(Column): 기간 설정 */}
          <div className="dept-form-column">
            <div className="dept-form-period">
              <span className="dept-form-period-label-with-icon">
                📊 실적 기간
              </span>
              <div className="dept-form-date-row">
                <input
                  type="date"
                  value={perfStart}
                  onChange={(e) => setPerfStart(e.target.value)}
                  className="dept-form-input"
                />
                <span className="dept-form-tilde">~</span>
                <input
                  type="date"
                  value={perfEnd}
                  onChange={(e) => setPerfEnd(e.target.value)}
                  className="dept-form-input"
                />
              </div>
            </div>

            <div className="dept-form-period">
              <span className="dept-form-period-label-with-icon">
                📋 계획 기간
              </span>
              <div className="dept-form-date-row">
                <input
                  type="date"
                  value={planStart}
                  onChange={(e) => setPlanStart(e.target.value)}
                  className="dept-form-input"
                />
                <span className="dept-form-tilde">~</span>
                <input
                  type="date"
                  value={planEnd}
                  onChange={(e) => setPlanEnd(e.target.value)}
                  className="dept-form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dept-form-footer info-footer">
          <button
            className="dept-form-next-btn"
            onClick={onNext}
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
};

export default DeptReportInfoStep;
