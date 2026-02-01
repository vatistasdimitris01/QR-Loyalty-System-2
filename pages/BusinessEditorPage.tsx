import React from 'react';
import { Navigate } from 'react-router-dom';

const BusinessEditorPage: React.FC = () => {
    // This page is now deprecated as settings are integrated into the main /business dashboard
    return <Navigate to="/business" replace />;
};

export default BusinessEditorPage;