/**
 * 백엔드 ATS / HR API (Spring: /api/hr/applicants/** , /api/public/**)
 * 배포 시 동일 오리진에서 /api 가 백엔드로 프록시되므로 경로는 상대 경로 /api 로 통일.
 * HR 경로는 로그인 JWT(Bearer) 필요 — localStorage accessToken 사용.
 */

function authHeaders(extra = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function httpErrorMessage(res, data) {
  if (res.status === 401) {
    return '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.';
  }
  const msg = data.message || data.error || data.raw || `HTTP ${res.status}`;
  return typeof msg === 'string' ? msg : JSON.stringify(msg);
}

export async function fetchHrApplicantDashboard() {
  const res = await fetch('/api/hr/applicants/dashboard', {
    headers: authHeaders(),
  });
  const data = await handleJson(res);
  if (!res.ok) {
    throw new Error(httpErrorMessage(res, data));
  }
  return data;
}

export async function fetchHrApplicantDetail(applicantId) {
  const res = await fetch(`/api/hr/applicants/${applicantId}`, {
    headers: authHeaders(),
  });
  const data = await handleJson(res);
  if (!res.ok) {
    throw new Error(httpErrorMessage(res, data));
  }
  return data;
}

/** 직무 기준이 필요하면 options.body 로 JSON 문자열 전달 (예: JSON.stringify({ jobDescription: '...' })) */
export async function postAnalyzeApplicantResume(applicantId, options = {}) {
  const hasBody = options.body != null && options.body !== '';
  const res = await fetch(`/api/hr/applicants/${applicantId}/analyze`, {
    method: 'POST',
    headers: authHeaders(
      hasBody ? { 'Content-Type': 'application/json' } : {},
    ),
    body: hasBody ? options.body : undefined,
  });
  const data = await handleJson(res);
  if (!res.ok) {
    throw new Error(httpErrorMessage(res, data));
  }
  return data;
}
