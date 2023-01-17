import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TablePagination,
  Button
} from '@material-ui/core';
import graphql from '@app/graphql';
import { useQuery } from '@apollo/client';
import useStyles from './style';

const ResourceList = ({ editPanelData, setEditPanelData }) => {
  const classes = useStyles();

  const [loadedData, setLoadedData] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(30);
  const [resourceCount, setResourceCount] = useState(0);

  const variables = {
    id: null,
    schemaType: 'resource',
    offset: null,
    name: null
  };

  const { loading, error, data, fetchMore } = useQuery(
    graphql.queries.GalleryGrouping,
    {
      variables,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first'
    }
  );

  useEffect(() => {
    if (!loading && !error) {
      setResourceCount(data?.grouping?.length || 0);
      if (fetchMore) {
        fetchMore({
          variables: {
            offset: offset,
            limit: limit
          }
        }).then((fetchMoreResult) => {
          const { grouping } = fetchMoreResult.data;
          setLoadedData(grouping);
        });
      }
    }
  }, [loading, error, data]);

  const onChangePage = (newPage) => {
    setOffset(newPage * limit);
  };

  const onChangeRowsPerPage = (newRowsPerPage) => {
    setLimit(newRowsPerPage);
    setOffset(0);
  };

  const handleChangePage = (event, newPage) => {
    onChangePage(newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onChangeRowsPerPage(newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const updateData = (resource) => {
    setEditPanelData((panelData) => ({
      ...panelData,
      avatar: resource?.avatar,
      data: resource?.data,
      desc: resource?.desc,
      tagList: resource?.tagList
    }));
  };

  return (
    <>
      <List className={classes.elementList}>
        {loadedData &&
          loadedData.map((el, index) => (
            <ListItem key={el['_id']}>
              <ListItemText className={classes.listItemText}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  component={Typography}
                  variant="subtitle1"
                >
                  <span className={classes.resourceTitle}>
                    {index + 1}) {el.name}
                  </span>
                  <Button
                    variant="contained"
                    color="default"
                    onClick={() => updateData(el)}
                  >
                    Use
                  </Button>
                </Box>
              </ListItemText>
            </ListItem>
          ))}
      </List>
      <TablePagination
        className={classes.pagination}
        component="div"
        labelRowsPerPage=""
        rowsPerPageOptions={[5, 10, 15]}
        count={resourceCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </>
  );
};

export default ResourceList;
