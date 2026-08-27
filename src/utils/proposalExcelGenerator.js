import ExcelJS from 'exceljs';

/**
 * 날짜 포맷 변환 헬퍼 (YYYY-MM-DD -> '     2026년       8월       28일')
 */
function formatDateForCell(dateStr) {
  if (!dateStr) return '     년       월       일';
  try {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `     ${year}년       ${month}월       ${day}일`;
  } catch {
    return '     년       월       일';
  }
}

/**
 * 제안 구분 텍스트 변환 헬퍼 (원본 양식 포맷)
 */
function getProposalCategoryText(categories = []) {
  const allCategories = [
    { label: '원가절감', key: '원가절감' },
    { label: '생산성향상', key: '생산성향상' },
    { label: '품질향상', key: '품질향상' },
    { label: '신기술', key: '신기술' },
    { label: '표준화', key: '표준화' },
    { label: '신규유망투자', key: '신규유망투자' },
    { label: '관리혁신', key: '관리혁신' },
    { label: '직무개선', key: '직무개선' },
    { label: '기타', key: '기타' }
  ];

  const line1 = [];
  const line2 = [];
  const line3 = [];

  allCategories.forEach((cat, idx) => {
    const isChecked = categories.includes(cat.key);
    const mark = isChecked ? '  ✓  ' : '    ';
    const item = `${cat.label}(${mark})`;
    if (idx < 4) {
      line1.push(item);
    } else if (idx < 8) {
      line2.push(item);
    } else {
      line3.push(item);
    }
  });

  let result = '  ' + line1.join(' ');
  if (line2.length > 0) result += '\n  ' + line2.join(' ');
  if (line3.length > 0) result += '\n  ' + line3.join(' ');
  return result;
}

/**
 * TEST2의 원본 템플릿('제안서 양식.xlsx')을 기반으로 데이터를 채워 Excel 파일을 다운로드합니다.
 */
export async function exportProposalToExcel(data) {
  const workbook = new ExcelJS.Workbook();

  // 1. public 폴더의 원본 양식 파일 로드
  const templateUrl = `${import.meta.env.BASE_URL || '/'}제안서 양식.xlsx`;
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('제안서 원본 양식 파일을 불러오지 못했습니다.');
  }

  const arrayBuffer = await response.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.getWorksheet('제안서') || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('제안서 시트를 찾을 수 없습니다.');
  }

  // ─── 2. 원본 양식 셀에 정확한 값 대입 ─── //

  // 제안 실시일 (U2)
  if (data.proposalDate) {
    worksheet.getCell('U2').value = formatDateForCell(data.proposalDate);
  }

  // 제안 작성일 (U3)
  if (data.writingDate) {
    worksheet.getCell('U3').value = formatDateForCell(data.writingDate);
  }

  // 제안 제목 (G7)
  if (data.title) {
    worksheet.getCell('G7').value = data.title;
  }

  // 제안 구분 (AB7)
  worksheet.getCell('AB7').value = getProposalCategoryText(data.categories || []);

  // 부서 (G9)
  worksheet.getCell('G9').value = data.department || '';

  // 사번 (W9)
  if (data.employeeId) {
    worksheet.getCell('W9').value = data.employeeId;
  }

  // 제안자 성명 (AL9)
  if (data.proposerName) {
    worksheet.getCell('AL9').value = data.proposerName;
  }

  // 문제점(현상 및 원인) (A11)
  if (data.problem) {
    worksheet.getCell('A11').value = data.problem;
  }

  // 개선안(대책) (A19)
  if (data.improvement) {
    worksheet.getCell('A19').value = data.improvement;
  }

  // 완료/미실시 체크 (K18, P18)
  if (data.improvementStatus === 'completed') {
    worksheet.getCell('K18').value = '✓';
  } else if (data.improvementStatus === 'not_implemented') {
    worksheet.getCell('P18').value = '✓';
  }

  // 기대효과 (A27)
  if (data.expectedEffect) {
    worksheet.getCell('A27').value = data.expectedEffect;
  }

  // ─── 3. 파일 브라우저 다운로드 ─── //
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeTitle = (data.title || '미지정').replace(/[\\/:*?"<>|]/g, '_');
  anchor.download = `개선제안서_${safeTitle}_${data.proposalDate || '2026'}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
