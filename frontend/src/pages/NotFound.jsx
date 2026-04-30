import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-8 border border-error/20">
        <AlertCircle className="w-12 h-12 text-error" />
      </div>
      <h1 className="text-6xl font-black text-text-primary mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-text-primary mb-4">Page Not Found</h2>
      <p className="text-text-secondary max-w-md mb-12 leading-relaxed">
        Oops! The page you're looking for doesn't exist or has been moved to another universe.
      </p>
      <Link 
        to="/dashboard" 
        className="flex items-center gap-2 px-8 py-3 bg-primary text-[#0f1117] font-black uppercase tracking-widest rounded-lg shadow-teal-glow hover:scale-105 transition-all"
      >
        <Home className="w-5 h-5" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
