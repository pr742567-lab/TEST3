import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Download, Plus, Trash2, Sparkles, Image as ImageIcon, 
  CheckCircle2, AlertCircle, Save, HelpCircle, ShieldAlert 
} from 'lucide-react';
import './RiskAssessmentTab.css';

/**
 * 위험성 평가 개선 계획서 작성 및 다운로드 탭 컴포넌트 (Component)
 */
const RiskAssessmentTab = ({ onBack }) => {
  // 스크롤 상단 이동을 위한 컨테이너 참조 (Container Ref)
  const containerRef = useRef(null);

  // ─── 1. 기본 정보 상태 (Basic Information State) ───
  const [year, setYear] = useState('2026년');
  const [selectedDept, setSelectedDept] = useState('총무파트');
  const [assessDate, setAssessDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessor, setAssessor] = useState('');

  // 사용자가 요청한 변경된 12개 파트 목록
  const departmentList = [
    '총무파트',
    '설비관리파트',
    '전기제어파트',
    '품질보증파트',
    '생산관리파트',
    '조성파트',
    '자재관리파트',
    '가공1파트',
    '가공2파트',
    '완정1파트',
    '완정2파트',
    '물류관리파트'
  ];

  // ─── 2. 재해 형태 및 KRAS 요인 드롭다운 목록 ───
  const disasterTypes = [
    '충돌', '화재', '협착(끼임)', '전도(넘어짐)', '추락(떨어짐)', 
    '낙하/비래(맞음)', '감전', '질식', '이상온도접촉', '기타'
  ];

  const krasFactors = [
    '작업환경 요인', '작업특성 요인', '기계적 요인', 
    '전기적 요인', '화학적 요인', '인적 요인', '기타 요인'
  ];

  // ─── 3. 개선 계획 항목 목록 상태 (Items List State) ───
  const [items, setItems] = useState([
    {
      id: 'item-1',
      seq: 1,
      machineClassification: '총무',
      unitProcess: '사무업무',
      taskName: '현장출입',
      docNo: '사무실-2',
      sheetNo: '사무2',
      photoBefore: '', // 개선 전 사진 Base64
      hazards: '이륜차(오토바이 및 자전거) 출입시 보행자 경로와 겹쳐 충돌 위험이 존재함.',
      disasterType: '충돌',
      krasFactor: '작업환경 요인',
      currentControl: '정문 보행자 출입구 확장으로 이륜차 및 보행자 출입구를 분리하여 운영한다.',
      preFreq: 3,
      preSev: 3,
      preLevel: 9,
      preGrade: 'C',
      mitigation: '보행자 전용 안전 통로를 확보하고 과속방지턱을 추가 설치하여 서행 유도.',
      postFreq: 2,
      postSev: 2,
      postLevel: 4,
      postGrade: 'D',
      planDate: '2026-07-20',
      completeDate: '2026-07-25',
      manager: '김영환',
      completeDept: '공무',
      photoAfter: '', // 개선 후 사진 Base64
      activityName: '안전디딤돌'
    },
    {
      id: 'item-2',
      seq: 2,
      machineClassification: '푸디스트',
      unitProcess: '식당',
      taskName: '세척 및 청소',
      docNo: '식당-3',
      sheetNo: '식당3',
      photoBefore: '',
      hazards: '노후 콘센트 사용 및 바닥 물 청소 시 누전 발생으로 인한 감전/화재 위험.',
      disasterType: '화재',
      krasFactor: '작업특성 요인',
      currentControl: '물튐 발생 장소의 콘센트는 아크릴 보호 커버를 임시 설치하고 조심히 물청소를 실시한다.',
      preFreq: 2,
      preSev: 2,
      preLevel: 4,
      preGrade: 'D',
      mitigation: '방수형 누전 차단용 콘센트로 전체 교체 실시 및 비전도성 세척 솔 사용.',
      postFreq: 1,
      postSev: 2,
      postLevel: 2,
      postGrade: 'E',
      planDate: '2026-08-05',
      completeDate: '2026-08-10',
      manager: '김명완',
      completeDept: '자체',
      photoAfter: '',
      activityName: '쥐띡시간 반정순실'
    }
  ]);

  // 현재 편집 중인 행 ID
  const [selectedItemId, setSelectedItemId] = useState('item-1');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // 현재 세부 작성 단계 상태 (Current Form Step State)
  const [currentStep, setCurrentStep] = useState(1);

  // 선택 행 변경 시 단계를 1단계로 리셋 (Reset step on selected item change)
  useEffect(() => {
    setCurrentStep(1);
  }, [selectedItemId]);

  // 단계 변경 또는 선택 항목 변경 시 스크롤 상단 이동 (Scroll to Top)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentStep, selectedItemId]);

  // ─── 4. 등급 자동 산출 수식 함수 (Grade Calculation) ───
  // =IF(S6=0,"N",IF(S6<4,"E",IF(S6<8,"D",IF(S6<13,"C",IF(S6<20,"B",IF(S6>=20,"A")))))))
  const getRiskGrade = (level) => {
    if (level === 0) return 'N';
    if (level < 4) return 'E';
    if (level < 8) return 'D';
    if (level < 13) return 'C';
    if (level < 20) return 'B';
    return 'A';
  };

  // 선택된 아이템 객체 구하기
  const selectedItem = items.find(item => item.id === selectedItemId);

  // 상세 필드 수정 시 실시간 핸들러
  const handleFieldChange = (field, value) => {
    if (!selectedItemId) return;
    
    setItems(prevItems => prevItems.map(item => {
      if (item.id === selectedItemId) {
        const updatedItem = { ...item, [field]: value };
        
        // 빈도(Frequency) 또는 강도(Severity) 수정 시 위험도 및 등급 자동 계산
        if (field === 'preFreq' || field === 'preSev') {
          const freq = field === 'preFreq' ? Number(value) : Number(item.preFreq);
          const sev = field === 'preSev' ? Number(value) : Number(item.preSev);
          updatedItem.preLevel = freq * sev;
          updatedItem.preGrade = getRiskGrade(updatedItem.preLevel);
        }
        if (field === 'postFreq' || field === 'postSev') {
          const freq = field === 'postFreq' ? Number(value) : Number(item.postFreq);
          const sev = field === 'postSev' ? Number(value) : Number(item.postSev);
          updatedItem.postLevel = freq * sev;
          updatedItem.postGrade = getRiskGrade(updatedItem.postLevel);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // 행 추가 기능 (Add Row)
  const handleAddItem = () => {
    const nextSeq = items.length > 0 ? Math.max(...items.map(i => i.seq)) + 1 : 1;
    const newItemId = `item-${Date.now()}`;
    const newItem = {
      id: newItemId,
      seq: nextSeq,
      machineClassification: '',
      unitProcess: '',
      taskName: '',
      docNo: '',
      sheetNo: '',
      photoBefore: '',
      hazards: '',
      disasterType: '충돌',
      krasFactor: '작업환경 요인',
      currentControl: '',
      preFreq: 0,
      preSev: 0,
      preLevel: 0,
      preGrade: 'N',
      mitigation: '',
      postFreq: 0,
      postSev: 0,
      postLevel: 0,
      postGrade: 'N',
      planDate: '',
      completeDate: '',
      manager: '',
      completeDept: '자체',
      photoAfter: '',
      activityName: ''
    };
    setItems([...items, newItem]);
    setSelectedItemId(newItemId);
  };

  // 행 삭제 기능 (Delete Row)
  const handleDeleteItem = (id, e) => {
    e.stopPropagation(); // 목록 클릭 이벤트 방지
    const filtered = items.filter(item => item.id !== id);
    // 순번 재정렬
    const updated = filtered.map((item, idx) => ({ ...item, seq: idx + 1 }));
    setItems(updated);
    
    // 삭제 후 선택 행 관리
    if (selectedItemId === id) {
      if (updated.length > 0) {
        setSelectedItemId(updated[0].id);
      } else {
        setSelectedItemId(null);
      }
    }
  };

  // 이미지 파일 업로드 처리
  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleFieldChange(field, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // AI를 통한 안전 위험 대책 분석 및 등급 예측 (AI Assistant)
  const handleAiAnalyze = () => {
    if (!selectedItem) return;
    if (!selectedItem.hazards.trim()) {
      alert('유해위험요인(Hazards)을 먼저 입력해주세요.');
      return;
    }

    setIsAiGenerating(true);
    setTimeout(() => {
      let recommendedMitigation = '';
      let calculatedPostFreq = 1;
      let calculatedPostSev = 2;

      const hz = selectedItem.hazards;
      if (hz.includes('충돌') || hz.includes('이륜차')) {
        recommendedMitigation = '1. 공장 내부 진입 전용 안전 통로(Green Zone)를 노면에 도색 처리하고 가드레일을 설치합니다.\n2. 보행자 이동 동선과 차량 동선을 차단하는 안전 울타리를 신설합니다.\n3. 이륜차 운전자를 대상으로 사내 시속 10km 이내 서행 교육을 매달 실시합니다.';
        calculatedPostFreq = 1;
        calculatedPostSev = 3;
      } else if (hz.includes('화재') || hz.includes('콘센트') || hz.includes('전기') || hz.includes('누전')) {
        recommendedMitigation = '1. 물청소 및 다습한 위치에 있는 콘센트를 전부 IPX6 등급 이상의 방수 콘센트로 일괄 교체 조치합니다.\n2. 전기 분전반 주변에 무인 자동 소화 장치(패치형)를 설치합니다.\n3. 매월 1회 접지 저항 측정을 통해 누전 여부를 사전 스캔합니다.';
        calculatedPostFreq = 1;
        calculatedPostSev = 2;
      } else {
        recommendedMitigation = `1. 작업 표준서(SOP)에 맞춘 보호구(보안경, 안전장갑) 착용 여부를 철저히 감독합니다.\n2. 해당 유해위험 위치에 눈에 띄는 안전 표지판 및 경고 부착물을 추가 시공합니다.\n3. 긴급 상황 발생 시 작동할 수 있는 설비 비상 정지 버튼(E-Stop)의 위치 시인성을 보강합니다.`;
        calculatedPostFreq = Math.max(1, selectedItem.preFreq - 1);
        calculatedPostSev = Math.max(1, selectedItem.preSev - 1);
      }

      // 상태 업데이트
      setItems(prevItems => prevItems.map(item => {
        if (item.id === selectedItemId) {
          const postLevelVal = calculatedPostFreq * calculatedPostSev;
          return {
            ...item,
            mitigation: recommendedMitigation,
            postFreq: calculatedPostFreq,
            postSev: calculatedPostSev,
            postLevel: postLevelVal,
            postGrade: getRiskGrade(postLevelVal)
          };
        }
        return item;
      }));

      setIsAiGenerating(false);
    }, 1200);
  };

  // ─── 5. Excel 내보내기 로직 (HTML-XML 포맷 다운로드) ───
  const handleXlsDownload = () => {
    setIsBuilding(true);
    setTimeout(() => {
      // 엑셀 시트명 및 격자선 설정을 품은 HTML 문자열 구성
      let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
       <x:ExcelWorkbook>
        <x:ExcelWorksheets>
         <x:ExcelWorksheet>
          <x:Name>${year} 위험성평가_${selectedDept}</x:Name>
          <x:WorksheetOptions>
           <x:DisplayGridlines/>
          </x:WorksheetOptions>
         </x:ExcelWorksheet>
        </x:ExcelWorksheets>
       </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th { border: 0.5pt solid #000000; background-color: #d9e1f2; text-align: center; font-weight: bold; font-size: 10pt; height: 35px; }
        td { border: 0.5pt solid #000000; text-align: left; font-size: 9pt; height: 30px; }
        .num-col { text-align: center; }
        .center-col { text-align: center; }
        .grade-A { background-color: #ffc7ce; color: #9c0006; font-weight: bold; text-align: center; }
        .grade-B { background-color: #ffeb9c; color: #9c6500; font-weight: bold; text-align: center; }
        .grade-C { background-color: #fff2cc; color: #7f6000; font-weight: bold; text-align: center; }
        .grade-D { background-color: #e2efda; color: #375623; font-weight: bold; text-align: center; }
        .grade-E { background-color: #c6efce; color: #006100; font-weight: bold; text-align: center; }
        .grade-N { background-color: #f2f2f2; color: #595959; text-align: center; }
        .title-row { font-size: 16pt; font-weight: bold; text-align: center; height: 45px; }
        .info-row { font-size: 10pt; height: 25px; }
      </style>
      </head>
      <body>
        <table>
          <!-- 제목부 -->
          <tr>
            <td colspan="26" class="title-row" style="border:none; text-align:center; font-size:16pt; font-weight:bold;">${year} 위험성평가 개선 계획서 (${selectedDept})</td>
          </tr>
          <!-- 기본 정보 -->
          <tr class="info-row">
            <td colspan="3" style="border:none; font-weight:bold;">평가 년도: ${year}</td>
            <td colspan="4" style="border:none; font-weight:bold;">평가 부서/파트: ${selectedDept}</td>
            <td colspan="4" style="border:none; font-weight:bold;">평가 일자: ${assessDate}</td>
            <td colspan="4" style="border:none; font-weight:bold;">평가자: ${assessor || '미입력'}</td>
            <td colspan="11" style="border:none;"></td>
          </tr>
          <tr><td colspan="26" style="border:none; height:10px;"></td></tr>
          
          <!-- 헤더 1행 -->
          <tr>
            <th rowspan="2">순번</th>
            <th rowspan="2">기계명/작업종류/장소<br>(대분류)</th>
            <th rowspan="2">단위공정(공정명/부속기계명)<br>(중분류)</th>
            <th rowspan="2">작업명<br>(소분류)</th>
            <th rowspan="2">위험성평가표<br>관리번호</th>
            <th rowspan="2">시트 번호</th>
            <th rowspan="2">유해위험요인<br>개선 전 사진</th>
            <th rowspan="2">유해위험요인<br>(Hazards)</th>
            <th rowspan="2">재해 형태</th>
            <th rowspan="2">KRAS 위험요인</th>
            <th rowspan="2">현재 유해/위험관리방안<br>(control)</th>
            <th colspan="4">위험성(개선전)</th>
            <th rowspan="2">추가 위험성 감소 대책<br>(C등급 이상 필수 작성)</th>
            <th colspan="4">위험성(개선후)</th>
            <th rowspan="2">개선계획일</th>
            <th rowspan="2">개선완료일</th>
            <th rowspan="2">담당자</th>
            <th rowspan="2">개선완료부서<br>(자체/전담반/공무)</th>
            <th rowspan="2">유해위험요인<br>개선 후 사진</th>
            <th rowspan="2">발굴활동명<br>(중복 시 전부 기입)</th>
          </tr>
          <!-- 헤더 2행 -->
          <tr>
            <th>빈도</th>
            <th>강도</th>
            <th>위험도</th>
            <th>등급</th>
            <th>빈도</th>
            <th>강도</th>
            <th>위험도</th>
            <th>등급</th>
          </tr>
      `;

      // 데이터 바인딩
      items.forEach(item => {
        const photoBeforeText = item.photoBefore ? '[이미지 첨부됨]' : '[사진 없음]';
        const photoAfterText = item.photoAfter ? '[이미지 첨부됨]' : '[사진 없음]';
        
        html += `
          <tr>
            <td class="num-col" style="text-align:center;">${item.seq}</td>
            <td>${item.machineClassification || ''}</td>
            <td>${item.unitProcess || ''}</td>
            <td>${item.taskName || ''}</td>
            <td>${item.docNo || ''}</td>
            <td>${item.sheetNo || ''}</td>
            <td class="center-col" style="text-align:center; color:#7f7f7f;">${photoBeforeText}</td>
            <td>${item.hazards || ''}</td>
            <td class="center-col" style="text-align:center;">${item.disasterType || ''}</td>
            <td class="center-col" style="text-align:center;">${item.krasFactor || ''}</td>
            <td>${item.currentControl || ''}</td>
            
            <!-- 개선전 위험성 -->
            <td class="center-col" style="text-align:center;">${item.preFreq || 0}</td>
            <td class="center-col" style="text-align:center;">${item.preSev || 0}</td>
            <td class="center-col" style="text-align:center;">${item.preLevel || 0}</td>
            <td class="grade-${item.preGrade || 'N'}">${item.preGrade || 'N'}</td>
            
            <td>${item.mitigation || ''}</td>
            
            <!-- 개선후 위험성 -->
            <td class="center-col" style="text-align:center;">${item.postFreq || 0}</td>
            <td class="center-col" style="text-align:center;">${item.postSev || 0}</td>
            <td class="center-col" style="text-align:center;">${item.postLevel || 0}</td>
            <td class="grade-${item.postGrade || 'N'}">${item.postGrade || 'N'}</td>
            
            <td class="center-col" style="text-align:center;">${item.planDate || ''}</td>
            <td class="center-col" style="text-align:center;">${item.completeDate || ''}</td>
            <td class="center-col" style="text-align:center;">${item.manager || ''}</td>
            <td class="center-col" style="text-align:center;">${item.completeDept || ''}</td>
            <td class="center-col" style="text-align:center; color:#7f7f7f;">${photoAfterText}</td>
            <td>${item.activityName || ''}</td>
          </tr>
        `;
      });

      html += `
        </table>
      </body>
      </html>
      `;

      // 다운로드 파일명 구성: '26년 위험성평가 00파트 결과 보고.xls'
      // 사용자 브라우저 호환성을 위한 xls 확장자 매칭 다운로드
      const fileName = `${year.replace('년', '')}년 위험성평가 ${selectedDept} 결과 보고.xls`;
      
      const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsBuilding(false);
    }, 1000);
  };

  return (
    <div className="risk-assessment-container" ref={containerRef}>
      {/* 헤더 부분 */}
      <div className="content-header">
        <div className="doc-assist-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="doc-assist-back-btn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={18} />
              <span>이전</span>
            </button>
            <div>
              <h2>⚠️ 위험성평가 개선 계획서 작성</h2>
              <div className="content-subheader-container">
                <span className="slogan-badge">Excel 자동 내보내기</span>
                <span className="slogan-desc">현장의 작업 위험 요인을 작성하고 등급 산정 및 추가 안전 대책을 수립합니다.</span>
              </div>
            </div>
          </div>
          <div>
            <button 
              className="btn-xls-download" 
              onClick={handleXlsDownload} 
              disabled={isBuilding || items.length === 0}
            >
              <Download size={18} />
              <span>{isBuilding ? '엑셀 구성 중...' : 'Excel 결과 보고서 다운로드'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 중/하단: 마스터-디테일 레이아웃 ─── */}
      <div className="risk-editor-layout">
        
        {/* 마스터 패널: 위험 요인 목록 */}
        <div className="risk-master-panel">
          <div className="panel-header">
            <span className="panel-title">개선 계획 목록 ({items.length}건)</span>
            <button className="btn-add" onClick={handleAddItem}>
              <Plus size={16} />
              <span>계획 추가</span>
            </button>
          </div>

          <div className="card-list-wrapper">
            {items.length === 0 ? (
              <div className="empty-card-message">
                등록된 개선 계획서 내용이 없습니다.<br />"계획 추가" 버튼을 눌러 작업을 개시하세요.
              </div>
            ) : (
              <div className="risk-card-list">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`risk-card ${selectedItemId === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="card-top">
                      <span className="card-seq">순번 {item.seq}</span>
                      <button 
                        className="btn-delete-card" 
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        title="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    
                    <div className="card-info">
                      <div className="info-row">
                        <span className="info-label">대분류:</span>
                        <span className="info-val">{item.machineClassification || <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>미입력</span>}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">작업명:</span>
                        <span className="info-val">{item.taskName || <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>미입력</span>}</span>
                      </div>
                    </div>
                    
                    <div className="card-bottom">
                      <div className="grade-flow">
                        <span className={`grade-badge-sm grade-${item.preGrade || 'N'}`}>
                          개선전: {item.preGrade || 'N'} ({item.preLevel || 0})
                        </span>
                        <span className="flow-arrow">→</span>
                        <span className={`grade-badge-sm grade-${item.postGrade || 'N'}`}>
                          개선후: {item.postGrade || 'N'} ({item.postLevel || 0})
                        </span>
                      </div>
                      <span className="card-manager">
                        담당: {item.manager || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 디테일 패널 (Detail Panel): 상세 작성 폼 */}
        <div className="risk-detail-panel">
          {!selectedItem ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <ShieldAlert size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>상세 내역을 조회할 계획을 선택하거나 추가해 주세요.</p>
            </div>
          ) : (
            <>
              {/* 상세 편집 헤더 (Header) */}
              <div className="panel-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <span className="panel-title" style={{ color: '#2563eb' }}>
                  No. {selectedItem.seq} 상세 내용 편집
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  모든 입력 사항은 자동으로 임시 저장됩니다
                </span>
              </div>

              {/* 단계 표시기 (Step Indicator): 사용자가 현재 위치를 파악하고 클릭하여 직접 이동할 수 있습니다 */}
              <div className="risk-step-indicator">
                <button 
                  type="button" 
                  className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span className="step-num">1</span>
                  <span className="step-txt">작업 분류</span>
                </button>
                <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`} />
                <button 
                  type="button" 
                  className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <span className="step-num">2</span>
                  <span className="step-txt">개선 전 평가</span>
                </button>
                <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`} />
                <button 
                  type="button" 
                  className={`step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(3)}
                >
                  <span className="step-num">3</span>
                  <span className="step-txt">대책 및 계획</span>
                </button>
                <div className={`step-line ${currentStep > 3 ? 'completed' : ''}`} />
                <button 
                  type="button" 
                  className={`step-item ${currentStep === 4 ? 'active' : ''}`}
                  onClick={() => setCurrentStep(4)}
                >
                  <span className="step-num">4</span>
                  <span className="step-txt">결과 및 사진</span>
                </button>
              </div>

              {/* 1단계 (Step 1): 작업 분류 (대분류, 중분류, 소분류 및 번호 정보 입력) */}
              {currentStep === 1 && (
                <div className="step-content-pane animation-slide-in">
                  <div className="detail-section-title">공정 및 작업 분류</div>
                  <div className="detail-grid">
                    <div className="risk-field">
                      <span className="risk-label">대분류 (기계명/작업종류/장소)</span>
                      <input 
                        type="text" 
                        className="risk-input" 
                        value={selectedItem.machineClassification || ''} 
                        onChange={(e) => handleFieldChange('machineClassification', e.target.value)} 
                        placeholder="예) 총무, 초지기 등" 
                      />
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">중분류 (단위공정/부속기계명)</span>
                      <input 
                        type="text" 
                        className="risk-input" 
                        value={selectedItem.unitProcess || ''} 
                        onChange={(e) => handleFieldChange('unitProcess', e.target.value)} 
                        placeholder="예) 사무업무, 롤 교체 등" 
                      />
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">소분류 (작업명)</span>
                      <input 
                        type="text" 
                        className="risk-input" 
                        value={selectedItem.taskName || ''} 
                        onChange={(e) => handleFieldChange('taskName', e.target.value)} 
                        placeholder="예) 현장 출입, 고압 세척 등" 
                      />
                    </div>
                    <div className="risk-doc-sheet-grid">
                      <div className="risk-field">
                        <span className="risk-label">평가표 관리번호</span>
                        <input 
                          type="text" 
                          className="risk-input" 
                          value={selectedItem.docNo || ''} 
                          onChange={(e) => handleFieldChange('docNo', e.target.value)} 
                          placeholder="예) 사무실-2" 
                        />
                      </div>
                      <div className="risk-field">
                        <span className="risk-label">시트 번호</span>
                        <input 
                          type="text" 
                          className="risk-input" 
                          value={selectedItem.sheetNo || ''} 
                          onChange={(e) => handleFieldChange('sheetNo', e.target.value)} 
                          placeholder="예) 사무2" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2단계 (Step 2): 위험 요인 및 개선 전 위험도 평가 (유해위험요인, 재해 형태, 등급 도출) */}
              {currentStep === 2 && (
                <div className="step-content-pane animation-slide-in">
                  <div className="detail-section-title">유해위험요인 및 현재 대응안</div>
                  <div className="detail-grid">
                    <div className="risk-field" style={{ gridColumn: 'span 2' }}>
                      <span className="risk-label">유해위험요인 (Hazards) <span className="required">*</span></span>
                      <textarea 
                        className="risk-textarea" 
                        value={selectedItem.hazards || ''} 
                        onChange={(e) => handleFieldChange('hazards', e.target.value)} 
                        placeholder="유해하고 위험한 원인 및 상태를 서술해 주세요." 
                      />
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">재해 형태</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.disasterType || '충돌'} 
                        onChange={(e) => handleFieldChange('disasterType', e.target.value)}
                      >
                        {disasterTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">KRAS 위험요인</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.krasFactor || '작업환경 요인'} 
                        onChange={(e) => handleFieldChange('krasFactor', e.target.value)}
                      >
                        {krasFactors.map(factor => (
                          <option key={factor} value={factor}>{factor}</option>
                        ))}
                      </select>
                    </div>
                    <div className="risk-field" style={{ gridColumn: 'span 2' }}>
                      <span className="risk-label">현재 유해/위험관리방안 (control)</span>
                      <textarea 
                        className="risk-textarea" 
                        value={selectedItem.currentControl || ''} 
                        onChange={(e) => handleFieldChange('currentControl', e.target.value)} 
                        placeholder="현재 작동 중인 관리 방안을 기술해 주세요." 
                      />
                    </div>
                  </div>

                  <div className="detail-section-title" style={{ marginTop: '20px' }}>위험성 평가 (개선전)</div>
                  <div className="risk-calc-box">
                    <div className="risk-field">
                      <span className="risk-label">빈도(1~5)</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.preFreq || 0} 
                        onChange={(e) => handleFieldChange('preFreq', Number(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? '선택안함' : n}</option>)}
                      </select>
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">강도(1~5)</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.preSev || 0} 
                        onChange={(e) => handleFieldChange('preSev', Number(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? '선택안함' : n}</option>)}
                      </select>
                    </div>
                    <div className="calc-result">
                      <span className="risk-label">위험도 (빈도×강도)</span>
                      <span className="calc-value" style={{ color: (selectedItem.preLevel || 0) >= 9 ? '#ef4444' : '#1e293b' }}>
                        {selectedItem.preLevel || 0}
                      </span>
                    </div>
                    <div className="calc-result">
                      <span className="risk-label">위험성 등급</span>
                      <span className={`grade-badge grade-${selectedItem.preGrade || 'N'}`}>
                        {selectedItem.preGrade || 'N'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3단계 (Step 3): 추가 감소 대책 수립 및 개선 계획 정보 입력 */}
              {currentStep === 3 && (
                <div className="step-content-pane animation-slide-in">
                  <div className="detail-section-title">
                    추가 위험 감소 대책
                    {['A', 'B', 'C'].includes(selectedItem.preGrade) && (
                      <span className="warning-message" style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={12} /> C등급 이상 필히 안전대책 작성 요망
                      </span>
                    )}
                  </div>
                  
                  <div className="risk-field" style={{ marginBottom: '12px' }}>
                    <span className="risk-label">추가 위험성 감소 대책</span>
                    <textarea 
                      className="risk-textarea" 
                      rows={4}
                      value={selectedItem.mitigation || ''} 
                      onChange={(e) => handleFieldChange('mitigation', e.target.value)} 
                      placeholder="위험 요인을 실질적으로 개선하기 위한 구체적인 안전 감소 대책을 기재해주세요." 
                    />
                  </div>

                  {/* 안전 대책 솔루션 도구 */}
                  <div className="ai-recommend-container" style={{ marginBottom: '20px' }}>
                    <div className="ai-recommend-header">
                      <Sparkles size={16} />
                      <span>안전 대책 솔루션 추천</span>
                    </div>
                    <div className="ai-recommend-body">
                      {(selectedItem.hazards || '').trim() 
                        ? '유해위험요인을 파악하여 공학적 감소 대책을 추천하고 개선 후 위험 지수를 예상해 줍니다.'
                        : '유해위험요인(Hazards)을 한 줄 이상 작성하시면 최적의 추천 감소 대책이 여기에 로드됩니다.'
                      }
                    </div>
                    <button 
                      className="btn-ai-generate"
                      onClick={handleAiAnalyze}
                      disabled={isAiGenerating || !(selectedItem.hazards || '').trim()}
                    >
                      {isAiGenerating ? '대책 분석 중...' : '위험성 분석 및 대책 보완'}
                    </button>
                  </div>

                  <div className="detail-section-title">개선 계획 정보</div>
                  <div className="detail-grid">
                    <div className="risk-field">
                      <span className="risk-label">개선계획일</span>
                      <input 
                        type="date" 
                        className="risk-input" 
                        value={selectedItem.planDate || ''} 
                        onChange={(e) => handleFieldChange('planDate', e.target.value)} 
                      />
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">담당자</span>
                      <input 
                        type="text" 
                        className="risk-input" 
                        value={selectedItem.manager || ''} 
                        onChange={(e) => handleFieldChange('manager', e.target.value)} 
                        placeholder="예) 홍길동" 
                      />
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">개선완료부서 (자체/전담반/공무 중 선택)</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.completeDept || '자체'} 
                        onChange={(e) => handleFieldChange('completeDept', e.target.value)}
                      >
                        <option value="자체">자체</option>
                        <option value="전담반">전담반</option>
                        <option value="공무">공무</option>
                      </select>
                    </div>
                    <div className="risk-field detail-grid-full">
                      <span className="risk-label">발굴활동명 (중복 시 전부 기입)</span>
                      <input 
                        type="text" 
                        className="risk-input" 
                        value={selectedItem.activityName || ''} 
                        onChange={(e) => handleFieldChange('activityName', e.target.value)} 
                        placeholder="예) 안전디딤돌, 쥐띡시간 반정순실 등" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4단계 (Step 4): 개선 후 평가, 완료 정보 및 개선 사진 등록 */}
              {currentStep === 4 && (
                <div className="step-content-pane animation-slide-in">
                  <div className="detail-section-title">위험성 평가 (개선후)</div>
                  <div className="risk-calc-box post" style={{ marginBottom: '20px' }}>
                    <div className="risk-field">
                      <span className="risk-label">빈도(1~5)</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.postFreq || 0} 
                        onChange={(e) => handleFieldChange('postFreq', Number(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? '선택안함' : n}</option>)}
                      </select>
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">강도(1~5)</span>
                      <select 
                        className="risk-select" 
                        value={selectedItem.postSev || 0} 
                        onChange={(e) => handleFieldChange('postSev', Number(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? '선택안함' : n}</option>)}
                      </select>
                    </div>
                    <div className="calc-result">
                      <span className="risk-label">위험도 (빈도×강도)</span>
                      <span className="calc-value" style={{ color: '#22c55e' }}>
                        {selectedItem.postLevel || 0}
                      </span>
                    </div>
                    <div className="calc-result">
                      <span className="risk-label">개선후 등급</span>
                      <span className={`grade-badge grade-${selectedItem.postGrade || 'N'}`}>
                        {selectedItem.postGrade || 'N'}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section-title">개선 완료 정보</div>
                  <div className="detail-grid" style={{ marginBottom: '20px' }}>
                    <div className="risk-field">
                      <span className="risk-label">개선완료일</span>
                      <input 
                        type="date" 
                        className="risk-input" 
                        value={selectedItem.completeDate || ''} 
                        onChange={(e) => handleFieldChange('completeDate', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="detail-section-title">개선 사진 자료</div>
                  <div className="photo-upload-section">
                    <div className="risk-field">
                      <span className="risk-label">유해위험요인 개선 전 사진</span>
                      <label className="photo-box">
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => handleImageUpload('photoBefore', e)} 
                        />
                        {selectedItem.photoBefore ? (
                          <img src={selectedItem.photoBefore} alt="개선 전" className="photo-preview" />
                        ) : (
                          <div className="photo-placeholder">
                            <ImageIcon size={28} />
                            <span>개선 전 사진 등록</span>
                          </div>
                        )}
                      </label>
                    </div>
                    <div className="risk-field">
                      <span className="risk-label">유해위험요인 개선 후 사진</span>
                      <label className="photo-box">
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => handleImageUpload('photoAfter', e)} 
                        />
                        {selectedItem.photoAfter ? (
                          <img src={selectedItem.photoAfter} alt="개선 후" className="photo-preview" />
                        ) : (
                          <div className="photo-placeholder">
                            <ImageIcon size={28} />
                            <span>개선 후 사진 등록</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 단계 네비게이션 제어 영역 (Step Navigation Actions) */}
              <div className="risk-step-actions">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    className="btn-step-prev" 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    이전 단계
                  </button>
                ) : (
                  <div className="btn-step-placeholder" />
                )}
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    className="btn-step-next" 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                  >
                    다음 단계
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-xls-download"
                    style={{ width: 'auto', padding: '8px 16px', boxShadow: 'none' }}
                    onClick={handleXlsDownload}
                    disabled={isBuilding || items.length === 0}
                  >
                    <Download size={16} />
                    <span>{isBuilding ? '엑셀 구성 중...' : 'Excel 결과 보고서 다운로드'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default RiskAssessmentTab;
