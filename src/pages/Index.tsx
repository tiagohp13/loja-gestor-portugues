
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to Dashboard since this is the root route
  return <Navigate to="/dashboard" replace />;
};

export default Index;
