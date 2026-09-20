import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TamanPage from './pages/TamanPage';
import TamanDetailPage from './pages/TamanDetailPage';
import AboutPage from './pages/AboutPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/taman" element={<TamanPage />} />
          <Route path="/taman/:id" element={<TamanDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;