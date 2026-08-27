import { Cpu, ExternalLink } from 'lucide-react';

/**
 * 웍스AI(WorksAI) 외부 서비스로 접속할 수 있는 바로가기 버튼 컴포넌트입니다.
 */
const WorksAIButton = () => {
  // 버튼 클릭 시 웍스AI 웹사이트를 새 탭에서 열어줍니다.
  const handleOpenWorksAI = () => {
    window.open('https://wrks.ai/ko/agent', '_blank', 'noopener,noreferrer');
  };

  return (
    <button 
      onClick={handleOpenWorksAI}
      className="works-ai-btn"
      aria-label="웍스AI 웹사이트로 이동"
    >
      <div className="works-ai-btn-content">
        <Cpu size={18} />
        <span>웍스AI 바로가기</span>
      </div>
      <ExternalLink size={14} style={{ opacity: 0.8 }} />
    </button>
  );
};

export default WorksAIButton;
