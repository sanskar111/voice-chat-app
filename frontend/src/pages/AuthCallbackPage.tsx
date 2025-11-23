import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const error = params.get('error');

            if (error) {
                console.error('OAuth error:', error);
                navigate('/login?error=' + error);
                return;
            }

            if (token) {
                // Store token
                localStorage.setItem('token', token);

                // Decode token to get user info (basic JWT decode)
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const user = {
                        id: payload.userId,
                        email: payload.email,
                        username: payload.username
                    };
                    login(token, user);
                    navigate('/');
                } catch (err) {
                    console.error('Error decoding token:', err);
                    navigate('/login?error=invalid_token');
                }
            } else {
                navigate('/login?error=no_token');
            }
        };

        handleCallback();
    }, [navigate, login]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                <p className="mt-4 text-white text-lg">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
