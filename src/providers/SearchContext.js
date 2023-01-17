import React, { useState, useContext } from 'react';

const SearchContext = React.createContext(null);
SearchContext.displayName = 'SearchContext';

const SearchContextProvider = ({ ...props }) => {
  const [openSearch, setOpenSearch] = useState(false);
  const [openLessonSearch, setOpenLessonSearch] = useState(false);
  const [openLessonNameSearch, setOpenLessonNameSearch] = useState(false);
  const [searchChildren, setSearchChildren] = useState(false);
  const [searchClassId, setSearchClassId] = useState(false);

  const value = {
    openSearch,
    setOpenSearch,
    openLessonSearch,
    setOpenLessonSearch,
    openLessonNameSearch,
    setOpenLessonNameSearch,
    searchChildren,
    setSearchChildren,
    searchClassId,
    setSearchClassId
  };

  return <SearchContext.Provider value={value} {...props} />;
};

const useSearchContext = () => {
  return useContext(SearchContext);
};

export { SearchContextProvider, useSearchContext };
