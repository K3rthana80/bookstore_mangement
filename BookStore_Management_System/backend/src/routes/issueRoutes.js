const express = require('express');
const router = express.Router();
const { issueBook, getAllIssues, getIssueById, returnBook, calculateCharge } = require('../controllers/issuesController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllIssues);
router.post('/', issueBook);
router.get('/:id', getIssueById);
router.post('/:id/calculate', calculateCharge);
router.post('/:id/return', returnBook);

module.exports = router;
