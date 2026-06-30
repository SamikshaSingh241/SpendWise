import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const GoalsSection = () => {
  const [goals, setGoals] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  const fetchGoals = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/goals', { headers: { Authorization: `Bearer ${user.token}` } });
      setGoals(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/goals', { title: newTitle, targetAmount: Number(newAmount) }, { headers: { Authorization: `Bearer ${user.token}` } });
      setNewTitle('');
      setNewAmount('');
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mt-6 transition-all hover:shadow-xl">
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white mb-4">Savings Goals</h3>
      
      <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input 
          type="text" 
          placeholder="Goal Title" 
          required 
          value={newTitle} 
          onChange={e => setNewTitle(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 border"
        />
        <input 
          type="number" 
          placeholder="Target Amount" 
          required 
          value={newAmount} 
          onChange={e => setNewAmount(e.target.value)}
          className="w-full sm:w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 border"
        />
        <button type="submit" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors">Add</button>
      </form>

      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal._id} className="relative pt-1 group">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-brand-600 bg-brand-200 dark:text-brand-200 dark:bg-brand-900">
                    {goal.title}
                  </span>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <span className="text-xs font-semibold inline-block text-brand-600 dark:text-brand-400">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                  <button onClick={() => handleDelete(goal._id)} className="text-red-500 text-xs hover:text-red-700 hidden group-hover:block transition-colors">Remove</button>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-brand-200 dark:bg-brand-900">
                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-500 transition-all duration-500"></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default GoalsSection;
