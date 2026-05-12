import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, Users, FileText, Star, CheckCircle } from 'lucide-react';

import {
  fetchHrApplicantDashboard,
  fetchHrApplicantDetail,
  postAnalyzeApplicantResume,
} from '../../api/api.jsx';

import '../dashboard/dashboard.css';
import './resumeAi.css';

const PAGE_SIZE = 8;

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

function hasToken() {
  return Boolean(localStorage.getItem('accessToken'));
}

export default function ResumePage() {
  const [tab, setTab] = useState('summary');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem('accessToken')),
  );
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [analyzeBusyId, setAnalyzeBusyId] = useState(null);

  const loadDashboard = useCallback(async () => {
    setError('');
    if (!hasToken()) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchHrApplicantDashboard();
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setPage(1);
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

  const kpis = useMemo(() => {
    const total = rows.length;
    const withResume = rows.filter((r) => r.resumeAttached).length;
    const analyzed = rows.filter(
      (r) => r.analysisStatus || r.overallScore != null,
    ).length;
    const scores = rows
      .map((r) => r.overallScore)
      .filter((s) => s != null && !Number.isNaN(Number(s)));
    const avgScore =
      scores.length === 0
        ? null
        : Math.round(
            scores.reduce((a, b) => a + Number(b), 0) / scores.length,
          );
    return { total, withResume, analyzed, avgScore };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openDetail = async (applicantId) => {
    if (!hasToken()) return;
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
    if (!row.resumeAttached || !hasToken()) return;
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

  if (!hasToken() && !loading) {
    return (
      <section className="dashboard-page">
        <header className="dashboard-page__header">
          <div className="dashboard-page__hero">
            <h1>AI 채용</h1>
            <p>지원자 현황과 이력서 분석 결과를 확인합니다.</p>
          </div>
        </header>
        <article className="panel resume-ai__login-hint">
          <p>AI 채용 대시보드는 로그인한 회원만 볼 수 있습니다.</p>
          <Link className="resume-ai__login-link" to="/login">
            로그인하기
          </Link>
        </article>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>AI 채용</h1>
          <p>지원자 현황과 이력서 분석 결과를 한곳에서 확인하세요.</p>
        </div>
        <button className="dashboard-page__date-picker" type="button" disabled>
          <Calendar size={16} strokeWidth={1.8} />
          <span>{new Date().toLocaleDateString('ko-KR')}</span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
      </header>

      <nav className="resume-ai__tabs" aria-label="AI 채용 구역">
        <button
          type="button"
          className={`resume-ai__tab ${tab === 'summary' ? 'is-active' : ''}`}
          onClick={() => setTab('summary')}
        >
          요약
        </button>
        <button
          type="button"
          className={`resume-ai__tab ${tab === 'list' ? 'is-active' : ''}`}
          onClick={() => setTab('list')}
        >
          지원자 목록
        </button>
      </nav>

      {error ? (
        <p style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 16 }}>
          {error}
        </p>
      ) : null}

      {tab === 'summary' && (
        <section className="dashboard-page__summary-grid">
          <article className="summary-card">
            <div className="summary-card__icon tone-blue">
              <Users size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">전체 지원자</p>
              <strong className="summary-card__value">{kpis.total}명</strong>
              <span className="summary-card__note">등록된 지원자 수</span>
            </div>
          </article>
          <article className="summary-card">
            <div className="summary-card__icon tone-green">
              <FileText size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">이력서 제출</p>
              <strong className="summary-card__value">{kpis.withResume}명</strong>
              <span className="summary-card__note">첨부파일 있는 지원자</span>
            </div>
          </article>
          <article className="summary-card">
            <div className="summary-card__icon tone-purple">
              <Star size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">평균 스크리닝 점수</p>
              <strong className="summary-card__value">
                {kpis.avgScore != null ? `${kpis.avgScore}점` : '—'}
              </strong>
              <span className="summary-card__note">분석 완료 건 기준</span>
            </div>
          </article>
          <article className="summary-card">
            <div className="summary-card__icon tone-orange">
              <CheckCircle size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">분석 이력 있음</p>
              <strong className="summary-card__value">{kpis.analyzed}명</strong>
              <span className="summary-card__note">상태 또는 점수 보유</span>
            </div>
          </article>
        </section>
      )}

      {tab === 'list' && (
        <div className="resume-ai__grid">
          <article className="panel">
            <div className="panel__head">
              <h2>지원자 목록</h2>
              <button
                type="button"
                className="resume-ai__page-btn"
                onClick={() => loadDashboard()}
                disabled={loading}
              >
                새로고침
              </button>
            </div>
            {loading ? (
              <p style={{ color: '#64748b', fontWeight: 600 }}>불러오는 중…</p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>지원자</th>
                        <th>이메일</th>
                        <th>이력서</th>
                        <th>분석</th>
                        <th>점수</th>
                        <th>분석일시</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageSlice.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="muted-cell">
                            지원자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        pageSlice.map((row) => {
                          const busy = analyzeBusyId === row.applicantId;
                          const sel = selectedId === row.applicantId;
                          return (
                            <tr
                              key={row.applicantId}
                              style={{
                                background: sel ? '#fff7ed' : undefined,
                              }}
                            >
                              <td>
                                <button
                                  type="button"
                                  className="resume-ai__name-btn"
                                  onClick={() => openDetail(row.applicantId)}
                                >
                                  {row.name || '—'}
                                </button>
                              </td>
                              <td className="muted-cell">{row.email || '—'}</td>
                              <td>{row.resumeAttached ? '있음' : '없음'}</td>
                              <td>{row.analysisStatus || '—'}</td>
                              <td>
                                {row.overallScore != null ? (
                                  <span className="score-badge">
                                    {row.overallScore}점
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="muted-cell">
                                {formatDt(row.analyzedAt)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="resume-ai__page-btn"
                                  disabled={!row.resumeAttached || busy}
                                  onClick={() => runAnalyze(row)}
                                >
                                  {busy ? '분석중…' : '분석'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="resume-ai__pager">
                  <span className="resume-ai__pager-info">
                    총 {rows.length}명 · {safePage} / {totalPages} 페이지
                  </span>
                  <div className="resume-ai__pager-btns">
                    <button
                      type="button"
                      className="resume-ai__page-btn"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      className="resume-ai__page-btn"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      다음
                    </button>
                  </div>
                </div>
              </>
            )}
          </article>

          <article className="panel">
            <div className="panel__head">
              <h2>이력서 분석</h2>
            </div>
            {!selectedId ? (
              <p className="muted-cell">목록에서 지원자 이름을 눌러 상세를 확인하세요.</p>
            ) : detailLoading ? (
              <p style={{ color: '#64748b', fontWeight: 600 }}>상세 불러오는 중…</p>
            ) : detailError ? (
              <p style={{ color: '#b91c1c', fontWeight: 700 }}>{detailError}</p>
            ) : detail ? (
              <>
                <p>
                  <strong>{detail.name}</strong>
                  <br />
                  <span className="muted-cell">
                    {detail.email} · {detail.phone}
                  </span>
                </p>
                <p className="muted-cell" style={{ fontSize: 13 }}>
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
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      상태: {detail.analysis.status} · 모델:{' '}
                      {detail.analysis.model || '—'} · 점수:{' '}
                      {detail.analysis.overallScore != null
                        ? detail.analysis.overallScore
                        : '—'}
                    </p>
                    <p
                      style={{
                        marginBottom: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      요약
                    </p>
                    <div className="resume-ai__detail-pre">
                      {detail.analysis.summary || '—'}
                    </div>
                    <p
                      style={{
                        marginBottom: 6,
                        marginTop: 14,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      resultJson
                    </p>
                    <pre className="resume-ai__detail-pre">
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
                      <p style={{ color: '#b91c1c', marginTop: 10 }}>
                        {detail.analysis.failureMessage}
                      </p>
                    ) : null}
                    <p className="muted-cell" style={{ marginTop: 10 }}>
                      분석일시: {formatDt(detail.analysis.analyzedAt)}
                    </p>
                  </>
                ) : (
                  <p className="muted-cell">
                    아직 분석 결과가 없습니다. 목록에서 분석을 실행하세요.
                  </p>
                )}
                {selectedRow?.summaryPreview && !detail.analysis?.summary ? (
                  <p className="muted-cell" style={{ marginTop: 10 }}>
                    목록 요약: {selectedRow.summaryPreview}
                  </p>
                ) : null}
              </>
            ) : null}
          </article>
        </div>
      )}
    </section>
  );
}
