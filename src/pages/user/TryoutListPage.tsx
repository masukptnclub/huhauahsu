import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export const TryoutListPage: React.FC = () => {
  const [sessions, setSessions] = useState<TryoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
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
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (error) throw error;

        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching tryout sessions:', err);
        setError('Failed to load tryout sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Try Outs</h1>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Try Outs Available</h3>
            <p className="text-gray-500">
              There are no active try out sessions at the moment. Please check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{session.name}</CardTitle>
                  <Badge variant="primary">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(session.end_date).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-1">{session.package.name}</h3>
                  <p className="text-gray-600">{session.package.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Available until {new Date(session.end_date).toLocaleString()}
                  </div>
                  <Button
                    as={Link}
                    to={`/tryout/${session.id}`}
                    rightIcon={<FileText className="h-4 w-4" />}
                  >
                    Start Try Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};