const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/documentController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload   = require('../middleware/uploadMiddleware');

router.use(isAuthenticated);
router.get('/',      ctrl.getDocuments);
router.post('/',     upload.single('file'), ctrl.postDocument);
router.delete('/:id',ctrl.deleteDocument);
module.exports = router;
