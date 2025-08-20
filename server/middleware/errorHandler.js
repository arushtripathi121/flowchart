const errorHandler = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    console.error('Error Message:', err.message);

    if (err.message?.includes('API_KEY') || err.message?.includes('authentication')) {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.',
            code: 'AUTH_ERROR'
        });
    }

    if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
        return res.status(429).json({
            error: 'Rate Limited',
            message: 'API quota exceeded or rate limit reached. Please try again later.',
            code: 'RATE_LIMIT'
        });
    }

    if (err.message?.includes('Gemini') || err.message?.includes('GenerativeAI')) {
        return res.status(503).json({
            error: 'AI Service Error',
            message: 'Gemini AI service is temporarily unavailable. Please try again.',
            code: 'AI_SERVICE_ERROR'
        });
    }

    // JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON',
            message: 'Request body contains invalid JSON format.',
            code: 'JSON_PARSE_ERROR'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message,
            code: 'VALIDATION_ERROR'
        });
    }

    if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        return res.status(408).json({
            error: 'Request Timeout',
            message: 'Request took too long to process. Please try again.',
            code: 'TIMEOUT_ERROR'
        });
    }

    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong on the server. Please try again.',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

module.exports = errorHandler;
