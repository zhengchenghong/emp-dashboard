/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  IconButton,
  Grid,
  MenuItem,
  Menu
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import {
  Delete as DeleteIcon,
  GetApp as GetAppIcon,
  Publish as PublishIcon
} from '@material-ui/icons';
import {
  faInfo,
  faTrash,
  faEllipsisV,
  faDownload,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import graphql from '@app/graphql';
import useStyles from './style';
import { getDisplayName } from '@app/utils/functions';
import { getFormattedDate } from '@app/utils/date-manager';
import JSONEditor from '@app/components/JSONEditor';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';

import { useNotifyContext } from '@app/providers/NotifyContext';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { withStyles } from '@material-ui/core/styles';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5'
  },
  list: {
    padding: '0'
  }
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    transformOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    backgroundColor: '#37474f',
    color: '#fff',
    '&:hover': {
      color: '#000'
    },
    '&:focus': {
      backgroundColor: '#37474f',
      color: '#fff',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

const LibraryFilesForm = ({
  docId,
  type,
  filterValue,
  disable,
  hasTypeField,
  userTypeData,
  isRefresh,
  isCreated,
  setIsCreated
}) => {
  const classes = useStyles();
  const mainTable = useRef();
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState([]);
  const [loadedDataCopy, setLoadedDataCopy] = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [currentRowId, setCurrentRowId] = useState();
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const { pageCount, setPageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [rowData, setRowData] = useState({
    name: null
  });
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const isSmallScreen = useSmallScreen();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobSelectedRow, setMobSelectedRow] = useState();

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  const [getData, { loading, data, error }] = useLazyQuery(
    graphql.queries.BulkFilesGrouping,
    {
      fetchPolicy: 'no-cache'
    }
  );

  const {
    loading: totalLoading,
    error: totalError,
    data: totalData,
    refetch: totalRefetch
  } = useQuery(graphql.queries.BulkFilesGrouping, {
    variables: {
      schemaType: 'bulkFile',
      type: type
    },
    fetchPolicy: 'no-cache'
  });

  const fetchData = () => {
    getData({
      variables: {
        schemaType: 'bulkFile',
        type: type,
        offset: pageCount * (page - 1),
        limit: pageCount
      }
    });
  };

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    if (page > Math.ceil(totalRow / pageCount)) {
      if (Math.ceil(totalRow / pageCount) === 0) {
        setPage(1);
      } else {
        setPage(Math.ceil(totalRow / pageCount));
      }
    }
    fetchData();
  }, [docId, isRefresh, offset, pageCount, totalRow]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    if (!totalError && !totalLoading) {
      setTotalRow(totalData.grouping.length);
    }

    if (isCreated) {
      setTimeout(() => {
        totalRefetch();
        fetchData();
        setIsCreated(false);
      }, 3000); // after 3 seconds, refresh list
    }
  }, [totalLoading, totalError, totalData, isCreated]);

  useEffect(() => {
    if (!loading && !error && data) {
      console.log('okay');
      const { grouping } = data;
      const loadData = grouping.map((item) => ({ ...item, disable: true }));
      setLoadedData(loadData);
      setLoadedDataCopy(loadData);
    }
  }, [loading, data, error, filterValue]);

  const deleteData = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (changeType && decision && checkbox) {
      const response = await deleteDocument({
        variables: {
          schemaType: 'bulkFile',
          id: currentRowId
        }
      });
      const tmp = loadedData.filter((el) => el._id !== currentRowId);
      setLoadedData(tmp);
      setLoadedDataCopy(tmp);

      const notiOps = getNotificationOpt('package', 'success', 'delete');
      notify(notiOps.message, notiOps.options);
      setCheckbox(false);
    }
    setOpenDeleteDialog(false);
    setCurrentRowId();
  };

  const handleTableChange = async (method, value) => {
    setAnchorEl(null);
    try {
      if (method === 'edit') {
        let tmp = loadedData.slice();
        const idx = tmp.findIndex((el) => el._id === value);
        tmp[idx] = {
          ...tmp[idx],
          disable: false
        };

        setLoadedData(tmp);
        setLoadedDataCopy(tmp);
      }

      if (method === 'download') {
        let elDom = document.createElement('a');
        getAssetUrlFromS3(value, 1).then((res) => {
          elDom.setAttribute('href', res);
          elDom.setAttribute('download', '');
          elDom.setAttribute('rel', 'noopener noreferrer');
          elDom.click();
        });
      }

      if (method === 'delete') {
        setCurrentRowId(value);
        setOpenDeleteDialog(true);
        totalRefetch();
      }

      if (method === 'info') {
        setSelectedInfo(value);
        setOpenInfo(true);
      }
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleInputChange = (method, value, id) => {
    const findedData = loadedData.find((el) => el._id === id);
    if (rowData?._id !== id) {
      setRowData({
        [method]: value,
        id: id
      });
    } else {
      setRowData({
        ...rowData,
        [method]: value,
        id: id
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setOffset(newPage * pageCount);
    setPage(newPage);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleEllipsisClose = () => {
    setMobSelectedRow(null);
    setAnchorEl(null);
  };

  const handleEllipsisClicked = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <LoadingCard
      loading={loadingPanel}
      percentage={percentage}
      isProgress={true}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        {/* <Typography variant="h6">Packages</Typography> */}
      </Box>
      <div style={{ position: 'relative' }}>
        <TableContainer
          component={Paper}
          style={{
            position: 'absolute',
            maxHeight: isSmallScreen
              ? `calc(100vh - 228px)`
              : `calc(100vh - 206px)`
          }}
        >
          <Table
            className={classes.table}
            aria-label="custom pagination table"
            ref={mainTable}
          >
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ minWidth: 60 }}>
                  # ID
                </TableCell>
                <TableCell align="left">{en['Status']}</TableCell>
                <TableCell align="left">{en['Identifier']}</TableCell>
                <TableCell align="left">{en['Name']}</TableCell>
                <TableCell align="left">{en['Type']}</TableCell>
                <TableCell align="left">{en['Size']}(KB)</TableCell>
                <TableCell align="left" style={{ minWidth: 110 }}>
                  {en['Updated At']}
                </TableCell>
                {!disable ? (
                  <TableCell align="center" style={{ minWidth: 88 }}>
                    # {en['Action']}
                  </TableCell>
                ) : (
                  []
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loadedData.length > 0 &&
                loadedData.map((row, index) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row" align="center">
                      {page === 1
                        ? index + 1
                        : index + 1 + (page - 1) * pageCount}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {(row.status || '').capitalizeFirstLetter()}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.disable ? (
                        row.name
                      ) : (
                        <TextField
                          defaultValue={row.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value, row._id)
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {getDisplayName(row.desc?.title)}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.desc?.short}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.multimediaAssets?.length > 0 &&
                        row.multimediaAssets[0].data?.size}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {getFormattedDate(row.updatedAt)}
                    </TableCell>
                    {!disable ? (
                      <TableCell component="th" align="center">
                        {isSmallScreen ? (
                          <>
                            <IconButton
                              size="small"
                              style={{ width: 30, height: 30 }}
                              onClick={(event) => {
                                setMobSelectedRow(row);
                                handleEllipsisClicked(event);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisV}
                                size="sm"
                                style={{ cursor: 'pointer' }}
                              />
                            </IconButton>
                            <StyledMenu
                              id="customized-menu"
                              anchorEl={anchorEl}
                              keepMounted
                              open={Boolean(anchorEl)}
                              onClose={handleEllipsisClose}
                            >
                              {row.status === 'uploaded' ? (
                                <StyledMenuItem>
                                  <div
                                    onClick={() =>
                                      handleTableChange(
                                        'download',
                                        mobSelectedRow?.avatar?.baseUrl
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faDownload}
                                      size="xs"
                                      style={{ marginRight: 7 }}
                                    />
                                    {/* {en['Ingest Google']} */}
                                    {'Download'}
                                  </div>
                                </StyledMenuItem>
                              ) : (
                                <StyledMenuItem disabled={true}>
                                  <div
                                    onClick={() => handleTableChange('', null)}
                                  >
                                    <FontAwesomeIcon
                                      icon={faDownload}
                                      size="xs"
                                      style={{ marginRight: 7 }}
                                    />
                                    {en['Download']}
                                  </div>
                                </StyledMenuItem>
                              )}
                              <StyledMenuItem>
                                <div
                                  onClick={() =>
                                    handleTableChange('info', mobSelectedRow)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faInfo}
                                    size="xs"
                                    style={{ marginRight: 12, marginLeft: 3 }}
                                  />
                                  {en['Info']}
                                </div>
                              </StyledMenuItem>
                              <StyledMenuItem>
                                <div
                                  onClick={() =>
                                    handleTableChange(
                                      'delete',
                                      mobSelectedRow?._id
                                    )
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    size="xs"
                                    style={{ marginRight: 7 }}
                                  />
                                  {en['Delete']}
                                </div>
                              </StyledMenuItem>
                              <StyledMenuItem>
                                <div
                                  onClick={() =>
                                    handleTableChange(
                                      'publish',
                                      mobSelectedRow?._id
                                    )
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faUpload}
                                    size="xs"
                                    style={{ marginRight: 7 }}
                                  />
                                  {en['Publish']}
                                </div>
                              </StyledMenuItem>
                            </StyledMenu>
                          </>
                        ) : (
                          <Box textAlign="center">
                            {row.status === 'uploaded' ? (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleTableChange(
                                    'download',
                                    row.avatar?.baseUrl
                                  )
                                }
                              >
                                <GetAppIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                disabled="true"
                                onClick={() => handleTableChange('', null)}
                              >
                                <GetAppIcon />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleTableChange('info', row)}
                            >
                              <FontAwesomeIcon
                                icon={faInfo}
                                size="sm"
                                style={{ cursor: 'pointer' }}
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTableChange('delete', row._id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTableChange('publish', row._id)
                              }
                            >
                              <PublishIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    ) : (
                      []
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
      </div>
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
      <CustomDialog
        open={openDeleteDialog}
        title={en[`Delete Package?`]}
        mainBtnName={en['Delete']}
        onChange={deleteData}
      >
        {en['Are you sure want to delete this package?']}
        <br />
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
    </LoadingCard>
  );
};

export default LibraryFilesForm;
