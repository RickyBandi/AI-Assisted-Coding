const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/columnController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);
router.get('/:page',                  ctrl.getColumns);
router.put('/:page',                  ctrl.putColumns);
router.patch('/:page/:colId/options', ctrl.patchColumnOptions);
module.exports = router;
