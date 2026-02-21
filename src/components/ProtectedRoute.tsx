import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05010a] flex items-center justify-center">
                <Loader2 className="animate-spin text-violet-500" size={40} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};
