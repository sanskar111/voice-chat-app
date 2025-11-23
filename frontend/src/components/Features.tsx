import React from 'react';

const Features: React.FC = () => {
    return (
        <section id="features" className="py-20 bg-background overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Content */}
                    <div className="flex-1">
                        <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6">
                            Everything you need to <br />
                            <span className="text-primary">host like a pro.</span>
                        </h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            We give you the tools to manage your room, engage your audience, and keep the vibes right.
                        </p>

                        <ul className="space-y-6">
                            {[
                                "Crystal clear low-latency audio",
                                "Robust moderation tools (Kick, Ban, Mute)",
                                "Co-host support for shared management",
                                "Private and Locked room modes",
                                "Works on any device, no download needed"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">
                                        ✓
                                    </div>
                                    <span className="font-medium text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Visual */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full blur-[80px]"></div>
                        <div className="relative glass p-8 rounded-3xl border border-white/50 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                                    JD
                                </div>
                                <div>
                                    <h4 className="font-bold">John Doe</h4>
                                    <span className="text-xs bg-primary/20 text-primary-dark px-2 py-0.5 rounded-full font-bold">OWNER</span>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-full">🎤</button>
                                    <button className="p-2 hover:bg-red-50 text-red-500 rounded-full">🚫</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                                <div className="h-2 bg-gray-100 rounded-full w-1/2"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;
