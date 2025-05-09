import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface TryoutSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  package: {
    name: string;
    description: string;
  };
}

interface UserTryout {
  id: string;
  created_at: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'scored';
  final_score: number | null;
  package: {
    name: string;
  };
  session: {
    name: string;
  };
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState<TryoutSession[]>([]);
  const [userTryouts, setUserTryouts] = useState<UserTryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch active sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('tryout_sessions')
          .select(`
            id,
            name,
            start_date,
            end_date,
            package:packages (
              name,
              description
            )
          `)
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString());

        if (sessionsError) throw sessionsError;

        // Fetch user's tryouts
        const { data: tryouts, error: tryoutsError } = await supabase
          .from('user_tryouts')
          .select(`
            id,
            created_at,
            status,
            final_score,
            package:packages (name),
            session:tryout_sessions (name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (tryoutsError) throw tryoutsError;

        if (mounted) {
          setActiveSessions(sessions || []);
          setUserTryouts(tryouts || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (mounted) {
          setError('Failed to load dashboard data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline">Belum Dimulai</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Sedang Dikerjakan</Badge>;
      case 'completed':
        return <Badge variant="primary">Selesai</Badge>;
      case 'scored':
        return <Badge variant="success">Nilai Tersedia</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Try Outs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Try Out Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada try out yang tersedia saat ini.</p>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{session.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{session.package.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      as={Link}
                      to={`/tryout/${session.id}`}
                      size="sm"
                      className="w-full"
                    >
                      Mulai Try Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Try Outs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Riwayat Try Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userTryouts.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada riwayat try out.</p>
            ) : (
              <div className="space-y-4">
                {userTryouts.map((tryout) => (
                  <div key={tryout.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{tryout.session.name}</h3>
                      {getStatusBadge(tryout.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tryout.package.name}</p>
                    {tryout.status === 'scored' && (
                      <p className="text-sm font-semibold text-primary-600">
                        Skor: {tryout.final_score}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(tryout.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;