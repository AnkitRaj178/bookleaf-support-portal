import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/auth/Login';
import Layout from './layouts/Layout';
import AuthorLayout from './layouts/AuthorLayout';
import AuthorOverview from './pages/author/AuthorOverview';
import BooksView from './pages/author/BooksView';
import TicketsView from './pages/author/TicketsView';
import SubmitTicketView from './pages/author/SubmitTicketView';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
            duration: 3000,
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
            }
        }} 
      />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes use the old generic layout */}
        <Route element={<Layout />}>
          <Route 
            path="/admin/:ticketId?" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Modular Author Routes */}
        <Route 
            path="/author" 
            element={
              <ProtectedRoute allowedRoles={['author']}>
                <AuthorLayout />
              </ProtectedRoute>
            } 
        >
          <Route index element={<AuthorOverview />} />
          <Route path="books" element={<BooksView />} />
          <Route path="tickets" element={<TicketsView />} />
          <Route path="support" element={<SubmitTicketView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
