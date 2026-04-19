import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement);

const STATUS_COLORS = { Wishlist:'#5ba4e5', Applied:'#a78bfa', Interview:'#f5c542', Offer:'#3ecf8e', Rejected:'#f16c75' };

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1a20', titleColor: '#ececf1', bodyColor: '#8f8fa8',
  padding: 12, cornerRadius: 10, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
  displayColors: false, titleFont: { size: 12, weight: '600' }, bodyFont: { size: 11 },
};

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" style={{ color }}>{icon}</span>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user }         = useAuth();
  const [data, setData]  = useState(null);
  const [loading, setL]  = useState(true);

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data)).catch(console.error).finally(() => setL(false));
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width:240, height:24, marginBottom:7 }} />
          <div className="skeleton" style={{ width:160, height:14 }} />
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid">{[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:105 }} />)}</div>
        <div className="grid-2-1" style={{ marginBottom:16 }}>
          <div className="skeleton" style={{ height:280 }} />
          <div className="skeleton" style={{ height:280 }} />
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height:240 }} />
          <div className="skeleton" style={{ height:240 }} />
        </div>
      </div>
    </div>
  );

  const { stats, recentApps = [], recentDocs = [], chartData } = data || {};

  const barData = {
    labels: chartData?.months || [],
    datasets: [{ label:'Applications', data: chartData?.monthlyCounts || [],
      backgroundColor: 'rgba(124,111,255,0.65)', hoverBackgroundColor: 'rgba(124,111,255,0.85)',
      borderRadius: 6, borderSkipped: false }],
  };
  const donutData = {
    labels: chartData?.statusLabels || [],
    datasets: [{ data: chartData?.statusCounts || [],
      backgroundColor: (chartData?.statusLabels||[]).map(l => STATUS_COLORS[l]||'#555'),
      borderWidth: 0, borderRadius: 5, spacing: 3 }],
  };

  const axisStyle = { grid:{ color:'rgba(255,255,255,0.035)' }, ticks:{ color:'var(--text-3)', font:{ size:11 } }, border:{ display:false } };
  const barOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false }, tooltip: TOOLTIP_STYLE },
    scales:{ x:{ ...axisStyle, grid:{ display:false } }, y: axisStyle },
  };
  const donutOpts = {
    responsive:true, maintainAspectRatio:false, cutout:'73%',
    plugins:{ legend:{ position:'right', labels:{ color:'var(--text-3)', boxWidth:9, padding:14, font:{ size:11 } } }, tooltip: TOOLTIP_STYLE },
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your job search overview</p>
        </div>
        <Link to="/applications" className="btn btn-primary btn-sm">+ Add application</Link>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <StatCard icon="📋" value={stats?.totalApps||0}      label="Total Applications" color="var(--accent-light)" />
          <StatCard icon="🏢" value={stats?.totalCompanies||0}  label="Companies Tracked"  color="var(--blue)" />
          <StatCard icon="🎯" value={stats?.interviews||0}      label="Interviews"          color="var(--yellow)" />
          <StatCard icon="📄" value={stats?.totalDocs||0}       label="Documents"           color="var(--green)" />
        </div>

        <div className="grid-2-1" style={{ marginBottom:16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Applications per Month</span>
              <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>Last 6 months</span>
            </div>
            <div className="card-body">
              <div style={{ height:220 }}><Bar data={barData} options={barOpts} /></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">By Status</span></div>
            <div className="card-body">
              <div style={{ height:220 }}><Doughnut data={donutData} options={donutOpts} /></div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Applications</span>
              <Link to="/applications" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <div className="empty-title">No applications yet</div>
                <div className="empty-desc">Start tracking your first job application.</div>
                <Link to="/applications" className="btn btn-primary btn-sm">Add Application</Link>
              </div>
            ) : recentApps.map(app => (
              <div key={app._id} className="activity-item">
                <div className="activity-dot" style={{ background: STATUS_COLORS[app.status]||'var(--accent)' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="activity-text">{app.jobTitle} <span style={{ color:'var(--text-3)', fontWeight:400 }}>at</span> {app.company}</div>
                  <div className="activity-sub">{app.status} · {new Date(app.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Documents</span>
              <Link to="/documents" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {recentDocs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <div className="empty-title">No documents yet</div>
                <div className="empty-desc">Upload your resume and cover letters.</div>
                <Link to="/documents" className="btn btn-primary btn-sm">Upload</Link>
              </div>
            ) : recentDocs.map(doc => (
              <div key={doc._id} className="activity-item">
                <div className="activity-dot" style={{ background:'var(--blue)' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="activity-text">{doc.name}</div>
                  <div className="activity-sub">{doc.type} · {new Date(doc.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
