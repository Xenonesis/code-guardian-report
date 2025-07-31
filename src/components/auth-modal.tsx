// components/auth-modal.tsx
import React, { useState } from "react";
import { useAuth } from "../lib/auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithEmailAndPassword, createUser, signInWithGoogle } =
    useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
    setError("");

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
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2f] rounded-xl p-8 w-full max-w-md mx-4 shadow-lg border border-[#2e2e40]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Sign In" : "Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a3d] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a3d] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a3d] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1e1e2f] text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600  to-blue-500 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!loading && (
              <svg
                className="w-5 h-5"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101h146.9c-6.3 34.2-25 63.2-53.4 82.6l86.2 66.9c50.3-46.4 81.8-114.7 81.8-196.9z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c72.9 0 134-24.2 178.6-65.5l-86.2-66.9c-23.9 16-54.4 25.3-92.4 25.3-71 0-131.3-47.9-152.9-112.1H28.2v70.6c44.7 88.1 136.1 148.6 243.8 148.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M119.1 324.9c-10.6-31.3-10.6-64.7 0-96l-70.9-70.6C17.4 210.5 0 247.3 0 287.1c0 39.8 17.4 76.6 48.2 128.8l70.9-70.6z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.7c39.6 0 75.3 13.6 103.4 40.3l77.4-77.4C406 24.4 344.9 0 272 0 164.2 0 72.9 60.6 28.2 148.6l70.9 70.6c21.6-64.2 81.9-111.5 152.9-111.5z"
                />
              </svg>
            )}
            {loading ? "Loading..." : "Continue with Google"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
