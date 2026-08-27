import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  PlayCircle,
  ExternalLink,
  Send,
  Clock,
} from 'lucide-react';
import './OjtGuidePanel.css';

// ──────────────────────────────────────
// 진주공장 조직도 (실제 데이터)
// ──────────────────────────────────────
const ORG_DATA = {
  '공무부': ['설비관리파트', '전기제어파트'],
  '물류부': ['완정1파트', '완정2파트', '물류관리파트'],
  '생산부': ['조성파트', '생산1파트', '생산2파트', '가공1파트', '가공2파트'],
  '품질보증부': ['생산관리파트', '품질보증파트'],
  '제지기술개발부': [],
  '공장운영부': ['자재관리파트', '환경관리파트'],
};

// ──────────────────────────────────────
// 시범 콘텐츠: 품질보증부 > 생산관리파트
// 학습 항목 여러 개를 리스트로 제공
// ──────────────────────────────────────
const DEMO_CONTENT = {
  // 부서 전체 메트릭
  metrics: { guides: 3, time: '45분', passScore: 80 },

  // 학습 항목 리스트
  items: [
    {
      title: '생산관리파트 업무의 이해',
      description: '생산관리파트의 조직 구성, 주요 역할, 업무 프로세스 전반을 소개합니다.',
      icon: '📋',
      duration: '25분',
      videoTitle: '생산관리파트 업무의 이해 (장원창 사원)',
      videoLink: '#',
      summary: [
        {
          icon: '📋',
          title: '생산관리파트 주요 업무 개요',
          content:
            '생산관리파트는 진주공장 전체의 생산 계획 수립, 생산 실적 집계, 원가 관리 업무를 총괄합니다. 일일·주간·월간 단위로 생산 데이터를 수집하여 경영진에게 보고하는 것이 핵심 역할입니다.',
        },
        {
          icon: '📊',
          title: '생산계획 수립 프로세스',
          content:
            '월간 생산계획은 매월 25일까지 수립하며, 영업부 수주 데이터와 재고 현황을 기반으로 PM별 생산량을 배분합니다. 계획 대비 실적 달성률은 95% 이상을 목표로 합니다.',
        },
      ],
      quiz: [
        {
          question: '월간 생산계획은 매월 며칠까지 수립해야 합니까?',
          options: ['매월 15일', '매월 20일', '매월 25일', '매월 말일'],
          correctIndex: 2,
          explanation:
            '월간 생산계획은 매월 25일까지 수립하며, 영업부 수주 데이터와 재고 현황을 기반으로 PM별 생산량을 배분합니다.',
        },
      ],
    },
    {
      title: 'MES 시스템 활용 기초',
      description: '제조실행시스템(MES)의 기본 화면 구성과 생산 데이터 입력 방법을 학습합니다.',
      icon: '💾',
      duration: '10분',
      videoTitle: 'MES 시스템 기본 교육',
      videoLink: '#',
      summary: [
        {
          icon: '💻',
          title: 'MES 시스템 개요',
          content:
            'MES(Manufacturing Execution System)는 생산 현장의 실시간 데이터를 수집·관리하는 핵심 시스템입니다. 작업 지시, 실적 수집, 품질 검사 데이터를 통합 관리합니다.',
        },
        {
          icon: '📝',
          title: '데이터 입력 규칙',
          content:
            '생산 실적은 매 교대 종료 후 30분 이내에 입력해야 합니다. 입력 시 품종코드, 생산량(톤), 불량량을 필수로 기재하며 데이터 오류율 0.1% 이하를 유지해야 합니다.',
        },
      ],
      quiz: [
        {
          question: '생산 실적은 매 교대 종료 후 몇 분 이내에 MES에 입력해야 합니까?',
          options: ['10분', '30분', '1시간', '2시간'],
          correctIndex: 1,
          explanation:
            '생산 실적은 매 교대 종료 후 30분 이내에 입력해야 하며, 품종코드·생산량·불량량을 필수로 기재합니다.',
        },
      ],
    },
    {
      title: '원가관리 및 KPI 모니터링',
      description: '원단위(원/톤) 관리 방법과 주요 생산 KPI 모니터링 절차를 학습합니다.',
      icon: '💰',
      duration: '10분',
      videoTitle: '원가관리 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '💰',
          title: '원가관리 기본 개념',
          content:
            '원단위(원/톤) 관리를 통해 생산 원가를 모니터링합니다. 주요 원가 항목은 원재료비, 에너지비, 약품비이며 매월 전월 대비 증감을 분석합니다.',
        },
        {
          icon: '📈',
          title: '주요 KPI 항목',
          content:
            '생산관리파트의 핵심 KPI는 제조원가율, 불량률(목표 2% 이하), 가동률(목표 95% 이상)이며 매월 경영회의 시 보고합니다.',
        },
      ],
      quiz: [
        {
          question: '생산관리파트에서 관리하는 불량률 목표 기준은?',
          options: ['1% 이하', '2% 이하', '3% 이하', '5% 이하'],
          correctIndex: 1,
          explanation:
            '불량률 목표는 2% 이하이며, 가동률 목표는 95% 이상입니다. 매월 경영회의 시 보고합니다.',
        },
      ],
    },
  ],
};

// ──────────────────────────────────────
// 공무부 콘텐츠
// ──────────────────────────────────────

// 공무부 > 설비관리파트 - 설비보전의 체계와 이해
const EQUIP_MAINTENANCE_CONTENT = {
  metrics: { guides: 2, time: '30분', passScore: 80 },
  items: [
    {
      title: '설비보전의 체계와 이해',
      description: '설비보전의 기본 개념과 보전 활동의 분류 체계, 진주공장 보전 업무 프로세스를 학습합니다.',
      icon: '🔧',
      duration: '15분',
      videoTitle: '설비보전 체계 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🔧',
          title: '설비보전의 정의와 목적',
          content: '설비보전(Maintenance)이란 설비의 성능을 유지·복원하기 위한 모든 활동을 말합니다. 고장 예방, 설비 수명 연장, 제품 품질 안정화, 생산성 향상이 궁극적 목적이며, 진주공장에서는 TPM(Total Productive Maintenance) 기반의 보전 체계를 운영하고 있습니다.'
        },
        {
          icon: '📊',
          title: '보전 활동의 분류 체계',
          content: '보전 활동은 크게 예방보전(PM: Preventive Maintenance), 사후보전(BM: Breakdown Maintenance), 개량보전(CM: Corrective Maintenance), 예지보전(PdM: Predictive Maintenance)으로 분류됩니다. 진주공장은 예방보전을 중심으로 운영하되, 진동 분석·열화상 카메라 등을 활용한 예지보전 비중을 점차 확대하고 있습니다.'
        },
        {
          icon: '📋',
          title: '보전 업무 프로세스',
          content: '보전 요청 접수 → 작업 계획 수립 → 부품/자재 수배 → 정비 작업 수행 → 시운전 및 확인 → 이력 등록(CMMS)의 순서로 진행됩니다. 모든 정비 이력은 설비관리시스템(CMMS)에 등록하여 데이터 기반의 보전 의사결정에 활용합니다.'
        }
      ],
      quiz: [
        {
          question: '진동 분석, 열화상 카메라 등을 활용하여 설비 이상을 사전에 감지하는 보전 활동은?',
          options: ['사후보전(BM)', '예방보전(PM)', '예지보전(PdM)', '개량보전(CM)'],
          correctIndex: 2,
          explanation: '예지보전(PdM: Predictive Maintenance)은 진동, 온도, 소음 등의 상태 데이터를 분석하여 고장을 사전에 예측하고 대응하는 보전 활동입니다.'
        }
      ]
    },
    {
      title: '윤활유 종류 및 특징',
      description: '산업용 윤활유의 종류별 특성과 적용 기준, 관리 방법을 이해합니다.',
      icon: '🛢️',
      duration: '15분',
      videoTitle: '윤활유 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🛢️',
          title: '윤활유의 기본 분류',
          content: '윤활유는 크게 윤활유(Lubricating Oil)와 그리스(Grease)로 나뉩니다. 윤활유는 유동성이 좋아 고속 회전체에 적합하고, 그리스는 반고체 상태로 저속·고하중 부위에 주로 사용됩니다. 점도(Viscosity)가 윤활유 선정의 가장 중요한 기준이며, ISO VG 등급으로 분류합니다.'
        },
        {
          icon: '⚙️',
          title: '제지 설비 주요 윤활유 종류',
          content: '베어링용 그리스(리튬계 EP 그리스), 감속기용 기어오일(ISO VG 220~320), 유압 시스템용 작동유(ISO VG 46~68), 체인·와이어용 윤활유 등이 사용됩니다. 각 윤활점(Lubrication Point)에 적합한 유종과 점도를 정확히 매칭하는 것이 핵심입니다.'
        },
        {
          icon: '⚠️',
          title: '윤활유 관리 시 주의사항',
          content: '서로 다른 종류의 윤활유를 혼합 사용하면 화학 반응으로 윤활 성능이 급격히 저하됩니다. 윤활유 보관 시 수분 및 이물질 오염을 방지해야 하며, 사용 중인 윤활유는 정기적으로 오일 분석(Oil Analysis)을 실시하여 열화 상태를 관리합니다.'
        }
      ],
      quiz: [
        {
          question: '윤활유 선정 시 가장 중요한 물성 기준은 무엇입니까?',
          options: ['색상(Color)', '점도(Viscosity)', '냄새(Odor)', '밀도(Density)'],
          correctIndex: 1,
          explanation: '점도(Viscosity)는 윤활유의 유동 저항을 나타내는 핵심 물성으로, 설비의 회전 속도·하중·온도 조건에 맞는 적절한 점도 등급(ISO VG)을 선택하는 것이 가장 중요합니다.'
        }
      ]
    }
  ]
};

// 공무부 > 전기제어파트 (공통 콘텐츠 사용 - 전용 콘텐츠는 추후 확대)

// ──────────────────────────────────────
// 물류부 콘텐츠
// ──────────────────────────────────────

// 물류부 > 완정1파트, 완정2파트, 물류관리파트 공통
const LOGISTICS_CONTENT = {
  metrics: { guides: 2, time: '30분', passScore: 80 },
  items: [
    {
      title: '재단공정 교육',
      description: '원지(原紙)를 고객 요구 규격에 맞게 재단하는 공정의 원리, 설비 구성, 품질 관리 포인트를 학습합니다.',
      icon: '✂️',
      duration: '15분',
      videoTitle: '재단공정 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '✂️',
          title: '재단공정 개요',
          content: '재단(Sheeting/Cutting)은 초지기에서 생산된 대형 원지 롤(Jumbo Roll)을 고객 주문 규격에 맞는 평판지(Sheet) 또는 소폭 롤로 가공하는 후처리 공정입니다. 재단 정밀도가 최종 제품의 치수 품질을 직접 좌우하므로 매우 중요한 공정입니다.'
        },
        {
          icon: '⚙️',
          title: '재단 설비 구성과 작동 원리',
          content: '재단기(Sheeter)는 언와인더(Unwinder), 슬리터(Slitter), 크로스 커터(Cross Cutter), 스태커(Stacker)로 구성됩니다. 원지 롤을 풀면서 종방향(MD) 슬리팅과 횡방향(CD) 커팅을 동시에 수행하며, 칼날 간격 설정이 재단 치수 정밀도의 핵심입니다.'
        },
        {
          icon: '📏',
          title: '재단 품질 관리 포인트',
          content: '치수 편차(±1mm 이내), 직각도(Squareness), 절단면 깨끗함(버(Burr) 없음), 카운트 정확도를 중점 관리합니다. 칼날(Blade) 마모 상태를 주기적으로 점검하고, 정해진 수명 주기에 따라 교체해야 절단 품질을 유지할 수 있습니다.'
        }
      ],
      quiz: [
        {
          question: '재단기에서 원지를 종방향(MD)으로 절단하는 부위의 명칭은?',
          options: ['스태커(Stacker)', '크로스 커터(Cross Cutter)', '슬리터(Slitter)', '언와인더(Unwinder)'],
          correctIndex: 2,
          explanation: '슬리터(Slitter)는 원지를 종방향(MD: Machine Direction)으로 절단하는 장치이며, 횡방향(CD) 절단은 크로스 커터(Cross Cutter)가 담당합니다.'
        }
      ]
    },
    {
      title: '리와인더 공정 교육',
      description: '초지기에서 생산된 원지 롤을 고객 규격 폭과 직경으로 재권취하는 리와인더 공정을 학습합니다.',
      icon: '🔄',
      duration: '15분',
      videoTitle: '리와인더 공정 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🔄',
          title: '리와인더(Rewinder) 공정 개요',
          content: '리와인더는 초지기 릴(Reel)에서 감긴 대형 원지 롤(Parent Roll)을 고객이 요구하는 폭(Trim Width)과 직경(Roll Diameter)으로 다시 감는 공정입니다. 리와인더의 핵심은 균일한 권취 장력(Winding Tension) 관리와 정확한 폭 슬리팅입니다.'
        },
        {
          icon: '📐',
          title: '권취 장력 관리의 중요성',
          content: '권취 장력이 과도하면 종이가 찢어지거나 롤 내부에 과도한 압력이 발생하여 주름(Wrinkle)이 생기고, 장력이 부족하면 롤이 느슨하게 감겨 텔레스코핑(Telescoping, 롤 밀림) 현상이 발생합니다. 권취 시작부터 끝까지 점진적으로 장력을 감소시키는 테이퍼 텐션(Taper Tension) 제어가 핵심입니다.'
        },
        {
          icon: '⚠️',
          title: '리와인더 주요 결함과 대책',
          content: '스타피쉬(Star Defect, 별 모양 변형), 텔레스코핑(롤 밀림), 코어 크러쉬(Core Crush, 코어 찌그러짐) 등이 대표적 결함입니다. 이를 방지하려면 장력 프로파일 최적화, 닙 압력(Nip Pressure) 적정 설정, 코어 경도 확인이 필수적입니다.'
        }
      ],
      quiz: [
        {
          question: '리와인더에서 롤이 느슨하게 감겨 옆으로 밀리는 현상의 명칭은?',
          options: ['스타피쉬(Star Defect)', '텔레스코핑(Telescoping)', '코어 크러쉬(Core Crush)', '캘린더링(Calendering)'],
          correctIndex: 1,
          explanation: '텔레스코핑(Telescoping)은 권취 장력 부족으로 롤의 층간 마찰력이 부족하여 롤이 옆으로 밀리는 현상입니다. 적절한 권취 장력과 닙 압력 설정으로 방지합니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
// 생산부 콘텐츠
// ──────────────────────────────────────

// 생산부 > 조성파트 - 섬유 고해 특성 및 리파이너
const REFINING_CONTENT = {
  metrics: { guides: 1, time: '15분', passScore: 80 },
  items: [
    {
      title: '섬유 고해 특성 및 리파이너',
      description: '제지 원료 섬유의 고해(叩解) 원리와 리파이너 설비의 구조, 운전 관리 방법을 학습합니다.',
      icon: '🌿',
      duration: '15분',
      videoTitle: '섬유 고해 및 리파이너 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🌿',
          title: '고해(Refining)의 정의와 목적',
          content: '고해(叩解, Refining)는 펄프 섬유에 기계적 힘을 가하여 섬유를 피브릴화(Fibrillation)하고 유연하게 만드는 공정입니다. 고해를 통해 섬유 간 결합력(Bonding)이 증가하여 종이의 인장강도, 인열강도 등 물성이 향상되며, 초지 시 탈수성과 지합(Formation)에도 큰 영향을 미칩니다.'
        },
        {
          icon: '⚙️',
          title: '리파이너(Refiner)의 구조와 종류',
          content: '리파이너는 고정 디스크(Stator)와 회전 디스크(Rotor) 사이에서 펄프를 고해하는 설비입니다. 디스크 리파이너(Disc Refiner)와 코니컬 리파이너(Conical Refiner)가 대표적이며, 진주공장에서는 디스크 리파이너를 주로 사용합니다. 디스크 표면의 바(Bar)와 그루브(Groove) 패턴이 고해 특성을 결정합니다.'
        },
        {
          icon: '📊',
          title: '고해도(Freeness) 관리',
          content: '고해도는 CSF(Canadian Standard Freeness)로 측정하며, 수치가 낮을수록 고해가 많이 진행된 상태입니다. 과도한 고해는 탈수성 저하와 건조 에너지 증가를 초래하므로, 품종별 목표 CSF 범위 내에서 관리하는 것이 중요합니다. 리파이너 디스크 간격(Gap)과 부하 전력(Specific Energy)이 핵심 제어 변수입니다.'
        }
      ],
      quiz: [
        {
          question: '고해도(Freeness) 측정 시 CSF 수치가 낮다는 것은 어떤 의미입니까?',
          options: ['고해가 덜 진행된 상태', '고해가 많이 진행된 상태', '섬유가 길어진 상태', '탈수성이 좋은 상태'],
          correctIndex: 1,
          explanation: 'CSF(Canadian Standard Freeness) 수치가 낮을수록 섬유가 더 많이 피브릴화되어 고해가 많이 진행된 상태를 의미합니다. 이 경우 종이 강도는 증가하지만 탈수성은 저하됩니다.'
        }
      ]
    }
  ]
};

// 생산부 > 생산1파트, 생산2파트 - 초지기 Wire 파트의 이해
const WIRE_PART_CONTENT = {
  metrics: { guides: 1, time: '15분', passScore: 80 },
  items: [
    {
      title: '초지기 Wire 파트의 이해',
      description: '초지기의 첫 번째 구간인 Wire(망) 파트의 구조, 탈수 원리, 운전 관리 포인트를 학습합니다.',
      icon: '🏭',
      duration: '15분',
      videoTitle: '초지기 Wire 파트 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🏭',
          title: 'Wire 파트의 역할과 구조',
          content: 'Wire 파트는 헤드박스(Headbox)에서 분사된 지료(Stock)를 와이어 메쉬(Wire Mesh) 위에서 탈수하여 초기 습지(Wet Sheet)를 형성하는 구간입니다. 장망식(Fourdrinier)과 갭포머(Gap Former) 방식이 있으며, 진주공장에서는 두 방식을 모두 운영하고 있습니다.'
        },
        {
          icon: '💧',
          title: '탈수 원리와 탈수 요소',
          content: 'Wire 파트의 탈수는 중력 탈수, 포일(Foil) 탈수, 석션(Suction) 탈수로 구분됩니다. 테이블 롤(Table Roll)과 포일 보드(Foil Board)가 초기 자유수를 제거하고, 석션 박스(Suction Box)와 쿠치 롤(Couch Roll)이 후반부 탈수를 담당합니다. Wire 파트 종료 시 약 18~22%의 고형분 농도를 달성합니다.'
        },
        {
          icon: '📐',
          title: '지합(Formation)과 Wire 관리',
          content: '지합(Formation)은 종이 내 섬유 분포의 균일도를 말하며, Wire 파트에서 결정됩니다. 헤드박스 Jet/Wire 속도비(J/W Ratio), 슬라이스 개도(Slice Opening), 와이어 장력(Wire Tension) 등이 지합에 영향을 미칩니다. 와이어 수명 관리와 세정(Shower) 상태 점검도 품질 유지에 필수적입니다.'
        }
      ],
      quiz: [
        {
          question: 'Wire 파트에서 종이 내 섬유 분포의 균일도를 의미하는 용어는?',
          options: ['평활도(Smoothness)', '지합(Formation)', '벌크(Bulk)', '불투명도(Opacity)'],
          correctIndex: 1,
          explanation: '지합(Formation)은 종이 시트 내에서 섬유가 얼마나 균일하게 분포되어 있는지를 나타내는 품질 지표로, Wire 파트의 운전 조건에 의해 크게 좌우됩니다.'
        }
      ]
    }
  ]
};

// 생산부 > 가공1파트, 가공2파트 - 라텍스의 이해
const LATEX_CONTENT = {
  metrics: { guides: 1, time: '15분', passScore: 80 },
  items: [
    {
      title: '라텍스의 이해',
      description: '제지 코팅 공정에 사용되는 라텍스(Latex)의 종류, 역할, 품질 영향을 학습합니다.',
      icon: '🧪',
      duration: '15분',
      videoTitle: '라텍스 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🧪',
          title: '라텍스(Latex)란 무엇인가',
          content: '라텍스는 합성 고분자(Polymer)의 수분산체로, 코팅(Coating) 공정에서 안료(Pigment) 입자들을 서로 결합시키고 원지 표면에 고착시키는 바인더(Binder) 역할을 합니다. 대표적으로 SB 라텍스(Styrene-Butadiene Latex)와 SA 라텍스(Styrene-Acrylate Latex)가 사용됩니다.'
        },
        {
          icon: '📊',
          title: '라텍스 종류별 특성 비교',
          content: 'SB 라텍스는 우수한 접착력과 인쇄적성을 제공하여 가장 널리 사용됩니다. SA 라텍스는 내수성과 내열성이 뛰어나 특수 용도에 적합합니다. 라텍스의 유리전이온도(Tg), 입자 크기(Particle Size), 겔 함량(Gel Content)이 코팅지 품질에 핵심적 영향을 미칩니다.'
        },
        {
          icon: '⚠️',
          title: '라텍스 사용 시 주의사항',
          content: '라텍스는 동결(Freezing)되면 입자 응집이 발생하여 사용이 불가능해지므로 5°C 이상에서 보관해야 합니다. 또한 라텍스 배합량이 과다하면 코팅면이 끈적거리고(Stickiness), 부족하면 파우더링(Powdering, 안료 탈락) 현상이 발생하므로 적정 배합비를 준수해야 합니다.'
        }
      ],
      quiz: [
        {
          question: '코팅 배합에서 라텍스 함량이 부족할 때 발생하는 대표적 현상은?',
          options: ['끈적거림(Stickiness)', '파우더링(Powdering)', '컬링(Curling)', '블리스터(Blister)'],
          correctIndex: 1,
          explanation: '파우더링(Powdering)은 바인더(라텍스)가 부족하여 안료 입자가 코팅면에서 탈락하는 현상입니다. 반대로 라텍스가 과다하면 끈적거림(Stickiness)이 발생합니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
// 품질보증부 콘텐츠
// ──────────────────────────────────────

// 품질보증부 > 품질보증파트
const QA_CONTENT = {
  metrics: { guides: 2, time: '30분', passScore: 80 },
  items: [
    {
      title: '제품 물성검사 방법',
      description: '종이 제품의 주요 물성 항목별 검사 방법과 기준을 학습합니다.',
      icon: '🔬',
      duration: '15분',
      videoTitle: '제품 물성검사 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🔬',
          title: '주요 물성 검사 항목',
          content: '제지 제품의 핵심 물성 항목은 평량(Basis Weight, g/m²), 두께(Thickness/Caliper), 인장강도(Tensile Strength), 인열강도(Tear Strength), 내절도(Folding Endurance), 백색도(Brightness), 불투명도(Opacity), 평활도(Smoothness) 등입니다. 각 항목은 KS 또는 ISO 규격에 따라 측정합니다.'
        },
        {
          icon: '📏',
          title: '물성 측정 장비와 절차',
          content: '평량은 전자저울과 정밀 재단기로, 두께는 마이크로미터(Micrometer)로, 인장강도는 인장시험기(Tensile Tester)로 측정합니다. 모든 시편은 항온항습실(23±1°C, 50±2% RH)에서 4시간 이상 조습 후 측정해야 정확한 값을 얻을 수 있습니다.'
        },
        {
          icon: '✅',
          title: '검사 결과 판정 기준',
          content: '각 품종별 규격서(Specification)에 명시된 상·하한 관리 기준과 비교하여 합부 판정을 수행합니다. 관리 한계를 벗어난 경우 부적합(Non-Conformance) 처리하며, 원인 분석 후 시정 조치를 실시합니다.'
        }
      ],
      quiz: [
        {
          question: '물성 측정 시편의 조습 조건으로 올바른 것은?',
          options: ['20°C, 40% RH', '23±1°C, 50±2% RH', '25°C, 60% RH', '상온 상습'],
          correctIndex: 1,
          explanation: '종이 물성 측정의 표준 조습 조건은 KS/ISO 규격에 따라 23±1°C, 50±2% RH이며, 최소 4시간 이상 조습 후 측정해야 정확한 결과를 얻을 수 있습니다.'
        }
      ]
    },
    {
      title: '컬의 발생원인 및 대책',
      description: '종이의 컬(Curl) 현상이 발생하는 원인과 공정별 대응 방안을 학습합니다.',
      icon: '📄',
      duration: '15분',
      videoTitle: '컬 발생원인 및 대책 교육',
      videoLink: '#',
      summary: [
        {
          icon: '📄',
          title: '컬(Curl)이란 무엇인가',
          content: '컬(Curl)은 종이가 한쪽 방향으로 휘어지는 현상입니다. 종이의 앞면(Felt Side)과 뒷면(Wire Side)의 수축률 차이, 양면의 수분 함량 차이, 코팅량 불균일 등이 원인입니다. 컬은 인쇄·복사 시 급지 불량(Feed Jam)을 유발하여 고객 클레임의 주요 원인이 됩니다.'
        },
        {
          icon: '🔍',
          title: '컬 발생의 주요 원인',
          content: '① 수분 편차: 양면의 수분 차이가 0.5% 이상이면 컬이 발생합니다. ② 섬유 배향(Fiber Orientation): MD/CD 방향 섬유 배향 차이가 컬을 유발합니다. ③ 코팅 불균일: 양면 코팅량이 불균형하면 건조 시 수축 차이로 컬이 발생합니다. ④ 보관 환경: 습도 변화가 큰 환경에서 장기간 보관 시 흡습에 의한 컬이 발생합니다.'
        },
        {
          icon: '🛠️',
          title: '컬 방지 대책',
          content: '초지 공정에서 양면 탈수 균형 최적화, 드라이어 파트의 양면 건조 균형 조절, 코팅 공정에서 양면 코팅량 균일화가 핵심입니다. 완제품 포장 시 방습 포장(Moisture Barrier Packaging)을 적용하고, 출하 전 조습실에서 최종 수분 안정화를 실시합니다.'
        }
      ],
      quiz: [
        {
          question: '종이 양면의 수분 차이가 몇 % 이상이면 컬이 발생하기 시작합니까?',
          options: ['0.1% 이상', '0.3% 이상', '0.5% 이상', '1.0% 이상'],
          correctIndex: 2,
          explanation: '일반적으로 종이 양면(Felt Side와 Wire Side)의 수분 차이가 0.5% 이상이면 수축률 차이에 의해 컬(Curl)이 발생하기 시작합니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
// 제지기술개발부 콘텐츠
// ──────────────────────────────────────

const PAPER_TECH_CONTENT = {
  metrics: { guides: 2, time: '30분', passScore: 80 },
  items: [
    {
      title: '첨가제의 이해',
      description: '제지 공정에 사용되는 주요 첨가제(Chemical Additives)의 종류와 역할을 학습합니다.',
      icon: '⚗️',
      duration: '15분',
      videoTitle: '제지 첨가제 기초 교육',
      videoLink: '#',
      summary: [
        {
          icon: '⚗️',
          title: '제지 첨가제의 분류',
          content: '제지 첨가제는 크게 공정 첨가제(Process Additives)와 기능성 첨가제(Functional Additives)로 분류됩니다. 공정 첨가제는 보류제(Retention Aid), 탈수제(Drainage Aid), 소포제(Defoamer) 등 공정 효율을 높이는 약품이며, 기능성 첨가제는 사이즈제(Sizing Agent), 강도제(Strength Agent), 충전제(Filler) 등 제품 물성을 부여하는 약품입니다.'
        },
        {
          icon: '🔗',
          title: '주요 첨가제별 역할',
          content: '보류제(PAM 등)는 미세 섬유와 충전제의 와이어 위 보류율을 높이고, 사이즈제(AKD, ASA)는 종이에 발수성(耐水性)을 부여합니다. 습윤강도제(PAE Resin)는 젖은 상태에서의 강도를 부여하며, 전분(Starch)은 표면 강도와 인쇄적성을 향상시킵니다.'
        },
        {
          icon: '⚠️',
          title: '첨가제 사용 시 주의사항',
          content: '첨가제 간 전하(Charge) 상호작용을 고려한 투입 순서가 중요합니다. 양이온성(Cationic) 약품과 음이온성(Anionic) 약품의 투입 위치가 가까우면 서로 반응하여 효과가 상쇄됩니다. 또한 과다 투입 시 피치(Pitch) 발생, 탈수성 악화 등 부작용이 생길 수 있어 적정 투입량을 준수해야 합니다.'
        }
      ],
      quiz: [
        {
          question: '종이에 발수성(耐水性)을 부여하는 첨가제의 종류는?',
          options: ['보류제(Retention Aid)', '사이즈제(Sizing Agent)', '소포제(Defoamer)', '충전제(Filler)'],
          correctIndex: 1,
          explanation: '사이즈제(Sizing Agent)는 종이에 발수성을 부여하여 잉크나 수분의 침투를 방지합니다. 대표적으로 AKD(Alkyl Ketene Dimer)와 ASA(Alkenyl Succinic Anhydride)가 사용됩니다.'
        }
      ]
    },
    {
      title: 'AKD의 이해',
      description: '중성 사이징제인 AKD(Alkyl Ketene Dimer)의 반응 메커니즘과 적용 방법을 학습합니다.',
      icon: '💧',
      duration: '15분',
      videoTitle: 'AKD 사이징 교육',
      videoLink: '#',
      summary: [
        {
          icon: '💧',
          title: 'AKD(Alkyl Ketene Dimer)란',
          content: 'AKD는 중성·알칼리성 초지 조건에서 사용하는 반응형 내첨(Internal) 사이즈제입니다. 셀룰로오스 섬유의 수산기(-OH)와 화학적으로 결합(에스테르 결합)하여 섬유 표면을 소수성(疏水性)으로 변환시킵니다. 이를 통해 종이에 인쇄적성과 필기적성에 필요한 발수 성능을 부여합니다.'
        },
        {
          icon: '🔬',
          title: 'AKD 사이징 반응 메커니즘',
          content: 'AKD는 셀룰로오스 반응(유효 사이징), 가수분해(비유효), 자기중합(비유효)의 3가지 반응 경로를 가집니다. 유효 사이징 비율을 높이려면 pH 7.5~8.5, 초지 온도 40~50°C가 적정 조건이며, AKD가 섬유에 정착(Fixing)되도록 양이온성 보류제의 보조가 필수적입니다.'
        },
        {
          icon: '📈',
          title: 'AKD 적용 시 관리 포인트',
          content: 'AKD는 숙성(Curing) 시간이 필요하여 초지 직후에는 사이징 효과가 100% 발현되지 않습니다. 보통 48~72시간의 자연 숙성 후 최종 사이즈 효과가 안정됩니다. AKD 슬리핑(Slipping) 현상(프레스 롤에 미끄러짐)을 방지하려면 투입량을 적정 수준으로 관리하고 프레스 펠트 세정을 철저히 해야 합니다.'
        }
      ],
      quiz: [
        {
          question: 'AKD 사이징의 최종 효과가 안정되기까지 필요한 숙성 시간은?',
          options: ['6~12시간', '24~36시간', '48~72시간', '7일 이상'],
          correctIndex: 2,
          explanation: 'AKD는 반응형 사이즈제로 셀룰로오스와의 에스테르 결합이 완전히 진행되려면 48~72시간의 자연 숙성(Curing) 시간이 필요합니다. 이 기간 이후 최종 사이즈 효과가 안정됩니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
// 공장운영부 콘텐츠
// ──────────────────────────────────────

// 공장운영부 > 자재관리파트
const MATERIAL_MGMT_CONTENT = {
  metrics: { guides: 1, time: '15분', passScore: 80 },
  items: [
    {
      title: '자재관리파트 역할 및 업무',
      description: '공장 운영에 필요한 자재의 구매, 입출고, 재고 관리 업무 전반을 학습합니다.',
      icon: '📦',
      duration: '15분',
      videoTitle: '자재관리 업무 교육',
      videoLink: '#',
      summary: [
        {
          icon: '📦',
          title: '자재관리파트의 주요 역할',
          content: '자재관리파트는 공장 운영에 필요한 원부자재(펄프, 약품, 포장재 등)와 보수자재(MRO: Maintenance, Repair, Operations)의 구매 요청 접수, 발주, 입고 검수, 재고 관리, 출고 업무를 총괄합니다. 적시(Just-In-Time) 자재 공급을 통해 생산 중단을 방지하면서도 과잉 재고를 최소화하는 것이 핵심 목표입니다.'
        },
        {
          icon: '📋',
          title: '자재 관리 프로세스',
          content: '현업 구매 요청(PR) → 구매 발주(PO) → 입고 검수(입고 전표 발행) → 창고 적재 → 현업 출고 요청 → 출고(불출) → 재고 실사의 순서로 진행됩니다. 모든 입출고 이력은 ERP 시스템에 실시간 등록하며, 월 1회 정기 재고 실사(Physical Inventory)를 통해 장부 재고와 실물 재고를 대조합니다.'
        },
        {
          icon: '📊',
          title: '안전재고 및 발주점 관리',
          content: '핵심 원부자재(펄프 등)는 안전재고(Safety Stock)를 설정하여 리드타임(Lead Time) 중 수요 변동에 대비합니다. 발주점(Reorder Point) = 일 평균 사용량 × 리드타임 + 안전재고로 산출하며, 발주점 이하로 재고가 감소하면 자동 알림이 발생하여 구매 프로세스를 개시합니다.'
        }
      ],
      quiz: [
        {
          question: '발주점(Reorder Point) 산출 공식으로 올바른 것은?',
          options: [
            '월 평균 사용량 × 2',
            '일 평균 사용량 × 리드타임 + 안전재고',
            '연간 사용량 ÷ 12',
            '안전재고 × 리드타임'
          ],
          correctIndex: 1,
          explanation: '발주점(Reorder Point) = 일 평균 사용량 × 리드타임(Lead Time) + 안전재고(Safety Stock)입니다. 이 수치 이하로 재고가 감소하면 구매 발주를 개시합니다.'
        }
      ]
    }
  ]
};

// 공장운영부 > 환경관리파트
const ENV_MGMT_CONTENT = {
  metrics: { guides: 1, time: '15분', passScore: 80 },
  items: [
    {
      title: '폐수 슬러지 처리의 이해',
      description: '제지 공정에서 발생하는 폐수와 슬러지의 처리 과정 및 환경 관리 기준을 학습합니다.',
      icon: '🌊',
      duration: '15분',
      videoTitle: '폐수 슬러지 처리 교육',
      videoLink: '#',
      summary: [
        {
          icon: '🌊',
          title: '제지 폐수 처리 공정',
          content: '제지 공정에서 발생하는 폐수는 1차 처리(물리적 처리)와 2차 처리(생물학적 처리)를 거칩니다. 1차 처리에서는 침전지(Clarifier)를 통해 부유물질(SS)을 제거하고, 2차 처리에서는 활성슬러지법(Activated Sludge Process)으로 유기물(BOD/COD)을 분해합니다. 처리된 방류수는 환경부 수질 배출 허용 기준을 충족해야 합니다.'
        },
        {
          icon: '🏗️',
          title: '슬러지 처리 및 재활용',
          content: '1차 슬러지(Primary Sludge)는 섬유와 충전제가 주성분으로 탈수 후 재활용이 가능합니다. 2차 슬러지(잉여 활성슬러지)는 유기물이 주성분이며, 탈수 → 건조 과정을 거쳐 고형연료(SRF)로 재활용하거나 매립 처리합니다. 탈수기(Belt Press, Screw Press)의 효율적 운전이 슬러지 처리 비용 절감의 핵심입니다.'
        },
        {
          icon: '📋',
          title: '환경 관리 기준 및 모니터링',
          content: '방류수 수질은 BOD, COD, SS, T-N(총질소), T-P(총인) 항목을 실시간 자동측정기기(TMS)로 24시간 모니터링하며 환경부에 자동 전송됩니다. 법적 배출 기준의 80% 수준을 자체 관리 목표로 설정하여 여유를 확보하고, 이상 발생 시 즉시 원인 분석 및 공정 조치를 시행합니다.'
        }
      ],
      quiz: [
        {
          question: '제지 폐수의 2차 처리에서 유기물(BOD/COD) 분해에 사용되는 방법은?',
          options: ['침전법', '활성슬러지법', '여과법', '소각법'],
          correctIndex: 1,
          explanation: '활성슬러지법(Activated Sludge Process)은 미생물을 이용하여 폐수 중 유기물(BOD/COD)을 생물학적으로 분해하는 2차 처리 방법입니다. 제지 폐수 처리에 가장 널리 사용됩니다.'
        }
      ]
    }
  ]
};

const COMMON_CONTENT = {
  metrics: { guides: 1, time: '10분', passScore: 80 },
  items: [
    {
      title: '무림 공통 직무 소양 교육',
      description: '신입사원으로서 알아야 할 기본 사내 규정 및 정보보안 가이드입니다.',
      icon: '🏢',
      duration: '10분',
      videoTitle: '무림인 공통 기본 소양 교육 (인재개발팀)',
      videoLink: '#',
      summary: [
        {
          icon: '🏢',
          title: '회사 사명 및 핵심 가치',
          content: '무림은 친환경 종이 및 신소재 문화를 선도하는 기업으로서 고객 지향, 도전 정신, 동반 성장의 핵심 가치를 공유합니다.'
        },
        {
          icon: '🔒',
          title: '사내 정보 보안 준수',
          content: '사내 PC는 업무 종료 시 반드시 화면 잠금을 실시해야 하며, 외부 USB 등의 저장 매체 사용은 사내 보안 프로그램(DLP)을 통해 사전 승인을 득한 후 사용할 수 있습니다.'
        }
      ],
      quiz: [
        {
          question: '업무 중 자리를 비우거나 퇴근 시 사내 보안을 위해 준수해야 할 조치는?',
          options: ['PC 켜두기', 'PC 화면 잠금(Win+L) 또는 전원 끄기', '비밀번호 포스트잇 부착', '모니터만 끄기'],
          correctIndex: 1,
          explanation: '사내 보안 유지를 위해 자리를 비우거나 퇴근할 때 PC 화면을 잠그거나 전원을 끄는 것이 기본 보안 수칙입니다.'
        }
      ]
    }
  ]
};

// ──────────────────────────────────────
const OjtGuidePanel = ({
  ojtState: propOjtState,
  onOjtStateChange,
  onBack: propOnBack
}) => {
  // 내부 fallback 상태
  const [internalState, setInternalState] = useState({
    step: 0,
    dept: '',
    part: '',
    itemIdx: null
  });

  const currentState = propOjtState !== undefined ? propOjtState : internalState;
  const step = currentState.step !== undefined ? currentState.step : 0;
  const selectedDept = currentState.dept || '';
  const selectedPart = currentState.part || '';
  const selectedItemIdx = currentState.itemIdx !== undefined ? currentState.itemIdx : null;

  const updateState = (updates, replace = false) => {
    const next = { ...currentState, ...updates };
    if (onOjtStateChange) {
      onOjtStateChange(next, replace);
    } else {
      setInternalState(next);
    }
  };

  const setStep = (newStep, replace = false) => updateState({ step: newStep }, replace);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);

  // Step 2 상태
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Step 3 상태
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // 현재 선택된 부서/파트에 따라 콘텐츠 데이터 분기
  const getContentData = () => {
    // 품질보증부
    if (selectedDept === '품질보증부' && selectedPart === '생산관리파트') return DEMO_CONTENT;
    if (selectedDept === '품질보증부' && selectedPart === '품질보증파트') return QA_CONTENT;

    // 공무부
    if (selectedDept === '공무부' && selectedPart === '설비관리파트') return EQUIP_MAINTENANCE_CONTENT;

    // 물류부
    if (selectedDept === '물류부') return LOGISTICS_CONTENT;

    // 생산부
    if (selectedDept === '생산부' && selectedPart === '조성파트') return REFINING_CONTENT;
    if (selectedDept === '생산부' && (selectedPart === '생산1파트' || selectedPart === '생산2파트')) return WIRE_PART_CONTENT;
    if (selectedDept === '생산부' && (selectedPart === '가공1파트' || selectedPart === '가공2파트')) return LATEX_CONTENT;

    // 제지기술개발부
    if (selectedDept === '제지기술개발부') return PAPER_TECH_CONTENT;

    // 공장운영부
    if (selectedDept === '공장운영부' && selectedPart === '자재관리파트') return MATERIAL_MGMT_CONTENT;
    if (selectedDept === '공장운영부' && selectedPart === '환경관리파트') return ENV_MGMT_CONTENT;

    return COMMON_CONTENT;
  };

  const activeContent = getContentData();

  // 현재 선택된 학습 항목
  const currentItem = selectedItemIdx !== null ? activeContent.items[selectedItemIdx] : null;

  // 점수 계산
  const getScore = () => {
    if (!currentItem) return 0;
    let correct = 0;
    currentItem.quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    return Math.round((correct / currentItem.quiz.length) * 100);
  };

  // 전체 초기화
  const handleReset = () => {
    updateState({
      step: 0,
      dept: '',
      part: '',
      itemIdx: null
    });
    setIsConfirmed(false);
    setAnswers({});
    setSubmitted(false);
  };

  // 목록으로 돌아가기 (세부 상태 초기화)
  const handleBackToList = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      updateState({
        step: 1,
        itemIdx: null
      });
      setIsConfirmed(false);
      setAnswers({});
      setSubmitted(false);
    }
  };

  // ─── 렌더링 ───

  return (
    <div className="ojt-panel">
      {/* 공통 헤더 */}
      <div className="content-header">
        <h2>🌱 OJT 가이드</h2>
        <div className="content-subheader-container">
          <span className="slogan-badge">맞춤형 직무 학습</span>
          <span className="slogan-desc">
            부서·파트를 선택하면 핵심 업무 요약과 학습 검증 퀴즈를 제공합니다
          </span>
        </div>
      </div>

      {/* 스텝 인디케이터 (1단계 이상일 때 표시) */}
      {step > 0 && (
        <div className="ojt-step-indicator">
          <div className={`ojt-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            1<span className="ojt-step-label">목록</span>
          </div>
          <div className={`ojt-step-line ${step > 1 ? 'completed' : ''}`} />
          <div className={`ojt-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            2<span className="ojt-step-label">학습</span>
          </div>
          <div className={`ojt-step-line ${step > 2 ? 'completed' : ''}`} />
          <div className={`ojt-step-dot ${step >= 3 ? 'active' : ''}`}>
            3<span className="ojt-step-label">검증</span>
          </div>
        </div>
      )}

      {/* ═══════════ Step 0: 부서/파트 선택 ═══════════ */}
      {step === 0 && (
        <div className="ojt-select-screen">
          <div className="ojt-welcome-card">
            <span className="ojt-welcome-icon">🎓</span>
            <h3>직무 맞춤형 학습을 시작하세요</h3>
            <p>
              소속 부서와 파트를 선택하면,
              <br />
              해당 직무에 필요한 핵심 가이드와 학습 검증 퀴즈를 제공합니다.
            </p>
          </div>

          <div className="ojt-select-form">
            <div className="ojt-select-row">
              <div className="ojt-select-group">
                <label>부서 선택</label>
                <select
                  className="ojt-select"
                  value={selectedDept}
                  onChange={(e) => {
                    updateState({ dept: e.target.value, part: '' }, true);
                  }}
                >
                  <option value="">부서를 선택하세요</option>
                  {Object.keys(ORG_DATA).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="ojt-select-group">
                <label>파트 선택</label>
                <select
                  className="ojt-select"
                  value={selectedPart}
                  onChange={(e) => {
                    updateState({ part: e.target.value }, true);
                  }}
                  disabled={!selectedDept || ORG_DATA[selectedDept]?.length === 0}
                >
                  <option value="">
                    {!selectedDept ? '부서를 먼저 선택하세요'
                      : ORG_DATA[selectedDept]?.length === 0 ? '산하 파트 없음'
                        : '파트를 선택하세요'}
                  </option>
                  {selectedDept && ORG_DATA[selectedDept]?.map((part) => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="ojt-start-btn"
              disabled={!selectedDept || (!selectedPart && ORG_DATA[selectedDept]?.length > 0)}
              onClick={() => setStep(1)}
            >
              학습 시작하기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Step 1: 학습 항목 목록 ═══════════ */}
      {step === 1 && (
        <div className="ojt-learning-screen">
          <button className="ojt-back-btn" onClick={() => propOnBack ? propOnBack() : setStep(0)}>
            <ChevronLeft size={16} /> 부서 선택으로 돌아가기
          </button>

          <span className="ojt-dept-badge">📍 {selectedDept} &gt; {selectedPart}</span>

          {/* 메트릭 카드 */}
          <div className="ojt-metrics">
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">📖</span>
              <div className="ojt-metric-value">{activeContent.metrics.guides}개</div>
              <div className="ojt-metric-label">필수 학습 항목</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">⏱️</span>
              <div className="ojt-metric-value">{activeContent.metrics.time}</div>
              <div className="ojt-metric-label">총 학습 권장 시간</div>
            </div>
            <div className="ojt-metric-card">
              <span className="ojt-metric-icon">🏆</span>
              <div className="ojt-metric-value">{activeContent.metrics.passScore}점</div>
              <div className="ojt-metric-label">각 항목 패스 기준</div>
            </div>
          </div>

          {/* 학습 항목 리스트 */}
          <div className="ojt-summary-title">
            <BookOpen size={18} /> 학습 항목 목록
          </div>

          <div className="ojt-item-list">
            {activeContent.items.map((item, idx) => (
              <div
                className="ojt-item-card"
                key={idx}
                onClick={() => updateState({ itemIdx: idx, step: 2 })}
              >
                <div className="ojt-item-card-icon">{item.icon}</div>
                <div className="ojt-item-card-body">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="ojt-item-card-meta">
                    <Clock size={14} />
                    <span>{item.duration}</span>
                  </div>
                </div>
                <div className="ojt-item-card-arrow">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ Step 2: 세부 학습 (선택한 항목) ═══════════ */}
      {step === 2 && currentItem && (
        <div className="ojt-learning-screen">
          <button className="ojt-back-btn" onClick={handleBackToList}>
            <ChevronLeft size={16} /> 학습 목록으로 돌아가기
          </button>

          <span className="ojt-dept-badge">
            📍 {selectedDept} &gt; {selectedPart} &gt; {currentItem.title}
          </span>

          <div className="ojt-scroll-content">
            {/* 요약 콘텐츠 */}
            <div className="ojt-summary-section">
              <div className="ojt-summary-title">
                <span>{currentItem.icon}</span> {currentItem.title}
              </div>
              {currentItem.summary.map((s, idx) => (
                <div className="ojt-summary-card" key={idx}>
                  <div className="ojt-summary-card-header">
                    <span className="ojt-summary-card-icon">{s.icon}</span>
                    <h4>{s.title}</h4>
                  </div>
                  <p>{s.content}</p>
                </div>
              ))}
            </div>

            {/* 영상 링크 */}
            <a
              className="ojt-video-link"
              href={currentItem.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (currentItem.videoLink === '#') e.preventDefault(); }}
            >
              <div className="ojt-video-link-icon">
                <PlayCircle size={22} />
              </div>
              <div className="ojt-video-link-text">
                <h4>🎬 {currentItem.videoTitle}</h4>
                <p>
                  {currentItem.videoLink === '#'
                    ? '영상 링크 준비 중 (네이버 카페 업로드 후 연동 예정)'
                    : '클릭하여 교육 영상 보기'}
                </p>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </a>
          </div>

          {/* 숙지 확인 → 퀴즈 이동 */}
          <div className="ojt-confirm-area">
            <label className="ojt-confirm-checkbox">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <span>위 가이드 항목을 모두 읽고 숙지했습니다</span>
            </label>
            <button
              className="ojt-next-btn"
              disabled={!isConfirmed}
              onClick={() => setStep(3)}
            >
              ✍️ 학습 검증 퀴즈 도전하기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Step 3: 퀴즈 (검증) ═══════════ */}
      {step === 3 && currentItem && (
        <div className="ojt-quiz-screen">
          <button className="ojt-back-btn" onClick={() => { if (propOnBack) propOnBack(); else { setStep(2); setSubmitted(false); setAnswers({}); } }}>
            <ChevronLeft size={16} /> 학습 화면으로 돌아가기
          </button>

          <div className="ojt-scroll-content">
            {/* 안내 */}
            <div className="ojt-quiz-intro">
              <span className="ojt-quiz-intro-icon">✍️</span>
              <p>
                <strong>{currentItem.title}</strong> 학습 내용을 검증합니다.
                <br />
                <strong>{activeContent.metrics.passScore}점 이상</strong>이면 통과입니다.
              </p>
            </div>

            {/* 퀴즈 문제 */}
            {currentItem.quiz.map((q, qIdx) => (
              <div className="ojt-quiz-question" key={qIdx}>
                <div className="ojt-quiz-question-header">
                  <span className="ojt-quiz-number">Q{qIdx + 1}</span>
                  <h4>{q.question}</h4>
                </div>
                <div className="ojt-quiz-options">
                  {q.options.map((opt, oIdx) => {
                    let extraClass = '';
                    if (submitted) {
                      if (oIdx === q.correctIndex) extraClass = 'correct';
                      else if (answers[qIdx] === oIdx) extraClass = 'incorrect';
                    } else if (answers[qIdx] === oIdx) {
                      extraClass = 'selected';
                    }
                    return (
                      <label className={`ojt-quiz-option ${extraClass}`} key={oIdx}>
                        <input
                          type="radio"
                          name={`quiz-${qIdx}`}
                          checked={answers[qIdx] === oIdx}
                          disabled={submitted}
                          onChange={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`ojt-quiz-feedback ${answers[qIdx] === q.correctIndex ? 'correct' : 'incorrect'}`}>
                    <span className="ojt-quiz-feedback-icon">
                      {answers[qIdx] === q.correctIndex ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </span>
                    <span>
                      {answers[qIdx] === q.correctIndex ? '정답!' : '오답.'} {q.explanation}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* 결과 카드 */}
            {submitted && (
              <div className={`ojt-result-card ${getScore() >= activeContent.metrics.passScore ? 'pass' : 'fail'}`}>
                <h3>
                  {getScore() >= activeContent.metrics.passScore
                    ? '🎉 축하합니다! 테스트를 통과했습니다'
                    : '📝 아쉽지만 기준 점수에 미달했습니다'}
                </h3>
                <div className="ojt-result-score">{getScore()}점</div>
                <p>
                  {getScore() >= activeContent.metrics.passScore
                    ? '해당 항목의 핵심 내용을 잘 숙지하셨습니다. 수고하셨습니다!'
                    : `패스 기준은 ${activeContent.metrics.passScore}점입니다. 요약 내용을 다시 확인해 보세요.`}
                </p>
                <div className="ojt-result-actions">
                  <button className="ojt-reset-btn" onClick={handleBackToList}>
                    다른 항목 학습하기
                  </button>
                  <button className="ojt-reset-btn" onClick={handleReset}>
                    처음으로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          {!submitted && (
            <button
              className="ojt-submit-btn"
              disabled={Object.keys(answers).length < currentItem.quiz.length}
              onClick={() => setSubmitted(true)}
            >
              <Send size={18} /> 정답 제출
            </button>
          )}
        </div>
      )}

      {/* ═══════════ 확대 예정 모달 ═══════════ */}
      {showModal && (
        <div className="ojt-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ojt-modal" onClick={(e) => e.stopPropagation()}>
            <span className="ojt-modal-icon">🚧</span>
            <h3>하반기 확대 예정</h3>
            <p>
              현재 <strong>{selectedDept}</strong>
              {selectedPart && <> &gt; <strong>{selectedPart}</strong></>}의
              학습 콘텐츠는 준비 중입니다.
              <br /><br />
              시범 운영 부서: <strong>품질보증부 &gt; 생산관리파트</strong>에서 먼저 체험해 보세요!
            </p>
            <button className="ojt-modal-close-btn" onClick={() => setShowModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OjtGuidePanel;
