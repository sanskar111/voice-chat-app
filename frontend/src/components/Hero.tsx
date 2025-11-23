import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Hero: React.FC = () => {
    const { user } = useAuth();

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-5xl lg:text-7xl font-heading font-extrabold tracking-tight leading-tight mb-6">
                            Drop in. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Speak up.</span> <br />
                            Be heard.
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Join live voice rooms across every topic — from late-night gupshup to serious debates. No invites, just vibes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to={user ? "/rooms" : "/login"}
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-secondary font-bold rounded-full shadow-[0_10px_20px_rgba(0,255,98,0.3)] hover:shadow-[0_15px_30px_rgba(0,255,98,0.4)] hover:-translate-y-1 transition-all text-center"
                            >
                                {user ? "Browse Rooms" : "Join a Room"}
                            </Link>
                            <Link
                                to={user ? "/rooms" : "/login"}
                                className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-secondary font-bold rounded-full hover:bg-gray-50 transition-all text-center"
                            >
                                Create a Room
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Low-latency audio
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Topic-based rooms
                            </div>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
                        <div className="relative z-10 glass p-6 rounded-3xl border border-white/40">
                            {/* Mock Room UI */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">Late Night Tech Talks 🌙</h3>
                                    <p className="text-xs text-gray-500">Tech &bull; 24 listening</p>
                                </div>
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className={`w-14 h-14 rounded-full bg-gray-200 mb-2 border-2 ${i === 1 ? 'border-primary shadow-[0_0_15px_rgba(0,255,98,0.5)]' : 'border-transparent'}`}>
                                            <img src={`https://i.pravatar.cc/150?img=${10 + i}`} alt="User" className="w-full h-full rounded-full object-cover" />
                                        </div>
                                        <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <button className="px-6 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                                    + 18 others
                                </button>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-10 -right-10 glass p-3 rounded-2xl animate-bounce duration-[3000ms]">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div className="absolute -bottom-5 -left-5 glass p-3 rounded-2xl animate-bounce duration-[4000ms]">
                            <span className="text-2xl">💬</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
