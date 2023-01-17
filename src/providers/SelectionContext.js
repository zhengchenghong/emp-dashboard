import React, { useContext, useState } from 'react';

const SelectionContext = React.createContext(null);
SelectionContext.displayName = 'SelectionContext';

const SelectionContextProvider = ({ ...props }) => {
  const [nextSelected, setNextSelected] = useState();
  const [showRoot, setShowRoot] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState();
  const [isLastTab, setIsLastTab] = useState(false);
  const [selectFirstOnInfo, setSelectFirstOnInfo] = useState(false);
  const [focusFirstAction, setFocusFirstAction] = useState(false);
  const [newTopologyCreated, setNewTopologyCreated] = useState(false);

  const value = {
    nextSelected,
    setNextSelected,
    showRoot,
    setShowRoot,
    documentCreateError,
    setDocumentCreateError,
    isLastTab,
    setIsLastTab,
    selectFirstOnInfo,
    setSelectFirstOnInfo,
    focusFirstAction,
    setFocusFirstAction,
    newTopologyCreated,
    setNewTopologyCreated
  };

  return <SelectionContext.Provider value={value} {...props} />;
};

const useSelectionContext = () => {
  return useContext(SelectionContext);
};

export { SelectionContextProvider, useSelectionContext };
