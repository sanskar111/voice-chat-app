import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mic } from 'lucide-react';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <nav className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Mic /> VoiceChat
                    </Link>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-gray-300">Hello, {user.username}</span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
                                <Link to="/signup" className="bg-primary hover:bg-blue-600 px-3 py-1 rounded transition">Signup</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <main className="container mx-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
