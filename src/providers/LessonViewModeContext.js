import React, { useState, useContext, useEffect } from 'react';

const LessonViewModeContext = React.createContext(null);
LessonViewModeContext.displayName = 'LessonViewModeContext';

const LessonViewModeContextProvider = ({ ...props }) => {
  const [lessonViewMode, setLessonViewMode] = useState();
  const [selectedClassItem, setSelectedClassItem] = useState([]);

  useEffect(() => {
    let lvMode = localStorage.getItem('lessonViewMode') || 'List View';
    setLessonViewMode(lvMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('lessonViewMode', lessonViewMode);
  }, [lessonViewMode]);

  const value = {
    lessonViewMode,
    setLessonViewMode,
    selectedClassItem,
    setSelectedClassItem
  };

  return <LessonViewModeContext.Provider value={value} {...props} />;
};

const useLessonViewModeContext = () => {
  return useContext(LessonViewModeContext);
};

export { LessonViewModeContextProvider, useLessonViewModeContext };
