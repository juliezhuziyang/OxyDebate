
import { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export const AuthModal = ({ onClose, onLogin }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    onLogin();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Join Debate Arena'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <User size={16} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Mail size={16} />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Lock size={16} />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 debate-gradient text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
