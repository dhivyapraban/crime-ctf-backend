const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticateToken } = require('../middleware/auth');

// Get all cases (accessible to all authenticated users)
router.get('/', authenticateToken, caseController.getAllCases);

// Add a case (Chief only)
router.post('/', authenticateToken, caseController.addCase);

// Update a case (Chief only)
router.put('/:id', authenticateToken, caseController.updateCase);

// Delete a case (Chief only)
router.delete('/:id', authenticateToken, caseController.deleteCase);

// Release a hint (Chief only)
router.post('/:caseId/hints/:hintId/release', authenticateToken, caseController.releaseHint);

module.exports = router;
