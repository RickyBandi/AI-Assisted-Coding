const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');

router.post('/login',    isGuest,           ctrl.postLogin);
router.post('/register', isGuest,           ctrl.postRegister);
router.post('/logout',                      ctrl.logout);
router.get('/me',        isAuthenticated,   ctrl.getMe);   // ← now uses JWT middleware

module.exports = router;
