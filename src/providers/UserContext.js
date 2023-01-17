import React, { useState, useContext } from 'react';
const UserContext = React.createContext(null);
UserContext.displayName = 'ErrorContext';

const UserContextProvider = ({ ...props }) => {
  const [state, setState] = useState();
  const [status, setStatus] = useState(true);
  const [currentPage, setCurrentPage] = useState();
  const [userFirstName, setUserFirstName] = useState();
  const [userLastName, setUserLastName] = useState();
  const [currentUserRole, setCurrentUserRole] = useState();
  const [userAvarUrl, setUserAvatarUrl] = useState();

  const value = [
    state,
    setState,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    userFirstName,
    setUserFirstName,
    userLastName,
    setUserLastName,
    currentUserRole,
    setCurrentUserRole,
    userAvarUrl,
    setUserAvatarUrl
  ];

  return <UserContext.Provider value={value} {...props} />;
};

const useUserContext = () => {
  return useContext(UserContext);
};

export { UserContextProvider, useUserContext, UserContext };
