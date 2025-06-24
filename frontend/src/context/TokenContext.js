// src/context/TokenContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/tokens/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(data.balance);
    } catch (err) {
      console.error('❌ Error al obtener el balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <TokenContext.Provider value={{ balance, refreshBalance: fetchBalance }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
