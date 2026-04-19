import { useEffect, useState, useRef } from 'react';
import { documentsAPI, getUploadURL } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const DOC_ICON = (doc) => {
  if (doc.mimetype?.includes('pdf')) return '📕';
  if (doc.type === 'Resume')         return '📝';
  if (doc.type === 'Cover Letter')   return '✉️';
  if (doc.type === 'Certificate')    return '🏆';
  return '📄';
};

const TYPE_COLOR = {
  'Resume': 'var(--accent)', 'Cover Letter': 'var(--blue)',
  'Portfolio': 'var(--green)', 'Certificate': 'var(--yellow)', 'Other': 'var(--text-3)',
};

export default function Documents() {
  const [docs,     setDocs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading,setUploading]= useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [form, setForm] = useState({ name:'', type:'Resume' });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const toast   = useToast();

  useEffect(() => {
    documentsAPI.getAll()
      .then(r => setDocs(r.data.docs || []))
      .catch(() => toast('Failed to load documents', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!file) { toast('Please select a file', 'error'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', form.name || file.name);
      fd.append('type', form.type);
      const r = await documentsAPI.upload(fd);
      setDocs(prev => [r.data.doc, ...prev]);
      setUploadModal(false); setForm({ name:'', type:'Resume' }); setFile(null);
      toast('Document uploaded!');
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    const { id, name } = deleteModal; setDeleteModal(null);
    try {
      await documentsAPI.delete(id);
      setDocs(prev => prev.filter(d => d._id !== id));
      toast(`"${name}" deleted`);
    } catch { toast('Failed to delete', 'error'); }
  };

  const openUpload = (fileArg) => {
    if (fileArg) setFile(fileArg);
    setUploadModal(true);
  };

  if (loading) return (
    <div className="page-enter">
      <div className="page-header"><div><div className="skeleton" style={{ width:150, height:22 }} /></div></div>
      <div className="page-body">
        <div className="skeleton" style={{ height:120, marginBottom:20 }} />
        <div className="doc-grid">{[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:190 }} />)}</div>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">{docs.length} document{docs.length!==1?'s':''} stored</p>
        </div>
        <button className="btn btn-primary" onClick={() => openUpload()}>+ Upload document</button>
      </div>

      <div className="page-body">
        {/* Drop zone */}
        <div
          className={`upload-zone${dragOver?' drag-over':''}`}
          style={{ marginBottom:24 }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) openUpload(f); }}
          onClick={() => openUpload()}
        >
          <span className="upload-zone-icon">📁</span>
          <div className="upload-zone-text">Drag & drop files here, or <span style={{ color:'var(--accent-light)', fontWeight:600 }}>browse</span></div>
          <div className="upload-zone-sub">PDF, DOCX, DOC, PNG, JPG · Max 10 MB</div>
        </div>

        {docs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-icon">📄</span>
              <div className="empty-title">No documents yet</div>
              <div className="empty-desc">Upload your resumes, cover letters, and certificates to keep everything organized.</div>
              <button className="btn btn-primary" onClick={() => openUpload()}>+ Upload document</button>
            </div>
          </div>
        ) : (
          <div className="doc-grid">
            {docs.map(doc => (
              <div key={doc._id} className="doc-card">
                <button className="doc-delete-btn" title="Delete" onClick={() => setDeleteModal({ id:doc._id, name:doc.name })}>✕</button>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `color-mix(in srgb, ${TYPE_COLOR[doc.type]||'var(--accent)'} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${TYPE_COLOR[doc.type]||'var(--accent)'} 20%, transparent)`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem',
                  }}>{DOC_ICON(doc)}</div>
                  <div className="doc-content" style={{ minWidth:0 }}>
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta" style={{ marginTop:3 }}>
                      <span style={{ color: TYPE_COLOR[doc.type]||'var(--text-3)', fontWeight:600, fontSize:'0.72rem' }}>{doc.type}</span>
                      <span style={{ margin:'0 5px', opacity:.4 }}>·</span>
                      {new Date(doc.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </div>
                    {doc.size && <div className="doc-meta" style={{ marginTop:2 }}>{(doc.size/1024).toFixed(0)} KB</div>}
                  </div>
                </div>
                <div className="doc-actions">
                  <a href={getUploadURL(doc.filename)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex:1, justifyContent:'center' }}>👁 Preview</a>
                  <a href={getUploadURL(doc.filename)} download={doc.originalName||doc.name} className="btn btn-secondary btn-sm" style={{ flex:1, justifyContent:'center' }}>↓ Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => { setUploadModal(false); setFile(null); setForm({ name:'', type:'Resume' }); }}
        title="Upload document"
        footer={<>
          <button className="btn btn-secondary" onClick={() => { setUploadModal(false); setFile(null); }}>Cancel</button>
          <button className="btn btn-primary"   onClick={handleUpload} disabled={uploading||!file}>
            {uploading ? <><span className="spinner spinner-sm" /> Uploading…</> : 'Upload'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">File</label>
          <div
            className="upload-zone" style={{ padding:20 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) setFile(f); }}
          >
            <span className="upload-zone-icon" style={{ fontSize:'1.4rem' }}>📎</span>
            <div className="upload-zone-text">{file ? <span style={{ color:'var(--green)' }}>✓ {file.name}</span> : 'Click or drag to select'}</div>
            {!file && <div className="upload-zone-sub">PDF, DOCX, DOC, PNG, JPG</div>}
            <input ref={fileRef} type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Document name</label>
          <input className="form-control" placeholder="e.g. Software Engineer Resume 2024" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Type</label>
          <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type:e.target.value }))}>
            {['Resume','Cover Letter','Portfolio','Certificate','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete document" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger"    onClick={handleDelete}>Delete</button>
        </>}>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.55 }}>
          Delete <strong style={{ color:'var(--text)' }}>{deleteModal?.name}</strong>?<br />
          The file will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
