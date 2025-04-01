import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 font-medium' : 'text-secondary-600 hover:text-primary-600';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h20v14H2z"></path>
              <path d="M8 21h8"></path>
              <path d="M12 17v4"></path>
              <path d="M7 7h10"></path>
              <path d="M7 11h10"></path>
              <path d="M7 15h4"></path>
            </svg>
            <span className="text-xl font-bold text-primary-600">AI Resume Screener</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
            <Link to="/jobs" className={`${isActive('/jobs')} transition-colors`}>Jobs</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`${isActive('/dashboard')} transition-colors`}>Dashboard</Link>
                {user?.isAdmin && (
                  <Link to="/admin/dashboard" className={`${isActive('/admin/dashboard')} transition-colors`}>Admin Panel</Link>
                )}
              </>
            ) : null}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600">
                    <span>{user?.name || 'User'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">Your Profile</Link>
                    <Link to="/my-applications" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">My Applications</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">Sign out</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-secondary-600 hover:text-primary-600 transition-colors">Login</Link>
                <Link to="/register" className="btn btn-primary py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Resume Screener</h3>
              <p className="text-secondary-600">Transforming the hiring process with AI-powered resume screening for efficient and unbiased candidate selection.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-secondary-600 hover:text-primary-600">Home</Link></li>
                <li><Link to="/jobs" className="text-secondary-600 hover:text-primary-600">Browse Jobs</Link></li>
                <li><Link to="/register" className="text-secondary-600 hover:text-primary-600">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-secondary-600 hover:text-primary-600">Post a Job</Link></li>
                <li><Link to="/login" className="text-secondary-600 hover:text-primary-600">Employer Login</Link></li>
                <li><a href="#" className="text-secondary-600 hover:text-primary-600">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-8.486 8.486l4.243 4.243 4.243-4.243a6 6 0 000-8.486zm-1.414 7.072l-2.829 2.829-2.829-2.829a4 4 0 115.657-5.657 4 4 0 010 5.657z" clipRule="evenodd" />
                  </svg>
                  <span className="text-secondary-600">123 AI Street, Tech City</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-secondary-600">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-secondary-600">contact@airesumescreen.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-secondary-200 text-center text-secondary-600">
            <p>&copy; {new Date().getFullYear()} AI Resume Screener. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
