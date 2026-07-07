/**
 * 무림AI-ON 채팅 UI 관련 유틸리티 함수 (Chat UI Utilities)
 * 
 * 인용구 매칭, 마크다운 파싱, 아코디언 뷰 변환을 위한 헬퍼 함수들을 제공합니다.
 */

/**
 * 텍스트 전체에서 인용구를 추출하고, LLM이 임의로 생성한 출처 목록을 제거하며, 인용구를 HTML 링크로 사전 치환하는 함수
 * @param {string} text - 원본 텍스트
 * @param {Array} sources - 검색된 원본 출처 목록
 * @returns {object} - { cleanText: 치환된 본문 텍스트, citationList: 추출된 인용구 목록 }
 */
export const processCitations = (text, sources = []) => {
  let citationIndex = 1;
  const citationList = []; // { num, title, url }
  const citationUrlMap = new Map(); // url -> num
  const citationTitleMap = new Map(); // title -> num
  
  const lines = text.split('\n');
  let inRef = false;
  const strippedLines = [];
  
  // 마크다운 링크인 경우를 제외하기 위해 뒤에 '('가 오지 않는 경우만 매칭
  const bracketsRegex = /\[(?:문서\s*\(.*?\)\s*-\s*)?([^\]]+?\.(?:docx|pptx|pdf|xlsx|txt))\](?!\()/gi;
  
  for (let line of lines) {
    if (line.includes('참고 문서 출처') || line.includes('참고자료') || line.includes('출처:')) {
      inRef = true;
    }
    
    line.replace(/\[(.*?)\]\((.*?)\)/g, (match, title, url) => {
      const cTitle = title.replace(/\*\*|\*/g, '').trim();
      const cUrl = url.trim();
      if (!citationUrlMap.has(cUrl) && !citationTitleMap.has(cTitle)) {
        citationUrlMap.set(cUrl, citationIndex);
        citationTitleMap.set(cTitle, citationIndex);
        
        // sources 배열에서 일치하는 파일명을 찾아 유사도 점수(Similarity Score) 추출
        const matched = sources.find(src => {
          const srcName = src.file_name.toLowerCase();
          const queryName = cTitle.toLowerCase();
          const srcBase = srcName.split('.')[0];
          const queryBase = queryName.split('.')[0];
          return srcName.includes(queryName) || queryName.includes(srcName) || srcBase.includes(queryBase) || queryBase.includes(srcBase);
        });
        const score = matched ? matched.score : undefined;
        
        citationList.push({ num: citationIndex, title: cTitle, url: cUrl, score: score });
        citationIndex++;
      }
    });
    
    line.replace(bracketsRegex, (match, fileNameOnly) => {
      const cleanName = fileNameOnly.replace(/\*\*|\*/g, '').trim();
      const matched = sources.find(src => {
        const srcName = src.file_name.toLowerCase();
        const queryName = cleanName.toLowerCase();
        const srcBase = srcName.split('.')[0];
        const queryBase = queryName.split('.')[0];
        return srcName.includes(queryName) || queryName.includes(srcName) || srcBase.includes(queryBase) || queryBase.includes(srcBase);
      });
      if (matched) {
        const cUrl = matched.web_view_link;
        const cTitle = matched.file_name;
        if (!citationUrlMap.has(cUrl) && !citationTitleMap.has(cTitle)) {
          citationUrlMap.set(cUrl, citationIndex);
          citationTitleMap.set(cTitle, citationIndex);
          citationList.push({ num: citationIndex, title: cTitle, url: cUrl, score: matched.score });
          citationIndex++;
        }
      }
    });
    
    // 출처 섹션이 아닐 때만 본문에 유지
    if (!inRef) {
      strippedLines.push(line);
    }
  }
  
  let cleanText = strippedLines.join('\n');
  
  // 본문 내 인용구를 [1] 형태의 HTML로 치환
  cleanText = cleanText.replace(/\[(.*?)\]\((.*?)\)/g, (match, title, url) => {
    const cUrl = url.trim();
    const cTitle = title.replace(/\*\*|\*/g, '').trim();
    const num = citationUrlMap.get(cUrl);
    return num ? `<a href="${cUrl}" target="_blank" rel="noopener noreferrer" class="chat-citation-link" title="참고 문서: ${cTitle}">[${num}]</a>` : match;
  });
  
  cleanText = cleanText.replace(bracketsRegex, (match, fileNameOnly) => {
    const cleanName = fileNameOnly.replace(/\*\*|\*/g, '').trim();
    const matched = sources.find(src => {
      const srcName = src.file_name.toLowerCase();
      const queryName = cleanName.toLowerCase();
      const srcBase = srcName.split('.')[0];
      const queryBase = queryName.split('.')[0];
      return srcName.includes(queryName) || queryName.includes(srcName) || srcBase.includes(queryBase) || queryBase.includes(srcBase);
    });
    if (matched) {
      const cUrl = matched.web_view_link;
      const num = citationUrlMap.get(cUrl);
      return num ? `<a href="${cUrl}" target="_blank" rel="noopener noreferrer" class="chat-citation-link" title="참고 문서: ${matched.file_name}">[${num}]</a>` : match;
    }
    return `<span class="chat-citation-unlinked" title="참고 문서: ${cleanName}">[${cleanName}]</span>`;
  });
  
  return { cleanText, citationList };
};

/**
 * 마크다운 형식(**볼드**, 리스트)을 안전한 HTML로 파싱하는 경량 렌더러
 * @param {string} text - 원본 마크다운 텍스트
 * @returns {string} - 변환된 HTML 텍스트
 */
export const renderMarkdown = (text) => {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    // <a> 및 <span> 태그를 보호하기 위해 기본적인 HTML 이스케이프는 제한적으로 적용하거나 생략
    ;
    
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  let inList = false;
  let processedLines = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.substring(2);
      let prefix = '';
      if (!inList) {
        inList = true;
        prefix = '<ul class="chat-list">';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = '';
      if (inList) {
        inList = false;
        suffix = '</ul>';
      }
      return `${suffix}${line}`;
    }
  });
  
  if (inList) {
    processedLines[processedLines.length - 1] += '</ul>';
  }
  
  return processedLines.join('<br />');
};

/**
 * 소제목 단위로 텍스트를 구조화하여 아코디언 변환 가능 여부를 식별하는 함수
 * @param {string} text - 원본 텍스트
 * @returns {object|null} - 아코디언 뷰를 위한 구조화 데이터 { intro, sections }, 아코디언이 불가능하면 null 반환
 */
export const parseToAccordion = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const introLines = [];
  const sections = [];
  let currentSection = null;
  
  // '1. 제목' 형태만 매칭하고 '3.1' 이나 '3. 1.' 같은 하위 항목은 본문으로 처리하도록 (?!\d) 적용
  const titleRegex = /^(?:\*\*|\s*###?\s*)?(\d+)\.\s+(?!\d)(.*?)(?:\*\*|$)/;
  
  for (let line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(titleRegex);
    
    if (match) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        number: match[1],
        title: match[2] ? match[2].trim() : "",
        contentLines: []
      };
    } else {
      if (currentSection) {
        if (!currentSection.title && trimmed) {
          currentSection.title = trimmed.replace(/\*\*|\*/g, '').replace(/<[^>]+>/g, '');
        } else {
          currentSection.contentLines.push(line);
        }
      } else {
        introLines.push(line);
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  if (sections.length === 0) {
    return null;
  }
  
  return {
    intro: introLines.join('\n'),
    sections: sections.map(s => ({
      number: s.number,
      title: s.title || `단계 ${s.number}`,
      content: s.contentLines.join('\n')
    }))
  };
};
