import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 24시간 오프라인 프로토타입 시연용 API Mocking (window.fetch 가로채기)
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  console.log("Mocked Fetch request:", url, options);
  
  // 1. 부서 및 카테고리 정보 조회 API
  if (url.includes('/api/dept-report/departments')) {
    return new Response(JSON.stringify({
      departments: ['진주공장 기획팀', '진주공장 생산1팀', '진주공장 생산2팀', '진주공장 설비지원팀'],
      categories: {
        '진주공장 기획팀': ['생산 실적 분석', '예산 관리', '안전 관리'],
        '진주공장 생산1팀': ['PM3 생산 일지', '원료 배합 점검', '설비 가동율'],
        '진주공장 생산2팀': ['PM4 생산 일지', '지종 교체 작업', '품질 분석'],
        '진주공장 설비지원팀': ['PM3 1P Nip 점검', '모터 오버홀', '정기 보수 계획']
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 2. 업무보고 AI 정제 API
  if (url.includes('/api/dept-report/refine')) {
    await new Promise(resolve => setTimeout(resolve, 800)); // 0.8초 딜레이
    let requestData = {};
    try {
      requestData = JSON.parse(options.body);
    } catch(e){}
    
    const refinedEntries = (requestData.entries || []).map(entry => ({
      ...entry,
      refined_content: `💡 [AI 자동 보완 완료] ${entry.content || '업무 실적'}에 대해 사내 표준 가이드에 따라 보고서용 전문 문구로 매끄럽게 정제하고 가독성을 확보하였습니다.`
    }));
    
    return new Response(JSON.stringify({
      refined_entries: refinedEntries
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. PPT / Excel 다운로드 API (더미 파일 다운로드)
  if (url.includes('/api/dept-report/build-pptx') || url.includes('/api/doc-assist/build-pptx') || url.includes('/api/proposal/build-xlsx')) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 빌드 딜레이
    const blob = new Blob(["dummy moorim report content"], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="Moorim_Report.pptx"'
      }
    });
  }
  
  // 4. 개선제안서 AI 정제 API
  if (url.includes('/api/proposal/refine')) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return new Response(JSON.stringify({
      title: "PM3 Nip 압력 불균형 해소를 위한 유압 밸브 비례 제어 개선",
      problem: "PM3 1P 닙 압력이 비접촉 각도 변음 및 종이 중량 증가 시 비례 제어 지연으로 불균형이 발생하여 지결 등의 품질 저하 우려가 있음.",
      solution: "유압 제어 비례 밸브의 피드백 응답 튜닝 및 플랫 센서 데이터 샘플링 속도 2배 증가로 선제적 대응 체계 구축.",
      effect: "닙 압력 편차 5kg/cm2 이내 유지율 98%로 향상 및 스풀 인장 품질 안정성 확보."
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 5. 문서 어시스트 템플릿 목록 API
  if (url.includes('/api/doc-assist/templates')) {
    return new Response(JSON.stringify({
      templates: [
        { id: 1, filename: "기본_업무보고_양식_v1.pptx", description: "진주공장 표준 주간/월간 업무 보고 양식" },
        { id: 2, filename: "기획조정실_프레젠테이션_양식.pptx", description: "대외 보고 및 기획안 전용 템플릿" }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 6. 문서 어시스트 초안 생성 API
  if (url.includes('/api/doc-assist/generate-draft')) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return new Response(JSON.stringify({
      slides: [
        { title: "PM3 Nip 압력 불균형 분석", content: "- 닙 압력 저하 감지 기준 5kg/cm2 초과\n- 원인: 프라이머리 암 이동에 따른 스풀 중량 상쇄 오차" },
        { title: "대책 및 조치 사항", content: "- 비례 제어 밸브 유압 튜닝\n- 플랫 센서 정밀 캘리브레이션 실시" }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 7. 문서 어시스트 텍스트 개선 API
  if (url.includes('/api/doc-assist/refine-text')) {
    await new Promise(resolve => setTimeout(resolve, 600));
    let requestData = {};
    try {
      requestData = JSON.parse(options.body);
    } catch(e){}
    return new Response(JSON.stringify({
      refined_text: `✨ [AI 텍스트 정제] ${requestData.text || '본문'} 내용에 대한 논리적 연계성과 가독성을 강화하였습니다.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 기본 fallback
  try {
    return await originalFetch(url, options);
  } catch(e) {
    console.error("Original fetch failed, fallback mock returned for:", url);
    return new Response(JSON.stringify({ error: "Network error, mocked fallback" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

