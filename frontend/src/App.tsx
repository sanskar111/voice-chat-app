import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/rooms" element={
                <ProtectedRoute>
                    <Layout>
                        <LobbyPage />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/room/:id" element={
                <ProtectedRoute>
                    <Layout>
                        <RoomPage />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
    );
}

export default App;
