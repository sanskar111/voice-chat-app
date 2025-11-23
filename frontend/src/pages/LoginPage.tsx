import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import axios from '../config/axios';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/login', { email, password });
            login(res.data.token, { id: res.data.userId, username: res.data.username });
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

            {/* Google Sign-In */}
            <GoogleSignInButton />

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-primary focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-primary focus:outline-none"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-600 py-2 rounded font-bold transition">
                    Login
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
                Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default LoginPage;
