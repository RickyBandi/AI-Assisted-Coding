const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { isAdminAuthenticated } = require('../middleware/authMiddleware');

router.use(isAdminAuthenticated);
router.get('/',               ctrl.getAdminDashboard);
router.get('/users',          ctrl.getAdminUsers);
router.put('/users/:id/role', ctrl.updateUserRole);
router.delete('/users/:id',   ctrl.deleteUser);
module.exports = router;
