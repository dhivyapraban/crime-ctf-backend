const Case = require('../models/Case');
const bcrypt = require('bcrypt');

// Get all cases
const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'Server error fetching cases' });
  }
};

// Add a new case (Chief only)
const addCase = async (req, res) => {
  try {
    const { title, description, difficulty, points, flag, hints, attachmentType, attachmentName, attachmentUrl } = req.body;

    if (!title || !description || !points || !flag) {
      return res.status(400).json({ error: 'Title, description, points, and flag are required' });
    }

    // Hash the flag before storing
    const hashedFlag = await bcrypt.hash(flag, 10);

    const newCase = new Case({
      title,
      description,
      difficulty: difficulty || 'Medium',
      points,
      flag: hashedFlag,
      hints: hints || [],
      attachmentType,
      attachmentName,
      attachmentUrl
    });

    await newCase.save();
    res.status(201).json({ success: true, case: newCase });
  } catch (error) {
    console.error('Add case error:', error);
    res.status(500).json({ error: 'Server error adding case' });
  }
};

// Update a case (Chief only)
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCase = await Case.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ success: true, case: updatedCase });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Server error updating case' });
  }
};

// Delete a case (Chief only)
const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCase = await Case.findByIdAndDelete(id);
    
    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'Server error deleting case' });
  }
};

// Release a hint for a case
const releaseHint = async (req, res) => {
  try {
    const { caseId, hintId } = req.params;
    
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const hint = caseItem.hints.id(hintId);
    if (!hint) {
      return res.status(404).json({ error: 'Hint not found' });
    }

    // Toggle hint release status
    hint.released = !hint.released;
    await caseItem.save();

    res.json({ success: true, case: caseItem, hintReleased: hint.released });
  } catch (error) {
    console.error('Release hint error:', error);
    res.status(500).json({ error: 'Server error releasing hint' });
  }
};

module.exports = {
  getAllCases,
  addCase,
  updateCase,
  deleteCase,
  releaseHint
};
