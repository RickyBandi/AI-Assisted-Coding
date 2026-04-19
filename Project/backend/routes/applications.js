const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/applicationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);

router.get('/',      ctrl.getApplications);
router.post('/api',  ctrl.postCreateApplicationJson);
router.post('/',     ctrl.postCreateApplicationJson);
router.patch('/:id', ctrl.patchApplication);
router.delete('/:id',ctrl.deleteApplicationJson);

module.exports = router;
