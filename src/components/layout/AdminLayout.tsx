import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  FileText, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  BarChart
} from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed h-full bg-white shadow-md">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary-600">Try Out UTBK</h1>
          <p className="text-gray-500 text-sm">Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            <NavItem to="/admin" icon={<Home size={18} />} label="Dashboard" exact />
            <NavItem to="/admin/packages" icon={<Package size={18} />} label="Packages" />
            <NavItem to="/admin/subtests" icon={<FileText size={18} />} label="Subtests" />
            <NavItem to="/admin/questions" icon={<FileText size={18} />} label="Questions" />
            <NavItem to="/admin/sessions" icon={<Calendar size={18} />} label="Try Out Sessions" />
            <NavItem to="/admin/users" icon={<Users size={18} />} label="Users" />
            <NavItem to="/admin/reports" icon={<BarChart size={18} />} label="Reports" />
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={toggleSidebar}></div>

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary-600">Try Out UTBK</h1>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            <MobileNavItem to="/admin" icon={<Home size={18} />} label="Dashboard" onClick={toggleSidebar} exact />
            <MobileNavItem to="/admin/packages" icon={<Package size={18} />} label="Packages" onClick={toggleSidebar} />
            <MobileNavItem to="/admin/subtests" icon={<FileText size={18} />} label="Subtests" onClick={toggleSidebar} />
            <MobileNavItem to="/admin/questions" icon={<FileText size={18} />} label="Questions" onClick={toggleSidebar} />
            <MobileNavItem to="/admin/sessions" icon={<Calendar size={18} />} label="Try Out Sessions" onClick={toggleSidebar} />
            <MobileNavItem to="/admin/users" icon={<Users size={18} />} label="Users" onClick={toggleSidebar} />
            <MobileNavItem to="/admin/reports" icon={<BarChart size={18} />} label="Reports" onClick={toggleSidebar} />
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-10">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 md:hidden">
            <Menu size={24} />
          </button>
          <div className="flex-1 ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                A
              </div>
              <span className="ml-2 text-sm font-medium">Admin</span>
              <ChevronDown size={16} className="ml-1 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, exact }) => {
  return (
    <li>
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
      >
        <span className="mr-3">{icon}</span>
        {label}
      </NavLink>
    </li>
  );
};

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, icon, label, onClick, exact }) => {
  return (
    <li>
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
        onClick={onClick}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </NavLink>
    </li>
  );
};