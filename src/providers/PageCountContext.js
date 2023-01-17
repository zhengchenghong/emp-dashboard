import React, { useState, useContext, useEffect } from 'react';

const PageCountContext = React.createContext(null);
PageCountContext.displayName = 'PageCountContext';

const PageCountContextProvider = ({ ...props }) => {
  const [pageCount, setPageCount] = useState(25);
  const [viewMethod, setViewMethod] = useState('List View');

  useEffect(() => {
    let pgCnt = localStorage.getItem('pageCount');
    setPageCount(parseInt(pgCnt || '25'));
  }, []);

  useEffect(() => {
    localStorage.setItem('pageCount', pageCount);
  }, [pageCount]);

  const value = {
    pageCount,
    setPageCount,
    viewMethod,
    setViewMethod
  };

  return <PageCountContext.Provider value={value} {...props} />;
};

const usePageCountContext = () => {
  return useContext(PageCountContext);
};

export { PageCountContextProvider, usePageCountContext };
