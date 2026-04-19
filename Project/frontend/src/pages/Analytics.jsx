import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler);

const STATUS_COLORS = ['#5ba4e5','#a78bfa','#f5c542','#3ecf8e','#f16c75'];

const TOOLTIP = {
  backgroundColor: '#1a1a20',
  titleColor: '#ececf1',
  bodyColor: '#8f8fa8',
  padding: 12,
  cornerRadius: 10,
  borderColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  displayColors: false,
  titleFont: { size: 12, weight: '600' },
  bodyFont: { size: 11 },
};

const AXIS = {
  grid: { color: 'rgba(255,255,255,0.035)', drawTicks: false },
  ticks: { color: '#5a5a72', font: { size: 11 }, padding: 6 },
  border: { display: false },
};

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: TOOLTIP },
  scales: { x: { ...AXIS, grid: { display: false } }, y: AXIS },
};

function KpiCard({ icon, value, label, trend, trendDir }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div style={{
          marginTop: 8, fontSize: '0.72rem', fontWeight: 600,
          color: trendDir === 'up' ? 'var(--green)' : trendDir === 'down' ? 'var(--red)' : 'var(--text-3)',
        }}>
          {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '–'} {trend}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [data, setData]    = useState(null);
  const [loading, setLoad] = useState(true);
  const toast = useToast();

  useEffect(() => {
    analyticsAPI.get()
      .then(r => setData(r.data))
      .catch(() => toast('Failed to load analytics', 'error'))
      .finally(() => setLoad(false));
  }, []);

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width: 140, height: 22, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 200, height: 14 }} />
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 105 }} />)}
        </div>
        <div className="grid-2-1" style={{ marginBottom: 16 }}>
          <div className="skeleton" style={{ height: 300 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    </div>
  );

  const { stats, chartData } = data || {};

  const trendData = {
    labels: chartData?.months || [],
    datasets: [{
      label: 'Applications',
      data: chartData?.monthlyCounts || [],
      backgroundColor: 'rgba(124,111,255,0.12)',
      borderColor: 'rgba(124,111,255,0.85)',
      borderWidth: 2, fill: true, tension: 0.45,
      pointBackgroundColor: '#7c6fff',
      pointBorderColor: '#1a1a20',
      pointBorderWidth: 2,
      pointRadius: 4, pointHoverRadius: 7,
    }],
  };

  const statusData = {
    labels: chartData?.statusLabels || [],
    datasets: [{
      data: chartData?.statusCounts || [],
      backgroundColor: STATUS_COLORS,
      borderWidth: 0, borderRadius: 5, spacing: 3,
    }],
  };

  const companyData = {
    labels: (chartData?.companyLabels || []).map(l => l.length > 14 ? l.slice(0,14)+'…' : l),
    datasets: [{
      label: 'Applications',
      data: chartData?.companyCounts || [],
      backgroundColor: 'rgba(167,139,250,0.7)',
      hoverBackgroundColor: 'rgba(167,139,250,0.9)',
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const docData = {
    labels: chartData?.months || [],
    datasets: [{
      label: 'Uploads',
      data: chartData?.docActivityCounts || [],
      backgroundColor: 'rgba(62,207,142,0.12)',
      borderColor: 'rgba(62,207,142,0.85)',
      borderWidth: 2, fill: true, tension: 0.45,
      pointBackgroundColor: '#3ecf8e',
      pointBorderColor: '#1a1a20',
      pointBorderWidth: 2,
      pointRadius: 4, pointHoverRadius: 7,
    }],
  };

  const donutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#8f8fa8', boxWidth: 9, padding: 14, font: { size: 11 } },
      },
      tooltip: TOOLTIP,
    },
  };

  const kpis = [
    { icon: '📋', value: stats?.total || 0,               label: 'Total Applications', color: 'var(--accent-light)' },
    { icon: '🎯', value: stats?.interviews || 0,           label: 'Interviews',          color: 'var(--yellow)'       },
    { icon: '🏆', value: stats?.offers || 0,               label: 'Offers',              color: 'var(--green)'        },
    { icon: '📈', value: `${stats?.responseRate || 0}%`,   label: 'Response Rate',       color: 'var(--blue)'         },
    { icon: '✅', value: `${stats?.offerRate || 0}%`,      label: 'Interview → Offer',   color: 'var(--purple)'       },
  ];

  const hasCompanyData = (chartData?.companyLabels || []).length > 0;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Your job search performance at a glance</p>
        </div>
      </div>

      <div className="page-body">
        {/* KPI row */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', marginBottom: 20 }}>
          {kpis.map(k => (
            <div key={k.label} className="stat-card">
              <span className="stat-icon" style={{ color: k.color }}>{k.icon}</span>
              <div className="stat-value">{k.value}</div>
              <div className="stat-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1 */}
        <div className="grid-2-1" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Applications — 12 months</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {stats?.total || 0} total
              </span>
            </div>
            <div className="card-body">
              <div style={{ height: 260 }}><Line data={trendData} options={BASE_OPTS} /></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Status Breakdown</span></div>
            <div className="card-body">
              <div style={{ height: 260 }}>
                {(chartData?.statusCounts || []).every(v => v === 0) ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-3)', fontSize:'0.8rem' }}>No applications yet</div>
                ) : (
                  <Doughnut data={statusData} options={donutOpts} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Companies</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>By applications</span>
            </div>
            <div className="card-body">
              {!hasCompanyData ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height: 200, color:'var(--text-3)', fontSize:'0.8rem' }}>No data yet</div>
              ) : (
                <div style={{ height: 240 }}>
                  <Bar data={companyData} options={{
                    ...BASE_OPTS,
                    indexAxis: 'y',
                    scales: {
                      x: { ...AXIS },
                      y: { ...AXIS, grid: { display: false }, ticks: { ...AXIS.ticks, font: { size: 11 } } },
                    },
                  }} />
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Document Uploads</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>12 months</span>
            </div>
            <div className="card-body">
              <div style={{ height: 240 }}><Line data={docData} options={BASE_OPTS} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
