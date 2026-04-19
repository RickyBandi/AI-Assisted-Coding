const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

router.use(isAuthenticated);
router.get('/',         ctrl.getProfile);
router.put('/',         upload.single('avatar'), ctrl.updateProfile);
router.put('/password', ctrl.changePassword);
module.exports = router;
