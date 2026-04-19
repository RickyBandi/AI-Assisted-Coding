const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);
router.get('/', ctrl.getDashboard);

module.exports = router;
