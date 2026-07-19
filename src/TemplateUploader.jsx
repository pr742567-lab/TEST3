import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, Loader } from 'lucide-react';

// 백엔드 API 주소
// localhost 접속 시 IPv6(::1) 연결 오류 방지를 위해 호스트명이 localhost인 경우 127.0.0.1로 포워딩
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${targetHost}:8002`;
};
const API_BASE_URL = getApiBaseUrl();

// PPT 템플릿 업로드 컴포넌트
// - 드래그 앤 드롭(Drag & Drop) 또는 파일 선택(File Picker)으로 PPT 파일을 업로드
// - 업로드 후 자동으로 백엔드에 분석 요청을 보냄
// - 분석 결과(슬라이드 수, 사용 폰트, 레이아웃 등)를 요약 카드로 표시
const TemplateUploader = ({ onAnalysisComplete }) => {
  // 드래그 오버 상태 (영역 하이라이트 용)
  const [isDragOver, setIsDragOver] = useState(false);
  // 업로드/분석 진행 상태
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'
  // 분석 결과 데이터
  const [analysisResult, setAnalysisResult] = useState(null);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');
  // 업로드된 파일명
  const [fileName, setFileName] = useState('');

  // 파일 입력 참조 (숨겨진 input 요소)
  const fileInputRef = useRef(null);

  // 파일 유효성 검사 (PPT/PPTX만 허용)
  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
    ];
    const allowedExtensions = ['.pptx', '.ppt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return 'PPT 또는 PPTX 파일만 업로드할 수 있습니다.';
    }
    // 50MB 제한
    if (file.size > 50 * 1024 * 1024) {
      return '파일 크기는 50MB를 초과할 수 없습니다.';
    }
    return null;
  };

  // 파일 업로드 및 분석 요청 처리
  const handleFile = async (file) => {
    // 유효성 검사
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState('error');
      setErrorMessage(validationError);
      return;
    }

    setFileName(file.name);
    setUploadState('uploading');
    setErrorMessage('');

    try {
      // 1단계: 파일 업로드
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/doc-assist/upload-template`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`업로드 실패 (${uploadResponse.status})`);
      }

      const uploadData = await uploadResponse.json();

      // 2단계: 분석 요청
      setUploadState('analyzing');

      const analyzeResponse = await fetch(`${API_BASE_URL}/api/doc-assist/analyze-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: uploadData.file_id }),
      });

      if (!analyzeResponse.ok) {
        throw new Error(`분석 실패 (${analyzeResponse.status})`);
      }

      const analysisData = await analyzeResponse.json();
      setAnalysisResult(analysisData);
      setUploadState('done');

      // 부모 컴포넌트에 분석 완료 알림 (fileId도 함께 전달)
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData, uploadData.file_id);
      }
    } catch (error) {
      console.error('템플릿 업로드/분석 에러:', error);
      setUploadState('error');
      setErrorMessage(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 파일 선택 다이얼로그 열기
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 초기화 (다시 업로드)
  const handleReset = () => {
    setUploadState('idle');
    setAnalysisResult(null);
    setErrorMessage('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="template-uploader">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ppt,.pptx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 상태별 UI 분기 */}
      {uploadState === 'idle' && (
        <div
          className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} strokeWidth={1.5} />
          <h3>PPT 템플릿을 업로드해 주세요</h3>
          <p>
            기존에 잘 만들어진 PPT 파일을 여기에 드래그하거나 클릭하여 선택하세요.
            <br />
            템플릿의 스타일과 구조를 자동으로 분석합니다.
          </p>
          <span className="upload-hint">.pptx / .ppt · 최대 50MB</span>
        </div>
      )}

      {(uploadState === 'uploading' || uploadState === 'analyzing') && (
        <div className="upload-progress">
          <Loader size={40} className="upload-spinner" />
          <h3>{uploadState === 'uploading' ? '📤 파일 업로드 중...' : '🔍 템플릿 분석 중...'}</h3>
          <p>
            {uploadState === 'uploading'
              ? `${fileName} 파일을 서버에 전송하고 있습니다.`
              : '슬라이드 구조, 폰트, 색상 등을 분석하고 있습니다.'}
          </p>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="upload-error">
          <AlertCircle size={40} />
          <h3>⚠️ 오류 발생</h3>
          <p>{errorMessage}</p>
          <button className="upload-retry-btn" onClick={handleReset}>
            다시 시도
          </button>
        </div>
      )}

      {uploadState === 'done' && analysisResult && (
        <div className="upload-result">
          <div className="upload-result-header">
            <FileCheck size={24} />
            <div>
              <h3>✅ 분석 완료</h3>
              <span className="upload-result-filename">{fileName}</span>
            </div>
            <button className="upload-change-btn" onClick={handleReset}>
              다른 파일
            </button>
          </div>

          {/* 분석 결과 요약 카드 */}
          <div className="analysis-summary">
            <div className="analysis-stat">
              <span className="stat-value">{analysisResult.slide_count || 0}</span>
              <span className="stat-label">슬라이드</span>
            </div>
            <div className="analysis-stat">
              <span className="stat-value">{analysisResult.fonts?.length || 0}</span>
              <span className="stat-label">사용 폰트</span>
            </div>
            <div className="analysis-stat">
              <span className="stat-value">{analysisResult.theme_colors?.length || 0}</span>
              <span className="stat-label">테마 색상</span>
            </div>
          </div>

          {/* 테마 색상 미리보기 */}
          {analysisResult.theme_colors && analysisResult.theme_colors.length > 0 && (
            <div className="analysis-colors">
              <span className="analysis-colors-label">테마 색상:</span>
              <div className="color-swatches">
                {analysisResult.theme_colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 사용 폰트 목록 */}
          {analysisResult.fonts && analysisResult.fonts.length > 0 && (
            <div className="analysis-fonts">
              <span className="analysis-fonts-label">사용 폰트:</span>
              <div className="font-tags">
                {analysisResult.fonts.map((font, idx) => (
                  <span key={idx} className="font-tag">{font}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateUploader;
