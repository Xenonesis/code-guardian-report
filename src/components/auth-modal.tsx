// components/auth-modal.tsx
import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithEmailAndPassword, createUser, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(email, password);
      } else {
        await createUser(email, password, displayName);
      }
      onClose();
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onClose();
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-gradient-to-b from-[#121829] to-[#1E293B] text-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[#2A3B5F]">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white text-xl font-bold"
      >
        ×
      </button>
    </div>

    {error && (
      <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4 text-sm">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
            required={!isLogin}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
      </button>
    </form>

    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#1E293B] text-gray-400">Or</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-pink-600 text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Continue with Google'}
      </button>
    </div>

    <div className="mt-6 text-center">
      <button
        onClick={toggleMode}
        className="text-sm text-blue-400 hover:underline"
      >
        {isLogin 
          ? "Don't have an account? Sign up" 
          : "Already have an account? Sign in"
        }
      </button>
    </div>
  </div>
</div>

  );
};