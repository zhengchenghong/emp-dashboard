import React, { useState, useEffect } from 'react';
import { Paper, Box, Grid } from '@material-ui/core';
import { useQuery, useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';
import useStyles from './style';
import { GalleryData, CreateMode } from '@app/components/Gallery';
import { CustomDialog } from '@app/components/Custom';
import JSONEditor from '@app/components/JSONEditor';
import { usePageCountContext } from '@app/providers/PageCountContext';
import TableContainer from '@material-ui/core/TableContainer';
import Pagination from '@material-ui/lab/Pagination';
import { en } from '@app/language';
import { useTotalCountFetchQuery } from '@app/utils/hooks/form';

const UserTable = ({
  schemaType,
  createNew,
  setCreateNew,
  contentType,
  searchValue
}) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState([]);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [searchKey, setSearchKey] = useState();
  const [rawData, setRawData] = useState();

  const [page, setPage] = useState(1);
  const { pageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [nameRegExp, setNameRegExp] = useState(null);

  const { loading, error, data, refetch } = useQuery(
    graphql.queries.GalleryGrouping,
    {
      variables: {
        id: null,
        schemaType: schemaType,
        nameRegExp: nameRegExp,
        offset: pageCount * (page - 1),
        limit: pageCount,
        sortBy: 'createdAt'
      }
    }
  );

  const { data: totalPageCount, refetch: getTotalCount } =
    useTotalCountFetchQuery({
      schemaType: schemaType,
      nameRegExp: nameRegExp
    });

  const totalReLoad = async () => {
    getTotalCount();
    refetch();
  };

  useEffect(() => {
    setTotalPage(Math.ceil(totalRows / pageCount));
    refetch();
  }, [page]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRows / pageCount));
    totalReLoad();
    setPage(1);
  }, [schemaType, nameRegExp]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRows / pageCount));
    refetch();
  }, [pageCount, totalRows]);

  useEffect(() => {
    if (totalPageCount) {
      setTotalRows(totalPageCount?.totalCount);
      setPage(1);
    }
  }, [totalPageCount]);

  useEffect(() => {
    if (page > totalPage) {
      if (totalPage > 0) {
        setPage(totalPage);
      } else {
        setPage(1);
      }
    }
  }, [totalPage]);

  useEffect(() => {
    if (!loading && !error) {
      const { grouping } = data;

      setRawData(grouping);

      const tmp = grouping.map((el) => ({
        id: el['_id'],
        name: el.name,
        type: el.avatar?.type,
        icon: el.avatar?.baseUrl + el.avatar?.fileDir + el.avatar?.fileName,
        altText: el.avatar?.altText,
        tagList: el.tagList,
        avatarURL:
          el.avatar?.baseUrl + el.avatar?.fileDir + el.avatar?.fileName,
        thumbnailURL: el.avatar?.thumbnail,
        mimeType: el.avatar?.mimeType,
        schemaType: el.schemaType,
        version: el.version,
        avatar: el.avatar
      }));

      setRows(tmp);
      // filterRows(tmp, searchKey);
    }
  }, [loading, error, data]);

  useEffect(() => {
    if (searchValue !== null) handleSearch(searchValue);
  }, [searchValue]);

  const onCancel = () => {
    totalReLoad();
    setPage(1);
    setCreateNew(false);
  };

  const onInfo = (id) => {
    setSelectedInfo(rawData?.find((item) => item._id === id));
    setOpenInfo(true);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleSearch = (value) => {
    setNameRegExp(value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Paper className={classes.root} style={{ paddingBottom: 0 }}>
      <Box>
        <Grid container justifyContent="center" style={{ marginBottom: 10 }}>
          {createNew ? (
            <CreateMode
              schemaType={schemaType}
              onCancel={onCancel}
              onFinish={() => totalReLoad()}
            />
          ) : (
            []
          )}
        </Grid>
        <TableContainer>
          <Grid container justifyContent="space-evenly">
            {rows.map((item, index) => (
              <GalleryData
                key={index}
                {...item}
                onFinish={() => totalReLoad()}
                onInfo={(value) => onInfo(value)}
              />
            ))}
          </Grid>
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
        </TableContainer>
        <CustomDialog
          open={openInfo}
          title={en['Information']}
          maxWidth="sm"
          fullWidth={true}
          onChange={handleInfoDialogChange}
        >
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <JSONEditor disable={false} resources={selectedInfo} />
          </Grid>
        </CustomDialog>
      </Box>
    </Paper>
  );
};

export default UserTable;
