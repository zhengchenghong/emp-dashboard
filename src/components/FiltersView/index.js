/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { CustomSelectBox } from '@app/components/Custom';
import StatesList from '@app/constants/states.json';
import graphql from '@app/graphql';
import { useLazyQuery } from '@apollo/client';
import { useFilterContext } from '@app/providers/FilterContext';
import { useUserContext } from '@app/providers/UserContext';
import useStyles from './style';
import { usePaginationContext } from '@app/providers/Pagination';
import { useHistory } from 'react-router-dom';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';
import { Cookies } from 'react-cookie';
import { en } from '@app/language';
import { useMenuContext } from '@app/providers/MenuContext';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';

const FiltersView = ({ showOnlyFilters }) => {
  const classes = useStyles();
  const pathName = window.location.pathname;
  const [currentUser] = useUserContext();
  const {
    filterStateValue,
    setFilterStateValue,
    filteredStationList,
    setFilteredStationList,
    filteredStationId,
    setFilteredStationId,
    filteredDistrictId,
    setFilteredDistrictId,
    filteredDistrictList,
    setFilteredDistrictList,
    districts,
    setDistricts,
    setCurrentSelectedType,
    currentSelectedType,
    stations,
    userDataforStations,
    userDataforDistricts,
    filtersReset,
    validStations,
    setValidStations
  } = useFilterContext();
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const [updateStationWithAllState, setUpdateStationWithAllState] =
    useState(false);
  const isSmallScreen = useSmallScreen();
  const [
    classVariables,
    setClassVariables,
    classWithoutAuthorVariables,
    setClassWithoutAuthorVariables
  ] = usePaginationContext();
  const history = useHistory();

  const userInfo = currentUser || null;

  const [
    getAllDistricts,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const [
    getValidStations,
    { loading: stationsLoading, data: stationsData, error: stationsError }
  ] = useLazyQuery(graphql.queries.allStations, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (stations) {
      setStationLoadedData(stations);
    }
  }, [stations]);

  useEffect(async () => {
    if (districts == null || districts.length === 0) {
      await getAllDistricts({
        variables: {
          schemaType: 'district',
          offset: null,
          limit: null
        }
      });
    }
    await getValidStations();
  }, []);

  useEffect(async () => {
    if (pathName.includes('/materials') && !validStations?.length) {
      await getValidStations();
    }
  }, [pathName]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      const districtList = [];
      grouping.map((item) =>
        districtList.push({ ...item, label: item['name'], value: item['_id'] })
      );
      setDistricts(districtList);
      setFilteredDistrictList(
        districtList.map((item) => ({
          label: item['name'],
          value: item['_id']
        }))
      );
    }
  }, [districtLoading, districtError, districtData]);

  useEffect(() => {
    if (stationsData && !stationsLoading && !stationsError) {
      setValidStations(
        stationsData?.allStations
          ?.slice()
          ?.sort((a, b) => (a.name > b.name ? 1 : -1))
      );
    }
  }, [stationsData, stationsLoading, stationsError]);

  const stateListFromTopology = stationLoadedData
    ?.map((item) => item?.topology?.state)
    ?.filter((item) => item !== null && item?.length > 0);

  const filteredStateList = StatesList.filter((item) =>
    stateListFromTopology.includes(item?.value)
  );

  const handleStateChange = (data) => {
    console.log(data);
    setCurrentSelectedType('state');
    setFilterStateValue(data?.value);
    if (data?.value === 'all') {
      setFilteredDistrictId('all');
      setFilteredStationId('all');
    }
  };

  const handleStationChange = (data) => {
    setCurrentSelectedType('station');
    setFilteredStationId(data?.value);
    if (data?.value === 'all') {
      setFilterStateValue('all');
      setFilteredDistrictId('all');
    }
  };

  const handleDistrictChange = (data) => {
    setCurrentSelectedType('district');
    setFilteredDistrictId(data?.value);
  };

  useEffect(() => {
    if (
      userInfo?.schemaType === 'superAdmin' ||
      userInfo?.schemaType === 'sysAdmin'
    ) {
      if (filterStateValue === 'all' || filterStateValue == null) {
        setClassVariables({
          ...classVariables,
          topology: null,
          stationId: null,
          state: null
        });
        setClassWithoutAuthorVariables({
          ...classWithoutAuthorVariables,
          topology: null,
          stationId: null,
          state: null
        });
      } else {
        if (!updateStationWithAllState) {
          setClassVariables({
            ...classVariables,
            topology: { state: filterStateValue },
            state: filterStateValue,
            stationId: null
          });
          setClassWithoutAuthorVariables({
            ...classWithoutAuthorVariables,
            topology: { state: filterStateValue },
            state: filterStateValue,
            stationId: null
          });
        } else {
          setClassVariables({
            ...classVariables,
            topology: { state: filterStateValue },
            state: filterStateValue
          });
          setClassWithoutAuthorVariables({
            ...classWithoutAuthorVariables,
            topology: { state: filterStateValue },
            state: filterStateValue
          });
        }
        setUpdateStationWithAllState(false);
      }
    }
  }, [filterStateValue]);

  useEffect(() => {
    if (
      userInfo?.schemaType === 'superAdmin' ||
      userInfo?.schemaType === 'sysAdmin'
    ) {
      if (filteredStationId === 'all') {
        if (filterStateValue === 'all' || filterStateValue == null) {
          setClassVariables({
            ...classVariables,
            topology: null,
            stationId: null,
            state: null
          });
          setClassWithoutAuthorVariables({
            ...classWithoutAuthorVariables,
            topology: null,
            stationId: null,
            state: null
          });
        } else {
          setClassVariables({
            ...classVariables,
            stationId: null,
            topology: {
              ...classVariables?.topology,
              station: null
            }
          });
          setClassWithoutAuthorVariables({
            ...classWithoutAuthorVariables,
            stationId: null,
            topology: {
              ...classWithoutAuthorVariables?.topology,
              station: null
            }
          });
        }
      } else {
        setClassVariables({
          ...classVariables,
          stationId: filteredStationId,
          topology: {
            ...classVariables.topology,
            station: filteredStationId
          }
        });
        setClassWithoutAuthorVariables({
          ...classWithoutAuthorVariables,
          stationId: filteredStationId,
          topology: {
            ...classWithoutAuthorVariables.topology,
            station: filteredStationId
          }
        });
      }
    }
  }, [filteredStationId]);

  useEffect(() => {
    if (filteredDistrictId && filteredDistrictId !== 'all') {
      const dist = districts.find((item) => item._id === filteredDistrictId);
      if (dist && filteredStationId !== dist.parentId) {
        setFilteredStationId(dist.parentId);
        setFilterStateValue(dist?.topology?.state);
      }
    }

    if (
      userInfo?.schemaType === 'superAdmin' ||
      userInfo?.schemaType === 'sysAdmin'
    ) {
      if (filteredDistrictId === 'all') {
        if (filteredStationId === 'all') {
          if (filterStateValue === 'all' || filterStateValue == null) {
            setClassVariables({
              ...classVariables,
              topology: null,
              stationId: null,
              districtId: null,
              state: null
            });
            setClassWithoutAuthorVariables({
              ...classWithoutAuthorVariables,
              topology: null,
              districtId: null,
              stationId: null,
              state: null
            });
          } else {
            setClassVariables({
              ...classVariables,
              districtId: null,
              stationId: null,
              topology: {
                ...classVariables?.topology,
                station: null
              }
            });
            setClassWithoutAuthorVariables({
              ...classWithoutAuthorVariables,
              districtId: null,
              stationId: null,
              topology: {
                ...classWithoutAuthorVariables?.topology,
                station: null
              }
            });
          }
        } else {
          setClassVariables({
            ...classVariables,
            districtId: null,
            stationId: filteredStationId,
            topology: {
              ...classVariables.topology,
              station: filteredStationId
            }
          });
          setClassWithoutAuthorVariables({
            ...classWithoutAuthorVariables,
            districtId: null,
            stationId: filteredStationId,
            topology: {
              ...classWithoutAuthorVariables.topology,
              station: filteredStationId
            }
          });
        }
      } else {
        setClassVariables({
          ...classVariables,
          districtId: filteredDistrictId,
          topology: {
            ...classVariables.topology,
            district: filteredDistrictId
          }
        });
        setClassWithoutAuthorVariables({
          ...classWithoutAuthorVariables,
          districtId: filteredDistrictId,
          topology: {
            ...classWithoutAuthorVariables.topology,
            district: filteredDistrictId
          }
        });
      }
    }
  }, [filteredDistrictId]);

  const isValidStation = (station) => {
    const stations = validStations?.map((item) => item.topology.station) || [];
    return stations.includes(station);
  };

  useEffect(() => {
    let filteredStations = [];
    if (pathName.includes('/materials')) {
      filteredStations = validStations
        ?.filter((item) => {
          return filterStateValue === 'all' || filterStateValue == null
            ? true
            : item.topology?.state === filterStateValue;
        })
        .map((item) => {
          return {
            label: item.name,
            value: item._id
          };
        });
    } else {
      filteredStations = stationLoadedData
        ?.filter((item) => {
          if (pathName.includes('/materials')) {
            return filterStateValue === 'all' || filterStateValue == null
              ? isValidStation(item._id)
              : item.topology?.state === filterStateValue;
          }
          return filterStateValue === 'all' || filterStateValue == null
            ? true
            : item.topology?.state === filterStateValue;
        })
        .map((item) => {
          return {
            label: item.name,
            value: item._id
          };
        })
        .sort((a, b) => (a.label > b.label ? 1 : -1));
    }

    if (
      history.location.pathname.includes('users') &&
      userDataforStations.length > 0
    ) {
      const filterdStation = filteredStations.filter((el) => {
        let aaaa = false;
        for (let i = 0; i < userDataforStations.length; i++) {
          if (el.value === userDataforStations[i]?.topology?.station) {
            aaaa = true;
          }
        }
        return aaaa ? true : false;
      });

      setFilteredStationList(filterdStation);
    } else {
      if (
        history.location.pathname.includes('users') &&
        (userDataforStations == null || userDataforStations.length === 0)
      ) {
        setFilteredStationList([]);
      } else {
        setFilteredStationList(filteredStations);
      }
    }

    // setFilteredStationList(filteredStion);
    if (
      userInfo?.schemaType === 'educator' ||
      userInfo?.schemaType === 'schoolAdmin'
    ) {
      if (stationLoadedData) {
        let userStationID =
          userInfo.topology && userInfo.topology?.station
            ? userInfo.topology?.station
            : null;
        if (userStationID) {
          const station = stationLoadedData.find(
            (item) => item._id === userStationID
          );
          setFilterStateValue(station?.topology?.state);
          setFilteredStationId(station?._id);
        } else {
          if (userInfo?.schemaType === 'districtAdmin' && districts) {
            let userDistrictId =
              userInfo.topology && userInfo.topology?.district
                ? userInfo.topology?.district
                : userInfo.parentId;
            if (userDistrictId) {
              const userDistrict = districts.find(
                (el) => el._id === userDistrictId
              );
              if (userDistrict) {
                const station = stationLoadedData.find(
                  (item) => item._id === userDistrict.topology?.station
                );
                setFilterStateValue(station?.topology?.state);
                setFilteredStationId(station?._id);
              }
            }
          }
        }

        let userDistrictId =
          userInfo.topology && userInfo.topology?.district
            ? userInfo.topology?.district
            : userInfo.parentId;
        if (userDistrictId) {
          setFilteredDistrictId(userDistrictId);
        }
      }
    } else {
      const station = filteredStations.find(
        (item) => item.value === filteredStationId
      );
      if (!station) {
        setFilteredStationId('all');
      }
    }
  }, [
    userInfo,
    validStations,
    filterStateValue,
    stationLoadedData,
    districts,
    userDataforStations,
    userDataforDistricts
  ]);
  useEffect(() => {
    if (pathName.includes('/materials')) {
      validStations
        ?.filter((item) => {
          return filterStateValue === 'all' || filterStateValue == null
            ? true
            : item.topology?.state === filterStateValue;
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((item) => {
          return {
            label: item.name,
            value: item._id
          };
        });
    } else {
      setFilteredStationList(
        stationLoadedData
          ?.filter((item) => {
            return filterStateValue === 'all' || filterStateValue == null
              ? true
              : item.topology?.state === filterStateValue;
          })
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .map((item) => {
            return {
              label: item.name,
              value: item._id
            };
          })
      );
    }

    setFilteredDistrictList(
      districts
        ?.filter((item) =>
          filteredStationList.map((item) => item.value).includes(item.parentId)
        )
        .map((item) => ({ ...item, label: item['name'], value: item['_id'] }))
    );
  }, [filtersReset]);

  useEffect(() => {
    if (districts) {
      let ftDistricts = [];
      if (filteredStationId === 'all') {
        ftDistricts = districts
          .filter((item) =>
            filteredStationList
              .map((item) => item.value)
              .includes(item.parentId)
          )
          .map((item) => ({ label: item['name'], value: item['_id'] }));
      } else {
        ftDistricts = districts
          .filter((item) => item.topology?.station === filteredStationId)
          .map((item) => ({ label: item['name'], value: item['_id'] }));
      }

      if (
        history.location.pathname.includes('users') &&
        userDataforDistricts.length > 0
      ) {
        const filterdStation = ftDistricts.filter((el) => {
          let aaaa = false;
          for (let i = 0; i < userDataforDistricts.length; i++) {
            if (el.value === userDataforDistricts[i]?.topology?.district) {
              aaaa = true;
            }
          }
          return aaaa ? true : false;
        });

        setFilteredDistrictList(filterdStation);
      } else {
        setFilteredDistrictList(ftDistricts);
      }
    }

    if (filterStateValue === 'all' && filteredStationId !== 'all') {
      if (currentSelectedType === 'station') {
        const station = stationLoadedData.find(
          (item) => item._id === filteredStationId
        );
        if (station) {
          setFilterStateValue(station.topology?.state);
          setUpdateStationWithAllState(true);
        }
      }
    }
  }, [
    filteredStationId,
    filteredStationList,
    userDataforStations,
    userDataforDistricts
  ]);

  useEffect(() => {
    if (filteredDistrictList) {
      const distIds = filteredDistrictList.map((item) => item.value);
      if (!distIds.includes(filteredDistrictId)) {
        setFilteredDistrictId('all');
      }
    }
  }, [filteredDistrictList]);

  return (
    <Box
      className={classes.root}
      style={
        showOnlyFilters && {
          justifyContent: 'center',
          paddingRight: 3,
          paddingLeft: 3
        }
      }
    >
      {((isSmallScreen && showOnlyFilters) || !isSmallScreen) &&
        pathName.includes('/topology') && (
          <div
            className={classes.topologyContainer}
            style={{
              justifyContent: showOnlyFilters ? 'space-between' : 'flex-start'
            }}
          >
            {!(
              userInfo?.schemaType === 'stationAdmin' ||
              userInfo?.schemaType === 'districtAdmin' ||
              userInfo?.schemaType === 'educator' ||
              userInfo?.schemaType === 'schoolAdmin'
            ) && (
              <>
                <CustomSelectBox
                  variant="outlined"
                  addMarginTop={true}
                  style={
                    showOnlyFilters
                      ? classes.selectFilterMobile
                      : classes.selectFilter
                  }
                  value={filterStateValue ? filterStateValue : 'all'}
                  resources={[
                    { label: 'All States', value: 'all' },
                    ...filteredStateList
                  ]}
                  onChange={handleStateChange}
                  size="small"
                  disabled={
                    userInfo?.schemaType === 'stationAdmin' ||
                    userInfo?.schemaType === 'districtAdmin' ||
                    userInfo?.schemaType === 'educator' ||
                    userInfo?.schemaType === 'schoolAdmin'
                      ? true
                      : false
                  }
                  limitWidth
                />
                <CustomSelectBox
                  variant="outlined"
                  addMarginTop={true}
                  style={
                    showOnlyFilters
                      ? classes.selectFilterMobile
                      : classes.selectFilter
                  }
                  value={filteredStationId ? filteredStationId : 'all'}
                  resources={[
                    { label: en['All Stations'], value: 'all' },
                    ...filteredStationList
                  ]}
                  onChange={handleStationChange}
                  size="small"
                  disabled={
                    userInfo?.schemaType === 'stationAdmin' ||
                    userInfo?.schemaType === 'districtAdmin' ||
                    userInfo?.schemaType === 'educator' ||
                    userInfo?.schemaType === 'schoolAdmin'
                      ? true
                      : false
                  }
                  limitWidth
                />
              </>
            )}
            {!(
              userInfo?.schemaType === 'districtAdmin' ||
              userInfo?.schemaType === 'educator' ||
              userInfo?.schemaType === 'schoolAdmin'
            ) && (
              <CustomSelectBox
                variant="outlined"
                addMarginTop={true}
                style={
                  showOnlyFilters
                    ? classes.selectFilterMobile
                    : classes.selectFilter
                }
                value={
                  filteredDistrictId?.length > 0 ? filteredDistrictId : 'all'
                }
                resources={[
                  { label: 'All Districts', value: 'all' },
                  ...filteredDistrictList
                ]}
                onChange={handleDistrictChange}
                size="small"
                disabled={
                  userInfo?.schemaType === 'stationAdmin' ||
                  userInfo?.schemaType === 'districtAdmin' ||
                  userInfo?.schemaType === 'educator' ||
                  userInfo?.schemaType === 'schoolAdmin'
                    ? true
                    : false
                }
                limitWidth
              />
            )}
          </div>
        )}

      {((isSmallScreen && showOnlyFilters) || !isSmallScreen) &&
        pathName.includes('/materials') && (
          <div style={{ display: 'flex' }}>
            {(userInfo?.schemaType === 'sysAdmin' ||
              userInfo.schemaType === 'superAdmin') && (
              <div className={classes.topologyContainer}>
                <CustomSelectBox
                  variant="outlined"
                  addMarginTop={true}
                  style={
                    showOnlyFilters
                      ? classes.selectFilterMobile
                      : classes.selectFilter
                  }
                  value={
                    filterStateValue?.length > 0 ? filterStateValue : 'all'
                  }
                  resources={[
                    { label: 'All States', value: 'all' },
                    ...filteredStateList
                  ]}
                  onChange={handleStateChange}
                  size="small"
                  disabled={
                    userInfo?.schemaType === 'districtAdmin' ||
                    userInfo?.schemaType === 'schoolAdmin'
                      ? true
                      : false
                  }
                  limitWidth
                />
                <CustomSelectBox
                  variant="outlined"
                  addMarginTop={true}
                  style={
                    showOnlyFilters
                      ? classes.selectFilterMobile
                      : classes.selectFilter
                  }
                  value={filteredStationId ? filteredStationId : 'all'}
                  resources={[
                    { label: en['All Stations'], value: 'all' },
                    ...filteredStationList
                  ]}
                  onChange={handleStationChange}
                  size="small"
                  disabled={
                    userInfo?.schemaType === 'stationAdmin' ||
                    userInfo?.schemaType === 'districtAdmin' ||
                    userInfo?.schemaType === 'educator' ||
                    userInfo?.schemaType === 'schoolAdmin'
                      ? true
                      : false
                  }
                  limitWidth
                />
                <CustomSelectBox
                  variant="outlined"
                  addMarginTop={true}
                  style={
                    showOnlyFilters
                      ? classes.selectFilterMobile
                      : classes.selectFilter
                  }
                  value={
                    filteredDistrictId?.length > 0 ? filteredDistrictId : 'all'
                  }
                  resources={[
                    { label: 'All Districts', value: 'all' },
                    ...filteredDistrictList
                  ]}
                  onChange={handleDistrictChange}
                  size="small"
                  disabled={
                    userInfo?.schemaType === 'districtAdmin' ||
                    userInfo?.schemaType === 'educator' ||
                    userInfo?.schemaType === 'schoolAdmin'
                      ? true
                      : false
                  }
                  limitWidth
                />
              </div>
            )}
          </div>
        )}
    </Box>
  );
};

export default FiltersView;
