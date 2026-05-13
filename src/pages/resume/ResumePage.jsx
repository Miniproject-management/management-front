import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Users,
  FileText,
  Star,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

import {
  fetchHrApplicantDashboard,
  fetchHrApplicantDetail,
  fetchResumePdfBlob,
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

/** AI 점수 표시용 0–100 */
function clampScore0to100(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
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

function buildAnalyzeBody(jobDescription) {
  const t = jobDescription.trim();
  if (!t) return JSON.stringify({});
  return JSON.stringify({ jobDescription: t });
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
  const [analyzeModalRow, setAnalyzeModalRow] = useState(null);
  const [analyzeJd, setAnalyzeJd] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const resumeBlobUrlRef = useRef(null);

  const revokeResumeBlob = useCallback(() => {
    if (resumeBlobUrlRef.current) {
      URL.revokeObjectURL(resumeBlobUrlRef.current);
      resumeBlobUrlRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    if (!analyzeModalRow) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setAnalyzeModalRow(null);
        setAnalyzeJd('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [analyzeModalRow]);

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

  /** 요약 탭: 종합 점수 구간별 인원(막대 그래프용) */
  const scoreDistribution = useMemo(() => {
    const bins = [
      { label: '0–59점', min: 0, max: 59, count: 0 },
      { label: '60–74점', min: 60, max: 74, count: 0 },
      { label: '75–89점', min: 75, max: 89, count: 0 },
      { label: '90–100점', min: 90, max: 100, count: 0 },
    ];
    let scored = 0;
    for (const r of rows) {
      const s = clampScore0to100(r.overallScore);
      if (s == null) continue;
      scored += 1;
      const bin = bins.find((b) => s >= b.min && s <= b.max);
      if (bin) bin.count += 1;
    }
    const maxBar = Math.max(...bins.map((b) => b.count), 1);
    const noScore = rows.length - scored;
    return { bins, scored, noScore, maxBar };
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
    setPreviewUrl(null);
    setPreviewError('');
    setPreviewLoading(false);
    revokeResumeBlob();
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

  const openAnalyzeModal = (row) => {
    if (!row.resumeAttached || !hasToken()) return;
    setAnalyzeModalRow(row);
    setAnalyzeJd('');
    setError('');
  };

  const closeAnalyzeModal = () => {
    setAnalyzeModalRow(null);
    setAnalyzeJd('');
  };

  const confirmAnalyze = async () => {
    const row = analyzeModalRow;
    if (!row || !hasToken()) return;
    setAnalyzeBusyId(row.applicantId);
    setError('');
    try {
      const body = buildAnalyzeBody(analyzeJd);
      const result = await postAnalyzeApplicantResume(row.applicantId, {
        body,
      });
      setRows((prev) =>
        prev.map((r) =>
          r.applicantId === row.applicantId ? mergeAnalyzeIntoRow(r, result) : r,
        ),
      );
      closeAnalyzeModal();
      if (selectedId === row.applicantId) {
        await openDetail(row.applicantId);
      }
    } catch (e) {
      setError(e.message || '분석 요청 실패');
    } finally {
      setAnalyzeBusyId(null);
    }
  };

  useEffect(() => {
    if (!selectedId || !detail?.storageKey) {
      revokeResumeBlob();
      setPreviewUrl(null);
      setPreviewError('');
      setPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError('');
    revokeResumeBlob();
    setPreviewUrl(null);
    fetchResumePdfBlob(selectedId)
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        if (!blob || blob.size === 0) {
          setPreviewError('PDF 데이터가 비어 있습니다.');
          URL.revokeObjectURL(u);
          return;
        }
        resumeBlobUrlRef.current = u;
        setPreviewUrl(u);
      })
      .catch((e) => {
        if (!cancelled) {
          setPreviewError(e.message || 'PDF를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, detail?.storageKey, revokeResumeBlob]);

  const reloadResumePdf = async () => {
    if (!selectedId || !detail?.storageKey) return;
    setPreviewLoading(true);
    setPreviewError('');
    revokeResumeBlob();
    setPreviewUrl(null);
    try {
      const blob = await fetchResumePdfBlob(selectedId);
      if (!blob || blob.size === 0) {
        setPreviewError('PDF 데이터가 비어 있습니다.');
        return;
      }
      const u = URL.createObjectURL(blob);
      resumeBlobUrlRef.current = u;
      setPreviewUrl(u);
    } catch (e) {
      setPreviewError(e.message || 'PDF를 불러오지 못했습니다.');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => () => revokeResumeBlob(), [revokeResumeBlob]);

  const selectedRow = rows.find((r) => r.applicantId === selectedId);

  if (!hasToken() && !loading) {
    return (
      <section className="dashboard-page resume-ai">
        <header className="dashboard-page__header">
          <div className="dashboard-page__hero">
            <h1>AI 채용</h1>
            <p>지원자 현황과 이력서 분석 결과를 확인합니다.</p>
          </div>
        </header>
        <article className="resume-ai__login-hint">
          <p>AI 채용 대시보드는 로그인한 회원만 볼 수 있습니다.</p>
          <span className="resume-ai__login-sub">
            로그인 후 이 페이지에서 지원자 요약·목록·분석을 이용할 수 있습니다.
          </span>
          <Link className="resume-ai__login-link" to="/login">
            로그인하기
          </Link>
        </article>
      </section>
    );
  }

  return (
    <section className="dashboard-page resume-ai">
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

      <nav className="resume-ai__tab-bar" aria-label="AI 채용 구역">
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

      {error ? <p className="resume-ai__alert resume-ai__alert--error">{error}</p> : null}

      {tab === 'summary' && (
        <div className="resume-ai__summary-layout">
          {loading ? (
            <p className="resume-ai__hint">불러오는 중…</p>
          ) : (
            <>
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

              <section
                className="resume-ai__score-chart"
                aria-labelledby="resume-ai-score-dist-title"
              >
                <h2 id="resume-ai-score-dist-title" className="resume-ai__score-chart-title">
                  지원자 점수 분포
                </h2>
                <p className="resume-ai__score-chart-sub">
                  종합 점수가 있는 지원자만 구간별로 집계합니다.
                </p>
                {scoreDistribution.scored === 0 ? (
                  <p className="resume-ai__muted">
                    아직 집계할 점수 데이터가 없습니다. 지원자 목록에서 분석을 실행해 보세요.
                  </p>
                ) : (
                  <div className="resume-ai__score-chart-bars">
                    {scoreDistribution.bins.map((bin) => (
                      <div key={bin.label} className="resume-ai__dist-row">
                        <span className="resume-ai__dist-label">{bin.label}</span>
                        <div className="resume-ai__dist-track">
                          <div
                            className="resume-ai__dist-fill"
                            style={{
                              width: `${(bin.count / scoreDistribution.maxBar) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="resume-ai__dist-count">{bin.count}명</span>
                      </div>
                    ))}
                  </div>
                )}
                {scoreDistribution.noScore > 0 ? (
                  <p className="resume-ai__score-chart-foot">
                    점수 없음(미분석·실패 등): {scoreDistribution.noScore}명
                  </p>
                ) : null}
              </section>
            </>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="resume-ai__grid">
          <article className="panel resume-ai__list-panel">
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
              <p className="resume-ai__hint">불러오는 중…</p>
            ) : (
              <>
                <div className="resume-ai__table-wrap">
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
                              className={sel ? 'resume-ai__row is-selected' : 'resume-ai__row'}
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
                              <td>
                                {row.resumeAttached ? (
                                  <span className="resume-ai__badge resume-ai__badge--ok">
                                    제출됨
                                  </span>
                                ) : (
                                  <span className="resume-ai__badge resume-ai__badge--no">
                                    없음
                                  </span>
                                )}
                              </td>
                              <td className="muted-cell">
                                {row.analysisStatus || '—'}
                              </td>
                              <td>
                                {row.overallScore != null ? (
                                  <span className="score-badge">
                                    {row.overallScore}점
                                  </span>
                                ) : (
                                  <span className="muted-cell">—</span>
                                )}
                              </td>
                              <td className="muted-cell">
                                {formatDt(row.analyzedAt)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="resume-ai__btn-accent"
                                  disabled={!row.resumeAttached || busy}
                                  onClick={() => openAnalyzeModal(row)}
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

          <article className="panel resume-ai__detail-panel">
            <div className="panel__head">
              <h2>이력서 · 분석</h2>
            </div>
            {!selectedId ? (
              <p className="resume-ai__placeholder">
                목록에서 지원자 이름을 눌러 상세·PDF 미리보기를 확인하세요.
              </p>
            ) : detailLoading ? (
              <p className="resume-ai__hint">상세 불러오는 중…</p>
            ) : detailError ? (
              <p className="resume-ai__alert resume-ai__alert--error">{detailError}</p>
            ) : detail ? (
              <div className="resume-ai__detail-stack">
                <header className="resume-ai__identity">
                  <h3 className="resume-ai__identity-name">{detail.name || '—'}</h3>
                  <p className="resume-ai__identity-meta">
                    {detail.email || '—'} · {detail.phone || '—'}
                  </p>
                </header>

                <dl className="resume-ai__meta-grid">
                  <div className="resume-ai__meta-row">
                    <dt>제출일</dt>
                    <dd>{formatDt(detail.submittedAt)}</dd>
                  </div>
                  <div className="resume-ai__meta-row">
                    <dt>파일명</dt>
                    <dd>{detail.originalFileName || '—'}</dd>
                  </div>
                  <div className="resume-ai__meta-row resume-ai__meta-row--full">
                    <dt>저장소 키</dt>
                    <dd>
                      <code className="resume-ai__mono">{detail.storageKey || '—'}</code>
                    </dd>
                  </div>
                </dl>

                <section className="resume-ai__section" aria-labelledby="resume-pdf-title">
                  <h4 id="resume-pdf-title" className="resume-ai__section-title">
                    이력서 PDF
                  </h4>
                  {!detail.storageKey ? (
                    <p className="resume-ai__muted">업로드된 이력서가 없습니다.</p>
                  ) : (
                    <>
                      <div className="resume-ai__pdf-toolbar">
                        <span className="resume-ai__pdf-ttl">
                          로그인 토큰으로 서버에서 PDF를 받아 표시합니다.
                        </span>
                        <div className="resume-ai__pdf-actions">
                          <button
                            type="button"
                            className="resume-ai__icon-btn"
                            onClick={() => reloadResumePdf()}
                            disabled={previewLoading}
                            title="PDF 다시 받기"
                          >
                            <RefreshCw
                              size={16}
                              strokeWidth={2}
                              className={
                                previewLoading ? 'resume-ai__spin' : undefined
                              }
                            />
                            다시 불러오기
                          </button>
                          {previewUrl ? (
                            <button
                              type="button"
                              className="resume-ai__icon-btn resume-ai__icon-btn--link"
                              onClick={() =>
                                window.open(
                                  previewUrl,
                                  '_blank',
                                  'noopener,noreferrer',
                                )
                              }
                            >
                              <ExternalLink size={16} strokeWidth={2} />
                              새 탭
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {previewError ? (
                        <p className="resume-ai__alert resume-ai__alert--error">
                          {previewError}
                        </p>
                      ) : null}
                      {previewLoading && !previewUrl ? (
                        <p className="resume-ai__hint">PDF 불러오는 중…</p>
                      ) : null}
                      {previewUrl ? (
                        <div className="resume-ai__pdf-frame-wrap">
                          <iframe
                            title={`${detail.name || '지원자'} 이력서 PDF`}
                            className="resume-ai__pdf-frame"
                            src={previewUrl}
                          />
                        </div>
                      ) : null}
                      {!previewLoading && !previewUrl && !previewError ? (
                        <p className="resume-ai__muted">PDF를 불러올 수 없습니다.</p>
                      ) : null}
                    </>
                  )}
                </section>

                {detail.analysis ? (
                  <section className="resume-ai__section" aria-labelledby="resume-ai-title">
                    <h4 id="resume-ai-title" className="resume-ai__section-title">
                      AI 분석
                    </h4>
                    <div className="resume-ai__analysis-chips">
                      <span className="resume-ai__chip">{detail.analysis.status}</span>
                      {detail.analysis.model ? (
                        <span className="resume-ai__chip resume-ai__chip--muted">
                          {detail.analysis.model}
                        </span>
                      ) : null}
                    </div>
                    {(() => {
                      const sc = clampScore0to100(detail.analysis.overallScore);
                      return sc != null ? (
                        <div className="resume-ai__score-block">
                          <div className="resume-ai__score-head">
                            <span>종합 점수</span>
                            <strong>{sc}점</strong>
                          </div>
                          <div
                            className="resume-ai__score-track"
                            role="progressbar"
                            aria-valuenow={sc}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="resume-ai__score-fill"
                              style={{ width: `${sc}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="resume-ai__muted">점수 없음</p>
                      );
                    })()}
                    <p className="resume-ai__section-sub">요약</p>
                    <div className="resume-ai__summary-box">
                      {detail.analysis.summary || '—'}
                    </div>
                    {detail.analysis.failureMessage ? (
                      <p className="resume-ai__alert resume-ai__alert--error">
                        {detail.analysis.failureMessage}
                      </p>
                    ) : null}
                    <p className="resume-ai__analysis-foot">
                      분석일시: {formatDt(detail.analysis.analyzedAt)}
                    </p>
                    <details className="resume-ai__json-details">
                      <summary>원본 JSON</summary>
                      <pre className="resume-ai__detail-pre resume-ai__detail-pre--json">
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
                    </details>
                  </section>
                ) : (
                  <section className="resume-ai__section">
                    <p className="resume-ai__muted">
                      아직 분석 결과가 없습니다. 목록에서「분석」을 실행하세요.
                    </p>
                  </section>
                )}
                {selectedRow?.summaryPreview && !detail.analysis?.summary ? (
                  <p className="resume-ai__list-preview">
                    목록 요약: {selectedRow.summaryPreview}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        </div>
      )}

      {analyzeModalRow ? (
        <div
          className="resume-ai__modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAnalyzeModal();
          }}
        >
          <div
            className="resume-ai__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-ai-analyze-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="resume-ai-analyze-title">이력서 분석</h3>
            <p className="resume-ai__modal-sub">
              <strong>{analyzeModalRow.name || '지원자'}</strong>
              {analyzeModalRow.email
                ? ` · ${analyzeModalRow.email}`
                : ''}
            </p>
            <label htmlFor="resume-ai-jd">직무 공고 (Job Description)</label>
            <textarea
              id="resume-ai-jd"
              value={analyzeJd}
              onChange={(e) => setAnalyzeJd(e.target.value)}
              placeholder="예: Java, Spring Boot, REST API, AWS 운영 경험 우대…"
              disabled={analyzeBusyId === analyzeModalRow.applicantId}
            />
            <p className="resume-ai__modal-hint">
              비워 두면 직무 기준 없이 분석합니다. 입력 후「분석 실행」을 누르면
              서버로 요청이 전송됩니다.
            </p>
            <div className="resume-ai__modal-actions">
              <button
                type="button"
                className="resume-ai__btn-ghost"
                onClick={closeAnalyzeModal}
                disabled={analyzeBusyId === analyzeModalRow.applicantId}
              >
                취소
              </button>
              <button
                type="button"
                className="resume-ai__btn-accent"
                onClick={confirmAnalyze}
                disabled={analyzeBusyId === analyzeModalRow.applicantId}
              >
                {analyzeBusyId === analyzeModalRow.applicantId
                  ? '분석 중…'
                  : '분석 실행'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
