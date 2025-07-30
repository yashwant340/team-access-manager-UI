import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import { StoreProvider } from 'easy-peasy';
import store from './store';

const App: React.FC = () => (
  <StoreProvider store={store}>
  <Router>
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
</StoreProvider>
);

export default App;
