import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            <Navbar />
            <main className="pt-24 pb-10 container mx-auto px-6">
                {children}
            </main>
        </div>
    );
};

export default Layout;
