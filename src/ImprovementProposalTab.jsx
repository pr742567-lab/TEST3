import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  FileText,
  Sparkles,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Plus,
  ArrowRight
} from 'lucide-react';
import { exportProposalToExcel } from './utils/proposalExcelGenerator';
import { refineProposalWithGemini } from './utils/geminiProposalRefine';
import './DocAssistPanel.css';
import './DeptReportForm.css';
import './ImprovementProposalTab.css';

// 현재 기준 표준 부서 목록 (드롭다운 구성용)
const DEPARTMENT_LIST = [
  '조성파트',
  '생산1파트',
  '생산2파트',
  '가공1파트',
  '가공2파트',
  '완정1파트',
  '완정2파트',
  '물류관리파트',
  '품질보증파트',
  '설비관리파트',
  '전기제어파트',
  '혁신활동사무국',
  '총무파트',
  '자재관리파트',
  '환경관리파트'
];

// 과거/변형 부서명 -> 현재 표준 부서명 매핑 맵
const DEPT_NORMALIZATION_MAP = {
  // 조성파트 = 조성
  '조성파트': '조성파트',
  '조성': '조성파트',

  // 생산1파트 = 생산1
  '생산1파트': '생산1파트',
  '생산1': '생산1파트',

  // 생산2파트 = 생산2
  '생산2파트': '생산2파트',
  '생산2': '생산2파트',

  // 가공1파트 = 가공1 = 조제실
  '가공1파트': '가공1파트',
  '가공1': '가공1파트',
  '조제실': '가공1파트',

  // 가공2파트 = 가공2
  '가공2파트': '가공2파트',
  '가공2': '가공2파트',

  // 완정1파트 = 완정1 = 재단1 = 재단1파트
  '완정1파트': '완정1파트',
  '완정1': '완정1파트',
  '재단1': '완정1파트',
  '재단1파트': '완정1파트',

  // 완정2파트 = 완정2 = 재단2 = 재단2파트
  '완정2파트': '완정2파트',
  '완정2': '완정2파트',
  '재단2': '완정2파트',
  '재단2파트': '완정2파트',

  // 물류관리파트 = 물류부
  '물류관리파트': '물류관리파트',
  '물류부': '물류관리파트',

  // 품질보증파트 = 품질보증
  '품질보증파트': '품질보증파트',
  '품질보증': '품질보증파트',

  // 설비관리파트 = 설비관리 = 설비관리1실
  '설비관리파트': '설비관리파트',
  '설비관리': '설비관리파트',
  '설비관리1실': '설비관리파트',

  // 전기제어파트 = 전기제어
  '전기제어파트': '전기제어파트',
  '전기제어': '전기제어파트',
  '전기제이파트': '전기제어파트',

  // 혁신활동사무국
  '혁신활동사무국': '혁신활동사무국',

  // 총무파트
  '총무파트': '총무파트',

  // 자재관리파트
  '자재관리파트': '자재관리파트',

  // 환경관리파트
  '환경관리파트': '환경관리파트',
  '환경관리': '환경관리파트',

  // (주)제니엘이앤지
  '(주)제니엘이앤지': '(주)제니엘이앤지',
  '㈜제니엘이앤지': '(주)제니엘이앤지',
};

// 부서명 정규화 헬퍼 함수
const normalizeDept = (rawDept) => {
  if (!rawDept) return '';
  const trimmed = rawDept.trim();
  return DEPT_NORMALIZATION_MAP[trimmed] || trimmed;
};

/**
 * 개선 제안 전용 탭 컴포넌트 (ImprovementProposalTab)
 * - 2-Step 워크플로우:
 *   1) 사전 이력 조회 및 중복 점검 (Search View)
 *      - 패밀리룩 웰컴 카드
 *      - 중앙 스마트 검색창 + [이력 조회하기] 버튼 + 추천 키워드 태그
 *      - 검색 시 슬림 콤팩트 매칭 리스트 노출
 *   2) 제안서 작성 & 내용 다듬기 & Excel 다운로드 (Form View)
 */
const ImprovementProposalTab = () => {
  // 화면 모드: 'search' (이력 조회) | 'form' (제안서 작성)
  const [viewMode, setViewMode] = useState('search');

  // ─── 1. 제안 이력 데이터 비동기 로드 및 상태 ─── //
  const [proposalData, setProposalData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // 6.5MB 대용량 제안 이력 데이터를 필요 시점에 비동기 동적 임포트 (Code Splitting)
    import('./data/proposalHistoryData.json')
      .then((module) => {
        if (isMounted) {
          setProposalData(module.default || module);
          setIsDataLoading(false);
        }
      })
      .catch((err) => {
        console.error('제안 이력 데이터 비동기 로드 실패:', err);
        if (isMounted) {
          setIsDataLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── 제안 이력 조회 상태 ─── //
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 부서 목록 (현재 기준 표준 16개 부서)
  const deptList = DEPARTMENT_LIST;

  // 연도 목록
  const yearList = ['ALL', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2015~2019'];

  // 등급 목록
  const gradeList = ['ALL', 'A', 'B', 'C', 'D', '불채택'];

  // 추천 키워드 태그 목록
  const popularKeywords = ['센서', '에어라인', '밸브', '전력절감', '안전', '나이프', '모터', '스팀', '스풀', '슬러지'];

  // 조회 실행 함수
  const handleSearchSubmit = (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q && selectedYear === 'ALL' && selectedDept === 'ALL' && selectedGrade === 'ALL') {
      alert('검색할 제안명 또는 키워드를 입력해주세요.');
      return;
    }
    setSubmittedQuery(q);
    setSearchQuery(q);
    setHasSearched(true);
    setCurrentPage(1);
  };

  // 키워드 태그 클릭
  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    handleSearchSubmit(tag);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    setSelectedYear('ALL');
    setSelectedDept('ALL');
    setSelectedGrade('ALL');
    setHasSearched(false);
    setCurrentPage(1);
  };

  // 필터링된 제안 실적 데이터
  const filteredProposals = useMemo(() => {
    if (!hasSearched) return [];

    const query = submittedQuery.toLowerCase();
    return proposalData.filter(item => {
      // 연도 필터
      if (selectedYear !== 'ALL') {
        if (selectedYear === '2015~2019') {
          const yNum = parseInt(item.year, 10);
          if (isNaN(yNum) || yNum < 2015 || yNum > 2019) return false;
        } else if (item.year !== selectedYear) {
          return false;
        }
      }

      // 부서 필터 (표준화된 부서명으로 매핑하여 필터링)
      if (selectedDept !== 'ALL') {
        const itemDeptNormalized = normalizeDept(item.dept);
        if (itemDeptNormalized !== selectedDept && item.dept !== selectedDept) {
          return false;
        }
      }

      // 등급 필터
      if (selectedGrade !== 'ALL') {
        const g = (item.grade || '').toUpperCase();
        if (selectedGrade === '불채택' && !g.includes('불채택')) return false;
        if (selectedGrade !== '불채택' && !g.includes(selectedGrade)) return false;
      }

      // 검색어 필터 (제목, 작성자, 관리번호, 부서명)
      if (query) {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const noMatch = (item.no || '').toLowerCase().includes(query);
        const rawDept = (item.dept || '').toLowerCase();
        const normDept = (normalizeDept(item.dept) || '').toLowerCase();
        const deptMatch = rawDept.includes(query) || normDept.includes(query);
        if (!titleMatch && !nameMatch && !noMatch && !deptMatch) return false;
      }

      return true;
    });
  }, [proposalData, hasSearched, submittedQuery, selectedYear, selectedDept, selectedGrade]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredProposals.length / itemsPerPage));
  const paginatedProposals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProposals.slice(start, start + itemsPerPage);
  }, [filteredProposals, currentPage]);

  // 검색어 하이라이트 함수
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={idx} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  // ─── 2. 제안서 작성 상태 ─── //
  const [currentStep, setCurrentStep] = useState(1);

  // 기본 정보
  const [department, setDepartment] = useState('');
  const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [writingDate, setWritingDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [proposerName, setProposerName] = useState('');

  // 핵심 내용
  const [problem, setProblem] = useState('');
  const [improvement, setImprovement] = useState('');
  const [expectedEffect, setExpectedEffect] = useState('');

  // AI 내용 다듬기 상태
  const [isRefining, setIsRefining] = useState(false);
  const [isRefined, setIsRefined] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 다운로드 상태
  const [isBuilding, setIsBuilding] = useState(false);

  const categoryOptions = [
    '원가절감', '생산성향상', '품질향상', '신기술',
    '표준화', '신규유망투자', '관리혁신', '직무개선', '기타'
  ];

  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Gemini 기반 제안서 내용 다듬기 실행 (TEST2 메모장 API Key 자동 적용)
  const handleRefine = async () => {
    if (!problem.trim() && !improvement.trim() && !expectedEffect.trim()) {
      alert('문제점, 개선안, 기대효과 중 최소 한 항목을 입력해주세요.');
      return;
    }

    setIsRefining(true);
    try {
      const refined = await refineProposalWithGemini({
        problem,
        improvement,
        expectedEffect
      });

      if (refined.problem) setProblem(refined.problem);
      if (refined.improvement) setImprovement(refined.improvement);
      if (refined.expected_effect) setExpectedEffect(refined.expected_effect);
      setIsRefined(true);
      showToast('✨ AI가 내용을 전문적으로 다듬었습니다!');
    } catch (err) {
      console.error('내용 다듬기 오류:', err);
      alert(`내용 다듬기 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  // Excel 다운로드 실행 (Client-side ExcelJS)
  const handleDownload = async () => {
    if (!title.trim()) {
      alert('제안명을 입력해주세요.');
      return;
    }
    if (!proposerName.trim()) {
      alert('제안자 성명을 입력해주세요.');
      return;
    }

    setIsBuilding(true);
    try {
      await exportProposalToExcel({
        department,
        proposalDate,
        writingDate,
        title,
        categories,
        employeeId,
        proposerName,
        problem,
        improvement,
        expectedEffect
      });
      showToast('📥 Excel 제안서가 성공적으로 다운로드되었습니다!');
    } catch (err) {
      console.error('Excel 다운로드 오류:', err);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsBuilding(false);
    }
  };

  // 등급 뱃지 렌더링 헬퍼
  const renderGradeBadge = (grade) => {
    const g = (grade || '').trim().toUpperCase();
    let badgeClass = 'grade-badge-d';
    let label = grade || 'D';

    if (g.includes('A')) {
      badgeClass = 'grade-badge-a';
    } else if (g.includes('B')) {
      badgeClass = 'grade-badge-b';
    } else if (g.includes('C')) {
      badgeClass = 'grade-badge-c';
    } else if (g.includes('불채택')) {
      badgeClass = 'grade-badge-reject';
      label = '불채택';
    }

    return <span className={`compact-grade-badge ${badgeClass}`}>{label}</span>;
  };

  // ────────────────────────────────────────── //
  // 1. 제안 이력 조회 화면 (Search View)       //
  // ────────────────────────────────────────── //
  if (viewMode === 'search') {
    return (
      <div className="proposal-search-scroll-container">
        {/* 표준 패밀리룩 웰컴 카드 */}
        <div className="doc-welcome-card">
          <span className="doc-welcome-icon">💡</span>
          <h3>제안서를 쉽게 작성하세요</h3>
          <p>
            작성할 제안과 유사한 내용이 있는지 먼저 검색하고,<br />
            확인 후 표준 개선 제안서를 작성하세요.
          </p>
        </div>

        {/* ─── 중앙 스마트 검색 박스 ─── */}
        <div className="proposal-query-box">
          {/* 메인 검색 입력 & 버튼 */}
          <div className="proposal-search-input-group">
            <div className="search-input-wrapper">
              <Search className="search-input-icon" size={17} />
              <input
                type="text"
                className="proposal-main-input"
                placeholder="제안 제목 또는 키워드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className="proposal-search-submit-btn"
              onClick={() => handleSearchSubmit()}
            >
              <Search size={15} />
              <span>조회</span>
            </button>
          </div>

          {/* 3열 균등 스마트 필터 바 */}
          <div className={`proposal-filter-grid ${(searchQuery || selectedYear !== 'ALL' || selectedDept !== 'ALL' || selectedGrade !== 'ALL') ? 'has-reset' : ''}`}>
            <div className="filter-select-wrapper">
              <span className="filter-label">연도</span>
              <select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  if (hasSearched) setCurrentPage(1);
                }}
              >
                {yearList.map(y => (
                  <option key={y} value={y}>{y === 'ALL' ? '전체' : `${y}년`}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <span className="filter-label">부서</span>
              <select
                className="filter-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  if (hasSearched) setCurrentPage(1);
                }}
              >
                <option value="ALL">전체</option>
                {deptList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <span className="filter-label">등급</span>
              <select
                className="filter-select"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  if (hasSearched) setCurrentPage(1);
                }}
              >
                {gradeList.map(g => (
                  <option key={g} value={g}>{g === 'ALL' ? '전체' : `${g}등급`}</option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedYear !== 'ALL' || selectedDept !== 'ALL' || selectedGrade !== 'ALL') && (
              <button
                className="filter-reset-icon-btn"
                onClick={handleResetFilters}
                title="선택 필터 초기화"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* 추천 키워드 영역 */}
          {!hasSearched && (
            <div className="proposal-keywords-wrapper">
              <div className="keywords-header">
                <Sparkles size={12} className="sparkle-icon" />
                <span>추천 키워드</span>
              </div>
              <div className="keywords-chip-container">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    className="keyword-chip-btn"
                    onClick={() => handleTagClick(kw)}
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── A. 검색 전 초기 상태: 제안서 작성 빠른 이동 버튼 ─── */}
        {!hasSearched && (
          <div className="proposal-quick-write-container">
            <button
              className="proposal-quick-write-btn"
              onClick={() => {
                setViewMode('form');
                setCurrentStep(1);
              }}
            >
              <FileText size={15} />
              <span>새 제안서 바로 작성하기</span>
              <ArrowRight size={14} className="arrow-icon" />
            </button>
          </div>
        )}

        {/* ─── B. 검색 후 결과 상태 ─── */}
        {hasSearched && (
          <div className="proposal-search-results-section">
            {/* 결과 헤더 & 제안서 작성 액션 바 */}
            <div className="results-status-banner">
              <div className="status-text">
                {submittedQuery ? (
                  <><strong>"{submittedQuery}"</strong> 검색 결과: 총 <strong>{filteredProposals.length.toLocaleString()}</strong>건</>
                ) : (
                  <>선택 조건 결과: 총 <strong>{filteredProposals.length.toLocaleString()}</strong>건</>
                )}
              </div>

              <button
                className="results-write-btn"
                onClick={() => {
                  setViewMode('form');
                  setCurrentStep(1);
                  if (submittedQuery) setTitle(submittedQuery);
                }}
              >
                <Plus size={15} />
                <span>제안서 작성</span>
              </button>
            </div>

            {/* 결과 목록 */}
            {isDataLoading ? (
              <div className="proposal-empty-box">
                <Loader2 size={32} className="spinning" style={{ margin: '0 auto 12px', color: 'var(--accent-color)' }} />
                <h4>이력 데이터를 불러오는 중입니다...</h4>
                <p>잠시만 기다려주세요.</p>
              </div>
            ) : paginatedProposals.length === 0 ? (
              <div className="proposal-empty-box">
                <div className="empty-emoji">✅</div>
                <h4>중복되는 과거 제안이 없습니다</h4>
                <p>등록되지 않은 새로운 제안입니다. 바로 제안서를 작성해보세요!</p>
                <button
                  className="empty-action-write-btn"
                  onClick={() => {
                    setViewMode('form');
                    setCurrentStep(1);
                    if (submittedQuery) setTitle(submittedQuery);
                  }}
                >
                  <span>✏️ 제안서 작성 시작</span>
                </button>
              </div>
            ) : (
              <div className="compact-proposal-list">
                {paginatedProposals.map((item) => (
                  <div key={item.id} className="compact-proposal-card">
                    <div className="card-header-line">
                      <div className="left-tags">
                        <span className="badge-no">{item.no || `${item.year}-${item.id}`}</span>
                        <span className="badge-year">{item.year}년</span>
                        {item.dept && <span className="badge-dept">{normalizeDept(item.dept) || item.dept}</span>}
                        {item.name && <span className="badge-name">{item.name}</span>}
                      </div>
                      <div className="right-grade">
                        {renderGradeBadge(item.grade)}
                      </div>
                    </div>

                    <div className="card-body-title">
                      {highlightText(item.title, submittedQuery)}
                    </div>

                    {item.category && item.category !== '-' && (
                      <div className="card-footer-line">
                        <span className="category-text">🏷️ {item.category}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="proposal-pagination">
                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="pagination-info">
                  {currentPage} / {totalPages}
                </span>

                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* 하단 제안서 작성 플로팅 바 */}
            <div className="bottom-write-dock">
              <span>이력 확인을 완료하셨나요?</span>
              <button
                className="dock-write-btn"
                onClick={() => {
                  setViewMode('form');
                  setCurrentStep(1);
                  if (submittedQuery) setTitle(submittedQuery);
                }}
              >
                <span>제안서 작성하기</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────── //
  // 2. 제안서 작성 화면 (Form View - 2단계 구조) //
  // ────────────────────────────────────────── //
  return (
    <div className="proposal-search-scroll-container">
      {/* 알림 토스트 */}
      {toastMessage && (
        <div className="proposal-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="dept-report-form">
        <div className="form-header">
          <button
            className="back-btn"
            onClick={() => setViewMode('search')}
            title="제안 이력 조회 화면으로 이동"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="form-title-group">
            <h2>💡 개선 제안서 작성</h2>
            <p className="form-subtitle">표준 양식에 맞춘 개선 제안서 작성 및 Excel 즉시 다운로드</p>
          </div>
        </div>

        {/* 2단계 스텝바 */}
        <div className="step-indicator">
          <div className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">기본 정보</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">핵심 내용 & 다운로드</span>
          </div>
        </div>

        {/* ─── 1단계: 기본 정보 ─── */}
        {currentStep === 1 && (
          <div className="step-content">
            <div className="step-content-header">
              <h3>기본 정보 입력</h3>
              <p>제안서의 기본 메타데이터를 입력해주세요.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>부서 <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">부서를 선택하세요</option>
                  {DEPARTMENT_LIST.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>제안명 <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="개선 제안의 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>제안일자</label>
                <input
                  type="date"
                  className="form-input"
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>작성일자</label>
                <input
                  type="date"
                  className="form-input"
                  value={writingDate}
                  onChange={(e) => setWritingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>사번</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 20180090"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>성명 <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="제안자 성명"
                  value={proposerName}
                  onChange={(e) => setProposerName(e.target.value)}
                />
              </div>
            </div>

            {/* 제안 구분 선택 */}
            <div className="form-group" style={{ marginTop: '1.2rem' }}>
              <label>제안 구분 (다중 선택 가능)</label>
              <div className="category-tag-group">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-tag-btn ${categories.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-actions">
              <button
                className="action-btn secondary"
                onClick={() => setViewMode('search')}
              >
                ← 이력 조회로 이동
              </button>
              <button
                className="action-btn primary"
                onClick={() => setCurrentStep(2)}
                disabled={!department.trim() || !title.trim() || !proposerName.trim()}
              >
                다음 단계로 →
              </button>
            </div>
          </div>
        )}

        {/* ─── 2단계: 핵심 내용 입력 & 내용 다듬기 & 엑셀 다운로드 ─── */}
        {currentStep === 2 && (
          <div className="step-content">
            <div className="step-content-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <h3>핵심 내용 작성 및 엑셀 생성</h3>
                  <p>문제점과 개선안, 기대효과를 작성하고 바로 Excel을 내려받으세요.</p>
                </div>
                <button
                  className="refine-btn"
                  onClick={handleRefine}
                  disabled={isRefining || (!problem.trim() && !improvement.trim() && !expectedEffect.trim())}
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="spin-icon" size={16} />
                      <span>AI 다듬는 중...</span>
                    </>
                  ) : isRefined ? (
                    <>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>내용 다듬기 완료 (재실행 가능)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>✨ AI 내용 다듬기</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>1. 문제점 (현상 및 원인) <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="현재 공정이나 설비에서 발생하는 문제점, 비효율 현상을 자유롭게 작성하세요."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>2. 개선안 (개선 내용 및 방법) <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="구체적인 개선 방안, 조치 내용, 작업 절차를 작성하세요."
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>3. 기대효과 (정량적/정성적 효과) <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="개선 시 예상되는 원가절감, 품질향상, 안전 확보 등 기대효과를 작성하세요."
                value={expectedEffect}
                onChange={(e) => setExpectedEffect(e.target.value)}
              />
            </div>

            <div className="step-actions">
              <button
                className="action-btn secondary"
                onClick={() => setCurrentStep(1)}
              >
                ← 기본 정보 수정
              </button>
              <button
                className="action-btn download-btn"
                onClick={handleDownload}
                disabled={isBuilding || !problem.trim() || !improvement.trim()}
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="spin-icon" size={18} />
                    <span>Excel 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>📥 Excel 다운로드</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementProposalTab;
