const express = require('express');
const router = express.Router();
const diagramController = require('../controllers/diagramController');
const { auth } = require('../middleware/auth');

// Save (Create) a diagram
// router.post('/', auth, diagramController.saveDiagram);

// // Get all diagrams (optional, public/admin)
// router.get('/', diagramController.getDiagrams);

// // Get all diagrams for current user
// router.get('/my', auth, diagramController.getUserDiagrams);

// // Get single diagram by ID
// router.get('/:id', auth, diagramController.getDiagramById);

// // Delete diagram by ID
// router.delete('/:id', auth, diagramController.deleteDiagram);

// // Get diagrams by specific userId
// router.get('/user/:userId', diagramController.getDiagramsByUserId);

module.exports = router;
