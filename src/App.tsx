import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;
