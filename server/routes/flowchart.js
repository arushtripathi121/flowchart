const express = require('express');
const router = express.Router();
const {
    generateFlowchart,
    validateFlowchartData,
    getFlowchartFormats
} = require('../controllers/flowchartController');

router.get('/formats', getFlowchartFormats);

router.post('/generate', generateFlowchart);

router.post('/validate', validateFlowchartData);

module.exports = router;
