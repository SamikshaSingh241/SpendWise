import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import AddExpenseModal from '../components/AddExpenseModal';
import GoalsSection from '../components/GoalsSection';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, CurrencyDollarIcon, PresentationChartLineIcon, TrashIcon } from '@heroicons/react/24/outline';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, updateBudget } = useAuth();
  const { currency, formatCurrency } = useCurrency();

  const fetchData = async () => {
    try {
      const [expRes, distRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5000/api/analytics/distribution', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setExpenses(expRes.data);
      setDistribution(distRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDownload = async (type) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${type}?currency=${currency}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert('Failed to download report.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const topCategory = useMemo(() => {
    if (distribution.length === 0) return 'N/A';
    return distribution.reduce((prev, current) => (prev.total > current.total) ? prev : current)._id;
  }, [distribution]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-500 transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          + New Expense
        </button>
      </div>

      {/* Quick Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <PresentationChartLineIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{topCategory}</p>
          </div>
        </div>

        {/* Budget Progress Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Budget</p>
            <button onClick={() => {
              const newBudget = prompt('Enter your new monthly budget:');
              if (newBudget && !isNaN(newBudget)) updateBudget(Number(newBudget));
            }} className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">Edit</button>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {formatCurrency(totalSpent)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ {formatCurrency(user?.monthlyBudget || 0)}</span>
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-1">
            <div className={`h-2 rounded-full transition-all duration-500 ${totalSpent > (user?.monthlyBudget || 0) && (user?.monthlyBudget || 0) > 0 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.min((totalSpent / (user?.monthlyBudget || 1)) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">Spending Distribution (Last 30 Days)</h3>
          <div className="h-64">
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="_id"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', color: '#fff', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses List with Filtering & Secure Download */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Recent Expenses</h3>
            <div className="flex space-x-2">
              <button onClick={() => handleDownload('csv')} className="inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-1.5 rounded-lg transition-colors">
                <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" /> CSV
              </button>
              <button onClick={() => handleDownload('pdf')} className="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-colors">
                <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" /> PDF
              </button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-gray-50 dark:bg-gray-700/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 transition-all"
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50 h-64 overflow-y-auto pr-2">
              {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                <li key={expense._id} className="py-3.5 flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{expense.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(expense.date).toLocaleDateString()} {expense.description && `- ${expense.description}`}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">{formatCurrency(expense.amount)}</span>
                    <button onClick={() => handleDeleteExpense(expense._id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Delete Expense">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              )) : (
                <li className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No expenses match your search.' : 'No recent expenses. Start tracking!'}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <GoalsSection />

      <AddExpenseModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onAdded={fetchData} />
    </div>
  );
};

export default Dashboard;
