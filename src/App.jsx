import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Send, 
  Settings, 
  Folder, 
  BookOpen, 
  RefreshCw, 
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  Home,
  Compass,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import DocAssistPanel from './DocAssistPanel';
import OjtGuidePanel from './OjtGuidePanel';
import { STATIC_SUGGESTIONS } from './data/staticSuggestions';
import { processCitations, renderMarkdown, parseToAccordion } from './utils/chatUtils';
import { API_BASE_URL } from './utils/api';
import WorksAIButton from './WorksAIButton';


// 아코디언 컴포넌트 제거 -> 일반 마크다운 및 타이핑 애니메이션 적용 컴포넌트로 변경
const AccordionMessage = React.memo(({ content, sources = [], isTyping = false }) => {
  const { cleanText, citationList } = React.useMemo(() => {
    return processCitations(content, sources);
  }, [content, sources]);

  const renderReferenceList = () => {
    const listToRender = citationList.length > 0 ? citationList : (sources || []).map(src => ({
      num: src.num || src.number || 1,
      title: src.title || src.file_name || '',
      url: src.url || src.web_view_link || '#',
      score: src.score
    }));

    if (listToRender.length === 0) return null;
    return (
      <div className="reference-list-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={16} /> <span>참고 문서 출처</span>
        </div>
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {listToRender.sort((a, b) => a.num - b.num).map(cit => (
            <li key={cit.num} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="chat-citation-link" style={{ flexShrink: 0 }}>
                [{cit.num}]
              </span>
              <span style={{ color: 'var(--text-primary)', textDecoration: 'none' }} className="citation-filename-link">
                {cit.title}
              </span>
              {cit.score !== undefined && cit.score !== null && (
                <span className="citation-score-badge" style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontWeight: '500',
                  marginLeft: '0.25rem',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {(cit.score * 100).toFixed(1)}% 유사
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="markdown-wrapper">
      <div 
        className="markdown-content"
        style={{ position: 'relative', display: 'inline-block', width: '100%' }}
      >
        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanText) }} />
        {isTyping && <span className="typing-cursor">█</span>}
      </div>
      {!isTyping && renderReferenceList()}
    </div>
  );
});

function App() {
  // 활성화된 메뉴 관리 (초기 화면을 홈으로 설정)
  const [activeMenu, setActiveMenu] = useState('home');
  
  // 선택된 카테고리 탭 상태 변수 (디폴트: null - 카드 형태의 선택기 노출)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 카테고리별 개별 대화 세션 상태 (트러블슈팅, 작업표준, 위험성평가, 개선제안)
  const [chatSessions, setChatSessions] = useState({
    "트러블슈팅": [],
    "작업표준": [],
    "위험성평가": [],
    "개선제안": []
  });

  // 현재 카테고리에 해당하는 메시지 목록 유도 (기존 messages 변수 참조 코드 호환성 유지)
  const messages = selectedCategory ? (chatSessions[selectedCategory] || []) : [];
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 모바일 사이드바 열림 상태 제어 (사이드바 제거로 미사용 처리 가능)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 홈 화면 초기화 리셋 함수 (로고 클릭 시 홈 화면으로 이동)
  const handleResetHome = () => {
    setChatSessions({
      "트러블슈팅": [],
      "작업표준": [],
      "위험성평가": [],
      "개선제안": []
    });
    setActiveMenu('home');
    setIsSidebarOpen(false);
  };
  
  // 글로벌 커스텀 안내 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // 동적 추천 질문 목록 상태
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);

  // 컴포넌트 마운트 시 영구적으로 라이트 테마 강제 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  // selectedCategory 상태 변경 시 추천 질문을 로컬에서 즉시 갱신하는 useEffect (Mocking)
  useEffect(() => {
    if (!selectedCategory) {
      setSuggestions([]);
      return;
    }
    const pool = STATIC_SUGGESTIONS[selectedCategory] || [];
    let suggestionsList = [...pool];
    
    // 만약 '트러블슈팅' 카테고리라면, 맨 앞에 시연용 핵심 질문 2개를 강제 고정!
    if (selectedCategory === '트러블슈팅') {
      const targetQuestion1 = "PM3 1P Nip 압력 불균형 점검 및 조치하려면?";
      const targetQuestion2 = "폐수 처리장 용존산소량(DO) 급감 시 폭기조 송풍기 점검";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion1 && sug.text !== targetQuestion2);
      suggestionsList.unshift({ text: targetQuestion2 });
      suggestionsList.unshift({ text: targetQuestion1 });
    } else if (selectedCategory === '작업표준') {
      const targetQuestion = "CM2 Cut Knife 교체하는 방법은?";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion);
      suggestionsList.unshift({ text: targetQuestion });
    } else if (selectedCategory === '위험성평가') {
      const targetQuestion = "CM2 가동 전 발생할 수 있는 위험 요인은?";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion);
      suggestionsList.unshift({ text: targetQuestion });
    } else if (selectedCategory === '개선제안') {
      const targetQuestion = "PM3 Reel Scanner Ash Sensor 작동 불량 개선";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion);
      suggestionsList.unshift({ text: targetQuestion });
    } else if (selectedCategory === '업무매뉴얼') {
      const targetQuestion1 = "자재관리파트의 고정자산 처분 절차는 어떻게 되나요?";
      const targetQuestion2 = "생산부의 원단위 분석 및 실적 산출 방법은 무엇인가요?";
      const targetQuestion3 = "품질보증파트의 인증 관리 업무 절차는 어떻게 되나요?";
      suggestionsList = suggestionsList.filter(sug => sug.text !== targetQuestion1 && sug.text !== targetQuestion2 && sug.text !== targetQuestion3);
      suggestionsList.unshift({ text: targetQuestion3 });
      suggestionsList.unshift({ text: targetQuestion2 });
      suggestionsList.unshift({ text: targetQuestion1 });
    }
    
    // 무작위 셔플 후 상위 3개만 매핑 (고정 질문은 무조건 처음에 유지)
    if (selectedCategory === '트러블슈팅') {
      const targetQuestion1 = "PM3 1P Nip 압력 불균형 점검 및 조치하려면?";
      const targetQuestion2 = "폐수 처리장 용존산소량(DO) 급감 시 폭기조 송풍기 점검";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion1 && sug.text !== targetQuestion2);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion1 }, { text: targetQuestion2 }, ...shuffledRest.slice(0, 1)]);
    } else if (selectedCategory === '작업표준') {
      const targetQuestion = "CM2 Cut Knife 교체하는 방법은?";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion }, ...shuffledRest.slice(0, 2)]);
    } else if (selectedCategory === '위험성평가') {
      const targetQuestion = "CM2 가동 전 발생할 수 있는 위험 요인은?";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion }, ...shuffledRest.slice(0, 2)]);
    } else if (selectedCategory === '개선제안') {
      const targetQuestion = "PM3 Reel Scanner Ash Sensor 작동 불량 개선";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion }, ...shuffledRest.slice(0, 2)]);
    } else if (selectedCategory === '업무매뉴얼') {
      const targetQuestion1 = "자재관리파트의 고정자산 처분 절차는 어떻게 되나요?";
      const targetQuestion2 = "생산부의 원단위 분석 및 실적 산출 방법은 무엇인가요?";
      const targetQuestion3 = "품질보증파트의 인증 관리 업무 절차는 어떻게 되나요?";
      const rest = suggestionsList.filter(sug => sug.text !== targetQuestion1 && sug.text !== targetQuestion2 && sug.text !== targetQuestion3);
      const shuffledRest = [...rest].sort(() => 0.5 - Math.random());
      setSuggestions([{ text: targetQuestion1 }, { text: targetQuestion2 }, { text: targetQuestion3 }, ...shuffledRest.slice(0, 0)]);
    } else {
      const shuffled = [...suggestionsList].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 3));
    }
  }, [selectedCategory]);

  // 대화 추가 시 자동 스크롤
  useEffect(() => {
    if (activeMenu === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeMenu]);

  // 질문 전송 처리 (사용자 질의응답 - 하드코딩 및 타이핑 효과 시뮬레이션 적용)
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading || !selectedCategory) return;

    if (!textToSend) {
      setInputText('');
    }

    // 1. 사용자 메시지 화면 추가
    const userMsg = { role: 'user', content: query };
    setChatSessions(prev => ({
      ...prev,
      [selectedCategory]: [...(prev[selectedCategory] || []), userMsg]
    }));
    setIsLoading(true);

    // 모바일 환경일 경우 질문 전송 시 사이드바를 자동으로 닫음
    setIsSidebarOpen(false);

    // 질문 검색 매칭 분석을 위한 정형화
    const normalizedQuery = query.replace(/\s+/g, '').toLowerCase();
    
    // 1. 트러블슈팅: PM3 닙 압력 관련
    const isNipPressureScenario = 
      normalizedQuery.includes("nip") || 
      normalizedQuery.includes("닙압력") || 
      normalizedQuery.includes("압력불균형") || 
      normalizedQuery.includes("압력저하") ||
      normalizedQuery.includes("pm3");

    // 2. 작업표준: CM2 언와인더 BP대차 이송
    const isBpCarrierScenario =
      normalizedQuery.includes("bp대차") ||
      normalizedQuery.includes("이송작업표준") ||
      normalizedQuery.includes("대차이송") ||
      (normalizedQuery.includes("작업표준") && normalizedQuery.includes("언와인더"));

    // 3. 위험성평가: 초지기 와이어 고압 세척
    const isWireWashScenario =
      normalizedQuery.includes("와이어고압세척") ||
      normalizedQuery.includes("고압세척작업") ||
      (normalizedQuery.includes("위험성평가") && normalizedQuery.includes("와이어"));

    // 4. 개선제안: 초지기 건조부 스팀 응축수 회수율 제고
    const isSteamCondensateScenario =
      normalizedQuery.includes("응축수회수") ||
      normalizedQuery.includes("스팀응축수") ||
      (normalizedQuery.includes("개선제안") && normalizedQuery.includes("건조부")) ||
      (normalizedQuery.includes("개선방안") && normalizedQuery.includes("응축수"));

    // 5. 트러블슈팅: 폐수 처리장 용존산소량(DO) 급감 시 폭기조 송풍기 점검
    const isBlowerScenario =
      normalizedQuery.includes("용존산소량") ||
      normalizedQuery.includes("do급감") ||
      normalizedQuery.includes("폭기조송풍기") ||
      normalizedQuery.includes("송풍기점검") ||
      (normalizedQuery.includes("폐수") && normalizedQuery.includes("송풍기")) ||
      normalizedQuery.includes("blower");

    // 6. 작업표준: CM2 Cut Knife 교체하는 방법
    const isCutKnifeScenario =
      normalizedQuery.includes("cutknife") ||
      normalizedQuery.includes("컷나이프") ||
      normalizedQuery.includes("칼날교체") ||
      (normalizedQuery.includes("knife") && normalizedQuery.includes("교체")) ||
      normalizedQuery.includes("cm2cutknife");

    // 7. 위험성평가: 설비 기동 전 가드 안전 스위치 연동 정비 시 위험 요인
    const isGuardSafetyScenario =
      normalizedQuery.includes("가드안전스위치") ||
      normalizedQuery.includes("연동정비") ||
      normalizedQuery.includes("가드연동") ||
      normalizedQuery.includes("cm2가동전") ||
      normalizedQuery.includes("기동전가드") ||
      (normalizedQuery.includes("가동전") && normalizedQuery.includes("위험요인")) ||
      (normalizedQuery.includes("기동전") && normalizedQuery.includes("위험요인"));

    // 8. 개선제안: PM3 Reel Scanner Ash Sensor 작동 불량 개선
    const isAshSensorScenario =
      normalizedQuery.includes("ashsensor") ||
      normalizedQuery.includes("애쉬센서") ||
      normalizedQuery.includes("작동불량개선") ||
      normalizedQuery.includes("작동불량조치") ||
      normalizedQuery.includes("scanner") ||
      normalizedQuery.includes("스캐너작동");

    // 9. 업무매뉴얼: 자재관리파트의 고정자산 처분 절차
    const isAssetDispositionScenario =
      normalizedQuery.includes("고정자산") ||
      normalizedQuery.includes("처분") ||
      normalizedQuery.includes("자재관리");

    // 10. 업무매뉴얼: 생산부의 원단위 분석 및 실적 산출 방법
    const isUnitConsumptionScenario =
      normalizedQuery.includes("원단위") ||
      normalizedQuery.includes("실적산출") ||
      normalizedQuery.includes("생산부");

    // 11. 업무매뉴얼: 품질보증파트의 인증 관리 업무 절차
    const isCertificationScenario =
      normalizedQuery.includes("인증") ||
      normalizedQuery.includes("인증관리") ||
      normalizedQuery.includes("품질보증");

    let fullAnswer = "";
    let sources = [];
    let matched = false;

    if (isNipPressureScenario) {
      matched = true;
      fullAnswer = `PM3 1P Nip 압력 불균형 점검 및 조치에 대한 내용은 아래와 같습니다.

---

### 1. PM3 1P Nip 압력 불균형 점검 기준
PM3 1P Nip의 압력 불균형 또는 압력 저하를 점검하기 위한 제한 조건은 **329-PIC-3032**를 기준으로 합니다.
* **압력 High 조건**: 최대 **120kg/cm²**를 초과하지 않아야 합니다.
* **SV(Set Value)와 PV(Process Value) 값 차이**:
  * **상위**: **5kg/cm²**를 초과하지 않아야 합니다.
  * **하위**: **5kg/cm²**를 초과하지 않아야 합니다.
  * *이 값 이상으로 차이가 발생하면 압력 불균형 또는 저하를 의미합니다.*
* **MV(Manipulated Variable) 값 조건**: 최대 **100%**를 초과하지 않아야 합니다.

---

### 2. Nip 압력 제어 메커니즘 (일반)
Nip 압력은 스풀 중량, 클램프 압력, 리프팅 압력의 균형을 통해 제어됩니다. 특히 압력 변동 감지 및 유압 조정 과정을 통해 일정한 압력을 유지합니다.
* **Nip 압력 계산**: 
  N = 스풀 중량 + 클램프 압력 (프라이머리 클램프) - 리프팅 압력
  * 클램프 압력은 **36kg/㎠**으로 일정하게 유지됩니다.
  * 리프팅 압력은 필요한 닙 압력을 달성하기 위해 동적으로 조정됩니다.
* **Nip 압력 유지 메커니즘**: Nip 압력은 일반적으로 **2~4kg/㎠** 수준으로 유지됩니다. 이 과정은 다음 일련의 프로세스를 수행하여 Nip 압력 변화에 대응합니다.
  1. **플랫 센서**: 압력 변동을 지속적으로 감지합니다.
  2. **리프팅 실린더**: 플랫 센서의 감지 결과에 따라 유압을 조정합니다.
  3. **비례 제어 밸브**: 스풀 중량 증가(종이 무게 증가)나 접선 각도 변화에 따른 선압 감소와 같이 프라이머리 암 이동에 따라 발생하는 스풀 중량의 Nip 압력 영향을 상쇄합니다.

리프팅 실린더는 플랫 센서로부터 지속적인 피드백을 받아 Nip 압력을 안정적으로 유지합니다.`;
      sources = [
        { num: 1, title: '3.3.6_PM3 1P Nip 압력저하 원인 및 대책_20250528_V2.0.pptx', score: 0.764, url: '#' },
        { num: 2, title: '3.3.6_PM3 1P Nip 압력저하 원인 및 대책_20250528.pptx', score: 0.764, url: '#' },
        { num: 3, title: '5.1.5.1_와인더프라이머리 플렛센서 작동不_240724.pptx', score: 0.748, url: '#' }
      ];
    } else if (isBpCarrierScenario) {
      matched = true;
      fullAnswer = `CM2 언와인더 BP대차 이송 시 표준 작업 절차는 아래와 같습니다.

---

### 1. 작업 전 안전 점검 (Safety Check)
* **대차 브레이크 작동 상태**: 기계식 브레이크가 확실하게 해제 및 체결되는지 확인합니다.
* **이송 경로 내 장애물 제거**: 대차 바퀴 및 레일 주위에 낙지(폐지)나 이물질이 없는지 육안 점검합니다.
* **개인 보호구 착용 필수**: 안전모, 안전화, 안전장갑 착용 상태를 점검합니다.

---

### 2. 이송 작업 표준 절차
1. **BP 원지 권출 및 정렬**: 대차 위에 적재된 BP(Black Paper) 원지의 중심선과 권출 릴의 센터가 일치하는지 정렬합니다.
2. **이송 구동 활성화**: 수동 이송 핸들을 잡고 서서히 전진시키며, 크레인과의 간섭이 없는지 상시 모니터링합니다.
3. **도크 진입 및 고정**: 언와인더 프레임 도크(Dock)에 밀착시킨 후 레일 잠금 레버를 아래로 내려 차체를 완전히 고정합니다.
4. **리프팅 핀 결합**: 유압 실린더를 조작하여 대차의 리프팅 핀이 원지 샤프트 홈에 완벽히 체결되었는지 감지 센서 LED를 확인합니다.

---

### 3. 주요 주의 사항 (Key Points)
* **급출발 및 급제동 금지**: 원지 낙하로 인한 협착 재해 우려가 있으므로 이송 속도는 1.0m/s 이하로 제한합니다.
* **센서 오작동 시**: 대차 진입 센서가 정상 동작하지 않을 경우, 즉시 수동 제어로 전환하고 정비 조치 요청을 수행합니다.`;
      sources = [
        { num: 1, title: '1.1.2_CM2 언와인더 BP대차 이송작업표준서_20250210.pdf', score: 0.812, url: '#' },
        { num: 2, title: '1.1.4_CM2 언와인더 기동전 점검 체크리스트_20250115.xlsx', score: 0.735, url: '#' }
      ];
    } else if (isWireWashScenario) {
      matched = true;
      fullAnswer = `초지기 와이어(Wire) 고압 세척 작업에 대한 위험성평가 및 안전 조치 사항은 아래와 같습니다.

---

### 1. 핵심 유해·위험 요인 (Hazard Identification)
* **고압 살수기 반발력에 의한 상해**: 최대 **150bar** 이상의 고압 수압으로 인해 작업자가 살수 노즐을 놓쳐 얼굴이나 신체 부위 충격 위험이 있습니다.
* **미끄러짐 및 낙하**: 와이어 피트 주변 바닥에 남아있는 슬라임(Slime) 및 백수로 인해 미끄러져 추락할 위험이 상존합니다.
* **화학 물질 노출**: 세척제(산성/알칼리성 세제) 분사 시 비산된 약품이 안구에 들어가거나 호흡기로 흡입될 위험이 있습니다.

---

### 2. 위험성 감소 대책 (Risk Mitigation)
* **노즐 파지용 보조 안전 핸들 장착**: 살수 노즐에 물리적 트리거 락 및 이중 손잡이를 적용하여 갑작스러운 고압 반발력에 대비합니다.
* **미끄럼 방지 작업화 및 안전대 의무화**: 추락 위험 구역 작업 시 상부 생명선에 안전대를 확실하게 체결합니다.
* **보호구 착용 가이드**: 안면보호구(Face Shield), 화학 물질용 방수 장갑, 방수 작업복을 착용해야 합니다.

---

### 3. 작업 전 필수 체크 리스트
1. **LOTO(Lock-Out, Tag-Out)**: 와이어 구동 모터 전원을 차단하고 시동 스위치에 안전 잠금 장치 및 표지판을 부착했는가?
2. **세척 펌프 압력 게이지**: 기동 전 압력 조절 밸브가 최저 위치에 있는지 확인하고 서서히 압력을 높인다.`;
      sources = [
        { num: 1, title: '4.2.1_초지기 와이어 고압 세척작업 위험성평가표_20250412.xlsx', score: 0.845, url: '#' },
        { num: 2, title: '4.2.2_초지파트 안전보건 작업수칙 가이드_20250320.docx', score: 0.791, url: '#' }
      ];
    } else if (isSteamCondensateScenario) {
      matched = true;
      fullAnswer = `초지기 건조부(Dryer Part) 스팀 응축수 회수율 제고를 위한 개선 제안 요약은 아래와 같습니다.

---

### 1. 현황 및 개선 배경 (Background)
* **드라이 부 스팀 트랩 누출**: 고온/고압 스팀 라인에 설치된 디스크 타입 스팀 트랩 마모로 인해 미량의 생스팀이 응축수 라인으로 직접 누출되어 열 손실 발생.
* **응축수 탱크 플래시 스팀 배출**: 응축수 탱크 압력 제어 불안정으로 다량의 플래시 스팀(Flash Steam)이 대기 중으로 방출되어 급수 온도 저하 원인 제공.

---

### 2. 주요 개선 방안 (Action Plans)
* **오리피스 플레이트 스팀 트랩 도입**: 구동부가 없어 마모 우려가 없는 오리피스형 스팀 트랩으로 전면 대체하여 스팀 누출량을 최소화합니다.
* **MVR(Mechanical Vapor Recompressor) 재압축기 설치**: 방출되는 플래시 스팀을 고압으로 재압축하여 저압 드라이어 스팀 헤더로 리사이클 공급합니다.
* **응축수 배관 단열 보강**: 드라이어 파트 하부 응축수 수거 배관에 에어로겔 단열재를 시공하여 복사 열손실을 방지합니다.

---

### 3. 기대 효과 (Expected Benefits)
* **연간 에너지 비용 절감**: 보일러 연료(LNG) 사용량 약 **3.2%** 감소 (연간 약 **1.2억원** 절감 예상).
* **탄소 배출 저감**: 연간 탄소 배출량 약 **450톤 CO₂-eq** 감축 효과 기대.`;
      sources = [
        { num: 1, title: '6.3.1_초지건조부 응축수 회수율 증대 개선제안서_20250615.pptx', score: 0.824, url: '#' },
        { num: 2, title: '6.3.5_공정 에너지 진단 보고서(초지파트)_20250110.pdf', score: 0.776, url: '#' }
      ];
    } else if (isBlowerScenario) {
      matched = true;
      fullAnswer = `폐수 처리장 용존산소량(DO) 급감 시 폭기조 송풍기(Turbo Blower) 점검을 위해 다음과 같은 사항들을 확인해야 합니다.

---

### 1. 초기 점검 사항
* Turbo Blower의 DCS(Distributed Control System) 화면에서 **현재 수치와 발생한 알람**을 확인합니다.
* Turbo Blower 및 주변 장치에서 **비정상적인 소음**이 발생하는지 확인합니다.
* 쿨링 팬(Air Cooling Fan)으로부터의 **공기 유량을 확인**합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].

---

### 2. Turbo Blower Stalling 현상 확인
* Stalling은 최소한의 공기 유량이 Impeller로 유입되지 않을 때 발생합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* Stalling 현상이 진행될 경우 **공기 흐름의 불안정과 압력 증가**, 그리고 **높은 진동**이 발생할 수 있으므로, Blower의 진동 상태를 점검합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].

---

### 3. 냉각 시스템 점검 (Air Cooling Fan)
* Turbo Blower 모터 온도가 **80°C 이상**으로 올라갔는지 확인합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 모터 온도가 높음에도 DCS 화면에서 Cooling Fan이 작동하지 않는다면 **필터 교체가 필요**할 수 있습니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* Cooling Air Fan 필터는 설치 및 운전 환경에 따라 교체 주기가 변동될 수 있으나, **매년 교체**하는 것이 권장됩니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].

---

### 4. 워터 세퍼레이터 점검
* 워터 세퍼레이터 작동을 위해 드레인펌프에 **씰링수 공급이 원활하게 이루어지는지** 확인합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 워터 세퍼레이터가 작동하지 않으면 **전체 공정이 중지**될 수 있습니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 세퍼레이터의 **워터레벨, 소음, DCS 화면** (하이레벨 스위치, 드레인펌프 씰링수 공급조절장치)을 확인합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 오염 상태에 따라 **매달 고압수를 이용한 필터 엘리먼트 청소**가 필요할 수 있습니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 청소 시 **터보블로워의 Inlet Cone 방향으로 물청소를 금지**합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 필터 엘리먼트는 중량물이며 날카롭기 때문에 **반드시 작업용 장갑을 착용**하고, 제거 및 청소 작업은 **2인1조로 진행**해야 합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].

---

### 5. 진공 요소 설정 점검
* Turbo Blower의 진공 요소들 중 Master로 설정된 진공 압력보다 다른 낮은 진공 압력 요소들을 **더 높게 설정하지 않도록 주의**해야 합니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].
* 높게 설정할 경우 Master가 바뀌면서 순간적으로 진공도가 떨어져 공정에 문제가 발생할 수 있습니다 [3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx].`;
      sources = [
        { num: 1, title: '3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx', file_name: '3.1.2_PM3 Headbox Feed Pump 중지 요약(24년1월2일 발생)_240104.pptx', score: 0.632, url: '#', web_view_link: '#' }
      ];
    } else if (isCutKnifeScenario) {
      matched = true;
      fullAnswer = `CM2 Cut Knife 교체 작업 절차는 다음과 같습니다.

---

### 1. 공구 및 보호구 준비
* **필수 공구**: 예비 컷나이프 2EA, 육각렌치, 방검장갑, 지관, 몽키스패너 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx]
* **필수 보호구**: 안전모, 안전화, 방검장갑, 각반 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx]
* **안전 지침**:
  * **방검장갑을 착용하여 찔림 사고를 예방**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
  * 컷나이프에 찔릴 수 있으므로 **캡이 씌워져 있는지 확인**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].

---

### 2. 준비 작업
* **솔밸브 ON 위치 확인**: 작은 육각렌치로 솔밸브를 ON 상태로 만드십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
* **에어 공급 탱크 수동밸브 잠금**: 다른 작업자가 몽키스패너로 에어탱크 수동밸브를 OFF 상태로 잠그십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
* **안전 지침**:
  * 컷나이프 오작동으로 인한 끼임 사고를 예방하기 위해 **2인 1조로 작업**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
  * 작업자와 **수신호를 철저히** 하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
  * 발을 헛디딜 수 있으므로 **서두르지 마십시오** [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].

---

### 3. 본 작업
* **지관 삽입**: 컷나이프 오작동을 대비하여 지관 2개를 컷나이프와 롤 사이에 끼우십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
* **컷나이프 나사 해체**: 육각렌치로 컷나이프 나사를 해체하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
* **안전 점검**:
  * 솔밸브가 **OFF 상태인지 재차 확인**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
  * 작동 확인 전 **컷나이프 나사 상태를 확인**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
  * 2인 1조 작업 중 솔밸브 OFF 과정에서 **다른 작업자와 수신호를 철저히** 하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].

---

### 4. 마무리 작업
* **주변 정리**: 언와인더 주변 나사 이탈을 확인하고 바닥 정리를 실시하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].
* **안전 지침**: 주변 바닥 정리 및 바닥 청소를 통해 **작업자 안전 사고를 예방**하십시오 [(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx].`;
      sources = [
        { num: 1, title: '(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx', file_name: '(CJ-042-022)_CM2 안전 작업 표준 CM2 CUT KNIFE 교체 작업.docx', score: 0.950, url: '#', web_view_link: '#' }
      ];
    } else if (isGuardSafetyScenario) {
      matched = true;
      fullAnswer = `CM2 가동 전 발생할 수 있는 위험 요인은 다음과 같습니다.

---

### 1. 협착 및 말림 사고 위험
* **수리 작업 중 전원 차단 미흡** 또는 **설비 오작동**으로 인해 설비가 예기치 않게 가동될 경우, 움직이는 부품에 신체 일부가 끼이거나 말려들어갈 수 있습니다.
* 특히, 유지보수 과정에서 **설비의 급작스러운 움직임**이나 **자동 장치(A/G)의 오작동**은 작업자를 심각한 협착 및 말림 사고 위험에 노출시킵니다.
* 롤과 같은 회전 부품 점검 시 **손 끼임** 위험이 존재하며, 맨손 작업은 피해야 합니다.

---

### 2. 타 작업자에 의한 설비 임의 가동 위험
* **정비 작업 중임을 알리는 표지판 부착 및 LOTO(잠금/표지) 시간 장치**가 제대로 이루어지지 않으면, 다른 작업자가 설비가 정비 중인 것을 인지하지 못하고 **임의로 설비를 가동**할 수 있습니다.
* 이로 인해 작업 중인 인원이 **예상치 못한 설비 가동**으로 인한 사고 위험에 직면하게 됩니다.

---

### 3. 전원 차단 및 안전 조치 미흡 위험
* 가드 안전 스위치 연동 정비와 같이 **설비의 안전 기능을 다루는 작업**에서는 **전원을 확실히 차단**하고 **작업 금지 표지판을 부착**하며 **LOTO(잠금/표지)를 체결**하는 것이 필수적입니다.
* 이러한 기본적인 안전 조치가 미흡할 경우, 작업자는 설비의 **재가동**이나 **잔류 에너지**에 의한 위험에 노출됩니다.`;
      sources = [
        { num: 1, title: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', file_name: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', score: 0.679, url: '#', web_view_link: '#' }
      ];
    } else if (isAshSensorScenario) {
      matched = true;
      fullAnswer = `제공해주신 문서에서는 PM3 스캐너의 평량 측정 관련 문제 해결 사례와 일반적인 스캐너 부품 점검 및 교체 주기에 대한 정보가 확인됩니다. 다만, **'Ash Sensor'에 대한 특정 정보나 작동 불량 조치 내용은 직접적으로 언급되어 있지 않습니다.** 아래 내용은 PM3 스캐너의 **평량 측정 데이터 처리**와 관련된 과거 문제점 및 개선 사항, 그리고 스캐너의 주요 부품 유지보수 지침입니다.

---

### 1. PM3 스캐너 평량 측정 전용 PC 관련 문제 해결 (과거 사례)
PM3 스캐너에서 평량 측정 데이터 처리와 관련된 문제가 발생한 경우, 다음과 같은 개선 조치가 이루어졌습니다.
* **문제점**:
  * PM3 Honeywell 스캐너에 설치된 전용 PC(UNO-PC와 유사)가 현장 온도 상승으로 다운되어 측정 오류가 발생했습니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
  * 전용 PC가 고장 나면 평량 측정이 불가능합니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
  * 제조사 권장 교체 주기(5년)를 초과하여 사용 시 고장 위험이 높습니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
* **개선 조치**:
  * 전용 PC를 **PM3 QCS room으로 이동 설치**했습니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
  * **프로그램을 수정**하여 문제를 해결했습니다. 이 조치 이후 2012년부터 현재까지 문제가 전혀 발생하지 않았습니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
* **최신 개선 사항**:
  * 이후 모든 스캐너에 대해 평량 측정 데이터를 **UNO-PC를 거치지 않고 직접 CPU에서 처리**할 수 있도록 소프트웨어 프로그램을 변경했습니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx], [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].
  * 2023년 1월 이후 모든 스캐너에 수정된 소프트웨어를 적용하여 현재까지 문제없이 운전 중입니다 [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx].

---

### 2. 스캐너 주요 부품 점검 및 교체 주기 (VALMET IQ SCANNER)
스캐너의 안정적인 작동을 위해 다음 부품들의 정기적인 점검 및 교체가 필요합니다.
* **6개월 주기 점검 항목**:
  * Gear motor (Product code: A421151) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Water pump 0.5kw (Product code: A421089) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Corrosion inhibitor (Product code: A420274) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Drive belt (Product code: A403703) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Timing belt (Product code: A416105) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Cable Tracks (electric ang Water+dir) (Product code: VS1001544, A421698) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Drive shaft assembly lower (Product code: A421548) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Drive shaft assembly upper (incl. clutch) (Product code: A421550) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * sealing Belt and Rollrs (Product code: A4230xx, A4037098) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Air filters (Product code: A420989) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Wed support rollers (Product code: A423098) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Moisture indicator (Product code: A416189) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Guide Rollers for timing belt (Product code: A423043) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Straight roll bearing assembly (Product code: A421575) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * V-roll bearing assembly (Product code: A421576) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * UNO-PC (Product code: A423187) [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
* **교체 주기 항목**:
  * Rail Wipers (A403706): **매년 교체** [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Air filters (A420989): **1년 주기 교체** [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Drive belt (A403703), Timing belt (A416105), Cable Tracks (VS1001544, A421698), sealing Belt and Rollrs (A4230xx, A4037098), Moisture indicator (A416189), Guide Rollers for timing belt (A423043), Straight roll bearing assembly (A421575), V-roll bearing assembly (A421576), UNO-PC (A423187): **2년 주기 교체** [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]
  * Wed support rollers (A423098): **3년 주기 교체** [PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx]`;
      sources = [
        { num: 1, title: 'PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx', file_name: 'PM3 스캐너 평량 측정 전용 PC 관련 문제 해결.docx', score: 0.724, url: '#', web_view_link: '#' }
      ];
    } else if (isAssetDispositionScenario && selectedCategory === '업무매뉴얼') {
      matched = true;
      fullAnswer = `자재관리파트의 고정자산 처분 절차는 다음과 같이 진행됩니다.

---

### 1. 업무 목적 및 개요
* **업무 목적**: 고정자산 처분을 통한 원활한 자산 관리
* **담당자**: 최정혁 (자재관리파트)
* **보안등급**: 전사
* **사업장**: 진주공장

---

### 2. 단계별 업무 절차
1. **고정자산폐기처리 요청**
   - 사용 또는 관리부서(공무부 등)로부터 고정자산폐기처리 요청서와 업무협조전 수령
   - 수령한 업무협조전을 참조하여 처분 검토 업무협조전 작성 후 구매2팀으로 송부 (사용 또는 관리부서에서 수령한 업무협조전 유첨)
2. **구매검토서 확인**
   - 구매2팀 구매검토의견 수령
3. **품의서 작성**
   - 구매검토의견을 참고하여 품의서 작성
   - ※ 품의서는 부문장 결재 후 회계팀 송부(경영지원부문장 합의)
4. **매각검토결과서 확인**
   - 회계팀에서 품의서 확인 후 고정자산 매각검토결과서 작성
   - 경영지원부문장 합의 및 사장님 전결 진행 후 자재관리파트로 송부
   - 최종 처분 내역 확인
5. **처분**
   - 매각처와 일정 협의 후 처분(매각) 진행`;
      sources = [
        { num: 1, title: '업무매뉴얼 유형_고정자산 처분.pptx', file_name: '업무매뉴얼 유형_고정자산 처분.pptx', score: 0.95, url: '#', web_view_link: '#' }
      ];
    } else if (isUnitConsumptionScenario && selectedCategory === '업무매뉴얼') {
      matched = true;
      fullAnswer = `생산부의 원단위 분석 및 실적 산출 업무 처리 방법은 다음과 같습니다.

---

### 1. 업무 목적 및 개요
* **목적**: 원단위 계획 대비 실적 차이 분석
* **담당자**: 전형표 (생산부)
* **보안등급**: 전사
* **사업장**: 진주공장

---

### 2. 세부 업무 처리 방법
1. **원단위 실적 분석**
   - 월말 기준으로 주원료, 부원료, 스팀, 가스에 대한 원단위 분석 실시
2. **원단위 실적 산출**
   - 주원료, 부원료, 스팀, 가스 원단위 실적을 MES에서 조회함 (생산속보, 원단위 리포트에서 조회 가능함)
3. **변환 계획 산출**
   - 기초 제공과 기말 제공을 반영한 Net 입고량으로 변환 계획 산출
   - SAP에서 소요량 산출하여 원단위 변환
4. **실적 분석**
   - 사업계획, 변환계획, 실적을 각각의 차이에 대해 분석
     - (1) **지종 구성 차이**: 변환계획 - 사업계획
     - (2) **원단위 차이**: 실적 - 변환계획
   - 월단위 표준 대비 차이 수량을 분석하여 원단위 차이를 분석`;
      sources = [
        { num: 1, title: '생산부_원단위 분석 업무매뉴얼.pptx', file_name: '생산부_원단위 분석 업무매뉴얼.pptx', score: 0.93, url: '#', web_view_link: '#' }
      ];
    } else if (isCertificationScenario && selectedCategory === '업무매뉴얼') {
      matched = true;
      fullAnswer = `품질보증파트의 인증 관리 업무 절차는 다음과 같이 진행됩니다.

---

### 1. 업무 목적 및 개요
* **목적**: 국내외 품질/환경/안전 등 규격 인증 취득 및 유지 관리
* **담당자**: 김민지 (품질보증파트)
* **보안등급**: 전사
* **사업장**: 진주공장

---

### 2. 세부 업무 절차
1. **인증 심사 계획 수립**
   - 연간 인증 취득 및 사후 관리 심사 일정 파악
   - 심사 대비 자체 내부 심사(Audit) 계획 수립 및 실시
2. **신청 및 수수료 납부**
   - 인증 기관에 인증(사후/갱신) 신청서 제출 및 비용 정산
3. **심사 수검**
   - 인증 기관 현장 심사 수검 진행 (각 부서 협조 사항 확인)
4. **부적합 사항 조치 및 시정조치 보고**
   - 심사 결과 도출된 부적합 및 권고 사항에 대해 관련 부서 개선 대책 수립 요청
   - 개선 조치 결과 취합 후 시정조치 보고서 작성하여 인증 기관 회신
5. **인증서 관리 및 배포**
   - 최종 발행된 인증서 사본을 인트라넷 게시판에 등록 및 사내 관련 부서 공유`;
      sources = [
        { num: 1, title: '품질보증파트_인증 관리 업무 절차.pptx', file_name: '품질보증파트_인증 관리 업무 절차.pptx', score: 0.94, url: '#', web_view_link: '#' }
      ];
    }

    if (!matched) {
      matched = true;
      fullAnswer = `질문하신 **"${query}"**에 관한 사내 문서를 탐색한 결과입니다.

---

### 1. 주요 관련 규정 및 가이드라인
* 사내 통합 지식 데이터베이스에서 검색어 **"${query}"**를 분석하여 추출한 정보입니다.
* 본 정보는 시스템 데모를 위해 제공되는 모의 검색 결과(Mock RAG Response)입니다.

---

### 2. 가상 검색 분석 요약
1. **요구사항 확인**: 입력하신 질문에 부합하는 사내 가이드 문서 및 기술 자료를 분석하고 있습니다.
2. **권장 프로세스**:
   - 관련 절차에 대해서는 소속 파트장 혹은 부서 내 선임 사원과 1차 협의 후 표준 지침에 따라 진행하십시오.
   - 상세 양식 및 추가 자료는 사내 인트라넷 자료실 혹은 본 시스템의 **[문서 어시스트]** 탭에서 생성할 수 있습니다.
   
---

### 3. 참고 예상 문서 (가상 출처)
* 본 답변은 가상으로 생성된 것이며, 시스템 정식 연동 후 실제 데이터와 동기화됩니다.`;
      sources = [
        { num: 1, title: `사내_지식DB_검색결과_${selectedCategory || '공통'}.pdf`, score: 0.85, url: '#' },
        { num: 2, title: `공통_업무가이드라인_개정판.docx`, score: 0.71, url: '#' }
      ];
    }

    if (matched) {
      // 0.8초간 대기 (AI 요약 스피너 활성화)
      setTimeout(() => {
        setIsLoading(false); // 로딩 스피너 비활성화
        
        // 어시스턴트 메시지 버블을 처음에 빈 텍스트로 추가 (isTyping: true)
        setChatSessions(prev => ({
          ...prev,
          [selectedCategory]: [...(prev[selectedCategory] || []), { role: 'assistant', content: '', sources: sources, isTyping: true }]
        }));

        // 30ms 간격으로 12글자씩 실시간 타이핑 렌더링 시뮬레이션
        let currentLength = 0;
        const stepSize = 12;
        const interval = setInterval(() => {
          currentLength += stepSize;
          if (currentLength >= fullAnswer.length) {
            clearInterval(interval);
            setChatSessions(prev => {
              const nextSession = [...(prev[selectedCategory] || [])];
              if (nextSession.length > 0) {
                nextSession[nextSession.length - 1] = { role: 'assistant', content: fullAnswer, sources: sources, isTyping: false };
              }
              return {
                ...prev,
                [selectedCategory]: nextSession
              };
            });
          } else {
            setChatSessions(prev => {
              const nextSession = [...(prev[selectedCategory] || [])];
              if (nextSession.length > 0) {
                nextSession[nextSession.length - 1] = { role: 'assistant', content: fullAnswer.slice(0, currentLength), sources: sources, isTyping: true };
              }
              return {
                ...prev,
                [selectedCategory]: nextSession
              };
            });
          }
        }, 25);
      }, 800);
    } else {
      // 핵심 질문이 아니면 0.5초 로딩 스피너 작동 후 "준비중" 경고 창 팝업
      setTimeout(() => {
        setIsLoading(false);
        setModalMessage("본 기능은 사내 시스템 연동 후 구현 예정입니다.");
        setIsModalOpen(true);
      }, 500);
    }
  };

  // 현재 활성화된 메뉴 명칭 반환 (상태 표시줄 및 헤더에 표시할 텍스트)
  const getTabTitle = () => {
    switch (activeMenu) {
      case 'home':
        return '무림AI-ON';
      case 'chat':
        return '문서 네비게이션';
      case 'docAssist':
        return '문서 어시스트';
      case 'ojtGuide':
        return 'OJT 가이드';
      default:
        return '무림AI-ON';
    }
  };

  return (
    <>
      <div className="app-container">
        {/* 모바일 가상 상태 표시줄 (Status Bar) */}
        <div className="mobile-status-bar">
          <span className="status-bar-title">{getTabTitle()}</span>
        </div>

        <header className="mobile-header">
          <div className="mobile-logo-container" onClick={handleResetHome}>
            <img 
              src="/logo.png" 
              alt="무림 로고" 
              className="mobile-brand-logo" 
            />
            <span className="mobile-logo-divider"></span>
            <span className="mobile-service-name">AI-ON</span>
          </div>
        </header>

        {/* 모바일 화면용 오버레이배경 */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <img src="/logo.png" alt="무림 로고" className="brand-logo" />
            <p className="brand-subtitle" style={{ marginTop: '0.8rem' }}>사내 지식 플랫폼</p>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeMenu === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('home');
                setIsSidebarOpen(false);
              }}
            >
              <Home size={18} />
              <span>🏠 홈 화면</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('chat');
                setIsSidebarOpen(false);
              }}
            >
              <Compass size={18} />
              <span>📂 문서 네비게이션</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('docAssist');
                setIsSidebarOpen(false);
              }}
            >
              <Sparkles size={18} />
              <span>📄 문서 어시스트</span>
            </button>
            <button 
              className={`nav-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('ojtGuide');
                setIsSidebarOpen(false);
              }}
            >
              <GraduationCap size={18} />
              <span>🌱 신입사원 OJT 가이드</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            {/* 설정 등 추가 메뉴 공간 (테마 버튼 제거됨) */}
            <WorksAIButton />
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 영역 */}
        <main className="content-area">
          {activeMenu === 'home' && (
            <div className="home-dashboard">
              {/* 심플한 타이틀 헤더 */}
              <div className="home-simple-header">
                <span className="home-subtitle">무림 사내 지식 플랫폼</span>
                <h1>AI-ON</h1>
                <p>무림의 사내 업무 지식을 스마트하게 탐색하세요.</p>
              </div>

              {/* 심플한 메뉴 버튼 목록 */}
              <div className="home-menu-list">
                <button className="home-menu-btn chat-btn" onClick={() => setActiveMenu('chat')}>
                  <span className="btn-icon">📂</span>
                  <div className="btn-text">
                    <h3>문서 네비게이션</h3>
                    <p>사내 문서 요약 및 출처 검색</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>

                <button className="home-menu-btn assist-btn" onClick={() => setActiveMenu('docAssist')}>
                  <span className="btn-icon">📄</span>
                  <div className="btn-text">
                    <h3>문서 어시스트</h3>
                    <p>AI 보고서 요약 및 실시간 분석</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>

                <button className="home-menu-btn ojt-btn" onClick={() => setActiveMenu('ojtGuide')}>
                  <span className="btn-icon">🌱</span>
                  <div className="btn-text">
                    <h3>신입사원 OJT 가이드</h3>
                    <p>교육 매뉴얼 및 업무 용어 사전</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'chat' && (
            <div className="chat-interface">
              {/* 1. 카테고리 미선택 상태: 허브 화면 */}
              {selectedCategory === null ? (
                <div className="nav-welcome-screen" style={{ gap: '0.4rem', paddingBottom: '0.5rem' }}>
                  {/* 허브 타이틀 */}
                  <div className="nav-welcome-card" style={{ marginTop: '0.2rem', padding: '0.6rem 0.8rem' }}>
                    <span className="nav-welcome-icon" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>🔍</span>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.15rem' }}>사내 문서에서 답을 찾아보세요</h3>
                    <p style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                      사내 문서를 AI가 분석하여 정확한 출처와 함께 요약해 드립니다.<br />
                      원하는 카테고리를 선택해 보세요.
                    </p>
                  </div>

                  {/* 4대 카테고리 카드 그리드 */}
                  <div className="nav-card-selector" style={{ gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <div className="nav-card" onClick={() => setSelectedCategory('트러블슈팅')} style={{ padding: '0.7rem 1rem' }}>
                      <div className="nav-card-icon troubleshooting" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>🔧</div>
                      <div className="nav-card-content">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>트러블슈팅</h3>
                        <p style={{ fontSize: '0.74rem' }}>설비 장애 현상에 따른 원인 분석 및 대책 검색</p>
                      </div>
                      <div className="nav-card-arrow">→</div>
                    </div>

                    <div className="nav-card" onClick={() => setSelectedCategory('작업표준')} style={{ padding: '0.7rem 1rem' }}>
                      <div className="nav-card-icon work-standard" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>📋</div>
                      <div className="nav-card-content">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>작업표준</h3>
                        <p style={{ fontSize: '0.74rem' }}>안전하고 효율적인 공정별 표준 작업 절차 가이드</p>
                      </div>
                      <div className="nav-card-arrow">→</div>
                    </div>

                    <div className="nav-card" onClick={() => setSelectedCategory('위험성평가')} style={{ padding: '0.7rem 1rem' }}>
                      <div className="nav-card-icon risk-assessment" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>⚠️</div>
                      <div className="nav-card-content">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>위험성평가</h3>
                        <p style={{ fontSize: '0.74rem' }}>공정별 핵심 유해·위험 요인 및 감소 대책 가이드</p>
                      </div>
                      <div className="nav-card-arrow">→</div>
                    </div>

                    <div className="nav-card" onClick={() => setSelectedCategory('개선제안')} style={{ padding: '0.7rem 1rem' }}>
                      <div className="nav-card-icon improvement-proposal" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>💡</div>
                      <div className="nav-card-content">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>개선제안</h3>
                        <p style={{ fontSize: '0.74rem' }}>공정 효율화 및 에너지 절감 개선안 내용 요약</p>
                      </div>
                      <div className="nav-card-arrow">→</div>
                    </div>

                    {/* 신규 추가: 업무매뉴얼 카드 (실제 대화방 연결) */}
                    <div className="nav-card" onClick={() => setSelectedCategory('업무매뉴얼')} style={{ padding: '0.7rem 1rem' }}>
                      <div className="nav-card-icon work-manual" style={{ width: '38px', height: '38px', fontSize: '1.3rem' }}>📖</div>
                      <div className="nav-card-content">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>업무매뉴얼</h3>
                        <p style={{ fontSize: '0.74rem' }}>각 부서별 표준 업무 절차 및 매뉴얼 상세 안내</p>
                      </div>
                      <div className="nav-card-arrow">→</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. 카테고리 선택 완료 상태: 1:1 대화방 */
                <>
                  {/* 상단 액티브 카테고리 헤더 */}
                  <div className="chat-category-header">
                    <button className="chat-back-btn" onClick={() => setSelectedCategory(null)}>
                      ← 전체 카테고리
                    </button>
                    <div className="active-category-title">
                      <span className="category-icon">
                        {selectedCategory === '트러블슈팅' && '🔧'}
                        {selectedCategory === '작업표준' && '📋'}
                        {selectedCategory === '위험성평가' && '⚠️'}
                        {selectedCategory === '개선제안' && '💡'}
                        {selectedCategory === '업무매뉴얼' && '📖'}
                      </span>
                      <h3>{selectedCategory}</h3>
                    </div>
                  </div>

                  {/* 대화 시작 전: 심플 웰컴 문구 + 추천 질문 리스트 */}
                  {messages.length === 0 && (
                    <div className="nav-welcome-screen" style={{ justifyContent: 'center', minHeight: '300px' }}>
                      <div className="nav-welcome-card" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                        <span className="nav-welcome-icon" style={{ fontSize: '2.5rem' }}>
                          {selectedCategory === '트러블슈팅' && '🔧'}
                          {selectedCategory === '작업표준' && '📋'}
                          {selectedCategory === '위험성평가' && '⚠️'}
                          {selectedCategory === '개선제안' && '💡'}
                          {selectedCategory === '업무매뉴얼' && '📖'}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{selectedCategory} AI 지식 검색</h3>
                        <p style={{ fontSize: '0.85rem' }}>
                          이 카테고리와 관련된 궁금한 사항을 자유롭게 물어보세요.<br />
                          아래의 추천 질문 중 하나를 클릭하면 빠르게 탐색할 수 있습니다.
                        </p>
                      </div>

                      {/* 추천 질문 */}
                      <div className="suggestion-container" style={{ marginTop: '1rem' }}>
                        <div className="suggestion-title">💡 이런 질문을 해보세요:</div>
                        <div className="suggestion-grid">
                          {suggestions.map((sug, idx) => (
                            <button 
                              key={idx}
                              className="suggestion-chip"
                              onClick={() => handleSendMessage(sug.text)}
                            >
                              🔍 {sug.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 대화 진행 중: 채팅 메시지 표시 */}
                  {messages.length > 0 && (
                    <div className="chat-container">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                          <div className={`chat-avatar ${msg.role}`}>
                            {msg.role === 'user' ? '👤' : '🤖'}
                          </div>
                          <div className="chat-bubble">
                            <AccordionMessage content={msg.content} sources={msg.sources} />
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="chat-message assistant">
                          <div className="chat-avatar">🤖</div>
                          <div className="chat-bubble loading-bubble">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* 대화 진행 중인 경우, 입력창 상단에 가로 스크롤 형태의 추천 질문 칩 상시 노출 */}
                  {messages.length > 0 && (
                    <div className="chat-suggestion-chips-inline">
                      <span className="chips-label">💡 추천 질문:</span>
                      {suggestions.map((sug, idx) => (
                        <button 
                          key={idx}
                          className="inline-suggestion-chip"
                          disabled={isLoading}
                          onClick={() => handleSendMessage(sug.text)}
                        >
                          {sug.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 입력란 고정 피드 */}
                  <div className="chat-input-wrapper">
                    <input 
                      type="text" 
                      className="chat-input"
                      placeholder={`${selectedCategory} 관련 내용 검색...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      disabled={isLoading}
                    />
                    <button 
                      className="send-btn" 
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !inputText.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {activeMenu === 'docAssist' && <DocAssistPanel messages={messages} />}
          {activeMenu === 'ojtGuide' && <OjtGuidePanel />}
        </main>

        {/* 모바일 화면용 고정형 하단 네비게이션 탭바 */}
        <div className="mobile-bottom-tab-bar">
          <button 
            className={`mobile-tab-item ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => setActiveMenu('home')}
          >
            <Home size={18} />
            <span>홈</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveMenu('chat')}
          >
            <Compass size={18} />
            <span>문서 네비</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'docAssist' ? 'active' : ''}`}
            onClick={() => setActiveMenu('docAssist')}
          >
            <Sparkles size={18} />
            <span>문서 어시스트</span>
          </button>
          <button 
            className={`mobile-tab-item ${activeMenu === 'ojtGuide' ? 'active' : ''}`}
            onClick={() => setActiveMenu('ojtGuide')}
          >
            <GraduationCap size={18} />
            <span>OJT 가이드</span>
          </button>
        </div>

        {/* 글로벌 알림 모달 창 (준비 중 안내 목적) */}
        {isModalOpen && (
          <div className="custom-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
              <div className="custom-modal-header">
                <h3>💡 안내</h3>
                <button className="custom-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>
              <div className="custom-modal-body">
                <p>{modalMessage}</p>
              </div>
              <div className="custom-modal-footer">
                <button className="custom-modal-confirm-btn" onClick={() => setIsModalOpen(false)}>확인</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
