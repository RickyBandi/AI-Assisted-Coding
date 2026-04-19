import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTheme } from '../hooks/useTheme';

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL REVEAL WRAPPER
───────────────────────────────────────────────────────────────────────────── */
function Reveal({ children, className = '', delay = '', tag: Tag = 'div', style }) {
  const [ref, visible] = useScrollReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' visible' : ''} ${delay} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION WRAPPER — consistent padding + max-width
───────────────────────────────────────────────────────────────────────────── */
function Section({ children, id, className = '', style }) {
  return (
    <section id={id} className={`lp-section ${className}`} style={style}>
      <div className="lp-container">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⚡', title: 'Spreadsheet Tracking', color: 'var(--accent-light)',
    desc: 'Inline editing with custom columns, color-coded status badges, and per-row auto-save. Works exactly like a spreadsheet — but smarter.',
  },
  {
    icon: '📊', title: 'Deep Analytics', color: 'var(--green)',
    desc: '12-month application trends, interview funnel conversion rates, top companies breakdown, and response rate metrics.',
  },
  {
    icon: '📁', title: 'Document Vault', color: 'var(--blue)',
    desc: 'Upload resumes, cover letters, and certificates. Preview directly in the browser, download anytime, organized by type.',
  },
  {
    icon: '🏢', title: 'Company Tracker', color: 'var(--yellow)',
    desc: 'Track every company you care about — recruiter contacts, LinkedIn profiles, status, priority, and application counts.',
  },
  {
    icon: '🎨', title: 'Custom Columns', color: 'var(--pink)',
    desc: 'Add any column type — text, number, date, or dropdown. Drag to reorder, resize, rename, or delete. Your workspace, your rules.',
  },
  {
    icon: '🔒', title: 'Secure & Private', color: 'var(--orange)',
    desc: 'Session-based authentication. Your data is isolated per account. No data sharing, no ads — ever.',
  },
];

const STEPS = [
  {
    n: '01', title: 'Add your applications',
    desc: 'Paste in a job posting or type directly. Every application gets its own row in your personalized spreadsheet.',
    icon: '📋',
  },
  {
    n: '02', title: 'Track your progress',
    desc: 'Update status as you move through rounds. Set follow-up dates, log salary details, and add personal notes.',
    icon: '🔄',
  },
  {
    n: '03', title: 'Analyze & improve',
    desc: "See exactly where you're succeeding and where to focus. Response rates, interview conversion, and monthly trends.",
    icon: '📈',
  },
];

const AVATARS = [
  { l: 'A', g: '240,60%,65%,280,50%,55%' },
  { l: 'B', g: '190,55%,60%,230,45%,50%' },
  { l: 'C', g: '300,60%,65%,330,50%,55%' },
  { l: 'D', g: '150,55%,60%,180,45%,50%' },
  { l: 'E', g: '20,60%,65%,50,50%,55%'   },
];

const STATS = [
  { value: '500+', label: 'Applications tracked daily' },
  { value: '3×',   label: 'Faster job search process'  },
  { value: '94%',  label: 'User satisfaction rate'     },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK SPREADSHEET PREVIEW
───────────────────────────────────────────────────────────────────────────── */
const MOCK_ROWS = [
  { company: 'Stripe',    role: 'Senior Engineer',    status: 'Interview', color: 'yellow', date: 'Mar 14', salary: '$180k' },
  { company: 'Vercel',    role: 'Frontend Engineer',  status: 'Applied',   color: 'purple', date: 'Mar 12', salary: '$150k' },
  { company: 'Linear',    role: 'Product Designer',   status: 'Offer',     color: 'green',  date: 'Mar 10', salary: '$160k' },
  { company: 'Notion',    role: 'Full-Stack Engineer', status: 'Applied',   color: 'purple', date: 'Mar 8',  salary: '$155k' },
  { company: 'Figma',     role: 'Staff Engineer',     status: 'Wishlist',  color: 'blue',   date: 'Mar 5',  salary: '—'     },
];

function MockSpreadsheet() {
  return (
    <div className="mock-sheet">
      {/* macOS window chrome */}
      <div className="mock-sheet-bar">
        <div className="mock-sheet-dot" style={{ background: '#ff5f57' }} />
        <div className="mock-sheet-dot" style={{ background: '#ffbd2e' }} />
        <div className="mock-sheet-dot" style={{ background: '#28c940' }} />
        <span className="mock-sheet-title">Applications — JobSpace</span>
      </div>

      {/* Controls bar */}
      <div className="mock-sheet-controls">
        <div className="mock-sheet-search">🔍 Search company or role…</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['All', 'Applied', 'Interview', 'Offer'].map(t => (
            <span key={t} className={`mock-tab${t === 'All' ? ' mock-tab-active' : ''}`}>{t}</span>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-4)', fontWeight: 500 }}>
          5 rows · Auto-saved
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="mock-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ROWS.map((r, i) => (
              <tr key={r.company} style={{ animationDelay: `${i * 0.06}s` }}>
                <td className="mock-row-num">{i + 1}</td>
                <td className="mock-company">{r.company}</td>
                <td className="mock-role">{r.role}</td>
                <td>
                  <span className={`mock-badge mock-badge-${r.color}`}>{r.status}</span>
                </td>
                <td className="mock-date">{r.date}</td>
                <td className="mock-salary" style={{ color: r.salary !== '—' ? 'var(--text-2)' : 'var(--text-4)' }}>{r.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mock-add-row">＋ Add application</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK ANALYTICS PREVIEW
───────────────────────────────────────────────────────────────────────────── */
function MockAnalytics() {
  const bars = [2, 5, 3, 8, 6, 11, 9, 14, 10, 7, 12, 16];
  const maxBar = Math.max(...bars);
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  return (
    <div className="mock-analytics">
      <div className="mock-analytics-header">
        <div>
          <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 2 }}>
            Applications — 12 months
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>103 total applications</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['6M', '12M', 'All'].map((t, i) => (
            <span key={t} style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-xs)',
              background: i === 1 ? 'var(--accent-dim)' : 'var(--bg-3)',
              color: i === 1 ? 'var(--accent-light)' : 'var(--text-3)',
              border: `1px solid ${i === 1 ? 'rgba(124,111,255,0.25)' : 'var(--border)'}`,
              cursor: 'default', fontWeight: i === 1 ? 600 : 400,
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="mock-bar-chart">
        {bars.map((h, i) => (
          <div key={i} className="mock-bar-wrap" title={`${months[i]}: ${h} apps`}>
            <div
              className="mock-bar"
              style={{ height: `${(h / maxBar) * 100}%`, animationDelay: `${i * 0.04}s` }}
            />
          </div>
        ))}
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, paddingLeft: 2 }}>
        {months.filter((_, i) => i % 3 === 0).map(m => (
          <div key={m} style={{ flex: '0 0 25%', fontSize: 10, color: 'var(--text-4)', textAlign: 'center' }}>{m}</div>
        ))}
      </div>

      <div className="mock-analytics-kpis">
        {[
          { label: 'Response Rate', value: '34%',  color: 'var(--green)'        },
          { label: 'Interviews',    value: '12',   color: 'var(--yellow)'       },
          { label: 'Offers',        value: '3',    color: 'var(--accent-light)' },
        ].map(k => (
          <div key={k.label} className="mock-kpi">
            <div style={{ fontSize: '1.4rem', fontWeight: 780, color: k.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DASHBOARD PREVIEW (new)
───────────────────────────────────────────────────────────────────────────── */
function MockDashboard() {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text)' }}>Dashboard</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Good morning, Alex 👋</div>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)' }}>
        {[
          { icon: '📋', v: '47', l: 'Applications', c: 'var(--accent-light)' },
          { icon: '🏢', v: '12', l: 'Companies',    c: 'var(--blue)'         },
          { icon: '🎯', v: '8',  l: 'Interviews',   c: 'var(--yellow)'       },
          { icon: '🏆', v: '2',  l: 'Offers',       c: 'var(--green)'        },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--bg-2)', padding: '16px 14px' }}>
            <div style={{ fontSize: '1rem', marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 780, color: s.c, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Activity */}
      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Recent activity</div>
        {[
          { company: 'Stripe',  role: 'Senior Engineer', status: 'Interview', color: '#f5c542' },
          { company: 'Vercel',  role: 'Frontend Eng',    status: 'Applied',   color: '#a78bfa' },
          { company: 'Linear',  role: 'Product Designer',status: 'Offer',     color: '#3ecf8e' },
        ].map(a => (
          <div key={a.company} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500 }}>{a.role}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{a.company}</div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 650, padding: '2px 8px', borderRadius: 100,
              color: a.color, background: `color-mix(in srgb, ${a.color} 12%, transparent)`,
            }}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`lp-nav${scrolled ? ' lp-nav-scrolled' : ''}`}>
      <div className="lp-nav-inner">
        <div className="lp-nav-logo">
          <div className="logo-mark">J</div>
          <span className="logo-text">JobSpace</span>
        </div>

        <div className="lp-nav-links">
          <a href="#features"      className="lp-nav-link">Features</a>
          <a href="#how-it-works"  className="lp-nav-link">How it works</a>
          <a href="#analytics"     className="lp-nav-link">Analytics</a>
        </div>

        <div className="lp-nav-actions">
          <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started free</Link>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              transition: 'var(--transition)',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!glowRef.current) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 28;
      glowRef.current.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="lp-root">
      <LandingNav />

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div ref={glowRef} className="lp-hero-glow lp-hero-glow-1" />
        <div className="lp-hero-glow lp-hero-glow-2" />
        <div className="lp-hero-glow lp-hero-glow-3" />

        <div className="lp-hero-inner">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Your Job Search OS
          </div>

          <h1 className="lp-hero-heading">
            Track every application.<br />
            Land your{' '}
            <span className="lp-gradient-text gradient-text-animate">dream job</span>.
          </h1>

          <p className="lp-hero-sub">
            JobSpace is the modern workspace for serious job seekers —
            spreadsheet-style tracking, rich analytics, and a document vault,
            all in one beautifully crafted tool.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn-primary btn-press">
              Start for free <span className="lp-btn-arrow">→</span>
            </Link>
            <Link to="/login" className="lp-btn-secondary btn-press">Sign in</Link>
          </div>

          {/* Social proof */}
          <div className="lp-social-proof">
            <div className="lp-avatars">
              {AVATARS.map((a) => {
                const parts = a.g.split(',');
                const from  = `hsl(${parts[0]},${parts[1]},${parts[2]})`;
                const to    = `hsl(${parts[3]},${parts[4]},${parts[5]})`;
                return (
                  <div key={a.l} className="lp-avatar"
                    style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
                    {a.l}
                  </div>
                );
              })}
            </div>
            <span className="lp-social-text">
              Join <strong>hundreds</strong> of job seekers organizing their search
            </span>
          </div>
        </div>

        {/* Hero product preview — full mock spreadsheet */}
        <Reveal className="lp-hero-preview reveal-scale">
          <MockSpreadsheet />
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. STATS BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="lp-stats-bar">
        <div className="lp-container">
          <div className="lp-stats-inner">
            {STATS.map((s, i) => (
              <Reveal key={s.label} className="lp-stat-item" delay={`reveal-d${i + 1}`}>
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. FEATURES GRID
      ══════════════════════════════════════════════════════════ */}
      <Section id="features" className="lp-section-alt">
        <Reveal className="lp-section-header">
          <div className="lp-section-eyebrow">Everything you need</div>
          <h2 className="lp-section-heading">A complete system for your job search</h2>
          <p className="lp-section-sub">
            From the first application to the final offer, JobSpace keeps
            you organized, informed, and in control.
          </p>
        </Reveal>

        <div className="lp-features-grid stagger-children">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} className="lp-feature-card hover-lift" delay={`reveal-d${(i % 3) + 1}`}>
              <div
                className="lp-feature-icon"
                style={{
                  background: `color-mix(in srgb, ${f.color} 10%, transparent)`,
                  border:     `1px solid color-mix(in srgb, ${f.color} 18%, transparent)`,
                }}
              >
                {f.icon}
              </div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p  className="lp-feature-desc">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          4. DASHBOARD PREVIEW (new)
      ══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="lp-split lp-split-reverse">
          <Reveal className="lp-split-text reveal-right">
            <div className="lp-section-eyebrow">Command center</div>
            <h2 className="lp-section-heading lp-split-heading">
              Everything at a glance
            </h2>
            <p className="lp-section-sub" style={{ textAlign: 'left', maxWidth: 440 }}>
              Your personal job-search dashboard surfaces what matters most:
              total applications, upcoming interviews, recent activity, and
              monthly progress — all in one clean view.
            </p>
            <ul className="lp-check-list">
              {[
                'Application count across all statuses',
                'Recent activity feed with status badges',
                'Monthly application bar chart',
                'Status breakdown doughnut chart',
                'Quick links to add new applications',
              ].map(item => (
                <li key={item} className="lp-check-item">
                  <span className="lp-check-icon">✓</span> {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="lp-split-visual reveal-left">
            <MockDashboard />
          </Reveal>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          5. HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <Section id="how-it-works" className="lp-section-alt">
        <Reveal className="lp-section-header">
          <div className="lp-section-eyebrow">Simple by design</div>
          <h2 className="lp-section-heading">How JobSpace works</h2>
          <p className="lp-section-sub">Three steps to a better, more organized job search.</p>
        </Reveal>

        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} className="lp-step" delay={`reveal-d${i + 1}`}>
              <div className="lp-step-number">{s.n}</div>
              <div className="lp-step-content">
                <h3 className="lp-step-title">{s.title}</h3>
                <p  className="lp-step-desc">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="lp-step-connector" />}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          6. ANALYTICS PREVIEW
      ══════════════════════════════════════════════════════════ */}
      <Section id="analytics">
        <div className="lp-split lp-split-reverse">
          <Reveal className="lp-split-text reveal-left">
            <div className="lp-section-eyebrow">Data-driven decisions</div>
            <h2 className="lp-section-heading lp-split-heading">
              Understand your search like never before
            </h2>
            <p className="lp-section-sub" style={{ textAlign: 'left', maxWidth: 480 }}>
              JobSpace turns your application history into actionable insights.
              See which companies respond, how your interview conversion rate
              compares, and where to focus your energy.
            </p>
            <ul className="lp-check-list">
              {[
                '12-month application trend chart',
                'Status funnel breakdown (Wishlist → Offer)',
                'Interview-to-offer conversion rate',
                'Top companies by application count',
                'Document upload activity tracking',
              ].map(item => (
                <li key={item} className="lp-check-item">
                  <span className="lp-check-icon">✓</span> {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="lp-split-visual reveal-right">
            <MockAnalytics />
          </Reveal>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          7. SPREADSHEET DETAIL
      ══════════════════════════════════════════════════════════ */}
      <Section className="lp-section-alt">
        <div className="lp-split">
          <Reveal className="lp-split-visual reveal-left">
            <div className="lp-sheet-detail">
              <div className="lp-sheet-detail-badge">Auto-save</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Dynamic columns',  desc: 'Add any column type'    },
                  { label: 'Dropdown options', desc: 'Custom colors & labels' },
                  { label: 'Date picker',      desc: 'Calendar-based input'   },
                  { label: 'CSV export',       desc: 'Download your data'     },
                  { label: 'Row search',       desc: 'Filter by company/role' },
                  { label: 'Drag to reorder',  desc: 'Rearrange columns'      },
                ].map((item, i) => (
                  <div key={item.label} className="lp-sheet-feature-row" style={{ animationDelay: `${i * 0.07}s` }}>
                    <span className="lp-check-icon">✓</span>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginLeft: 8 }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="lp-split-text reveal-right">
            <div className="lp-section-eyebrow">Spreadsheet-first</div>
            <h2 className="lp-section-heading lp-split-heading">
              The spreadsheet built for job hunters
            </h2>
            <p className="lp-section-sub" style={{ textAlign: 'left', maxWidth: 460 }}>
              Familiar spreadsheet interface with everything a job seeker actually
              needs. Custom columns, smart dropdowns, date pickers — all saving
              automatically as you type.
            </p>
            <Link to="/register" className="lp-btn-primary btn-press" style={{ display: 'inline-flex', marginTop: 8 }}>
              Try it free →
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          8. DOCUMENT VAULT
      ══════════════════════════════════════════════════════════ */}
      <Section>
        <Reveal className="lp-section-header">
          <div className="lp-section-eyebrow">Organized documents</div>
          <h2 className="lp-section-heading">All your documents in one place</h2>
          <p className="lp-section-sub">
            Upload once, use everywhere. Preview resumes, download cover letters,
            and keep every certificate organized by type.
          </p>
        </Reveal>

        <div className="lp-doc-preview">
          {[
            { icon: '📝', name: 'Software_Engineer_Resume.pdf',  type: 'Resume',       size: '142 KB', color: 'var(--accent)'  },
            { icon: '✉️', name: 'Cover_Letter_Stripe.docx',      type: 'Cover Letter', size: '38 KB',  color: 'var(--blue)'    },
            { icon: '🏆', name: 'AWS_Solutions_Architect.pdf',   type: 'Certificate',  size: '220 KB', color: 'var(--yellow)'  },
            { icon: '📄', name: 'Portfolio_2024.pdf',            type: 'Portfolio',    size: '1.2 MB', color: 'var(--green)'   },
          ].map((doc, i) => (
            <Reveal key={doc.name} className="lp-doc-card hover-lift" delay={`reveal-d${i + 1}`}>
              <div className="lp-doc-icon" style={{ background: `color-mix(in srgb, ${doc.color} 10%, transparent)` }}>
                {doc.icon}
              </div>
              <div className="lp-doc-info">
                <div className="lp-doc-name">{doc.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 650, color: doc.color }}>{doc.type}</span>
                  <span style={{ color: 'var(--text-4)', fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{doc.size}</span>
                </div>
              </div>
              <div className="lp-doc-actions">
                <span className="lp-doc-btn">Preview</span>
                <span className="lp-doc-btn">↓</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          9. CTA
      ══════════════════════════════════════════════════════════ */}
      <Section className="lp-cta-section">
        <Reveal className="lp-cta-inner">
          <div className="lp-cta-glow" />
          <div className="lp-section-eyebrow lp-cta-eyebrow">Ready to start?</div>
          <h2 className="lp-cta-heading">
            Your next job starts with<br />better organization.
          </h2>
          <p className="lp-cta-sub">
            Join hundreds of job seekers who use JobSpace to stay
            organized, track progress, and land more interviews.
          </p>
          <div className="lp-cta-actions">
            <Link to="/register" className="lp-btn-primary btn-press lp-btn-lg">
              Create free account <span className="lp-btn-arrow">→</span>
            </Link>
            <span className="lp-cta-fine">No credit card required · Free forever</span>
          </div>
        </Reveal>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          10. FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <div className="logo-mark" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>J</div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>JobSpace</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 240 }}>
                The modern workspace for your job search. Organized, analytical, private.
              </p>
            </div>
            <div className="lp-footer-links">
              <div className="lp-footer-col">
                <div className="lp-footer-col-label">Product</div>
                <a href="#features">Features</a>
                <a href="#how-it-works">How it works</a>
                <a href="#analytics">Analytics</a>
              </div>
              <div className="lp-footer-col">
                <div className="lp-footer-col-label">Account</div>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Get started</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} JobSpace. Built for job seekers.</span>
            <span style={{ color: 'var(--text-4)' }}>Made with care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
