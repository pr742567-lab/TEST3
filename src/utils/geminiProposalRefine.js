/**
 * Gemini API를 활용한 개선 제안서 내용 다듬기 유틸리티
 * TEST2 환경에 저장된 Gemini API Key를 기본으로 자동 사용합니다.
 */

// TEST2에 설정된 실제 Gemini API Key 목록
const PRIMARY_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBzKeB2cM70cTLoz0WjlmqVtVsg0DRxhok';
const BACKUP_GEMINI_KEY = 'AIzaSyDTlNCA-i0PVyduZlM9ykzQGpf7abHugK4';

/**
 * 문제점, 개선안, 기대효과 텍스트를 Gemini AI로 전문적으로 다듬습니다.
 */
export async function refineProposalWithGemini({ problem, improvement, expectedEffect }) {
  const prompt = `
당신은 제조업 및 사내 업무 혁신을 위한 '개선 제안서' 작성 전문 AI 컨설턴트입니다.
사용자가 입력한 다음 [문제점], [개선안], [기대효과]의 내용을 토대로, 표준 개선 제안서 양식에 맞는 명확하고 설득력 있는 전문 비즈니스 문장으로 다듬어 주세요.

[작성 가이드라인]
1. 말투 및 어조:
   - 명사형 종결(예: ~함, ~발생됨, ~확보 등) 또는 간결한 개조식 문장 스타일 적용
   - 불필요한 군더더기 표현을 제거하고, 핵심 사실과 조치 위주로 서술
2. 문제점 (현상 및 원인):
   - 현장에서 발생하는 문제 현상과 그로 인한 불편/비효율의 원인이 구체적으로 드러나도록 작성
3. 개선안 (개선 내용 및 방법):
   - 구체적인 조치 내용, 변경 절차, 해결 방안이 단계적이고 실현 가능하게 작성
4. 기대효과:
   - 정량적 효과(원가 절감, 시간 단축, 불량률 감소 등)와 정성적 효과(안전성 향상, 작업 편의성 증대, 환경 개선 등)가 뚜렷하게 부각되도록 정리

[사용자 입력 원문]
- 문제점: ${problem || '(입력 내용 없음)'}
- 개선안: ${improvement || '(입력 내용 없음)'}
- 기대효과: ${expectedEffect || '(입력 내용 없음)'}

반드시 다른 설명 없이 아래 JSON 포맷으로만 응답해 주세요:
\`\`\`json
{
  "problem": "다듬어진 문제점 내용",
  "improvement": "다듬어진 개선안 내용",
  "expected_effect": "다듬어진 기대효과 내용"
}
\`\`\`
`.trim();

  const keys = [PRIMARY_GEMINI_KEY, BACKUP_GEMINI_KEY].filter(Boolean);
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const key of keys) {
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // JSON 파싱 (코드 블록 및 정규식 처리)
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          return {
            problem: parsed.problem || problem,
            improvement: parsed.improvement || improvement,
            expected_effect: parsed.expected_effect || expectedEffect
          };
        }
        
        throw new Error('AI 응답 파싱 실패');
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] ${model} (Key: ${key.slice(0, 8)}...) 호출 실패:`, err);
      }
    }
  }

  throw lastError || new Error('내용 다듬기 호출에 실패했습니다.');
}
