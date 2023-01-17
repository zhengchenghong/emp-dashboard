import React, { useState, useContext } from 'react';

const ErrorContext = React.createContext(null);
ErrorContext.displayName = 'ErrorContext';

const ErrorContextProvider = ({ ...props }) => {
  const [errors, setErrors] = useState({
    user: { error: true, helperText: 'required' },
    phone: { error: true, helperText: 'required' }
  });

  const value = [errors, setErrors];

  return <ErrorContext.Provider value={value} {...props} />;
};

const useErrorContext = () => {
  return useContext(ErrorContext);
};

export { ErrorContextProvider, useErrorContext };
