import React from 'react';
import resultContext from './resultContext';

export const ResultContextProvider = ({ children }) => {
  const [results, setResults] = React.useState([]);

  return (
    <resultContext.Provider value={{ results, setResults }}>
      {children}
    </resultContext.Provider>
  );
}