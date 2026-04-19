const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/analyticsController');
const { isAuthenticated } = require('../middleware/authMiddleware');
router.use(isAuthenticated);
router.get('/', ctrl.getAnalytics);
module.exports = router;
