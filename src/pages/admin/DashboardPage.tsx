import React, { useEffect, useState } from 'react';
import { Users, Package, FileText, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  helperText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, helperText }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="rounded-full p-2 bg-primary-50">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: '-',
    totalPackages: '-',
    totalQuestions: '-',
    activeSessions: '-',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Fetch total packages
        const { count: packagesCount, error: packagesError } = await supabase
          .from('packages')
          .select('*', { count: 'exact', head: true });

        if (packagesError) throw packagesError;

        // Fetch total questions
        const { count: questionsCount, error: questionsError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true });

        if (questionsError) throw questionsError;

        // Fetch active sessions
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from('tryout_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (sessionsError) throw sessionsError;

        setStats({
          totalUsers: usersCount !== null ? usersCount.toString() : '0',
          totalPackages: packagesCount !== null ? packagesCount.toString() : '0',
          totalQuestions: questionsCount !== null ? questionsCount.toString() : '0',
          activeSessions: sessionsCount !== null ? sessionsCount.toString() : '0',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="h-4 w-4 text-primary-600" />}
            helperText="Registered users in the system"
          />
          <StatCard
            title="Total Packages"
            value={stats.totalPackages}
            icon={<Package className="h-4 w-4 text-primary-600" />}
            helperText="Available test packages"
          />
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={<FileText className="h-4 w-4 text-primary-600" />}
            helperText="Across all packages"
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeSessions}
            icon={<CalendarDays className="h-4 w-4 text-primary-600" />}
            helperText="Currently active try-out sessions"
          />
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No recent activities to display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton label="Add Package" icon={<Package className="h-4 w-4" />} href="/admin/packages/new" />
              <QuickActionButton label="Add Question" icon={<FileText className="h-4 w-4" />} href="/admin/questions/new" />
              <QuickActionButton label="Create Session" icon={<CalendarDays className="h-4 w-4" />} href="/admin/sessions/new" />
              <QuickActionButton label="View Reports" icon={<Users className="h-4 w-4" />} href="/admin/reports" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, icon, href }) => (
  <a
    href={href}
    className="flex items-center p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
  >
    <span className="rounded-full p-2 bg-primary-50 mr-3">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export default DashboardPage;