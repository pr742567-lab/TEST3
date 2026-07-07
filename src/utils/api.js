/**
 * 무림AI-ON API 공통 설정 유틸리티 (Common API Configuration Utility)
 * 
 * 백엔드 서버의 API Base URL을 동적으로 결정하는 공통 함수 및 상수를 정의합니다.
 */

// 백엔드 API 주소 (Vercel 배포 환경에서는 VITE_API_URL 사용, 로컬 환경에서는 동적 호스트명 사용)
// localhost 접속 시 IPv6(::1) 연결 오류 방지를 위해 호스트명이 localhost인 경우 127.0.0.1로 포워딩
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${targetHost}:8001`;
};

export const API_BASE_URL = getApiBaseUrl();
