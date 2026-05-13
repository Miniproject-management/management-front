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

/** ALB/Nginx 가 HTML 502 페이지를 주면 JSON 이 아니라 raw 로 들어옴 → 사용자에게 HTML 을 숨김 */
function pickUserFacingMessage(candidate) {
  if (typeof candidate !== 'string') return '';
  const t = candidate.trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  if (lower.startsWith('<!doctype') || lower.startsWith('<html')) {
    return '';
  }
  return t;
}

function httpErrorMessage(res, data) {
  if (res.status === 401) {
    return '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.';
  }
  if (res.status === 403) {
    return '접근이 거부되었습니다(403). 로그인·권한 또는 배포된 API 버전을 확인해 주세요.';
  }
  if (res.status === 502 || res.status === 503) {
    const m =
      pickUserFacingMessage(data.message) ||
      pickUserFacingMessage(data.error) ||
      pickUserFacingMessage(data.raw);
    if (m.length > 0) return m;
    return '게이트웨이(502/503): 백엔드가 응답하지 않거나 연결이 끊겼습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.';
  }
  const msg =
    pickUserFacingMessage(data.message) ||
    pickUserFacingMessage(data.error) ||
    pickUserFacingMessage(data.raw) ||
    `HTTP ${res.status}`;
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

/** PDF 바이트 (Blob URL / iframe 용). Bearer 필수 */
export async function fetchResumePdfBlob(applicantId) {
  const res = await fetch(`/api/hr/applicants/${applicantId}/resume/file`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await handleJson(res);
    throw new Error(httpErrorMessage(res, data));
  }
  return res.blob();
}

/** S3 PDF 브라우저 표시용 단기 프리사인 URL { url, expiresInSeconds } (선택) */
export async function fetchResumePreviewUrl(applicantId) {
  const res = await fetch(
    `/api/hr/applicants/${applicantId}/resume/preview-url`,
    { headers: authHeaders() },
  );
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
