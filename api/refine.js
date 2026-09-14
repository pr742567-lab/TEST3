// Vercel Serverless Function: Gemini API 프록시 엔드포인트
// 서버 환경에서 안전하게 GEMINI_API_KEY를 호출하므로 클라이언트에 키가 노출되지 않습니다.

export default async function handler(req, res) {
  // CORS 및 메서드 제어
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: '서버에 GEMINI_API_KEY 또는 GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다. Vercel Settings -> Environment Variables에 키를 등록해주세요.' 
    });
  }

  const { problem, improvement, expectedEffect } = req.body || {};

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

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
      
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        return res.status(200).json({
          problem: parsed.problem || problem,
          improvement: parsed.improvement || improvement,
          expected_effect: parsed.expected_effect || expectedEffect
        });
      }

      throw new Error('AI 응답 파싱 실패');
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Serverless] ${model} 호출 실패:`, err.message);
    }
  }

  return res.status(500).json({
    error: lastError ? lastError.message : '내용 다듬기 호출에 실패했습니다.'
  });
}
