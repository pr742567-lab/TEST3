/**
 * 사내 지식 검색(RAG) 모의 시나리오 데이터 및 검색 매칭 로직
 */

export function findKnowledgeAnswer(query, selectedCategory) {
  if (!query) return { matched: false, fullAnswer: '', sources: [] };

  const normalizedQuery = query.replace(/\s+/g, '').toLowerCase();

  // 신규. 작업표준: CM3 Scanner Sensor 청소 및 교체 작업 표준
  const isCm3SensorCleaningScenario =
    normalizedQuery.includes("cm3scannersensor") ||
    (normalizedQuery.includes("cm3") && normalizedQuery.includes("scanner") && normalizedQuery.includes("청소")) ||
    (normalizedQuery.includes("cm3") && normalizedQuery.includes("sensor") && normalizedQuery.includes("청소")) ||
    normalizedQuery.includes("cm3scannersensor청소및교체작업표준");

  // 신규. 작업표준: 지필유도판 정전기 방지지 교체 작업표준
  const isStaticFabricScenario =
    normalizedQuery.includes("지필유도판") ||
    normalizedQuery.includes("정전기방지지") ||
    (normalizedQuery.includes("정전기") && normalizedQuery.includes("방지지")) ||
    normalizedQuery.includes("지필유도판정전기방지지교체작업표준");

  // 신규. 위험성평가: 밀폐공간 내부 청소 작업 시 안전 대책
  const isConfinedSpaceScenario =
    normalizedQuery.includes("밀폐공간") ||
    normalizedQuery.includes("내부청소") ||
    (normalizedQuery.includes("밀폐") && normalizedQuery.includes("안전대책")) ||
    normalizedQuery.includes("밀폐공간내부청소작업시안전대책");

  // 신규. 위험성평가: 독타 교체 작업 위험성 평가
  const isDoctorReplaceScenario =
    normalizedQuery.includes("독타교체") ||
    normalizedQuery.includes("닥터교체") ||
    (normalizedQuery.includes("독타") && normalizedQuery.includes("위험성평가")) ||
    normalizedQuery.includes("독타교체작업위험성평가");

  // 신규. 개선제안: MX#1.2 DIP 및 MX1 CB TOWER 투입방법 개선
  const isDipTowerScenario =
    normalizedQuery.includes("diptower") ||
    normalizedQuery.includes("cbtower") ||
    normalizedQuery.includes("투입방법개선") ||
    normalizedQuery.includes("mx#1.2dip") ||
    normalizedQuery.includes("cb타워");

  // 신규. 개선제안: PM1 3번 Felt save all 설치 건
  const isFeltSaveAllScenario =
    normalizedQuery.includes("saveall") ||
    normalizedQuery.includes("세이브올") ||
    (normalizedQuery.includes("felt") && normalizedQuery.includes("설치")) ||
    normalizedQuery.includes("pm13번felt") ||
    normalizedQuery.includes("pm13번feltsaveall");

  // 신규. 개선제안: PM3 Press pulper A/G & Pump 가동 감소로 전력절감
  const isPressPulperScenario =
    normalizedQuery.includes("presspulper") ||
    normalizedQuery.includes("프레스펄퍼") ||
    (normalizedQuery.includes("pulper") && normalizedQuery.includes("가동")) ||
    normalizedQuery.includes("pm3presspulper") ||
    normalizedQuery.includes("가동감소로전력절감");

  // 신규. 업무매뉴얼: 저장품 기자재 입고는 어떻게 하나요?
  const isVmiIncomingScenario =
    normalizedQuery.includes("기자재입고") ||
    normalizedQuery.includes("vmi입고") ||
    (normalizedQuery.includes("저장품") && normalizedQuery.includes("입고")) ||
    normalizedQuery.includes("저장품기자재입고");

  // 신규. 업무매뉴얼: 설비 일상 보전 및 유지 관리 매뉴얼은?
  const isMaintenanceScenario =
    normalizedQuery.includes("설비일상보전") ||
    normalizedQuery.includes("유지관리매뉴얼") ||
    (normalizedQuery.includes("설비") && normalizedQuery.includes("보전") && normalizedQuery.includes("유지")) ||
    normalizedQuery.includes("설비일상보전및유지관리매뉴얼");

  // 신규. 업무매뉴얼: 제품 파손시 업무 절차는?
  const isDamagedProductScenario =
    normalizedQuery.includes("제품파손") ||
    normalizedQuery.includes("파손시업무") ||
    (normalizedQuery.includes("제품") && normalizedQuery.includes("파손") && normalizedQuery.includes("절차")) ||
    normalizedQuery.includes("제품파손시업무절차");

  // 신규. 트러블슈팅: CM3 블레이드 빔 개방 불량 조치
  const isBladeBeamScenario =
    normalizedQuery.includes("블레이드빔") ||
    normalizedQuery.includes("개방불량") ||
    (normalizedQuery.includes("cm3") && normalizedQuery.includes("블레이드")) ||
    normalizedQuery.includes("cm3블레이드빔개방불량");

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

  if (isCm3SensorCleaningScenario) {
    matched = true;
    fullAnswer = `CM3 SCANNER SENSOR 청소 작업 표준은 다음과 같습니다.

---

### 1. 작업 준비 및 스캐너 헤드 분리
* 안전모와 안전화를 착용하십시오.
* LOCAL TOUCH PANEL에서 CLUTCH OPEN BUTTON을 누르십시오.
* 생산 중인 종이에 배임을 방지하기 위하여 SCANNER HEAD를 LIMIT SWITCH까지 당기십시오.
* 손으로 SCANNER HEAD를 밀어서 상하 헤드를 분리하십시오.

---

### 2. SENSOR 표면 청소
* 준비된 청소용 가제를 이용하여 SENSOR 표면을 청소하십시오.

---

### 3. 스캐너 헤드 재결합 및 시스템 복귀
* LOCAL TOUCH PANEL에서 CLUTCH CLOSE BUTTON을 누르십시오.
* LOCAL TOUCH PANEL에서 AUTO MODE BUTTON을 눌러 AUTO MODE를 선택하십시오.
* LOCAL TOUCH PANEL에서 STDZ BUTTON을 눌러 SENSOR STDZ를 실행하십시오.

---

### 4. 확인 작업
* OP STATION에서 SENSOR 측정 DATA의 이상 유무 및 측정 상태를 확인하십시오.

제공된 문서에는 CM3 Scanner Sensor의 청소 방법에 대한 내용만 있으며, 교체 작업 표준에 대한 정보는 포함되어 있지 않습니다.`;
    sources = [
      { num: 1, title: 'CJ-106-020)_CM3 SCANNER SENSOR 청소방법 안전 작업표준서.docx', file_name: 'CJ-106-020)_CM3 SCANNER SENSOR 청소방법 안전 작업표준서.docx', score: 0.785, url: '#', web_view_link: '#' }
    ];
  } else if (isStaticFabricScenario) {
    matched = true;
    fullAnswer = `지필유도판 정전기 방지지 교체 작업표준은 다음과 같습니다.

지필 정전기는 지필 펄럭거림이나 오버랩 불량으로 나타날 수 있으며, 장도부 지필유도판의 정전기 방지지를 교체하여 해결합니다.

---

### 1. 문제 진단 및 확인
* 재단 시 정전기로 인한 지필 펄럭거림 또는 오버랩 불량이 발생하는지 확인합니다.

---

### 2. 작업 목적
* 지필 정전기를 방지하여 원활한 재단 작업을 위해 재단4호기 장도부 지필유도판에 정전기 방지지를 안전하게 부착합니다.

---

### 3. 정전기 방지지 교체 작업 절차

#### 3.1 공구 및 준비물 준비
* 장도부 지필 유도판에 부착하기 위한 정전기 방지지를 준비합니다.
* 칼, OPP 테이프, 후레쉬 등을 준비합니다.

#### 3.2 준비 작업 및 안전 수칙
* 기계를 중지하고 기계가동금지 푯말을 부착합니다.
* 정전기 방지지 부착 전 주위 위험 요소를 점검하고 기계 이상 유무를 확인합니다.
* 끼임 사고를 방지하기 위해 원롤, 드럼롤 주변의 기계 사이에 안전 공간을 확보합니다.
* 안전모, 안전화, 각반, 귀마개, 장갑 등 필요한 안전보호구를 철저히 착용합니다.

#### 3.3 정전기 방지지 부착 (본작업)
* 정전기 방지지 2매를 OPP 테이프를 사용하여 연결합니다.
* 연결된 정전기 방지지를 장도와 웜롤 사이 지필유도판에 부착합니다.
* 작업 전/후 스트레칭을 실시하여 요통을 예방합니다.
* 작업 공간이 협소하므로 주변을 확인하여 부딪히지 않도록 주의하며 작업합니다.

#### 3.4 확인 작업
* 정전기 방지지가 정상적으로 부착되었는지 확인합니다.
* 기계를 가동하여 재단 시 정전기로 인한 지필 펄럭거림, 오버랩 불량이 더 이상 발생하지 않는지 확인합니다.

#### 3.5 마무리 작업
* 사용한 공구를 정위치시키고 주변을 정리합니다.
* 기계를 재가동시킵니다.`;
    sources = [
      { num: 1, title: '재단4호기 장도부 지필유도판 정전기 방지지 교체 작업표준(제정문서).docx', file_name: '재단4호기 장도부 지필유도판 정전기 방지지 교체 작업표준(제정문서).docx', score: 0.90, url: '#', web_view_link: '#' }
    ];
  } else if (isConfinedSpaceScenario) {
    matched = true;
    fullAnswer = `밀폐공간 내부 청소 작업 시 다음 안전 대책을 철저히 준수해야 합니다.

---

### 1. 밀폐공간 작업 전 준비 및 안전 조치
* 작업 전 필수 안전철칙 교육을 이수하고 충분히 숙지해야 합니다.
* 밀폐공간작업 프로그램을 연 1회 수립하고, 안전운영부 주관으로 프로그램 추진 일정을 수립하여 평가를 실시합니다.
* 밀폐공간 출입 전 산소 및 가스농도를 반드시 측정합니다.
* 작업 구역에 감시자(관리감독자)를 배치하여 상시 감독합니다.

---

### 2. 밀폐공간 출입 및 작업 시 안전 지침 (Unwinder/Winder Pit)
* 가능하면 출입문을 개방한 후 외부에서 내부 청소를 실시합니다.
* 내부 출입이 필요한 경우 밀폐공간 작업 절차를 반드시 준수해야 합니다.
* 내부 출입 전 산소농도를 다시 측정한 후 진입합니다.
* 작업 구역 감시자(관리감독자)를 배치해야 합니다.

---

### 3. 밀폐공간 출입 제한 및 작업 지침 (CM3 Doctor Collection Tank)
* 출입문이 협소하여 내부 출입이 불가합니다.
* 출입문에 신체 일부가 노출되는 경우에도 밀폐공간 작업 절차를 준수합니다.
* 작업 구역 감시자(관리감독자)를 배치해야 합니다.

---

### 4. 고압세척기 사용 시 안전 지침
* 피트 주변 및 내부 이물질 제거를 위해 고압세척기 사용 시 이물질 비산 위험이 있습니다.
* 1회용 작업복, 보안경, 방진마스크를 반드시 착용합니다.
* 작업 시 주변을 확인한 후 작업을 시작합니다.

---

### 5. PIT 청소 시 추가 안전 지침
* PIT 청소 시 A/G 오작동으로 인한 말림 위험에 대비하여:
* Winder Pit A/G에 LOTO(Lock Out, Tag Out)를 적용합니다.
* SP Room에 태그(tag)를 부착합니다.
* 와인더 Pit 하층 출입문 개방 작업 중 전도로 인한 추락 위험에 대비하여:
* 이동식 사다리를 비치하여 해당 작업 시 활용합니다.`;
    sources = [
      { num: 1, title: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', file_name: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', score: 0.679, url: '#', web_view_link: '#' }
    ];
  } else if (isDoctorReplaceScenario) {
    matched = true;
    fullAnswer = `독타 교체 작업 위험성 평가는 다음과 같습니다.

---

### 1. Doctor 교체 작업 시 추락 위험
* 위험: C/D Doctor 교체 시 #2 cylinder dryer 2층 개구부 추락 위험이 있습니다. 또한, 각 헤드 Cleaning Doctor 교체 시 족장 북쪽 안전발판 미설치로 인한 발빠짐 및 추락 위험이 존재합니다.
* 방지 대책:
* 작업 공간에 안전 난간을 설치하세요.
* 추락주의 안전표지판을 부착하고, 안전난간 및 바닥부를 추락 위험 인지용으로 도색하세요.
* 높은 곳 접근 시에는 반드시 안전대를 착용하고 체결 후 작업하세요.
* 독타 취입취출용 족장을 설치하고, 안전 발판을 30cm 너비로 설치하세요.

---

### 2. Doctor 취급 및 교체 시 베임 위험
* 위험: Dry cylinder Doctor 취급 및 취출입 시, 또는 Doctor 취출입 및 점검 시 날에 의한 베임 위험이 있습니다.
* 방지 대책:
* 방검 장갑을 착용하세요.
* 작업은 반드시 2인 1조로 진행하세요.
* 작업 간 복명복창을 실시하여 상호 안전을 확인하세요.

---

### 3. Doctor 교체 및 점검 시 전도 위험
* 위험: Doctor 교체 및 점검, 청소 시 바닥의 물기로 인해 미끄러져 넘어질 위험이 있습니다.
* 방지 대책:
* 작업 전 바닥의 물기를 완전히 제거한 후 작업을 시작하세요.

---

### 4. Doctor BOX 이동 시 근골격계 위험
* 위험: 독타 BOX를 이동할 때 작업자의 요통이 발생할 수 있습니다.
* 방지 대책:
* 독타 BOX 이동 시에는 반드시 손수레를 이용하여 운반하세요.
* 작업 전 충분한 스트레칭을 실시하여 몸을 풀어주세요.`;
    sources = [
      { num: 1, title: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', file_name: '[가공2파트] 유첨4. 2026년 가공2파트 정기 위험성 평가_V1.0.xlsx', score: 0.679, url: '#', web_view_link: '#' }
    ];
  } else if (isDipTowerScenario) {
    matched = true;
    fullAnswer = `MX#1.2 DIP 및 MX1 CB TOWER 투입방법 개선에 대한 제안 내용은 다음과 같습니다.

---

### 1. 문제점 및 현상
현재 MX#1.2 DIP 및 MX1 CB TOWER의 사용 방법은 다음과 같이 두 라인 모두 UB#2 C/H를 거쳐 TOWER C/H로 투입되는 순서로 작업이 이루어지고 있습니다.
* **기존 경로 1**: DIP TOWER → UB#2 C/H → TOWER C/H
* **기존 경로 2**: MX1 CB TOWER → UB#2 C/H → TOWER C/H

---

### 2. 개선안 (대책)
MX#1.2 DIP 및 MX1 CB TOWER에서 MX2 UB#2 C/H로 가는 배관을 **MX#2 TOWER C/H 행으로 가는 배관 라인으로 신설**합니다.
이를 통해 MX2 UB#2 C/H를 미사용하도록 전환함으로써, **A/G(교반기) 및 PUMP 가동을 중지하여 전력을 절감**할 수 있습니다.

---

### 3. 기대 효과
* **연간 전력 절감 예상 금액**: 총 **19,533,135원 / 년**
* **효과 산출 근거** (PM1 가동일수 346.4일/년, 전력단가 102.6원/kW 기준 적용):
  * **A/G (교반기)**: 22kW × 70% (부하율) × 102.6원/kW × 24h/d × 346.4d/a = **13,135,820원 / 년**
  * **PUMP (펌프)**: 15kW × 50% (부하율) × 102.6원/kW × 24h/d × 346.4d/a = **6,397,315원 / 년**`;
    sources = [
      { num: 1, title: '2021-02-299.pdf', file_name: '2021-02-299.pdf', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isFeltSaveAllScenario) {
    matched = true;
    fullAnswer = `PM1 3번 Felt save all 설치 건에 대한 제안 내용은 다음과 같습니다.

---

### 1. 문제점 및 현상
현재 PM1 3번 Felt 고압 및 저압 샤워 배관 아래에 save all(회수 장치)이 설치되어 있지 않습니다.
이로 인해 사용한 용수가 그대로 낙하하여 하수구로 버려지고 있어, 불필요한 폐수 처리 비용이 상시 발생하고 있습니다.

---

### 2. 개선안 (대책)
3번 Felt 고압 및 저압 샤워 배관 하부로 **save all을 설치**합니다.
* 3P 샤워수에서 발생한 용수를 한곳으로 수거합니다.
* 모아진 용수를 **seal over T/K(탱크)로 이송하여 공정수로 재사용**합니다.
* 이를 통해 원지 생산 용수를 절감하고 폐수 처리 비용을 낮춥니다.

---

### 3. 기대 효과
* **폐수 처리 절감 금액**:
  * **월간 절감 금액**: **330,739원 / 월**
  * **연간 절감 금액**: **3,968,870원 / 년**
* **효과 산출 근거**:
  * 3번 Felt 샤워수 배출량: **47.52 m³/일**
  * 폐수 처리 부담금 단가: **Ton(m³)당 232원**
  * 산출식: 47.52 m³/일 × 232원/Ton × 30일 = 약 330,739원 / 월 (연간 약 3,968,870원)`;
    sources = [
      { num: 1, title: '2023-01-353.pdf', file_name: '2023-01-353.pdf', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isPressPulperScenario) {
    matched = true;
    fullAnswer = `PM3 Press pulper A/G & Pump 가동 감소로 전력절감에 대한 제안 내용은 다음과 같습니다.

---

### 1. 문제점 및 현상
1. Press pulper로 Center roll doctor 클리닝 샤워수가 지속적으로 유입됨에 따라 Pulper 수위 레벨이 상승하여 AG(교반기) & Pump가 정기적(일 평균 9~10회, 약 4분/회)으로 가동되고 있습니다. (지절 시 가동 이외에도 주기적으로 40분/일 가동됨)
   * AG & Pump 동작: 수위 레벨 92% 가동 시작, 45%일 때 중지됨.
2. 중지/보수 초출 및 지절을 제외하고 Press pulper A/G & Pump 가동을 중지할 수 있다면 **2,243kW/일 (64,721kW/월) 전력을 절감**할 수 있습니다.
   * AG motor 130kW (부하율 80%), Pump motor 37kW (부하율 66%)

---

### 2. 개선안 (대책)
**Press pulper overflow 신규 배관 및 On/Off 밸브 설치**
* Press pulper level 약 75% ~ 80% 지점에 Overflow 배관 및 On/Off 밸브를 신설하여 정상 운전 중 샤워수에 의한 수위 상승 시 폐수로 배출되게 합니다.
* 이를 통해 불필요한 AG & Pump 가동을 중지하고, 지절 시에는 밸브가 닫혀 기존과 동일하게 AG & Pump가 가동되도록 구성합니다.
* 현재 Press pulper에서 UB 타워로 펌핑된 샤워수는 파지와 혼합되어 Thickner를 거쳐 PDF에서 처리되고 있으나 사용처가 없어 폐수로 드레인 되고 있으므로, Press pulper에서 직접 폐수로 배출되더라도 폐수 총량은 현 수준으로 유지되고 오히려 SS(부유물질) 농도는 낮아질 것으로 판단됩니다.

---

### 3. 기대 효과
* **전력 절감 효과**: 총 **2,599kW / 월** 절감
  * A/G 중지: 가동시간 40분(0.7hr)/일 × 130kW × 부하율 80% = **72.8kW/일 절감**
  * Pump 중지: 가동시간 40분(0.7hr)/일 × 37kW × 부하율 66% = **17.1kW/일 절감**
* **절감 금액**: 연간 약 **4,693천원** (월 약 391천원 절감)
  * 산출식: 31,733kW (A/G+Pump) × 147.9원/kW (23년 사업계획 단가) × 12개월`;
    sources = [
      { num: 1, title: '2023-03-423.pdf', file_name: '2023-03-423.pdf', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isVmiIncomingScenario) {
    matched = true;
    fullAnswer = `자재관리파트의 저장품 기자재(VMI) 입고 업무 절차는 다음과 같습니다.

---

### 1. 업무 목적
공급사 관리재고(VMI)의 효율적인 재고관리를 목적으로 합니다.
* **VMI (Vendor Managed Inventory)**: 공급사 관리재고로 납품업체에서 관리하는 자재입니다. 공장 재고로 입력되어 있지는 않으나 납품업체의 자산이며, 사용할 때마다 PM 오더를 생성하여 출고하고 월말 정산 시 대금을 지급합니다. (예: 벨트, 베어링 등)

---

### 2. 세부 업무 절차
1. **일 실적 공유**
   * VMI 재고 사용 내역을 Daily로 관리하여 사용 실적을 납품업체에 공유합니다.
2. **납품 일정 확인**
   * 업체에서는 공유받은 사용 실적을 토대로 납품 재고를 확인하고, 관리담당자에게 납품 내역 및 일정을 통보합니다.
3. **검수**
   * 납품업체가 공장에 입고되면 자재검수를 실시합니다.
   * 거래명세표상의 자재와 실제 입고된 자재의 수량 및 규격이 일치하는지 확인합니다.
   * 검수 결과가 일치하면 거래명세표에 서명한 후 거래명세표를 보관합니다.
4. **SAP 및 창고 입고 처리 (MB1C)**
   * SAP 시스템에서 MB1C 트랜잭션을 실행합니다.
   * 증빙일, 전기일, 이동유형, 플랜트, 저장위치, 특별 재고 입력을 실행합니다.
   * 공급업체, 수령인, 자재 내역을 입력한 후 전산 입고 처리를 완료합니다.`;
    sources = [
      { num: 1, title: '업무메뉴얼 유첨_기자재(VMI) 입고.pptx', file_name: '업무메뉴얼 유첨_기자재(VMI) 입고.pptx', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isMaintenanceScenario) {
    matched = true;
    fullAnswer = `설비관리1반의 기계 설비 작업 일상 보전 및 유지 관리 매뉴얼은 다음과 같습니다.

---

### 1. 업무 목적
기계 설비 작업에 대한 이력 관리를 목적으로 합니다.

---

### 2. 세부 업무 절차
1. **PM 오더 생성/계획 및 자재 예약**
   * PM 오더 생성 시 오더 유형, 작업 위치 및 작업자, 사용 자재 등의 정보를 기입하여 예약을 진행하고 작업을 설계합니다.
2. **PM 오더 승인 및 출력**
   * 상급자 결재 등을 통해 PM 오더가 승인되면, 관련 PM 오더를 전산 시스템에서 출력합니다.
3. **자재 불출**
   * ① PM 오더에 자재 예약이 정상적으로 걸려 있는 상태인지 여부를 확인합니다.
   * ② 자재 불출 시 출력한 PM 오더의 바코드 또는 불출 기능을 활용하여 제출 및 수령합니다.
4. **작업 수행**
   * 안전작업허가서를 발행한 후 현장 정비 작업을 안전하게 진행합니다.
   * 작업 완료 후 담당자는 작업일보를 작성하여 공무부서로 최종 제출합니다.
5. **작업 완료 확정**
   * 해당 PM 오더의 현장 작업이 완료된 후, 시스템 필요 입력란에 정비 내용 등 추가 정보를 성실히 입력하고 최종 확인란을 체크한 뒤 저장합니다.
6. **정산 처리**
   * 시스템의 PM 오더 정산 결과 리스트를 호출하여 실행함으로써 정산 처리를 진행합니다.
7. **비즈니스 완료**
   * PM 오더 내 비즈니스 완료(Business Close) 처리를 실행하여 해당 설비 정비 작업을 최종 종료합니다.`;
    sources = [
      { num: 1, title: '업무매뉴얼_설비 일상 보전 및 유지 관리.pptx', file_name: '업무매뉴얼_설비 일상 보전 및 유지 관리.pptx', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isDamagedProductScenario) {
    matched = true;
    fullAnswer = `물류관리파트의 제품 파손 발생 시 처리 업무 절차는 다음과 같습니다.

---

### 1. 업무 목적
운송 사고, 지게차 찍힘, 제품 전복 등으로 인해 제품 파손 발생 시, 해당 재고를 신속히 **보류 재고로 전환하여 출고 보류(블로킹) 처리**함으로써 비정상 제품이 오출고되는 것을 방지합니다.

---

### 2. 세부 업무 절차
1. **가용 → 보류 전환**
   * **재고 정보 확인**: T-code \`zmsr02\` (재고조회)에서 자재코드, 배치, 재고일수, MTO/MTS 여부, 담당 영업사원, 거래처 정보를 확인합니다.
   * **제품 정보 상세 확인**: T-code \`zbar002\` (바코드 상세조회)에서 바코드 수량, 보관 구역 등을 점검합니다.
   * **재고 이전 실행**: T-code \`zba004\` (재고이전 가용→보류)를 사용하여 플랜트, 저장위치, 보관위치, 보관구역 등을 입력하고 바코드 및 전환 수량을 지정하여 전환을 실행합니다.
2. **월별 파손리스트 정리 및 송부**
   * 월별 파손 발생 제품 내역을 엑셀 파일로 정리합니다. (발생일자, 사유, 보류전환일, 자재 세부 내역 등 포함)
   * 파손리스트를 작성하여 **SCM팀으로 송부**하고 TMO 및 선수품 해지를 요청합니다. (MTS 재고의 경우에만 보류 전환이 가능합니다)
     * *MTO*: 고객 요청 생산 재고 (영업재고)
     * *MTS*: 계획 생산 재고 (자재재고)
3. **반송품명세서 취합**
   * 반송품 명세서는 월말에 일괄 취합하여 공장 결재를 득한 후, 본사 SCM팀으로 최종 송부합니다.
4. **파지 처리 절차 (폐기 확정 시)**
   * **자재 투입피킹**: T-code \`zba027\` (파지 및 반제품 투입피킹)에 접속하여 저장위치, 자재코드를 입력하고 바코드와 처리 수량을 확인한 후 피킹을 확정합니다.
   * **반제품/파지 전환**: T-code \`zco031\` (반제품/파지 전환)에서 'B/C picking 정보 upload'를 클릭하여 파지 출고 전기를 처리합니다.`;
    sources = [
      { num: 1, title: '파손품처리 업무매뉴얼.pptx', file_name: '파손품처리 업무매뉴얼.pptx', score: 0.95, url: '#', web_view_link: '#' }
    ];
  } else if (isBladeBeamScenario) {
    matched = true;
    fullAnswer = `CM3 블레이드 빔 개방 불량일 때 조치 방법은 다음과 같습니다.

---

### 1. CM3 블레이드 빔 개방 불량 원인
* CM3 블레이드 빔 개방 불량은 칼라 밸브 코일 소손에 따라 칼라 밸브가 닫히면서 발생할 수 있습니다.

---

### 2. 실린더 에어 라인 관련 조치 (칼라 밸브 점검)
* 블레이드 빔 개방 불량 발생 시, 칼라 밸브의 상태를 최우선적으로 점검하십시오.
* 특히, 칼라 밸브 코일의 소손 여부를 육안으로 확인하고, 이상 발견 시 코일 교체를 고려해야 합니다.
* 칼라 밸브의 정상 작동은 블레이드 빔의 움직임에 직접적인 영향을 미치므로, 이 부분의 조치가 필요합니다.`;
    sources = [
      { num: 1, title: '5.1.2.2_CM3 Blade Beam Open_24.11.03.pptx', file_name: '5.1.2.2_CM3 Blade Beam Open_24.11.03.pptx', score: 0.737, url: '#', web_view_link: '#' }
    ];
  } else if (isNipPressureScenario) {
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

  // 매칭되지 않은 경우 Fallback 생성
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

  return { matched, fullAnswer, sources };
}
