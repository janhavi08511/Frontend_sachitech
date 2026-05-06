import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

import { loginApi } from '../../api/authapi'; // ✅ NEW
import { User } from '../../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToForgotPassword: () => void;
}

export function Login({ onLoginSuccess, onNavigateToForgotPassword }: LoginProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 ROLE MAPPING (VERY IMPORTANT)
  const mapRole = (role: string) => {
    if (role === "ADMIN") return "super_admin";
    if (role === "MANAGER") return "manager";
    if (role === "TRAINER") return "trainer";
    return "student";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginApi(email, password);

      // ✅ Save JWT
      localStorage.setItem("token", res.token);

      const user: any = {
  id: res.userId || 0,
  name: res.name || res.email,
  email: res.email,
  role: mapRole(res.role),
  status: 'active',
  studentProfileId: res.studentProfileId || null,
};

      localStorage.setItem("currentUser", JSON.stringify(user));

      onLoginSuccess(user);

    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img
              src="/sachitech-logo.png"
              alt="SachITech Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}