import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { columnsAPI, getAPIBase } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';

const COLORS = ['blue','purple','yellow','green','red','orange','pink','gray'];

function getOptionColor(col, label) {
  if (!col?.options) return 'gray';
  const opt = col.options.find(o => o.label === label);
  return opt ? opt.color : 'gray';
}

function getColValue(row, colId) {
  const NAMED = ['company','jobTitle','status','appliedDate','location','salary','notes',
                 'name','priority','lastContact','recruiterName','recruiterEmail','linkedin'];
  if (NAMED.includes(colId)) return row[colId] !== undefined ? (row[colId] || '') : '';
  if (colId === '_appCount') return row._appCount ?? '';
  return (row.extraData && row.extraData[colId]) || '';
}

function setColValue(row, colId, value) {
  const NAMED = ['company','jobTitle','status','appliedDate','location','salary','notes',
                 'name','priority','lastContact','recruiterName','recruiterEmail','linkedin'];
  if (NAMED.includes(colId)) { row[colId] = value; }
  else { if (!row.extraData) row.extraData = {}; row.extraData[colId] = value; }
}

function formatDisplayDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function csvEsc(val) {
  const s = String(val || '').replace(/"/g, '""');
  return /[,"\n\r]/.test(s) ? `"${s}"` : s;
}

/* ── Calendar ─────────────────────────────────────────────────────────────── */
function CalendarPopup({ anchorRect, value, onSelect, onClose }) {
  const [year,  setYear]  = useState(() => { const d = value ? new Date(value) : new Date(); return isNaN(d) ? new Date().getFullYear() : d.getFullYear(); });
  const [month, setMonth] = useState(() => { const d = value ? new Date(value) : new Date(); return isNaN(d) ? new Date().getMonth() : d.getMonth(); });
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const style = useMemo(() => {
    if (!anchorRect) return { top: 100, left: 100 };
    let top = anchorRect.bottom + 6, left = anchorRect.left;
    if (left + 280 > window.innerWidth - 8)  left  = window.innerWidth  - 288;
    if (top  + 320 > window.innerHeight - 8) top   = anchorRect.top - 326;
    if (left < 8) left = 8;
    return { top, left };
  }, [anchorRect]);

  const today       = new Date();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selD        = value ? new Date(value) : null;
  const cells       = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const isSelected  = (d) => selD && selD.getFullYear() === year && selD.getMonth() === month && selD.getDate() === d;
  const isToday     = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const isDisabled  = (d) => new Date(year, month, d) > today;
  const monthLabel  = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1);

  return (
    <div className="cal-popup" style={{ position: 'fixed', ...style }} ref={ref}>
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{monthLabel}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-weekdays">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
      </div>
      <div className="cal-days">
        {cells.map((d, i) => (
          <button key={i}
            className={`cal-day${!d ? ' empty' : ''}${d && isSelected(d) ? ' selected' : ''}${d && isToday(d) ? ' today' : ''}${d && isDisabled(d) ? ' disabled' : ''}`}
            disabled={!d || isDisabled(d)}
            onClick={() => d && !isDisabled(d) && onSelect(new Date(year, month, d).toISOString())}
          >{d || ''}</button>
        ))}
      </div>
      <div className="cal-footer">
        <button className="cal-clear-btn" onClick={() => onSelect(null)}>Clear date</button>
      </div>
    </div>
  );
}

/* ── Dropdown popup ───────────────────────────────────────────────────────── */
function DropdownPopup({ anchorRect, col, onSelect, onManage, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const style = useMemo(() => {
    if (!anchorRect) return { top: 100, left: 100 };
    const height  = ((col.options?.length || 0) + 2) * 34 + 40;
    let top  = anchorRect.bottom + 4;
    let left = anchorRect.left;
    if (left + 210 > window.innerWidth  - 8) left = window.innerWidth  - 218;
    if (left < 8) left = 8;
    if (top  + height > window.innerHeight - 8) top = anchorRect.top - height - 4;
    if (left < 8) left = 8;
    return { top, left };
  }, [anchorRect, col]);

  return (
    <div className="dd-popup" style={style} ref={ref}>
      <div className="dd-option" onClick={() => onSelect('')}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--text-4)', flexShrink:0, display:'inline-block' }} />
        <span style={{ color:'var(--text-3)', fontSize:'12px' }}>— None</span>
      </div>
      {(col.options || []).map(opt => (
        <div key={opt.label} className="dd-option" onClick={() => onSelect(opt.label)}>
          <span className={`dd-dot color-${opt.color}`} />
          <span>{opt.label}</span>
        </div>
      ))}
      <div className="dd-separator" />
      <div className="dd-manage-opt" onClick={onManage}>⚙ Manage options</div>
    </div>
  );
}

/* ── Column context menu ──────────────────────────────────────────────────── */
function ColMenu({ pos, col, onRename, onInsertLeft, onInsertRight, onManageOpts, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Auto-reposition if near edge
  const adjustedPos = useMemo(() => {
    let x = pos.x, y = pos.y;
    if (x + 200 > window.innerWidth  - 8) x = window.innerWidth  - 208;
    if (y + 220 > window.innerHeight - 8) y = window.innerHeight - 228;
    if (x < 8) x = 8;
    return { x, y };
  }, [pos]);

  return (
    <div className="col-menu" style={{ top: adjustedPos.y, left: adjustedPos.x }} ref={ref}>
      <div className="col-menu-item" onClick={onRename}>✏ Rename</div>
      <div className="col-menu-item" onClick={onInsertLeft}>← Insert left</div>
      <div className="col-menu-item" onClick={onInsertRight}>→ Insert right</div>
      {col?.type === 'dropdown' && (
        <div className="col-menu-item" onClick={onManageOpts}>⚙ Manage options</div>
      )}
      <div className="col-menu-sep" />
      {col?.dbField
        ? <div className="col-menu-disabled">Built-in column</div>
        : <div className="col-menu-item danger" onClick={onDelete}>🗑 Delete column</div>
      }
    </div>
  );
}

/* ── Manage options body ──────────────────────────────────────────────────── */
function ManageOptionsBody({ options, onChange }) {
  const add = () => onChange([...options, { label: 'New option', color: 'blue' }]);
  const del = (i) => onChange(options.filter((_, idx) => idx !== i));
  const upd = (i, k, v) => { const n = [...options]; n[i] = { ...n[i], [k]: v }; onChange(n); };
  return (
    <div>
      {options.map((opt, i) => (
        <div key={i} className="opt-row">
          <span className={`dd-dot color-${opt.color}`} style={{ flexShrink:0, width:8, height:8 }} />
          <input className="opt-label-input" value={opt.label} onChange={e => upd(i,'label',e.target.value)} />
          <select className="opt-color-select" value={opt.color} onChange={e => upd(i,'color',e.target.value)}>
            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="opt-delete-btn" onClick={() => del(i)}>✕</button>
        </div>
      ))}
      <button className="add-option-btn" onClick={add}>＋ Add option</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SPREADSHEET
═══════════════════════════════════════════════════════════════════════════ */
export default function Spreadsheet({ page, initialRows, initialCols, onPatch, onCreate, onDelete, rowIdKey = '_id', filterTabs = true }) {
  const toast = useToast();

  const [cols,    setCols]    = useState(initialCols || []);
  const [allRows, setAllRows] = useState(initialRows || []);
  const [rows,    setRows]    = useState(initialRows || []);

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');
  const [sortKey,      setSortKey]      = useState('-appliedDate');

  const [saveState,    setSaveState]    = useState('');
  const saveTimerRef                    = useRef(null);
  const pendingSavesRef                 = useRef(new Map());

  const [ddState,    setDdState]    = useState(null);
  const [calState,   setCalState]   = useState(null);
  const [colMenu,    setColMenu]    = useState(null);
  const [renameCI,   setRenameCI]   = useState(null);
  const [renameVal,  setRenameVal]  = useState('');
  const [dragCI,     setDragCI]     = useState(null);
  const [dragOverCI, setDragOverCI] = useState(null);
  const resizeRef                   = useRef(null);

  const [deleteRowModal,  setDeleteRowModal]  = useState(null);
  const [deleteColModal,  setDeleteColModal]  = useState(null);
  const [addColModal,     setAddColModal]     = useState(false);
  const [newColLabel,     setNewColLabel]     = useState('');
  const [newColType,      setNewColType]      = useState('text');
  const [newColOptions,   setNewColOptions]   = useState([{ label:'Option 1', color:'blue' }]);
  const [manageOptsModal, setManageOptsModal] = useState(null);

  useEffect(() => { setCols(initialCols || []); }, [initialCols]);
  useEffect(() => { setAllRows(initialRows || []); setRows(initialRows || []); }, [initialRows]);

  // Filter + sort
  useEffect(() => {
    let f = allRows.slice();
    if (filterStatus !== 'All') f = f.filter(r => (r.status || '') === filterStatus);
    if (filterSearch.trim()) {
      const q = filterSearch.trim().toLowerCase();
      f = f.filter(r =>
        (r.company||'').toLowerCase().includes(q) ||
        (r.jobTitle||'').toLowerCase().includes(q) ||
        (r.name||'').toLowerCase().includes(q)
      );
    }
    const desc = sortKey.startsWith('-'), field = desc ? sortKey.slice(1) : sortKey;
    f = f.slice().sort((a, b) => {
      const va = field === 'appliedDate' ? (a._appliedDateISO || a.appliedDate || '') : (a[field] || '');
      const vb = field === 'appliedDate' ? (b._appliedDateISO || b.appliedDate || '') : (b[field] || '');
      if (va < vb) return desc ? 1 : -1; if (va > vb) return desc ? -1 : 1; return 0;
    });
    setRows(f);
  }, [allRows, filterStatus, filterSearch, sortKey]);

  const statusCol = useMemo(() => cols.find(c => c.id === 'status'), [cols]);

  const showSave = useCallback((state) => {
    setSaveState(state);
    clearTimeout(saveTimerRef.current);
    if (state === 'saved' || state === 'error') {
      saveTimerRef.current = setTimeout(() => setSaveState(''), 2200);
    }
  }, []);

  const persistCellChange = useCallback((rowId, colId, value) => {
    if (!rowId) return;
    setAllRows(prev => prev.map(r => {
      if (String(r[rowIdKey] || r._id) !== String(rowId)) return r;
      const copy = { ...r, extraData: { ...(r.extraData || {}) } };
      setColValue(copy, colId, value);
      return copy;
    }));
    showSave('saving');
    const pMap = pendingSavesRef.current;
    if (pMap.has(rowId)) clearTimeout(pMap.get(rowId).timer);
    const payload = {};
    if (colId === 'appliedDate') {
      payload.appliedDate = (!value) ? null : (() => { const d = new Date(value); return isNaN(d) ? null : d.toISOString(); })();
    } else {
      payload[colId] = value;
    }
    const timer = setTimeout(async () => {
      pMap.delete(rowId);
      try {
        await onPatch(rowId, payload);
        if (pMap.size === 0) showSave('saved');
      } catch {
        showSave('error');
        toast('Failed to save change', 'error');
      }
    }, 400);
    pMap.set(rowId, { timer, payload });
  }, [onPatch, showSave, toast, rowIdKey]);

  useEffect(() => {
    return () => {
      pendingSavesRef.current.forEach(({ timer, payload }, rowId) => {
        clearTimeout(timer);
        navigator.sendBeacon(`${getAPIBase()}/${page}/${rowId}`, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      });
    };
  }, [page]);

  const handleAddRow = async () => {
    try {
      const newRow = await onCreate();
      setAllRows(prev => [newRow, ...prev]);
    } catch { toast('Failed to add row', 'error'); }
  };

  const handleDeleteRow = async () => {
    const { id } = deleteRowModal;
    setDeleteRowModal(null);
    try {
      await onDelete(id);
      setAllRows(prev => prev.filter(r => String(r[rowIdKey] || r._id) !== String(id)));
      toast('Row deleted');
    } catch { toast('Failed to delete', 'error'); }
  };

  const exportCSV = () => {
    const ec = cols.filter(c => c.id !== '_appCount');
    const rows2 = [ec.map(c => csvEsc(c.label)).join(',')];
    rows.forEach(row => rows2.push(ec.map(c => csvEsc(getColValue(row, c.id))).join(',')));
    const blob = new Blob([rows2.join('\r\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `jobspace-${page}-${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  const moveCol = async (fromCI, toCI) => {
    if (fromCI === toCI) return;
    const nc = cols.slice(); const [m] = nc.splice(fromCI, 1); nc.splice(toCI, 0, m);
    const withOrder = nc.map((c, i) => ({ ...c, order: i }));
    setCols(withOrder); setDragCI(null); setDragOverCI(null);
    try { await columnsAPI.put(page, withOrder); } catch { toast('Failed to save order','error'); }
  };

  const startResize = (e, ci) => {
    e.preventDefault();
    const startX = e.clientX, startW = cols[ci].width || 140;
    const onMove = (me) => {
      const nw = Math.max(60, startW + me.clientX - startX);
      setCols(prev => prev.map((c, i) => i === ci ? { ...c, width: nw } : c));
    };
    const onUp = async () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      try { await columnsAPI.put(page, cols); } catch {}
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startRename = (ci) => { setRenameCI(ci); setRenameVal(cols[ci].label); setColMenu(null); };
  const confirmRename = async () => {
    if (renameCI === null) return;
    const nc = cols.map((c, i) => i === renameCI ? { ...c, label: renameVal || c.label } : c);
    setCols(nc); setRenameCI(null);
    try { await columnsAPI.put(page, nc); } catch { toast('Failed to rename','error'); }
  };

  const insertCol = async (atCI) => {
    const id = 'custom_' + Math.random().toString(36).slice(2, 8);
    const nc  = [...cols.slice(0, atCI), { id, label:'New Column', type:'text', order:atCI, width:140, dbField:false, options:[] }, ...cols.slice(atCI)].map((c,i) => ({ ...c, order:i }));
    setCols(nc); setColMenu(null);
    try { await columnsAPI.put(page, nc); toast('Column added'); } catch { toast('Failed','error'); }
  };

  const confirmDeleteCol = async () => {
    const ci = deleteColModal;
    setDeleteColModal(null);
    const nc = cols.filter((_, i) => i !== ci).map((c, i) => ({ ...c, order: i }));
    setCols(nc);
    try { await columnsAPI.put(page, nc); toast('Column deleted'); } catch { toast('Failed','error'); }
  };

  const confirmAddCol = async () => {
    if (!newColLabel.trim()) return;
    const id  = 'custom_' + Math.random().toString(36).slice(2, 8);
    const nc  = [...cols, { id, label: newColLabel.trim(), type: newColType, order: cols.length, width: 140, dbField: false, options: newColType === 'dropdown' ? newColOptions : [] }];
    setCols(nc); setAddColModal(false); setNewColLabel(''); setNewColType('text'); setNewColOptions([{ label:'Option 1', color:'blue' }]);
    try { await columnsAPI.put(page, nc); toast('Column added'); } catch { toast('Failed','error'); }
  };

  const saveManageOpts = async () => {
    const { ci, options } = manageOptsModal;
    const nc = cols.map((c, i) => i === ci ? { ...c, options } : c);
    setCols(nc); setManageOptsModal(null);
    try { await columnsAPI.patchOptions(page, cols[ci].id, options); toast('Options saved'); }
    catch { toast('Failed','error'); }
  };

  const handleCellKey = (e, ri, ci) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const nri = e.key === 'Enter' ? ri + 1 : ri;
      const nci = e.key === 'Tab'   ? ci + 1 : ci;
      const el  = document.querySelector(`[data-ri="${nri}"][data-ci="${nci}"] .cell-input`);
      if (el) el.focus();
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>
      {/* Controls */}
      <div className="sheet-controls">
        <div className="sheet-search-wrap">
          <span className="sheet-search-icon">⌕</span>
          <input className="sheet-search" placeholder="Search…" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
        </div>

        {filterTabs && statusCol && (
          <div className="filter-tabs">
            <button className={`filter-tab${filterStatus==='All'?' active':''}`} onClick={() => setFilterStatus('All')}>All</button>
            {(statusCol.options || []).map(opt => (
              <button key={opt.label} className={`filter-tab${filterStatus===opt.label?' active':''}`} onClick={() => setFilterStatus(opt.label)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {page === 'applications' && (
          <select className="sheet-sort" value={sortKey} onChange={e => setSortKey(e.target.value)}>
            <option value="-appliedDate">Date ↓</option>
            <option value="appliedDate">Date ↑</option>
            <option value="company">Company A→Z</option>
            <option value="-company">Company Z→A</option>
          </select>
        )}

        <button className="btn-csv" onClick={exportCSV}>↓ Export CSV</button>
      </div>

      {/* Toolbar */}
      <div className="spreadsheet-toolbar">
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setAddColModal(true)}>+ Column</button>
          {saveState && (
            <span className={`save-indicator save-${saveState}`}>
              {saveState==='saving' ? '● Saving…' : saveState==='saved' ? '✓ Saved' : '✕ Error'}
            </span>
          )}
        </div>
        <span className="spreadsheet-toolbar-hint">
          {rows.length} row{rows.length!==1?'s':''} · Click to edit · Right-click to delete · Auto-saves
        </span>
      </div>

      {/* Table */}
      <div className="spreadsheet-outer">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th />
              {cols.map((col, ci) => (
                <th
                  key={col.id}
                  style={{ width: col.width || 140 }}
                  draggable
                  className={dragOverCI === ci ? 'th-drag-over' : ''}
                  onDragStart={() => setDragCI(ci)}
                  onDragEnd={() => { setDragCI(null); setDragOverCI(null); }}
                  onDragOver={e => { e.preventDefault(); setDragOverCI(ci); }}
                  onDrop={() => { if (dragCI !== null) moveCol(dragCI, ci); setDragOverCI(null); }}
                >
                  <div className="th-inner">
                    {renameCI === ci ? (
                      <input
                        className="th-rename-input" autoFocus
                        value={renameVal} onChange={e => setRenameVal(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={e => { if (e.key==='Enter') confirmRename(); if (e.key==='Escape') setRenameCI(null); }}
                      />
                    ) : (
                      <span className="th-label" onDoubleClick={() => startRename(ci)}>{col.label}</span>
                    )}
                    <button className="th-menu-btn"
                      onClick={e => { e.stopPropagation(); setColMenu({ pos:{ x:e.clientX, y:e.clientY }, ci }); }}
                    >⋯</button>
                    <div className="th-resize" onMouseDown={e => startResize(e, ci)} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const rowId = String(row[rowIdKey] || row._id || '');
              return (
                <tr key={rowId || ri} onContextMenu={e => { e.preventDefault(); setDeleteRowModal({ id:rowId, label: row.jobTitle||row.name||'this row' }); }}>
                  <td><span className="row-num">{ri+1}</span></td>
                  {cols.map((col, ci) => (
                    <td key={col.id} data-ri={ri} data-ci={ci}>
                      {col.type === 'dropdown' ? (
                        <DropdownCell col={col} value={getColValue(row, col.id)}
                          onClick={e => setDdState({ anchorRect: e.currentTarget.getBoundingClientRect(), ri, col })} />
                      ) : col.type === 'date' ? (
                        <DateCell value={getColValue(row, col.id)}
                          onClick={e => setCalState({ anchorRect: e.currentTarget.getBoundingClientRect(), ri, colId: col.id, isoVal: row._appliedDateISO || (row.appliedDate ? new Date(row.appliedDate).toISOString() : '') })} />
                      ) : (
                        <TextCell value={getColValue(row, col.id)} readOnly={col.id==='_appCount'}
                          onBlur={nv => { if (nv !== getColValue(row, col.id)) persistCellChange(rowId, col.id, nv); }}
                          onKeyDown={e => handleCellKey(e, ri, ci)} />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr><td colSpan={cols.length + 1}><button className="add-row-btn" onClick={handleAddRow}><span>＋</span> Add row</button></td></tr>
          </tfoot>
        </table>
      </div>

      {/* Portals */}
      {ddState && (
        <DropdownPopup anchorRect={ddState.anchorRect} col={ddState.col}
          onSelect={val => { persistCellChange(String(rows[ddState.ri][rowIdKey]||rows[ddState.ri]._id), ddState.col.id, val); setDdState(null); }}
          onManage={() => { const ci=cols.findIndex(c=>c.id===ddState.col.id); setManageOptsModal({ ci, options:[...(ddState.col.options||[])] }); setDdState(null); }}
          onClose={() => setDdState(null)} />
      )}
      {calState && (
        <CalendarPopup anchorRect={calState.anchorRect} value={calState.isoVal}
          onSelect={iso => {
            const rowId = String(rows[calState.ri][rowIdKey]||rows[calState.ri]._id);
            const display = iso ? new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
            persistCellChange(rowId, calState.colId, iso);
            setAllRows(prev => prev.map(r => String(r[rowIdKey]||r._id)!==rowId ? r : { ...r, appliedDate:display, _appliedDateISO:iso||'' }));
            setCalState(null);
          }}
          onClose={() => setCalState(null)} />
      )}
      {colMenu && (
        <ColMenu pos={colMenu.pos} col={cols[colMenu.ci]}
          onRename={() => startRename(colMenu.ci)}
          onInsertLeft={() => { insertCol(colMenu.ci); }}
          onInsertRight={() => { insertCol(colMenu.ci + 1); }}
          onManageOpts={() => { setManageOptsModal({ ci:colMenu.ci, options:[...(cols[colMenu.ci].options||[])] }); setColMenu(null); }}
          onDelete={() => { setDeleteColModal(colMenu.ci); setColMenu(null); }}
          onClose={() => setColMenu(null)} />
      )}

      {/* Modals */}
      <Modal open={!!deleteRowModal} onClose={() => setDeleteRowModal(null)} title="Delete row" size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteRowModal(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDeleteRow}>Delete</button></>}>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.55 }}>
          Delete <strong style={{ color:'var(--text)' }}>{deleteRowModal?.label}</strong>? This cannot be undone.
        </p>
      </Modal>
      <Modal open={deleteColModal!==null} onClose={() => setDeleteColModal(null)} title="Delete column" size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteColModal(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteCol}>Delete column</button></>}>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.55 }}>
          Delete <strong style={{ color:'var(--text)' }}>{deleteColModal!==null?cols[deleteColModal]?.label:''}</strong>? All data in this column will be lost.
        </p>
      </Modal>
      <Modal open={addColModal} onClose={() => setAddColModal(false)} title="Add column"
        footer={<><button className="btn btn-secondary" onClick={() => setAddColModal(false)}>Cancel</button><button className="btn btn-primary" onClick={confirmAddCol}>Add column</button></>}>
        <div className="form-group">
          <label className="form-label">Column name</label>
          <input className="form-control" placeholder="e.g. Priority" value={newColLabel} onChange={e => setNewColLabel(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-control" value={newColType} onChange={e => setNewColType(e.target.value)}>
            <option value="text">Text</option><option value="number">Number</option>
            <option value="date">Date</option><option value="dropdown">Dropdown</option>
          </select>
        </div>
        {newColType === 'dropdown' && (
          <div><label className="form-label" style={{ marginBottom:8 }}>Options</label>
          <ManageOptionsBody options={newColOptions} onChange={setNewColOptions} /></div>
        )}
      </Modal>
      <Modal open={!!manageOptsModal} onClose={() => setManageOptsModal(null)}
        title={`Manage options — ${manageOptsModal!==null?cols[manageOptsModal.ci]?.label:''}`}
        footer={<><button className="btn btn-secondary" onClick={() => setManageOptsModal(null)}>Cancel</button><button className="btn btn-primary" onClick={saveManageOpts}>Save options</button></>}>
        {manageOptsModal && <ManageOptionsBody options={manageOptsModal.options} onChange={opts => setManageOptsModal(m => ({ ...m, options:opts }))} />}
      </Modal>
    </div>
  );
}

/* ── Cell sub-components ─────────────────────────────────────────────────── */
function TextCell({ value, readOnly, onBlur, onKeyDown }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  if (readOnly) return <span style={{ padding:'10px 14px', display:'block', fontSize:13, color:'var(--text-2)' }}>{value}</span>;
  return (
    <input className="cell-input" value={local} onChange={e => setLocal(e.target.value)}
      onBlur={() => onBlur(local)} onKeyDown={onKeyDown} />
  );
}

function DropdownCell({ col, value, onClick }) {
  const color = value ? getOptionColor(col, value) : 'empty';
  return (
    <button className={`dd-badge color-${color}`} onClick={onClick}>
      <span className="dd-badge-inner">{value || '—'}</span>
      <span className="dd-caret">▾</span>
    </button>
  );
}

function DateCell({ value, onClick }) {
  return (
    <button className={`date-cell-btn${!value?' date-cell-empty':''}`} onClick={onClick}>
      <span className="date-cell-icon">📅</span>
      <span className="date-cell-text">{value ? formatDisplayDate(value) : 'Set date'}</span>
    </button>
  );
}
