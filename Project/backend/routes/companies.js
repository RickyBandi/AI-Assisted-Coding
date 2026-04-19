const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/companyController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);
router.get('/',       ctrl.getCompanies);
router.post('/',      ctrl.postCompanyJson);
router.patch('/:id',  ctrl.patchCompany);
router.delete('/:id', ctrl.deleteCompany);
module.exports = router;
