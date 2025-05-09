import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Try Out UTBK
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink isActive={isActive('/')} to="/">Home</NavLink>
              <NavLink isActive={isActive('/about')} to="/about">About</NavLink>
              <NavLink isActive={isActive('/features')} to="/features">Features</NavLink>
              <NavLink isActive={isActive('/contact')} to="/contact">Contact</NavLink>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open menu</span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink isActive={isActive('/')} to="/" onClick={toggleMenu}>Home</MobileNavLink>
              <MobileNavLink isActive={isActive('/about')} to="/about" onClick={toggleMenu}>About</MobileNavLink>
              <MobileNavLink isActive={isActive('/features')} to="/features" onClick={toggleMenu}>Features</MobileNavLink>
              <MobileNavLink isActive={isActive('/contact')} to="/contact" onClick={toggleMenu}>Contact</MobileNavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => {
                    toggleMenu();
                    handleLogin();
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => {
                    toggleMenu();
                    handleRegister();
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Try Out UTBK</h3>
              <p className="text-gray-400 text-sm">
                Persiapan terbaik untuk ujian masuk perguruan tinggi. Latihan soal berkualitas dengan analisis hasil yang komprehensif.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="text-gray-400 text-sm not-italic">
                <p>Email: info@tryout-utbk.com</p>
                <p>Phone: +62 812 3456 7890</p>
                <p>Address: Jl. Pendidikan No. 123, Jakarta</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Try Out UTBK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'text-primary-600'
          : 'text-gray-700 hover:text-primary-600 transition-colors'
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, isActive, children, onClick }) => {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};