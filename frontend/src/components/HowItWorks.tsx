import React from 'react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: "🔍",
            title: "Find a room",
            desc: "Search topics, languages, or vibes. From chill study sessions to heated debates."
        },
        {
            icon: "🎙️",
            title: "Drop in live",
            desc: "Join instantly. Raise your hand to speak or just listen in the background."
        },
        {
            icon: "🤝",
            title: "Make connections",
            desc: "Follow interesting speakers and get notified when they go live again."
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">How Talksick Works</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">No complicated setups. Just open the app and start talking.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                            <div className="text-4xl mb-6 bg-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
