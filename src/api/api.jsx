/**
 * 백엔드 ATS / HR API (Spring: /api/hr/applicants/** , /api/public/**)
 * 배포 시 nginx가 /api 를 백엔드로 넘기므로 경로는 항상 상대 경로 /api 로 통일.
 */

async function handleJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function fetchHrApplicantDashboard() {
  const res = await fetch('/api/hr/applicants/dashboard');
  const data = await handleJson(res);
  if (!res.ok) {
    const msg = data.message || data.error || data.raw || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function fetchHrApplicantDetail(applicantId) {
  const res = await fetch(`/api/hr/applicants/${applicantId}`);
  const data = await handleJson(res);
  if (!res.ok) {
    const msg = data.message || data.error || data.raw || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function postAnalyzeApplicantResume(applicantId) {
  const res = await fetch(`/api/hr/applicants/${applicantId}/analyze`, {
    method: 'POST',
  });
  const data = await handleJson(res);
  if (!res.ok) {
    const msg = data.message || data.error || data.raw || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}
