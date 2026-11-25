import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../constants/admin';
import PageLoader from '../common/PageLoader';

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdminUser(currentUser.uid)) {
        return <Navigate to="/exercises" replace />;
    }

    return <>{children}</>;
}

export default AdminRoute;
