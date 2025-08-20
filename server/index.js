require('dotenv').config();
const express = require('express');
const cors = require('cors');
const flowchartRoutes = require('./routes/flowchart');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'Flowchart Generator API',
        version: '1.0.0',
        endpoints: {
            generateFlowchart: 'POST /api/flowchart/generate'
        }
    });
});

app.use('/api/flowchart', flowchartRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📊 Ready to generate flowcharts with Gemini AI');
});

module.exports = app;
