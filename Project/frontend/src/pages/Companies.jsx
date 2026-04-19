import { useEffect, useState, useCallback } from 'react';
import { companiesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spreadsheet from '../components/Spreadsheet';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [cols,      setCols]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const toast = useToast();

  useEffect(() => {
    companiesAPI.getAll()
      .then(r => {
        const rows = (r.data.companies || []).map(c => ({
          ...c, _id: String(c._id), extraData: c.extraData || {},
        }));
        setCompanies(rows);
        setCols(r.data.columns || []);
      })
      .catch(() => toast('Failed to load companies', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    const r = await companiesAPI.create({ name: 'New Company' });
    const c = r.data.company;
    return { ...c, _id: String(c._id), extraData: c.extraData || {} };
  }, []);

  const handlePatch  = useCallback((id, data) => companiesAPI.patch(id, data),  []);
  const handleDelete = useCallback((id)        => companiesAPI.delete(id),       []);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width:150, height:22, marginBottom:6 }} />
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
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} tracked</p>
        </div>
      </div>
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        <Spreadsheet
          page="companies"
          initialRows={companies}
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
