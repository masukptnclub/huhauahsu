import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

interface Package {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setPackages(data || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package? This will delete all associated subtests and questions.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPackages(packages.filter(pkg => pkg.id !== id));
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Packages</h1>
        <Button 
          as={Link} 
          to="/admin/packages/new"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Package
        </Button>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No packages found.</p>
          <Button 
            as={Link} 
            to="/admin/packages/new"
            variant="outline"
          >
            Create your first package
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.active ? 'success' : 'outline'}>
                      {pkg.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(pkg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        as={Link}
                        to={`/admin/packages/${pkg.id}/edit`}
                        leftIcon={<Edit className="h-4 w-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                        onClick={() => handleDelete(pkg.id)}
                        leftIcon={<Trash className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;