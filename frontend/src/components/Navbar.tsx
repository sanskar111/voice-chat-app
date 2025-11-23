import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-heading font-bold tracking-tight">
                    Talk<span className="text-primary">sick</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it works</a>
                    <Link to="/rooms" className="text-sm font-medium hover:text-primary transition-colors">Rooms</Link>
                    <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/rooms" className="hidden md:block text-sm font-medium hover:text-primary">Browse Rooms</Link>
                            <div className="relative group">
                                <button className="flex items-center space-x-2 focus:outline-none">
                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-50">
                                        <p className="text-sm font-semibold truncate">{user.username}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
                            <Link to="/login" className="bg-secondary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Join a Room
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
