import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="text-2xl font-heading font-bold tracking-tight mb-4 block">
                            Talk<span className="text-primary">sick</span>
                        </Link>
                        <p className="text-gray-500 text-sm">
                            The place for real conversations. <br />
                            Drop in and be heard.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link to="/rooms" className="hover:text-primary">Live Rooms</Link></li>
                            <li><a href="#features" className="hover:text-primary">Features</a></li>
                            <li><a href="#" className="hover:text-primary">Download App</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary">Community Guidelines</a></li>
                            <li><a href="#" className="hover:text-primary">Report Issue</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Talksick. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-600">Twitter</a>
                        <a href="#" className="hover:text-gray-600">Instagram</a>
                        <a href="#" className="hover:text-gray-600">Discord</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
