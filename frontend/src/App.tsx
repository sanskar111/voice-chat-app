import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
                <Route path="room/:id" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="auth/callback" element={<AuthCallbackPage />} />
            </Route>
        </Routes>
    );
}

export default App;
