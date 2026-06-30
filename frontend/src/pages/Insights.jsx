import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { SparklesIcon, LightBulbIcon, PresentationChartLineIcon, ChartBarSquareIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Insights = () => {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { formatCurrency, currency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, trendsRes, suggestionsRes, predictionRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analytics/personality', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/analytics/trends', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/analytics/suggestions', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/analytics/prediction', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setProfile(profileRes.data);
        setTrends(trendsRes.data);
        setSuggestions(suggestionsRes.data.suggestions);
        setPrediction(predictionRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg border border-gray-700 shadow-xl">
          <p className="font-semibold">{label}</p>
          <p className="text-brand-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analytics & Insights</h1>
      
      {/* Personality Card */}
      <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl shadow-xl p-8 sm:p-10 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-700"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <SparklesIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
              <h2 className="text-lg font-medium text-brand-100 uppercase tracking-widest">Your Financial Persona</h2>
            </div>
            <p className="text-5xl font-extrabold tracking-tight mt-2 drop-shadow-md">{profile?.type || 'Unknown'}</p>
            <p className="mt-4 max-w-xl text-lg text-brand-50">
              {profile?.type === 'Saver' && "You have a strong instinct to preserve wealth. You prioritize future security over present gratification."}
              {profile?.type === 'Spender' && "You enjoy the fruits of your labor! You prefer to experience life now, though balancing it with savings could be beneficial."}
              {profile?.type === 'Investor' && "You're focused on making your money work for you. Growth and assets are your primary drivers."}
              {profile?.type === 'Balanced' && "You have achieved harmony between enjoying today and preparing for tomorrow."}
              {profile?.type === 'Unknown' && "We need more expense data to calculate your persona. Start logging expenses!"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Historical Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PresentationChartLineIcon className="w-6 h-6 text-brand-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">6-Month Spending Trend</h3>
          </div>
          <div className="h-72">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')} />
                  <Tooltip cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No historical data available.
              </div>
            )}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Suggestions</h3>
          </div>
          <ul className="flex-1 space-y-4">
            {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {suggestion}
                </p>
              </li>
            )) : (
              <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                Log more expenses to generate AI suggestions.
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Prediction & Forecasting Section */}
      {prediction && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ChartBarSquareIcon className="w-6 h-6 text-brand-500" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Future Forecast & Savings Plan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-brand-50 dark:bg-gray-700/50 rounded-xl p-6 border border-brand-100 dark:border-gray-600 flex flex-col justify-center items-center text-center">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Predicted Spend (Next Month)</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(prediction.predictedTotal)}</span>
                <ArrowTrendingUpIcon className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm mt-3 text-gray-600 dark:text-gray-300">
                Based on your historical average and current velocity.
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Alert</span>
                Top Projected Category: {prediction.topCategory}
              </h4>
              <ul className="space-y-3">
                {prediction.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {profile && profile.type !== 'Unknown' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {['Saver', 'Spender', 'Investor'].map((type) => {
            const score = profile.scores[`${type.toLowerCase()}Score`] || 0;
            return (
              <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transform transition duration-500 hover:-translate-y-1 hover:shadow-md">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{type} Score</h4>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(score)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                  <div className={`h-2 rounded-full ${type === 'Saver' ? 'bg-green-500' : type === 'Spender' ? 'bg-pink-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(score, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Insights;
