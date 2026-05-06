import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { loginApi } from '../../api/authapi'; // ✅ NEW

interface LoginFormProps {
  onLogin: (user: any) => void;
  onForgotPassword: () => void;
  error?: string;
}

export function LoginForm({ onLogin, onForgotPassword }: LoginFormProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🔥 ROLE MAPPING
  const mapRole = (role: string) => {
    if (role === "ADMIN") return "super_admin";
    if (role === "MANAGER") return "manager";
    if (role === "TRAINER") return "trainer";
    return "student";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await loginApi(email, password);

      localStorage.setItem("token", res.token);

      const user = {
        email: res.email,
        role: mapRole(res.role),
      };

      localStorage.setItem("currentUser", JSON.stringify(user));

      onLogin(user);

    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <img
                src="/sachitech-logo.png"
                alt="SachITech Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  required
                />
              </div>
            </div>

            <button className="w-full bg-sachiblue text-white py-3 rounded-lg">
              Sign In
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}