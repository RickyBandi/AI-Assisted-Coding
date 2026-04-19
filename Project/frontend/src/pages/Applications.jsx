import { useEffect, useState, useCallback } from 'react';
import { applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spreadsheet from '../components/Spreadsheet';

export default function Applications() {
  const [apps,    setApps]    = useState([]);
  const [cols,    setCols]    = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    applicationsAPI.getAll()
      .then(r => {
        const rows = (r.data.apps || []).map(app => ({
          ...app,
          _id:             String(app._id),
          _appliedDateISO: app.appliedDate ? new Date(app.appliedDate).toISOString() : '',
          appliedDate:     app.appliedDate
            ? new Date(app.appliedDate).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })
            : '',
          extraData: app.extraData || {},
        }));
        setApps(rows);
        setCols(r.data.columns || []);
      })
      .catch(() => toast('Failed to load applications', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    const r   = await applicationsAPI.create({});
    const app = r.data.application;
    return {
      ...app,
      _id:             String(app._id),
      _appliedDateISO: app.appliedDate ? new Date(app.appliedDate).toISOString() : '',
      appliedDate:     app.appliedDate
        ? new Date(app.appliedDate).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })
        : '',
      extraData: app.extraData || {},
    };
  }, []);

  const handlePatch  = useCallback((id, data) => applicationsAPI.patch(id, data),  []);
  const handleDelete = useCallback((id)        => applicationsAPI.delete(id),       []);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width:170, height:22, marginBottom:6 }} />
          <div className="skeleton" style={{ width:110, height:14 }} />
        </div>
      </div>
      <div style={{ flex:1, padding:'24px 32px' }}>
        <div className="skeleton" style={{ height:'100%', minHeight:400 }} />
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        <Spreadsheet
          page="applications"
          initialRows={apps}
          initialCols={cols}
          onPatch={handlePatch}
          onCreate={handleCreate}
          onDelete={handleDelete}
          rowIdKey="_id"
          filterTabs={true}
        />
      </div>
    </div>
  );
}
