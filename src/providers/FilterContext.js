import React, { useState, useContext, useEffect } from 'react';
const FilterContext = React.createContext(null);
FilterContext.displayName = 'FilterContext';

const FilterContextProvider = ({ ...props }) => {
  const [filterStateValue, setFilterStateValue] = useState('all');
  const [filteredStationList, setFilteredStationList] = useState([]);
  const [filteredStationId, setFilteredStationId] = useState('all');
  const [filteredDistrictList, setFilteredDistrictList] = useState([]);
  const [filteredDistrictId, setFilteredDistrictId] = useState('all');
  //distrct, state, station
  const [currentSelectedType, setCurrentSelectedType] = useState('');
  const [districts, setDistricts] = useState([]);
  const [stations, setStations] = useState([]);
  const [filtersReset, setFiltersReset] = useState(false);
  const [userDataforStations, setUserDataforStations] = useState([]);
  const [userDataforDistricts, setUserDataforDistricts] = useState([]);
  const [validStations, setValidStations] = useState([]);

  const value = {
    filterStateValue,
    setFilterStateValue,
    filteredStationList,
    setFilteredStationList,
    filteredStationId,
    setFilteredStationId,
    districts,
    setDistricts,
    filteredDistrictId,
    setFilteredDistrictId,
    filteredDistrictList,
    setFilteredDistrictList,
    currentSelectedType,
    setCurrentSelectedType,
    stations,
    setStations,
    userDataforStations,
    setUserDataforStations,
    userDataforDistricts,
    setUserDataforDistricts,
    filtersReset,
    setFiltersReset,
    validStations,
    setValidStations
  };

  return <FilterContext.Provider value={value} {...props} />;
};

const useFilterContext = () => {
  return useContext(FilterContext);
};

export { FilterContextProvider, useFilterContext, FilterContext };
