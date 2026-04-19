const SpreadsheetColumn = require('../models/SpreadsheetColumn');

// ── Default column definitions ────────────────────────────────────────────────
const DEFAULTS = {
  applications: [
    { id:'company',     label:'Company',      type:'text',     order:0, width:160, dbField:true,  options:[] },
    { id:'jobTitle',    label:'Role',          type:'text',     order:1, width:180, dbField:true,  options:[] },
    {
      id:'status', label:'Status', type:'dropdown', order:2, width:145, dbField:true,
      options:[
        { label:'Wishlist',  color:'blue'   },
        { label:'Applied',   color:'purple' },
        { label:'Interview', color:'yellow' },
        { label:'Offer',     color:'green'  },
        { label:'Rejected',  color:'red'    }
      ]
    },
    { id:'appliedDate', label:'Applied Date',  type:'date',     order:3, width:145, dbField:true,  options:[] },
    { id:'location',    label:'Location',      type:'text',     order:4, width:140, dbField:true,  options:[] },
    { id:'salary',      label:'Salary',        type:'text',     order:5, width:130, dbField:true,  options:[] },
    { id:'notes',       label:'Notes',         type:'text',     order:6, width:220, dbField:true,  options:[] }
  ],
  companies: [
    { id:'name',         label:'Company',        type:'text',     order:0, width:190, dbField:true,  options:[] },
    {
      id:'status', label:'Status', type:'dropdown', order:1, width:145, dbField:true,
      options:[
        { label:'Dream',        color:'blue'   },
        { label:'Applied',      color:'purple' },
        { label:'Interviewing', color:'yellow' },
        { label:'Offer',        color:'green'  },
        { label:'Rejected',     color:'red'    }
      ]
    },
    {
      id:'priority', label:'Priority', type:'dropdown', order:2, width:130, dbField:true,
      options:[
        { label:'High',   color:'red'    },
        { label:'Medium', color:'yellow' },
        { label:'Low',    color:'green'  }
      ]
    },
    { id:'_appCount',    label:'Applications',   type:'number',   order:3, width:130, dbField:false, options:[] },
    { id:'lastContact',  label:'Last Contact',   type:'date',     order:7, width:150, dbField:true,  options:[] },
    { id:'recruiterName',  label:'Recruiter Name',  type:'text',  order:9,  width:160, dbField:true, options:[] },
    { id:'recruiterEmail', label:'Recruiter Email', type:'text',  order:10, width:180, dbField:true, options:[] },
    { id:'linkedin',       label:'LinkedIn URL',    type:'text',  order:11, width:200, dbField:true, options:[] },
    { id:'notes',        label:'Notes',          type:'text',     order:12, width:240, dbField:true,  options:[] }
  ]
};

// ── GET /columns/:page ────────────────────────────────────────────────────────
// Returns column config for a page. Creates defaults on first visit.
exports.getColumns = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page } = req.params;
    if (!['applications','companies'].includes(page)) {
      return res.status(400).json({ error: 'Invalid page' });
    }

    let doc = await SpreadsheetColumn.findOne({ user: userId, page });

    if (!doc) {
      // First visit — seed defaults
      doc = await SpreadsheetColumn.create({
        user: userId,
        page,
        columns: DEFAULTS[page]
      });
    }

    // 🔥 Merge missing default columns (schema evolution fix)
    const defaultCols = DEFAULTS[page];
    let updated = false;

    defaultCols.forEach(defCol => {
      const exists = doc.columns.find(c => c.id === defCol.id);
      if (!exists) {
        doc.columns.push(defCol);
        updated = true;
      }
    });

    // Save only if updated
    if (updated) {
      await doc.save();
    }

    // convert to plain object
    doc = doc.toObject();

    res.json({ ok: true, columns: doc.columns });
  } catch (err) {
    console.error('[columnController] getColumns:', err);
    res.status(500).json({ error: 'Failed to load columns' });
  }
};

// ── PUT /columns/:page ────────────────────────────────────────────────────────
// Replace entire columns array (order, widths, labels, add/remove cols)
exports.putColumns = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page } = req.params;
    if (!['applications','companies'].includes(page)) {
      return res.status(400).json({ error: 'Invalid page' });
    }

    const { columns } = req.body;
    if (!Array.isArray(columns)) return res.status(400).json({ error: 'columns must be array' });

    // Normalize columns (fix missing label/id/type issues)
    const normalizedColumns = columns.map((col, index) => ({
      id: col.id || ('custom_' + Math.random().toString(36).slice(2,8)),
      label: col.label || 'Column',
      type: col.type || 'text',
      order: typeof col.order === 'number' ? col.order : index,
      width: col.width || 140,
      dbField: !!col.dbField,
      options: Array.isArray(col.options) ? col.options : []
    }));

    const doc = await SpreadsheetColumn.findOneAndUpdate(
      { user: userId, page },
      { $set: { columns: normalizedColumns } },
      { new: true, upsert: true, runValidators: false }
    );

    res.json({ ok: true, columns: doc.columns });
  } catch (err) {
    console.error('[columnController] putColumns:', err);
    res.status(500).json({ error: 'Failed to save columns' });
  }
};

// ── PATCH /columns/:page/:colId/options ───────────────────────────────────────
// Update dropdown options for a specific column
exports.patchColumnOptions = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { page, colId } = req.params;
    const { options } = req.body;

    if (!Array.isArray(options)) return res.status(400).json({ error: 'options must be array' });

    const doc = await SpreadsheetColumn.findOne({ user: userId, page });
    if (!doc) return res.status(404).json({ error: 'Column config not found' });

    const col = doc.columns.find(c => c.id === colId);
    if (!col) return res.status(404).json({ error: 'Column not found' });
    if (col.type !== 'dropdown') return res.status(400).json({ error: 'Column is not a dropdown' });

    col.options = options;
    await doc.save();

    res.json({ ok: true, options: col.options });
  } catch (err) {
    console.error('[columnController] patchColumnOptions:', err);
    res.status(500).json({ error: 'Failed to update options' });
  }
};
