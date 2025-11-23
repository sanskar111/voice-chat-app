import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/30">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Features />
            <Footer />
        </div>
    );
};

export default LandingPage;
