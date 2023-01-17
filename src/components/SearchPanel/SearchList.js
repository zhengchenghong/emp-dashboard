/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  TablePagination,
  LinearProgress
} from '@material-ui/core';
import graphql from '@app/graphql';
import { useQuery, useApolloClient } from '@apollo/client';
import useStyles from './style';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import { useUserContext } from '@app/providers/UserContext';

const SearchList = ({ type, searchString }) => {
  const classes = useStyles();
  const [currentUser] = useUserContext();
  const client = useApolloClient();
  const [loadedData, setLoadedData] = useState([]);
  const [pageLoadedData, setPageLoadedData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const variables = {
    id: null,
    schemaType: 'material',
    offset: null,
    name: null
  };

  const { loading, error, data } = useQuery(graphql.queries.MaterialGrouping, {
    variables: variables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    async function onResourcesLoad(type) {
      let { data: resourcesData } = await client.query({
        query: graphql.queries.grouping,
        variables: {
          schemaType: type === 'pbs' ? 'PBS' : 'OER'
        }
      });
      let results = [];
      if (resourcesData.grouping) {
        results = resourcesData.grouping;
      }
      if (results.length > 0) {
        setTotalCount(results.length);
        setLoadedData(results);
        setPageLoadedData(results.slice(page * rowsPerPage, rowsPerPage));
      } else {
        setLoadedData([]);
        setPageLoadedData([]);
      }
    }

    async function onLoad() {
      const { grouping } = data;
      let idList = [];
      if (currentUser.schemaType !== 'superAdmin') {
        if (currentUser.schemaType === 'educator') {
          let { data: classData } = await client.query({
            query: graphql.queries.ClassGrouping,
            variables: {
              schemaType: 'class',
              authorId: currentUser?._id
            }
          });
          if (classData.grouping) {
            classData.grouping.forEach((el) => {
              idList.push(el._id);
            });
          }
        } else if (
          currentUser.schemaType === 'districtAdmin' ||
          currentUser.schemaType === 'stationAdmin'
        ) {
          let { data: classData } = await client.query({
            query: graphql.queries.ClassGrouping,
            variables: {
              schemaType: 'class'
            }
          });
          if (classData.grouping) {
            let tmp = classData.grouping.filter((el) =>
              currentUser.schemaType === 'districtAdmin'
                ? el.topology.district === currentUser.parentId
                : el.topology.station === currentUser.parentId
            );
            tmp.forEach((el) => {
              idList.push(el._id);
            });
          }
        }
      }
      let resultItems = [];
      let results = [];
      if (currentUser?.schemaType !== 'superAdmin') {
        if (idList.length > 0) {
          if (
            currentUser.schemaType === 'educator' ||
            currentUser.schemaType === 'districtAdmin' ||
            currentUser.schemaType === 'stationAdmin'
          ) {
            resultItems = grouping.filter((e) =>
              idList.includes(e.topology.class)
            );
          }
        }
      } else {
        resultItems = grouping;
      }
      results = resultItems.filter((e) => e.name === searchString);
      results = results.concat(
        resultItems.filter((e) => e.tagList?.includes(searchString))
      );
      results = results.concat(
        resultItems.filter((e) => e.desc?.title?.includes(searchString))
      );
      results = results.concat(
        resultItems.filter((e) => e.desc?.short?.includes(searchString))
      );
      results = results.concat(
        resultItems.filter((e) => e.desc?.long?.includes(searchString))
      );
      results = results.concat(
        resultItems.filter((e) => e.categories?.grades?.includes(searchString))
      );
      results = results.concat(
        resultItems.filter((e) =>
          e.categories?.orgs?.level1?.includes(searchString)
        )
      );
      results = results.concat(
        resultItems.filter((e) =>
          e.categories?.orgs?.level2?.includes(searchString)
        )
      );
      if (results.length > 0) {
        setTotalCount(results.length);
        setLoadedData(results);
        setPageLoadedData(results.slice(page * rowsPerPage, rowsPerPage));
      } else {
        setLoadedData([]);
        setPageLoadedData([]);
      }
    }
    if (!loading && !error) {
      if (type === 'mycontent') {
        if (searchString) {
          onLoad();
        } else {
          setLoadedData([]);
          setPageLoadedData([]);
        }
      } else {
        onResourcesLoad(type);
      }
    }
  }, [loading, error, data, searchString, type]);

  const handleChangePage = (event, newPage) => {
    setPageLoadedData(
      loadedData.slice(newPage * rowsPerPage, (newPage + 1) * rowsPerPage)
    );
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPageLoadedData(loadedData.slice(page * newRowsPerPage, newRowsPerPage));
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <>
      <List className={classes.elementList}>
        {pageLoadedData.length > 0 ? (
          pageLoadedData.map((el, index) => (
            <ListItem key={el['_id']}>
              <ListItemIcon>
                {el.childrenIdList === null ? (
                  <DescriptionIcon style={{ color: 'white' }} />
                ) : (
                  <FolderIcon style={{ color: 'white' }} />
                )}
              </ListItemIcon>
              <ListItemText className={classes.listItemText}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  component={Typography}
                  variant="subtitle1"
                >
                  <span className={classes.resourceTitle}>{el.name}</span>
                </Box>
              </ListItemText>
            </ListItem>
          ))
        ) : loading ? (
          <LinearProgress />
        ) : (
          <>
            <div style={{ color: 'white' }}>No Results</div>
          </>
        )}
      </List>
      <TablePagination
        classes={{
          root: classes.white,
          toolbar: classes.white,
          input: classes.white,
          actions: classes.white,
          selectIcon: classes.white
        }}
        className={classes.pagination}
        component="div"
        labelRowsPerPage=""
        rowsPerPageOptions={[5, 10, 15, 25]}
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </>
  );
};

export default SearchList;
