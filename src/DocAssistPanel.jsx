import React, { useState } from 'react';
import { FileText, Lightbulb } from 'lucide-react';
import DeptReportTab from './DeptReportTab';
import ImprovementProposalTab from './ImprovementProposalTab';
import './DocAssistPanel.css';


/**
 * 문서 어시스트 메인 패널 컴포넌트 (Component)
 * - 문서 유형 선택 허브 역할을 합니다.
 * - 선택 시 해당 워크플로우 화면으로 전환됩니다.
 *   1. 진주공장 주요 업무보고 (DeptReportTab)
 *   2. 개선 제안서 (ImprovementProposalTab) - 추후 구현
 */
const DocAssistPanel = ({ messages = [] }) => {
  // 선택된 문서 유형 (null: 선택 화면, 'weekly_report': 주요업무보고, 'improvement_proposal': 개선 제안서)
  const [selectedDocType, setSelectedDocType] = useState(null);

  // 문서 유형 선택 화면으로 돌아가기
  const handleBack = () => setSelectedDocType(null);

  // 선택된 문서 유형에 따라 화면 전환
  if (selectedDocType === 'weekly_report') {
    return <DeptReportTab messages={messages} onBack={handleBack} />;
  }

  if (selectedDocType === 'improvement_proposal') {
    return <ImprovementProposalTab onBack={handleBack} />;
  }

  // 기본: 문서 유형 선택 화면
  return (
    <div className="doc-assist-panel">
      {/* 헤더 영역 */}
      <div className="content-header">
        <h2>📄 문서 어시스트</h2>
        <div className="content-subheader-container">
          <span className="slogan-badge">문서 자동 생성</span>
          <span className="slogan-desc">AI가 도와주는 스마트 문서 작성 — 작성할 문서 유형을 선택하세요</span>
        </div>
      </div>

      {/* 웰컴 카드 (OJT 패밀리룩) */}
      <div className="doc-welcome-card">
        <span className="doc-welcome-icon">✍️</span>
        <h3>문서 작성을 시작하세요</h3>
        <p>
          작성할 문서 유형을 선택하면,<br />
          AI가 내용을 다듬고 표준 양식에 맞춰 자동으로 문서를 생성합니다.
        </p>
      </div>

      {/* 문서 유형 선택 카드 */}
      <div className="doc-type-selector">
        <div
          className="doc-type-card"
          onClick={() => setSelectedDocType('weekly_report')}
        >
          <div className="doc-type-card-icon weekly-report">
            <FileText size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>진주공장 주요 업무보고</h3>
            <p>부서를 선택하고 업무 내용만 입력하면 AI가 다듬어 PPT를 자동 생성합니다</p>
          </div>
          <div className="doc-type-card-badge">PPT</div>
          <div className="doc-type-card-arrow">→</div>
        </div>

        <div
          className="doc-type-card"
          onClick={() => setSelectedDocType('improvement_proposal')}
        >
          <div className="doc-type-card-icon improvement-proposal">
            <Lightbulb size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>개선 제안서</h3>
            <p>문제점과 개선안을 입력하면 AI가 다듬어 제안서 양식에 맞는 Excel을 자동 생성합니다</p>
          </div>
          <div className="doc-type-card-badge">Excel</div>
          <div className="doc-type-card-arrow">→</div>
        </div>
      </div>

      {/* 안내 기능 카드 */}
      <div className="doc-feature-cards">
        <div className="doc-feature-card">
          <span className="doc-feature-card-icon">🤖</span>
          <div className="doc-feature-card-body">
            <h4>AI 문장 다듬기</h4>
            <p>입력한 내용을 비즈니스 문서에 적합한 문체로 자동 다듬어 줍니다.</p>
          </div>
        </div>
        <div className="doc-feature-card">
          <span className="doc-feature-card-icon">📊</span>
          <div className="doc-feature-card-body">
            <h4>양식 자동 적용</h4>
            <p>회사 표준 양식(PPT/Excel)에 맞춰 자동으로 포맷하여 다운로드할 수 있습니다.</p>
          </div>
        </div>
        <div className="doc-feature-card">
          <span className="doc-feature-card-icon">👁️</span>
          <div className="doc-feature-card-body">
            <h4>실시간 미리보기</h4>
            <p>작성 중인 문서를 실시간으로 미리보며 수정할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocAssistPanel;
