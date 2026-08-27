import React, { useState } from 'react';
import { FileText, Lightbulb, AlertTriangle, FileCheck } from 'lucide-react';
import DeptReportTab from './DeptReportTab';
import ImprovementProposalTab from './ImprovementProposalTab';
import RiskAssessmentTab from './RiskAssessmentTab';
import DraftDocumentTab from './DraftDocumentTab';
import './DocAssistPanel.css';


/**
 * 문서 어시스트 메인 패널 컴포넌트 (Component)
 * - 문서 유형 선택 허브 역할을 합니다.
 * - 선택 시 해당 워크플로우 화면으로 전환됩니다.
 *   1. 진주공장 주요 업무보고 (DeptReportTab)
 *   2. 개선 제안서 (ImprovementProposalTab) - 추후 구현
 */
const DocAssistPanel = ({
  messages = [],
  selectedDocType: propDocType,
  onSelectDocType,
  onBack: propOnBack
}) => {
  // 외부 props가 없을 경우를 대비한 내부 fallback 상태
  const [internalDocType, setInternalDocType] = useState(null);
  const selectedDocType = propDocType !== undefined ? propDocType : internalDocType;

  const handleSelectDocType = (type) => {
    if (onSelectDocType) {
      onSelectDocType(type);
    } else {
      setInternalDocType(type);
    }
  };

  // 모달 상태 관리 (준비 중 안내 목적)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 문서 유형 선택 화면으로 돌아가기
  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      setInternalDocType(null);
    }
  };

  // 선택된 문서 유형에 따라 화면 전환
  if (selectedDocType === 'weekly_report') {
    return <DeptReportTab messages={messages} onBack={handleBack} />;
  }

  if (selectedDocType === 'improvement_proposal') {
    return <ImprovementProposalTab onBack={handleBack} />;
  }

  if (selectedDocType === 'risk_assessment') {
    return <RiskAssessmentTab onBack={handleBack} />;
  }

  if (selectedDocType === 'draft_document') {
    return <DraftDocumentTab onBack={handleBack} />;
  }

  // 기본: 문서 유형 선택 화면
  return (
    <div className="doc-assist-panel">
      {/* 헤더 영역 */}
      <div className="content-header">
        <h2>📄 문서 어시스트</h2>
        <div className="content-subheader-container">
          <span className="slogan-badge">문서 자동 생성</span>
          <span className="slogan-desc">더 스마트한 문서 작성 — 작성할 문서 유형을 선택하세요</span>
        </div>
      </div>

      {/* 웰컴 카드 (OJT 패밀리룩) */}
      <div className="doc-welcome-card">
        <span className="doc-welcome-icon">✍️</span>
        <h3>문서 작성을 시작하세요</h3>
        <p>
          작성할 문서 유형을 선택하면,<br />
          내용을 깔끔하게 다듬고 표준 양식에 맞춰 자동으로 문서를 생성합니다.
        </p>
      </div>

      {/* 문서 유형 선택 카드 */}
      <div className="doc-type-selector">
        <div
          className="doc-type-card"
          id="doc-card-weekly-report"
          onClick={() => handleSelectDocType('weekly_report')}
        >
          <div className="doc-type-card-icon weekly-report">
            <FileText size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>진주공장 주요 업무보고</h3>
            <p>부서를 선택하고 업무 내용만 입력하면 내용을 정리하여 PPT를 자동 생성합니다</p>
          </div>
          <div className="doc-type-card-badge">PPT</div>
          <div className="doc-type-card-arrow">→</div>
        </div>

        <div
          className="doc-type-card"
          id="doc-card-improvement-proposal"
          onClick={() => handleSelectDocType('improvement_proposal')}
        >
          <div className="doc-type-card-icon improvement-proposal">
            <Lightbulb size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>개선 제안서</h3>
            <p>문제점과 개선안을 입력하면 내용을 정리하여 제안서 양식에 맞는 Excel을 자동 생성합니다</p>
          </div>
          <div className="doc-type-card-badge">Excel</div>
          <div className="doc-type-card-arrow">→</div>
        </div>

        {/* 신규 추가: 위험성 평가 */}
        <div
          className="doc-type-card"
          id="doc-card-risk-assessment"
          onClick={() => handleSelectDocType('risk_assessment')}
        >
          <div className="doc-type-card-icon risk-assessment">
            <AlertTriangle size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>위험성 평가</h3>
            <p>작업 프로세스와 위험 요인을 입력하면 이를 분석하여 위험성평가표를 작성합니다</p>
          </div>
          <div className="doc-type-card-badge">Excel</div>
          <div className="doc-type-card-arrow">→</div>
        </div>

        {/* 신규 추가: 품의서 */}
        <div
          className="doc-type-card"
          id="doc-card-draft-document"
          onClick={() => handleSelectDocType('draft_document')}
        >
          <div className="doc-type-card-icon draft-document">
            <FileCheck size={32} />
          </div>
          <div className="doc-type-card-content">
            <h3>품의서</h3>
            <p>작성 목적 및 결재 요약 사항을 입력하면 표준 양식의 기안문을 자동 작성합니다</p>
          </div>
          <div className="doc-type-card-badge">Word</div>
          <div className="doc-type-card-arrow">→</div>
        </div>
      </div>

      {/* 안내 기능 카드 */}
      <div className="doc-feature-cards">
        <div className="doc-feature-card">
          <span className="doc-feature-card-icon">✨</span>
          <div className="doc-feature-card-body">
            <h4>문장 자동 다듬기</h4>
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

      {/* 글로벌 알림 모달 창 (준비 중 안내 목적) */}
      {isModalOpen && (
        <div className="custom-modal-overlay" id="doc-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="custom-modal-content" id="doc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>💡 안내</h3>
              <button className="custom-modal-close" id="doc-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="custom-modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="custom-modal-footer">
              <button className="custom-modal-confirm-btn" id="doc-modal-confirm" onClick={() => setIsModalOpen(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocAssistPanel;
