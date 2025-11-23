import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated } = useAuth();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMsg, setErrorMsg] = useState('');
    const [hasLoggedIn, setHasLoggedIn] = useState(false);

    console.log('AuthCallbackPage rendering, isAuthenticated:', isAuthenticated);

    useEffect(() => {
        console.log('=== AUTH CALLBACK PAGE MOUNTED ===');
        const handleCallback = async () => {
            try {
                console.log('Processing callback...');
                const params = new URLSearchParams(window.location.search);
                const token = params.get('token');
                const error = params.get('error');

                console.log('Token present:', !!token);
                console.log('Error param:', error);

                if (error) {
                    console.error('OAuth error from backend:', error);
                    setStatus('error');
                    setErrorMsg(getErrorMessage(error));
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!token) {
                    console.error('No token in callback URL');
                    setStatus('error');
                    setErrorMsg('No authentication token received');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                console.log('Token received, length:', token.length);

                // Clear any existing auth state first
                console.log('Clearing old auth state...');
                logout();

                // Small delay to ensure logout completes
                await new Promise(resolve => setTimeout(resolve, 100));

                // Decode token to get user info
                console.log('Decoding token...');
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Token payload:', { userId: payload.userId, email: payload.email, username: payload.username });

                const user = {
                    id: payload.userId,
                    email: payload.email,
                    username: payload.username
                };

                console.log('Logging in with user:', user);
                login(token, user);
                setHasLoggedIn(true);

                setStatus('success');
                console.log('Login successful, waiting for auth state to update...');

            } catch (err) {
                console.error('Error in callback handler:', err);
                setStatus('error');
                setErrorMsg('Failed to process login. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run once on mount

    // Separate effect to watch for authentication state change
    useEffect(() => {
        if (hasLoggedIn && isAuthenticated) {
            console.log('Auth state confirmed, redirecting to lobby...');
            setTimeout(() => {
                console.log('Navigating to /');
                window.location.href = '/';
            }, 500);
        }
    }, [hasLoggedIn, isAuthenticated]);

    const getErrorMessage = (error: string) => {
        switch (error) {
            case 'auth_failed':
                return 'Authentication failed. Please try again.';
            case 'server_error':
                return 'Server error occurred. Please try again later.';
            case 'invalid_token':
                return 'Invalid authentication token.';
            default:
                return 'An error occurred during login.';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            <div className="text-center">
                {status === 'processing' && (
                    <>
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                        <p className="mt-6 text-white text-xl font-medium">Completing sign in...</p>
                        <p className="mt-2 text-gray-300 text-sm">Please wait</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="inline-block rounded-full h-16 w-16 bg-green-500 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="mt-6 text-white text-xl font-medium">Sign in successful!</p>
                        <p className="mt-2 text-gray-300 text-sm">Redirecting to lobby...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="inline-block rounded-full h-16 w-16 bg-red-500 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="mt-6 text-white text-xl font-medium">Sign in failed</p>
                        <p className="mt-2 text-gray-300 text-sm">{errorMsg}</p>
                        <p className="mt-4 text-gray-400 text-xs">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallbackPage;
