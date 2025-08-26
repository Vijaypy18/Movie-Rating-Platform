const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Proxy API requests to the backend
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ 
      error: 'Backend connection failed',
      message: 'Make sure the backend server is running on ' + backendUrl
    });
  }
}));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🎬 Frontend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying API requests to: ${backendUrl}`);
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
});