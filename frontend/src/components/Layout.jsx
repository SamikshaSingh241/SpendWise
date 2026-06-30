import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { HomeIcon, LightBulbIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon, FireIcon } from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Insights', href: '/insights', icon: LightBulbIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-50 transition-colors duration-300 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-500">SpendWise</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      location.pathname === item.href
                        ? 'border-brand-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600',
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors'
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Hello, {user?.username}</span>
              
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 border-none focus:ring-0 cursor-pointer outline-none"
              >
                {currencies.map(c => (
                  <option key={c} value={c} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">{c}</option>
                ))}
              </select>

              <div className="flex items-center space-x-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800/50" title={`Financial Discipline Streak: Stay under budget to keep your streak! Longest: ${user?.longestStreak || 0}`}>
                {user?.currentStreak > 0 ? (
                  <FireIconSolid className="w-5 h-5 text-orange-500 animate-pulse" />
                ) : (
                  <FireIcon className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm font-bold ${user?.currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                  {user?.currentStreak || 0}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="rounded-full bg-gray-100 dark:bg-gray-700 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              >
                {isDarkMode ? <SunIcon className="h-6 w-6" aria-hidden="true" /> : <MoonIcon className="h-6 w-6" aria-hidden="true" />}
              </button>
              <button
                onClick={logout}
                className="rounded-full bg-gray-100 dark:bg-gray-700 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
