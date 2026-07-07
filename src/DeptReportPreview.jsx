import React, { useState } from 'react';
import { Download, ChevronLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from './utils/api';
import './DeptReportForm.css';


/**
 * 부서별 보고서 미리보기 + PPTX 다운로드 컴포넌트 (3단계)
 * - 입력된 데이터를 표 형태로 시각화
 * - PPTX 빌드 & 다운로드
 */
const DeptReportPreview = ({ reportData, onBack }) => {
  const [buildState, setBuildState] = useState('idle'); // 'idle' | 'building' | 'done' | 'error'
  const [buildError, setBuildError] = useState('');

  if (!reportData) {
    return (
      <div className="dept-preview">
        <div className="dept-error">
          <AlertCircle size={14} /> 미리볼 데이터가 없습니다.
        </div>
      </div>
    );
  }

  const { department, period, entries } = reportData;
  
  // 실적 및 계획 전체 필터링(Filtering)
  const perfEntries = entries.filter(e => e.entry_type === 'performance');
  const planEntries = entries.filter(e => e.entry_type === 'plan');

  // 실적 분류 (핵심 vs 주간)
  const keyPerfEntries = perfEntries.filter(e => e.is_key_task);
  const weeklyPerfEntries = perfEntries.filter(e => !e.is_key_task);
  
  // 계획 분류 (핵심 vs 주간)
  const keyPlanEntries = planEntries.filter(e => e.is_key_task);
  const weeklyPlanEntries = planEntries.filter(e => !e.is_key_task);

  // PPTX 빌드 & 다운로드
  const handleBuildDownload = async () => {
    if (buildState === 'building') return;
    setBuildState('building');
    setBuildError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/dept-report/build-pptx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_data: reportData }),
      });

      if (!response.ok) throw new Error(`PPTX 빌드 실패 (${response.status})`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${period.year}년_${period.month}월_${period.week}주차_${department}_주요업무보고.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setBuildState('done');
    } catch (error) {
      console.error('PPTX 빌드 에러:', error);
      setBuildState('error');
      setBuildError(error.message || 'PPTX 생성 중 오류가 발생했습니다.');
    }
  };

  // 표 렌더링 헬퍼 (데이터가 없을 시 플레이스홀더 렌더링)
  const renderTable = (title, tableEntries) => {
    return (
      <div className="dept-preview-table-wrap">
        <div className="dept-preview-table-title">{title}</div>
        <table className="dept-preview-table">
          <thead>
            <tr>
              <th className="col-cat">구분</th>
              <th className="col-content">내용</th>
              <th className="col-date">일자</th>
              <th className="col-note">비고</th>
            </tr>
          </thead>
          <tbody>
            {tableEntries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem', fontStyle: 'italic' }}>
                  등록된 항목이 없습니다.
                </td>
              </tr>
            ) : (
              tableEntries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="col-cat">{entry.category}</td>
                  <td className="col-content">{entry.content}</td>
                  <td className="col-date">{entry.date || '-'}</td>
                  <td className="col-note">{entry.note || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dept-preview">
      {/* 상단 요약 */}
      <div className="dept-preview-summary-bar">
        <span className="dept-form-dept-badge">{department}</span>
        <span className="dept-form-period-badge">
          {period.year}년 {period.month}월 {period.week}주차
        </span>
        <button className="dept-preview-back-btn" onClick={onBack}>
          <ChevronLeft size={14} /> 수정하기
        </button>
      </div>

      {/* 핵심 업무 그룹 (상단) */}
      <div className="dept-preview-section-group">
        <h3 className="dept-preview-group-title" style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.5rem', textAlign: 'left' }}>
          🔥 핵심 업무 실적 및 계획 (Key Tasks)
        </h3>
        <div className="dept-preview-tables-container">
          {renderTable(
            `📊 핵심 실적 (${period.performance_start} ~ ${period.performance_end})`,
            keyPerfEntries
          )}
          {renderTable(
            `📋 핵심 계획 (${period.plan_start} ~ ${period.plan_end})`,
            keyPlanEntries
          )}
        </div>
      </div>

      {/* 주간 업무 그룹 (하단) */}
      <div className="dept-preview-section-group" style={{ marginTop: '0.75rem' }}>
        <h3 className="dept-preview-group-title" style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.5rem', textAlign: 'left' }}>
          📅 주간 일반 업무 실적 및 계획 (Weekly Tasks)
        </h3>
        <div className="dept-preview-tables-container">
          {renderTable(
            `📊 주간 실적 (${period.performance_start} ~ ${period.performance_end})`,
            weeklyPerfEntries
          )}
          {renderTable(
            `📋 주간 계획 (${period.plan_start} ~ ${period.plan_end})`,
            weeklyPlanEntries
          )}
        </div>
      </div>

      {/* PPTX 다운로드 */}
      <div className="dept-download-section">
        <div className="dept-download-info">
          <h3>📥 PPTX 내보내기</h3>
          <p>
            {department} — 실적 {perfEntries.length}건, 계획 {planEntries.length}건이
            원본 PPT 양식에 반영되어 PPTX 파일로 생성됩니다.
          </p>
        </div>
        <button
          className="dept-download-btn"
          onClick={handleBuildDownload}
          disabled={buildState === 'building'}
        >
          {buildState === 'building' ? (
            <><Loader size={18} className="dept-spinner" /> 생성 중...</>
          ) : buildState === 'done' ? (
            <><CheckCircle size={18} /> 완료! 다시 받기</>
          ) : (
            <><Download size={18} /> PPTX 다운로드</>
          )}
        </button>
      </div>

      {buildState === 'error' && (
        <div className="dept-error">
          <AlertCircle size={14} /> {buildError}
        </div>
      )}
    </div>
  );
};

export default DeptReportPreview;
