import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Left Panel: Branding & Value Prop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12 text-white w-full">
          <div className="flex items-center space-x-3 mb-8">
            <SparklesIcon className="w-10 h-10 text-brand-300" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">SpendWise</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Discover your true <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-indigo-200">financial persona.</span>
          </h2>
          <p className="text-xl text-indigo-100 max-w-lg mb-10 leading-relaxed">
            Track expenses seamlessly, set ambitious goals, and uncover the psychology behind your spending habits.
          </p>
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-indigo-800" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt="Avatar" />
              ))}
            </div>
            <p className="text-sm font-medium text-indigo-100">Join 10,000+ users tracking their finances.</p>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 xl:px-24 relative">
        <button 
          onClick={toggleTheme} 
          className="absolute top-8 right-8 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>

        <div className="w-full max-w-sm mx-auto">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 text-center">{error}</div>}
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-colors duration-200 border"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-colors duration-200 border"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transform transition hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
