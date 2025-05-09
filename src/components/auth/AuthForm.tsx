import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Mail, Lock, UserCircle2, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  initialMode?: AuthMode;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

          // Navigate based on user role
          if (profile?.is_admin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }
      } else {
        // First, create the auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Then update the profile with additional information
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              username: email.split('@')[0], // Generate a default username from email
              email: email,
              is_admin: false,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;

          navigate('/user/dashboard');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {mode === 'login' ? 'Login to Your Account' : 'Create an Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<UserCircle2 className="h-5 w-5 text-gray-400" />}
            />
          )}
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          />
          {error && <p className="text-error-600 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-primary-600 hover:text-primary-800 text-sm"
        >
          {mode === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </button>
      </CardFooter>
    </Card>
  );
};