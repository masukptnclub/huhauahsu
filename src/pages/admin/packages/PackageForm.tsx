import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

interface PackageFormData {
  name: string;
  description: string;
  active: boolean;
}

export const PackageForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchPackage = async () => {
        try {
          const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setFormData({
              name: data.name,
              description: data.description || '',
              active: data.active,
            });
          }
        } catch (err) {
          console.error('Error fetching package:', err);
          setError('Failed to load package details.');
        } finally {
          setLoadingData(false);
        }
      };

      fetchPackage();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('packages')
          .update({
            name: formData.name,
            description: formData.description,
            active: formData.active,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('packages')
          .insert([{
            name: formData.name,
            description: formData.description,
            active: formData.active,
          }]);

        if (error) throw error;
      }

      navigate('/admin/packages');
    } catch (err) {
      console.error('Error saving package:', err);
      setError('Failed to save package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/packages')}
          className="mr-4"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Package' : 'Create Package'}</h1>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              name="name"
              label="Package Name"
              placeholder="Enter package name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextArea
              id="description"
              name="description"
              label="Description"
              placeholder="Enter package description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/packages')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isEditing ? 'Update' : 'Create'} Package
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PackageForm;