const express = require('express');
const router = express.Router();
const {
    getDiagramFormats,
    generateDiagram,
    validateDiagramStructure
} = require('../controllers/flowchartController');

router.get('/formats', getDiagramFormats);

router.post('/generate', generateDiagram);

router.post('/validate', validateDiagramStructure);

module.exports = router;
