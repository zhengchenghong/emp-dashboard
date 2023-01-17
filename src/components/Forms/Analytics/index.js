/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TableContainer,
  Table,
  Typography,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Input,
  InputAdornment
} from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';

import Pagination from '@material-ui/lab/Pagination';
import graphql from '@app/graphql';
import { useQuery, useLazyQuery } from '@apollo/client';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { useStyles, useStylesSearch } from './style';
import './style.css';
import moment from 'moment';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { useMediumScreen } from '@app/utils/hooks';
import {
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
  SearchOutlined
} from '@material-ui/icons';
import UserSearch from '../UserList/Search';

const AnalyticForm = ({
  stationId,
  districtId,
  classId,
  isRoot,
  schemaType,
  resources,
  districtLoadedData,
  stationLoadedData,
  allDistrictResources,
  allSchoolResources,
  schoolLoadedData
}) => {
  const classes = useStyles();
  const mainTable = React.createRef();
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const [value, setValue] = useState(
    localStorage.getItem('analyticsValue') == null
      ? isRoot
        ? 'station'
        : schemaType === 'station'
        ? 'district'
        : schemaType === 'district'
        ? 'school'
        : schemaType === 'school'
        ? 'class'
        : schemaType === 'class'
        ? 'educator'
        : 'station'
      : isRoot
      ? ['material', 'lesson', 'collection'].includes(
          localStorage.getItem('analyticsValue')
        )
        ? 'station'
        : localStorage.getItem('analyticsValue')
      : schemaType === 'station'
      ? ['station', 'tag'].includes(localStorage.getItem('analyticsValue'))
        ? 'district'
        : ['lesson', 'collection'].includes(
            localStorage.getItem('analyticsValue')
          )
        ? 'material'
        : localStorage.getItem('analyticsValue')
      : schemaType === 'district'
      ? ['station', 'district', 'tag'].includes(
          localStorage.getItem('analyticsValue')
        )
        ? 'school'
        : ['lesson', 'collection'].includes(
            localStorage.getItem('analyticsValue')
          )
        ? 'material'
        : localStorage.getItem('analyticsValue')
      : schemaType === 'school'
      ? ['lesson', 'collection', 'material'].includes(
          localStorage.getItem('analyticsValue')
        )
        ? 'material'
        : 'class'
      : ['educator', 'student', 'lesson', 'collection'].includes(
          localStorage.getItem('analyticsValue')
        )
      ? localStorage.getItem('analyticsValue')
      : localStorage.getItem('analyticsValue') === 'material'
      ? 'lesson'
      : 'educator'
  );

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const { pageCount, setPageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(1);
  // const [stationList, setStationList] = useState([]);

  const [createdMaterialsCnt, setCreatedMaterialsCnt] = useState(0);
  const [publishedMaterialsCnt, setPublishedMaterialsCnt] = useState(0);
  const [unpublishedMaterialsCnt, setUnpublishedMaterialsCnt] = useState(0);
  const [totalMaterialsCnt, setTatalMaterialsCnt] = useState(0);
  const lastSelectedValue = localStorage.getItem('analyticsValue');
  const [sortColumn, setSortColumn] = useState({
    column: null,
    direction: null
  });
  const [loadedItems, setLoadedItems] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [columns, setColumns] = useState([]);
  const [totalCountLoadingVariables, setTotalCountLoadingVariables] = useState(
    {}
  );
  const [nameRegExp, setNameRegExp] = useState(null);

  const stationValue = isRoot
    ? null
    : stationId != null
    ? stationId
    : resources?.schemaType === 'station'
    ? resources?._id
    : null;
  const districtValue = isRoot ? null : districtId;
  const classValue = isRoot ? null : classId;

  const [
    getTotalCount,
    { loading: totalCountLoading, error: totalCountError, data: totalCountData }
  ] = useLazyQuery(graphql.queries.totalCount, {
    fetchPolicy: 'no-cache'
  });

  const [
    getMaterialsCounts,
    {
      loading: materialsCountsLoading,
      error: materialsCountsError,
      data: materialsCountsData
    }
  ] = useLazyQuery(graphql.queries.materialsCount, {
    fetchPolicy: 'no-cache'
  });

  const fetchLoadCounts = async (radioValue) => {
    if (
      schemaType === 'class' &&
      (radioValue === 'lesson' || radioValue === 'collection')
    ) {
      const mcVariables = {
        schemaType: 'material',
        topology: {
          station: stationValue,
          district: districtValue,
          school: resources?.topology?.school,
          class: classId == null ? resources?._id : classId
        },
        nameRegExp: nameRegExp,
        type: radioValue
      };
      await getMaterialsCounts({ variables: mcVariables });
    } else if (
      radioValue === 'material' &&
      (schemaType === 'school' ||
        schemaType === 'district' ||
        schemaType === 'station')
    ) {
      const msVariables = {
        schemaType: 'material',
        topology: {
          station: stationValue,
          district:
            schemaType === 'district' || schemaType === 'school'
              ? districtValue
              : null,
          school: schemaType === 'school' ? resources?.topology?.school : null,
          class: null
        },
        nameRegExp: nameRegExp,
        type: 'all'
      };
      await getMaterialsCounts({ variables: msVariables });
    } else {
      await fetchTotalCount(
        radioValue === 'lesson' || radioValue === 'collection'
          ? 'material'
          : radioValue
      );
    }

    if (
      schemaType === 'class' &&
      (radioValue === 'student' || radioValue === 'educator')
    ) {
      let variables = {
        schemaType:
          value === 'lesson' || value === 'collection' ? 'material' : value,
        parentId: districtValue,
        classId: classId == null ? resources?._id : classId,
        nameRegExp: nameRegExp,
        offset: pageCount * (page - 1),
        limit: pageCount
      };
      if (value === 'lesson' || value === 'collection') {
        variables = {
          ...variables,
          type:
            value === 'lesson'
              ? 'lesson'
              : value === 'collection'
              ? 'collection'
              : null
        };
      }
      await fetchMore({ variables });
    } else {
      let variables =
        schemaType !== 'tag'
          ? {
              schemaType:
                value === 'lesson' || value === 'collection'
                  ? 'material'
                  : value,
              topology: {
                station: stationValue,
                district: districtValue,
                school:
                  resources?.schemaType === 'school'
                    ? resources?._id
                    : resources?.topology?.school,
                class: classId && schemaType === 'class' ? resources?._id : null
              },
              parentId: null,
              // stationId: stationValue,
              // districtId: districtValue,
              // schoolId:
              //   resources?.schemaType === 'school'
              //     ? resources?._id
              //     : resources?.topology?.school,
              classId:
                classId && schemaType === 'class' ? resources?._id : null,
              nameRegExp: nameRegExp,
              offset: pageCount * (page - 1),
              limit: pageCount
            }
          : {
              schemaType: 'tag',
              nameRegExp: nameRegExp,
              offset: pageCount * (page - 1),
              limit: pageCount
            };
      if (value === 'lesson' || value === 'collection') {
        variables = {
          ...variables,
          type:
            value === 'lesson'
              ? 'lesson'
              : value === 'collection'
              ? 'collection'
              : null
        };
      }
      await fetchMore({ variables });
    }
  };

  useEffect(async () => {
    if (value) {
      setTotalCount(0);
      setLoadedItems([]);
      await fetchLoadCounts(value);
      localStorage.setItem('analyticsValue', value);
    }

    let columns_ = ['name'];
    if (isRoot) {
      if (value !== 'tag') {
        columns_.push('state');
        if (value === 'class') {
          columns_.push('school');
        }
      }
    } else {
      if (schemaType === 'station') {
        if (
          ['district', 'school', 'class', 'educator', 'student'].includes(value)
        ) {
          columns_.push('station');
        }
        if (['school', 'class', 'educator', 'student'].includes(value)) {
          columns_.push('district');
        }
      }
      if (
        value === 'class' &&
        schemaType !== 'class' &&
        schemaType !== 'school'
      ) {
        columns_.push('school');
      }
      if (value === 'educator') {
        columns_.push('lastSeenAt');
      }
    }

    setColumns(columns_);
  }, [value, nameRegExp]);

  const handleRadioChange = (event) => {
    setValue(event.target.value);
    setPage(1);
  };

  const [fetchMore, { loading, error, data }] = useLazyQuery(
    graphql.queries.analyticsGrouping,
    {
      fetchPolicy: 'no-cache'
    }
  );

  const convertTime = (value) => {
    const convert_date = moment(new Date(value)).format('MM/DD/YY hh:mm:ss');
    return convert_date;
  };

  const fetchTotalCount = async (fetchVal) => {
    const schemaTypeVal = fetchVal == null ? value : fetchVal;

    const variables =
      schemaType === 'class' &&
      (schemaTypeVal === 'student' || schemaTypeVal === 'educator')
        ? {
            schemaType: schemaTypeVal,
            parentId: districtValue,
            classId: classId == null ? resources?._id : classId
          }
        : {
            schemaType: schemaTypeVal,
            topology: {
              station: stationValue,
              district: districtValue,
              school:
                resources?.schemaType === 'school' ? resources?._id : null,
              class: null
            }
          };
    setTotalCountLoadingVariables(variables);
    await getTotalCount({
      variables: {
        ...variables,
        nameRegExp: nameRegExp,
        status: null
      }
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    setTotalCount(0);
    let lastValue = lastSelectedValue;
    let valideValue;
    if (lastValue != null) {
      if (isRoot) {
        if (['tag', 'material', 'lesson', 'collection'].includes(lastValue)) {
          valideValue = 'station';
        } else {
          valideValue = lastValue;
        }
      } else {
        if (schemaType === 'station') {
          if (['station', 'tag'].includes(lastValue)) {
            valideValue = 'district';
          } else if (['lesson', 'collection'].includes(lastValue)) {
            valideValue = 'material';
          } else {
            valideValue = lastValue;
          }
        } else if (schemaType === 'district') {
          if (['station', 'district', 'tag'].includes(lastValue)) {
            valideValue = 'school';
          } else if (['lesson', 'collection'].includes(lastValue)) {
            valideValue = 'material';
          } else {
            valideValue = lastValue;
          }
        } else if (schemaType === 'school') {
          if (['lesson', 'collection', 'material'].includes(lastValue)) {
            valideValue = 'material';
          } else {
            valideValue = 'class';
          }
        } else if (schemaType === 'class') {
          if (
            ['educator', 'student', 'lesson', 'collection'].includes(lastValue)
          ) {
            valideValue = lastValue;
          } else if (lastValue === 'material') {
            valideValue = 'lesson';
          } else {
            valideValue = 'educator';
          }
        }
      }
    }

    if (valideValue == null || valideValue === '') {
      let typeVale = isRoot
        ? 'station'
        : schemaType === 'district'
        ? 'school'
        : schemaType === 'school'
        ? 'class'
        : schemaType === undefined
        ? 'station'
        : schemaType === 'class'
        ? 'educator'
        : 'district';
      if (value === typeVale) {
        fetchLoadCounts(typeVale);
      }
      setValue(typeVale);
    } else {
      if (value === valideValue) {
        fetchLoadCounts(valideValue);
      }
      setValue(valideValue);
    }
    setPage(1);
  }, [resources]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
    if (value != null) {
      fetchLoadCounts(value);
    }
  }, [page]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalCount / pageCount));
  }, [pageCount, totalCount]);

  useEffect(() => {
    if (!totalCountError && !totalCountLoading && totalCountData) {
      const { totalCount } = totalCountData;
      if (totalCountLoadingVariables?.status !== 'published') {
        setTotalCount(totalCount);
        setTatalMaterialsCnt(totalCount);
        setTotalCountLoadingVariables({
          ...totalCountLoadingVariables,
          status: 'published'
        });
        console.log(
          {
            ...totalCountLoadingVariables,
            status: 'published'
          },
          '====3'
        );
        getTotalCount({
          variables: {
            ...totalCountLoadingVariables,
            status: 'published',
            nameRegExp: nameRegExp
          }
        });
      } else {
        setPublishedMaterialsCnt(totalCount);
      }
      console.log(totalCountData);
    }
  }, [totalCountData, totalCountError, totalCountLoading]);

  useEffect(() => {
    if (
      !materialsCountsError &&
      !materialsCountsLoading &&
      materialsCountsData
    ) {
      const { materialsCount } = materialsCountsData;
      setTatalMaterialsCnt(materialsCount?.total);
      setCreatedMaterialsCnt(materialsCount?.created);
      setPublishedMaterialsCnt(materialsCount?.published);
      setUnpublishedMaterialsCnt(materialsCount?.unpublished);
      setTotalCount(materialsCount?.total);
    }
  }, [materialsCountsData, materialsCountsError, materialsCountsLoading]);

  useEffect(() => {
    if (!loading && !error && data) {
      let classid = classId == null ? resources?._id : classId;
      let { grouping } = data;

      if (value === 'lesson') {
        grouping = grouping.filter(
          (e) => e.childrenIdList === null && classid === e?.topology?.class
        );
      } else if (value === 'collection') {
        grouping = grouping.filter(
          (e) => e.childrenIdList !== null && classid === e?.topology?.class
        );
      } else if (value === 'class') {
        grouping = grouping.map((e) => {
          e.name =
            (e.source?.classSource?.name
              ? e.source?.classSource?.name + ' - '
              : '') + e.name;
          return e;
        });
      }

      setLoadedItems(grouping);
    }
  }, [loading, error, data]);

  const compare = (a, b, key) => {
    let compare_a = '';
    let compare_b = '';
    if (['name', 'refCount', 'updatedAt', 'status'].indexOf(key) > -1) {
      compare_a = a[key];
      compare_b = b[key];
    } else if (key === 'state') {
      compare_a = a.topology?.state;
      compare_b = b.topology?.state;
    } else if (key === 'station') {
      compare_a = a.topology?.station;
      compare_b = b.topology?.station;
    } else if (key === 'district') {
      compare_a = a.topology?.district;
      compare_b = b.topology?.district;
    } else if (key === 'school') {
      compare_a = a.topology?.school;
      compare_b = b.topology?.school;
    } else if (key === 'lastSeenAt') {
      compare_a = a.loginInfo?.lastSeenAt;
      compare_b = b.loginInfo?.lastSeenAt;
    }

    try {
      if (compare_a.toUpperCase() < compare_b.toUpperCase()) {
        return -1;
      }
      if (compare_a.toUpperCase() > compare_b.toUpperCase()) {
        return 1;
      }
    } catch (error) {
      return 0;
    }

    return 0;
  };

  const filterItems = (grouping) => {
    if (filterValue === '') {
      return grouping;
    }
    grouping = grouping.filter((e) => {
      let search_item = '';
      for (let i in columns) {
        let key = columns[i];
        if (['name', 'refCount', 'updatedAt', 'status'].indexOf(key) > -1) {
          search_item = e[key];
        } else if (
          ['state', 'station', 'district', 'school'].indexOf(key) > -1
        ) {
          search_item = e.topology[key];
        }
        if (search_item && search_item.indexOf(filterValue) > -1) {
          return true;
        }
      }
      return false;
    });

    return grouping;
  };

  useEffect(() => {
    let grouping = [...loadedItems];
    grouping = filterItems(grouping);

    if (sortColumn?.column) {
      grouping.sort((a, b) => compare(a, b, sortColumn?.column));
      if (sortColumn?.direction === 'DESC') {
        grouping.reverse();
      }
    }
    setItems(grouping);
  }, [loadedItems, sortColumn, filterValue]);

  const toggleSort = (value) => {
    if (sortColumn?.column === value && sortColumn?.direction === 'DESC') {
      setSortColumn({
        column: null,
        direction: null
      });
    } else {
      setSortColumn({
        column: value,
        direction:
          sortColumn?.column === value && sortColumn?.direction === 'ASC'
            ? 'DESC'
            : 'ASC'
      });
    }
  };

  const SortTable = (props) => {
    const { title, name, onclick } = props;

    return (
      <div className={'sort-item'} onClick={() => onclick(name)}>
        {title}
        <div
          className={`sort-item-badge ${
            sortColumn?.column === name ? 'active' : ''
          }`}
        >
          {sortColumn?.column !== name ||
          (sortColumn?.column === name && sortColumn?.direction === 'ASC') ? (
            <ArrowUpwardOutlined fontSize="small" />
          ) : (
            <ArrowDownwardOutlined fontSize="small" />
          )}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <Grid
        // spacing={2}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ padding: 12 }}
      >
        {/* <Input
          id="standard-adornment-weight"
          value={filterValue}
          onChange={(event) => {
            setFilterValue(event.target.value);
          }}
          startAdornment={
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          }
          aria-describedby="standard-weight-helper-text"
          inputProps={{
            'aria-label': 'weight'
          }}
          style={{ width: 150, marginBottom: -15 }}
        /> */}
        <div
          style={{
            width: 'fit-content',
            height: 'fit-content',
            borderBottom: '1px solid gray'
          }}
        >
          <UserSearch
            type={''}
            width={'200px'}
            fromTable={true}
            onChange={(value) => setNameRegExp(value)}
            // onChange={(value) => setFilterValue(value)}
            useStyles={useStylesSearch}
          />
        </div>

        <div
          style={{
            width: 'calc(100% - 200px)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {schemaType !== 'googleClass' && (
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="position"
                name="position"
                value={value}
                onChange={handleRadioChange}
                style={{ overflowX: 'auto', flexWrap: 'unset' }}
              >
                {isRoot && (
                  <FormControlLabel
                    value="station"
                    control={<Radio color="primary" />}
                    label="Stations"
                    labelPlacement="top"
                  />
                )}
                {schemaType !== 'district' &&
                  schemaType !== 'school' &&
                  schemaType !== 'class' && (
                    <FormControlLabel
                      value="district"
                      control={<Radio color="primary" />}
                      label="Districts"
                      labelPlacement="top"
                    />
                  )}
                {schemaType !== 'school' && schemaType !== 'class' && (
                  <FormControlLabel
                    value="school"
                    control={<Radio color="primary" />}
                    label="Schools"
                    labelPlacement="top"
                  />
                )}

                {schemaType !== 'class' && (
                  <FormControlLabel
                    value="class"
                    control={<Radio color="primary" />}
                    label="Classes"
                    labelPlacement="top"
                  />
                )}

                {schemaType !== 'school' && (
                  <FormControlLabel
                    value="educator"
                    control={<Radio color="primary" />}
                    label="Educators"
                    labelPlacement="top"
                  />
                )}
                {schemaType !== 'school' && (
                  <FormControlLabel
                    value="student"
                    control={<Radio color="primary" />}
                    label="Students"
                    labelPlacement="top"
                  />
                )}

                {!isRoot && schemaType !== 'class' && (
                  <FormControlLabel
                    value="material"
                    control={<Radio color="primary" />}
                    label="Lessons/Collections"
                    labelPlacement="top"
                  />
                )}

                {schemaType === undefined && (
                  <FormControlLabel
                    value="tag"
                    control={<Radio color="primary" />}
                    label="Keywords"
                    labelPlacement="top"
                  />
                )}

                {schemaType === 'class' && (
                  <FormControlLabel
                    value="lesson"
                    control={<Radio color="primary" />}
                    label="Lessons"
                    labelPlacement="top"
                  />
                )}

                {schemaType === 'class' && (
                  <FormControlLabel
                    value="collection"
                    control={<Radio color="primary" />}
                    label="Collections"
                    labelPlacement="top"
                  />
                )}
              </RadioGroup>
            </FormControl>
          )}
        </div>
      </Grid>
      {/* {(schemaType === 'class' &&
        (value === 'lesson' || value === 'collection')) ||
        ((schemaType === 'school' ||
          schemaType === 'district' ||
          schemaType === 'station') &&
          value === 'material') ? (
        <> */}
      <Grid container item xs={12}>
        <Grid container item xs={4} className={classes.countLabel}>
          <Typography
            variant="subtitle1"
            style={{
              fontSize: '14px'
            }}
          >
            {'Published: ' + publishedMaterialsCnt ?? '0'}
          </Typography>
        </Grid>
        <Grid container item xs={4} className={classes.countLabel}>
          <Typography
            variant="subtitle1"
            style={{
              fontSize: '14px'
            }}
          >
            {'Unpublished: ' +
              (totalMaterialsCnt - publishedMaterialsCnt < 0
                ? 0
                : totalMaterialsCnt - publishedMaterialsCnt)}
          </Typography>
        </Grid>
        <Grid container item xs={4} className={classes.countLabel}>
          <Typography
            variant="subtitle1"
            style={{
              fontSize: '14px'
            }}
          >
            {'Total: ' + totalMaterialsCnt ?? '0'}
          </Typography>
        </Grid>
      </Grid>
      {/* </>
      ) : (
        <></>
      )} */}
      <Grid
        // spacing={2}
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          marginTop: 16,
          display: 'block'
        }}
      >
        {' '}
        {
          // value !== 'material' &&
          //   value !== 'lesson' &&
          //   value !== 'collection' &&
          <TableContainer
            component={Paper}
            style={
              isMediumScreen
                ? {
                    height: 'max-content'
                  }
                : {
                    maxHeight: `calc(100vh - 358px)`
                  }
            }
          >
            <Table
              stickyHeader
              aria-label="sticky table"
              className="AnalyticsTable"
              ref={mainTable}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">No</TableCell>
                  <TableCell align="center">
                    <SortTable title="Name" name="name" onclick={toggleSort} />
                  </TableCell>
                  {value === 'tag' && (
                    <TableCell align="center">
                      <SortTable
                        title="Ref Count"
                        name="refCount"
                        onclick={toggleSort}
                      />
                    </TableCell>
                  )}
                  {value === 'tag' && (
                    <TableCell align="center">
                      <SortTable
                        title="Updated At"
                        name="updatedAt"
                        onclick={toggleSort}
                      />
                    </TableCell>
                  )}
                  {isRoot && value !== 'tag' && (
                    <TableCell align="center">
                      <SortTable
                        title="State"
                        name="state"
                        onclick={toggleSort}
                      />
                    </TableCell>
                  )}
                  {isRoot ||
                    (schemaType === 'station' && (
                      <>
                        {[
                          'district',
                          'school',
                          'class',
                          'educator',
                          'student'
                        ].includes(value) &&
                          isRoot && (
                            <TableCell align="center">
                              <SortTable
                                title="Station"
                                name="station"
                                onclick={toggleSort}
                              />
                            </TableCell>
                          )}
                        {['school', 'class', 'educator', 'student'].includes(
                          value
                        ) && (
                          <TableCell align="center">
                            <SortTable
                              title="District"
                              name="district"
                              onclick={toggleSort}
                            />
                          </TableCell>
                        )}
                      </>
                    ))}
                  {value === 'class' &&
                    schemaType !== 'class' &&
                    schemaType !== 'school' && (
                      <TableCell align="center">
                        <SortTable
                          title="School"
                          name="school"
                          onclick={toggleSort}
                        />
                      </TableCell>
                    )}
                  {value === 'educator' && (
                    <TableCell align="center">
                      <SortTable
                        title="Last Seen At"
                        name="lastSeenAt"
                        onclick={toggleSort}
                      />
                    </TableCell>
                  )}
                  {value !== 'tag' && (
                    <TableCell align="center">
                      <SortTable
                        title="Status"
                        name="status"
                        onclick={toggleSort}
                      />
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {value !== 'tag'
                  ? items.map((row, index) => (
                      <TableRow key={`${index}-${row.name}`} hover>
                        <TableCell align="center">
                          {(page - 1) * pageCount + index + 1}
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        {value === 'tag' && (
                          <TableCell align="center">
                            {row.refCount ?? 0}
                          </TableCell>
                        )}
                        {value === 'tag' && (
                          <TableCell align="center">
                            {row.searchCount ?? 0}
                          </TableCell>
                        )}
                        {value === 'tag' && (
                          <TableCell align="center">
                            {row?.updatedAt ? convertTime(row?.updatedAt) : ''}
                          </TableCell>
                        )}
                        {isRoot && value !== 'tag' && (
                          <TableCell align="center">
                            {row.topology?.state}
                          </TableCell>
                        )}
                        {isRoot ||
                          (schemaType === 'station' && (
                            <>
                              {[
                                'district',
                                'school',
                                'class',
                                'educator',
                                'student'
                              ].includes(value) &&
                                isRoot && (
                                  <TableCell align="center">
                                    {row.topology?.station == null
                                      ? ''
                                      : stationLoadedData?.find(
                                          (item) =>
                                            item._id === row.topology?.station
                                        )?.name}
                                  </TableCell>
                                )}
                              {[
                                'school',
                                'class',
                                'educator',
                                'student'
                              ].includes(value) && (
                                <TableCell align="center">
                                  {row.topology?.district == null
                                    ? ''
                                    : allDistrictResources?.find(
                                        (item) =>
                                          item._id === row.topology?.district
                                      )?.name}
                                </TableCell>
                              )}
                            </>
                          ))}
                        {value === 'class' &&
                          schemaType !== 'class' &&
                          schemaType !== 'school' && (
                            <TableCell align="center">
                              {row.topology?.school == null
                                ? ''
                                : allSchoolResources?.find(
                                    (item) => item._id === row.topology?.school
                                  )?.name}
                            </TableCell>
                          )}
                        {value === 'educator' && (
                          <TableCell align="center">
                            {row?.loginInfo?.lastSeenAt
                              ? convertTime(row?.loginInfo?.lastSeenAt)
                              : ''}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          {(row.status || '').capitalizeFirstLetter()}
                        </TableCell>
                      </TableRow>
                    ))
                  : items.map((row, index) => (
                      <TableRow key={`${index}-${row.name}`} hover>
                        <TableCell align="center">
                          {(page - 1) * pageCount + index + 1}
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">{row.refCount}</TableCell>
                        <TableCell align="center">
                          {row?.updatedAt ? convertTime(row?.updatedAt) : ''}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        }
        <Pagination
          count={totalPage}
          size="small"
          page={page}
          siblingCount={0}
          showFirstButton
          showLastButton
          onChange={handleChangePage}
          className={classes.pagination}
        />
      </Grid>
    </React.Fragment>
  );
};

export default AnalyticForm;
