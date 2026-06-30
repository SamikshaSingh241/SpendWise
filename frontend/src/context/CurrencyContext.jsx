import { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

// Base currency is INR
const rates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const symbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatCurrency = (amount) => {
    const converted = amount * rates[currency];
    return `${symbols[currency]}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, symbols, currencies: Object.keys(rates) }}>
      {children}
    </CurrencyContext.Provider>
  );
};
