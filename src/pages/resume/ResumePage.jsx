import { useCallback, useEffect, useState } from 'react';
import {
  fetchHrApplicantDashboard,
  fetchHrApplicantDetail,
  postAnalyzeApplicantResume,
} from '../../api/api.jsx';

const layout = {
  wrap: { display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' },
  tableBox: { flex: '1 1 520px', minWidth: 320, overflowX: 'auto' },
  panel: {
    flex: '1 1 360px',
    minWidth: 280,
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 16,
    background: '#fafafa',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', borderBottom: '2px solid #ccc', padding: '8px 6px' },
  td: { borderBottom: '1px solid #eee', padding: '8px 6px', verticalAlign: 'top' },
  btn: { cursor: 'pointer', padding: '4px 10px' },
  btnDisabled: { opacity: 0.55, cursor: 'not-allowed' },
  muted: { color: '#666', fontSize: 13 },
  err: { color: '#b00020' },
  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 12,
    background: '#fff',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #eee',
    maxHeight: 240,
    overflow: 'auto',
  },
};

function formatDt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ko-KR');
  } catch {
    return String(iso);
  }
}

function previewFromSummary(text) {
  if (text == null || text === '') return null;
  const t = String(text).trim();
  if (t.length <= 160) return t;
  return `${t.slice(0, 160)}…`;
}

/** 대시보드 한 행 + 분석 POST 응답으로 목록 상태 갱신 */
function mergeAnalyzeIntoRow(row, analyzeResult) {
  const a = analyzeResult?.analysis;
  if (!a) return row;
  return {
    ...row,
    analysisStatus: a.status ?? row.analysisStatus,
    overallScore: a.overallScore ?? row.overallScore,
    analyzedAt: a.analyzedAt ?? row.analyzedAt,
    summaryPreview: previewFromSummary(a.summary) ?? row.summaryPreview,
  };
}

export default function ResumePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [analyzeBusyId, setAnalyzeBusyId] = useState(null);

  const loadDashboard = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchHrApplicantDashboard();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || '목록을 불러오지 못했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openDetail = async (applicantId) => {
    setSelectedId(applicantId);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const d = await fetchHrApplicantDetail(applicantId);
      setDetail(d);
    } catch (e) {
      setDetailError(e.message || '상세 조회 실패');
    } finally {
      setDetailLoading(false);
    }
  };

  const runAnalyze = async (row) => {
    if (!row.resumeAttached) return;
    setAnalyzeBusyId(row.applicantId);
    setError('');
    try {
      const result = await postAnalyzeApplicantResume(row.applicantId);
      setRows((prev) =>
        prev.map((r) =>
          r.applicantId === row.applicantId ? mergeAnalyzeIntoRow(r, result) : r,
        ),
      );
      if (selectedId === row.applicantId) {
        await openDetail(row.applicantId);
      }
    } catch (e) {
      setError(e.message || '분석 요청 실패');
    } finally {
      setAnalyzeBusyId(null);
    }
  };

  const selectedRow = rows.find((r) => r.applicantId === selectedId);

  return (
    <div>
      <h1>지원자 · 이력서 분석 (HR)</h1>
      <p style={layout.muted}>
        목록: <code>/api/hr/applicants/dashboard</code> · 분석:{' '}
        <code>POST /api/hr/applicants/:id/analyze</code>
      </p>

      {error ? <p style={layout.err}>{error}</p> : null}

      <div style={layout.wrap}>
        <div style={layout.tableBox}>
          {loading ? (
            <p>불러오는 중…</p>
          ) : (
            <table style={layout.table}>
              <thead>
                <tr>
                  <th style={layout.th}>지원자</th>
                  <th style={layout.th}>이메일</th>
                  <th style={layout.th}>이력서</th>
                  <th style={layout.th}>분석</th>
                  <th style={layout.th}>점수</th>
                  <th style={layout.th}>분석일시</th>
                  <th style={layout.th}>작업</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={layout.td}>
                      지원자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const busy = analyzeBusyId === row.applicantId;
                    const sel = selectedId === row.applicantId;
                    return (
                      <tr
                        key={row.applicantId}
                        style={{
                          background: sel ? '#f0f7ff' : undefined,
                        }}
                      >
                        <td style={layout.td}>
                          <button
                            type="button"
                            style={{
                              ...layout.btn,
                              border: 'none',
                              background: 'none',
                              color: '#1565c0',
                              textDecoration: 'underline',
                              padding: 0,
                            }}
                            onClick={() => openDetail(row.applicantId)}
                          >
                            {row.name || '—'}
                          </button>
                        </td>
                        <td style={layout.td}>{row.email || '—'}</td>
                        <td style={layout.td}>
                          {row.resumeAttached ? '있음' : '없음'}
                        </td>
                        <td style={layout.td}>
                          {row.analysisStatus || '—'}
                        </td>
                        <td style={layout.td}>
                          {row.overallScore != null ? row.overallScore : '—'}
                        </td>
                        <td style={layout.td}>{formatDt(row.analyzedAt)}</td>
                        <td style={layout.td}>
                          <button
                            type="button"
                            style={
                              !row.resumeAttached || busy
                                ? { ...layout.btn, ...layout.btnDisabled }
                                : layout.btn
                            }
                            disabled={!row.resumeAttached || busy}
                            onClick={() => runAnalyze(row)}
                          >
                            {busy ? '분석중…' : '분석하기'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
          <p>
            <button type="button" style={layout.btn} onClick={loadDashboard}>
              새로고침
            </button>
          </p>
        </div>

        <aside style={layout.panel}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>이력서 분석 결과</h2>
          {!selectedId ? (
            <p style={layout.muted}>왼쪽에서 지원자 이름을 눌러 상세를 확인하세요.</p>
          ) : detailLoading ? (
            <p>상세 불러오는 중…</p>
          ) : detailError ? (
            <p style={layout.err}>{detailError}</p>
          ) : detail ? (
            <>
              <p>
                <strong>{detail.name}</strong>
                <br />
                <span style={layout.muted}>
                  {detail.email} · {detail.phone}
                </span>
              </p>
              <p style={layout.muted}>
                제출: {formatDt(detail.submittedAt)}
                <br />
                파일: {detail.originalFileName || '—'}
                <br />
                저장소 키:{' '}
                <span style={{ wordBreak: 'break-all' }}>
                  {detail.storageKey || '—'}
                </span>
              </p>
              {detail.analysis ? (
                <>
                  <p>
                    상태: {detail.analysis.status} · 모델:{' '}
                    {detail.analysis.model || '—'} · 점수:{' '}
                    {detail.analysis.overallScore != null
                      ? detail.analysis.overallScore
                      : '—'}
                  </p>
                  <p style={{ marginBottom: 4 }}>요약</p>
                  <div style={layout.pre}>{detail.analysis.summary || '—'}</div>
                  <p style={{ marginBottom: 4, marginTop: 12 }}>resultJson</p>
                  <pre style={layout.pre}>
                    {detail.analysis.resultJson
                      ? (() => {
                          try {
                            return JSON.stringify(
                              JSON.parse(detail.analysis.resultJson),
                              null,
                              2,
                            );
                          } catch {
                            return detail.analysis.resultJson;
                          }
                        })()
                      : '—'}
                  </pre>
                  {detail.analysis.failureMessage ? (
                    <p style={layout.err}>{detail.analysis.failureMessage}</p>
                  ) : null}
                  <p style={layout.muted}>
                    분석일시: {formatDt(detail.analysis.analyzedAt)}
                  </p>
                </>
              ) : (
                <p style={layout.muted}>아직 분석 결과가 없습니다. 목록에서 분석하기를 누르세요.</p>
              )}
              {selectedRow?.summaryPreview && !detail.analysis?.summary ? (
                <p style={layout.muted}>목록 요약: {selectedRow.summaryPreview}</p>
              ) : null}
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
