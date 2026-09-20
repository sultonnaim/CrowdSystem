const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Root route - tambahkan ini
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    endpoints: {
      locations: '/api/locations',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', gateway: 'running' });
});

// Proxy ke location service
app.use('/api/locations', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

// 404 handler untuk endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: ['/', '/health', '/api/locations']
  });
});

app.listen(PORT, () => {
  console.log('API Gateway running on port ' + PORT);
  console.log('http://localhost:' + PORT);
  console.log('http://localhost:' + PORT + '/api/locations');
  console.log('http://localhost:' + PORT + '/health');
});