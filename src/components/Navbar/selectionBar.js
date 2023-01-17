/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Box, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import graphql from '@app/graphql';
import useStyles from './style';
import { getDisplayName } from '@app/utils/functions';

const SelectionBar = () => {
  const classes = useStyles();
  const [stationLoadedData, setStationLoadedData] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const [stationValue, setStationValue] = useState(null);
  const [districtValue, setDistrictValue] = useState(null);
  const [schoolValue, setSchoolValue] = useState(null);

  const [
    getStation,
    { loading: stationLoading, data: stationData, error: stationError }
  ] = useLazyQuery(graphql.queries.StationGrouping);

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const [
    getDistrict,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const stationVariables = {
    id: null,
    schemaType: 'station',
    offset: null,
    name: null
  };

  const districtVariables = {
    id: null,
    schemaType: 'district',
    parentId: stationValue?._id
  };

  const schoolVariables = {
    id: null,
    schemaType: 'school',
    parentId: districtValue?._id,
    offset: null,
    name: null
  };

  const fetchStation = async () => {
    await getStation({
      variables: stationVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchSchool = async () => {
    await getSchool({
      variables: schoolVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchDistrict = async () => {
    await getDistrict({
      variables: districtVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (stationValue) {
      fetchDistrict();
    } else {
      setDistrictLoadedData([]);
      setSchoolLoadedData([]);
    }
  }, [stationValue]);

  useEffect(() => {
    if (districtValue) {
      fetchSchool();
    } else {
      setSchoolLoadedData([]);
    }
  }, [districtValue]);

  useEffect(() => {
    if (!stationLoading && !stationError && stationData) {
      const { grouping } = stationData;
      setStationLoadedData([{ name: 'All' }, ...grouping]);
    }
  }, [stationLoading, stationError, stationData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      setDistrictLoadedData([{ name: 'All' }, ...grouping]);
    }
  }, [districtLoading, districtError, districtData]);

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      setSchoolLoadedData([{ name: 'All' }, ...grouping]);
    }
  }, [schoolLoading, schoolError, schoolData]);

  const handleOpen = (event) => {
    fetchStation();
  };

  return (
    <Box className={classes.selectBar}>
      <Grid
        spacing={2}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item sm={12} md={12} lg={4}>
          <Autocomplete
            className={classes.formControl}
            id="stations"
            options={stationLoadedData}
            getOptionLabel={(option) => getDisplayName(option.name)}
            value={stationValue}
            onChange={(event, newValue) => {
              setStationValue(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select a station" />
            )}
            onOpen={(event) => handleOpen(event)}
          />
        </Grid>
        <Grid item sm={12} md={12} lg={4}>
          <Autocomplete
            className={classes.formControl}
            id="districts"
            options={districtLoadedData}
            getOptionLabel={(option) => getDisplayName(option.name)}
            value={districtValue}
            onChange={(event, newValue) => {
              setDistrictValue(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select a district" />
            )}
          />
        </Grid>
        <Grid item sm={12} md={12} lg={4}>
          <Autocomplete
            className={classes.formControl}
            id="school"
            options={schoolLoadedData}
            getOptionLabel={(option) => getDisplayName(option.name)}
            value={schoolValue}
            onChange={(event, newValue) => {
              setSchoolValue(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select a school" />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelectionBar;
