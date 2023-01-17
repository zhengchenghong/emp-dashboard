/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Grid,
  Menu
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import {
  faInfo,
  faEdit,
  faTrash,
  faEllipsisV,
  faClose
} from '@fortawesome/free-solid-svg-icons';
import {
  CustomDialog,
  CustomCheckBox,
  CustomSelectBox
} from '@app/components/Custom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useLazyQuery } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import {
  useFetchDataByVariables,
  useTotalCountFetchQuery,
  getGroupingByVariables
} from '@app/utils/hooks/form';
import graphql from '@app/graphql';
import CreateSchoolTermDialog from './Dialog';
// import EditDeviceDialog from './EditDialog';
// import UserSearch from './Search';
import { useStyles, useStylesSearch } from './style';
import clsx from 'clsx';
import JSONEditor from '@app/components/JSONEditor';
import { useUserContext } from '@app/providers/UserContext';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { usePageCountContext } from '@app/providers/PageCountContext';
import {
  create,
  remove,
  update,
  groupingList
} from '@app/utils/ApolloCacheManager';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { withStyles } from '@material-ui/core/styles';
import EditSchoolTermDialog from './EditDialog';
import schoolTerm from '@app/constants/Notifications/schoolTerm';
import UserSearch from '../Device/Search';
import { getFormattedDate, getISOTimeString } from '@app/utils/date-manager';

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

const SchoolTermTable = ({
  docId,
  updateValue,
  // selectedRow,
  // setSelectedRow,
  doc,
  // refresh,
  // setRefresh,
  showAddSchoolTermDlg,
  setShowAddSchoolTermDlg
}) => {
  const sType = 'schoolTerm';
  const classes = useStyles();
  const mainTable = useRef();
  const isSmallScreen = useSmallScreen();
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [currentRowId, setCurrentRowId] = useState();
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openClassRemoveDialog, setOpenClassRemoveDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [nameRegExp, setNameRegExp] = useState(null);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const { pageCount, setPageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [wholeData, setWholeData] = useState();
  const [isSuperAdmin, setSuperAdmin] = useState(false);
  const [startAtSortDirection, setStartAtSortDirection] = useState('asc');
  const [endAtSortDirection, setEndAtSortDirection] = useState('asc');
  const [statusSortDirection, setStatusSortDirection] = useState('asc');
  const [nameSortDirection, setNameSortDirection] = useState('asc');
  const [sortKey, setSortKey] = useState();
  const [isSchoolTermCreating, setSchoolTermCreating] = useState(false);
  const [editRow, setEditRow] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [data, setData] = useState();
  const [allClasses, setAllClasses] = useState([]);
  const [loadTableData, setLoadTableData] = useState();
  const [currentUser] = useUserContext();
  const [createdResponse, setCreatedResponse] = useState();
  const [pickedUser, setPickedUser] = useState();
  const [pickedClass, setPickedClass] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobSelectedRow, setMobSelectedRow] = useState();

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  useEffect(() => {
    if (showAddSchoolTermDlg) {
      setOpenCreate(true);
      setShowAddSchoolTermDlg(false);
    }
  }, [showAddSchoolTermDlg]);

  useEffect(() => {
    setSuperAdmin(currentUser.schemaType === 'superAdmin');
  }, [currentUser]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, currentRowId)
  });

  const {
    loading: totalLoading,
    error: totalError,
    data: totalData,
    refetch: totalRefetch
  } = useFetchDataByVariables({
    schemaType: 'schoolTerm',
    sortBy: sortKey,
    schoolId: doc?.topology?.school,
    orderType:
      sortKey === 'schedule.startAt'
        ? startAtSortDirection
        : sortKey === 'schedule.endAt'
        ? endAtSortDirection
        : sortKey === 'schedule.status'
        ? statusSortDirection
        : nameSortDirection,
    nameRegExp: nameRegExp,
    offset: pageCount * (page - 1),
    limit: pageCount
  });

  const getVariables = (schemaType) => {
    if (schemaType === 'class') {
      return {
        schemaType: schemaType,
        schoolId: docId
      };
    } else {
      return {
        schemaType: schemaType,
        topology: {
          station: docId
        }
      };
    }
  };

  const [
    allDeviceRefetch,
    { loading: allClassesLoading, error: allClassesError, data: allClassesData }
  ] = useLazyQuery(getGroupingByVariables(getVariables('class')), {
    fetchPolicy: 'network-only'
  });

  const { data: totalPageCount, refetch: getTotalCount } =
    useTotalCountFetchQuery({
      schemaType: sType,
      topology: {
        school: doc?.topology?.school
      },
      nameRegExp: nameRegExp
      // type: 'EDU',
    });

  const totalReLoad = async () => {
    getTotalCount();
    totalRefetch();
  };

  useEffect(() => {
    if (totalPageCount) {
      setTotalRow(totalPageCount?.totalCount);
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
    setTotalPage(Math.ceil(totalRow / pageCount));
    setPage(1);
  }, [pageCount]);

  useEffect(() => {
    if (page) {
      totalRefetch();
    }
  }, [page]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
  }, [totalRow]);

  useEffect(() => {
    if (!totalError && !totalLoading && totalData) {
      setData(
        totalData?.grouping.filter((item) => item.topology?.school === docId)
      );
    }
  }, [totalLoading, totalError, totalData]);

  useEffect(() => {
    if (!allClassesError && !allClassesLoading && allClassesData) {
      setAllClasses(allClassesData.grouping);
    }
  }, [allClassesLoading, allClassesError, allClassesData]);

  useEffect(() => {
    if (docId) {
      allDeviceRefetch({
        variables: getVariables('class')
      });
    }
  }, [docId]);

  useEffect(() => {
    if (updateValue) {
      totalReLoad();
      setPage(1);
    }
  }, [updateValue]);

  useEffect(async () => {
    if (data) {
      setWholeData(data);
      const tmp = data.map((el) =>
        el
          ? {
              ...el,
              id: el._id,
              disable: true
            }
          : null
      );
      setLoadedData(tmp.filter((item) => item.topology?.school === docId));
    }
  }, [data]);

  useEffect(() => {
    if (page === 1) {
      totalRefetch();
    }
    setPage(1);
  }, [
    sortKey,
    statusSortDirection,
    nameSortDirection,
    startAtSortDirection,
    endAtSortDirection
  ]);

  useEffect(() => {
    setPage(1);
    totalReLoad();
  }, [nameRegExp]);

  const removeClassFromStudent = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (pickedUser && pickedClass) {
      try {
        if (changeType && decision && checkbox) {
          await updateGroupingList({
            variables: {
              id: pickedUser?.id,
              schemaType: 'student',
              item: pickedClass?.value,
              fieldName: 'childrenIdList',
              type: 'remove',
              trackingAuthorName: currentUser?.name
            }
          });

          await updateGroupingList({
            variables: {
              id: pickedClass?.value,
              schemaType: 'class',
              item: pickedUser?.id,
              fieldName: 'assigneeIdList',
              type: 'remove',
              trackingAuthorName: currentUser?.name
            }
          });

          const notiOps = getNotificationOpt(
            'userlist',
            'success',
            'removeClass'
          );
          notify(notiOps.message, notiOps.options);
          setCheckbox(false);
        }
      } catch (error) {
        notify(error.message, { variant: 'error' });
      }
    }
    setOpenClassRemoveDialog(false);
    setPickedUser();
    setPickedClass();
    setCheckbox(false);
  };

  const deleteData = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (doc?.schemaType !== 'class') {
      try {
        if (changeType && decision && checkbox) {
          // delete avatar from s3
          await deleteDocument({
            variables: {
              schemaType: sType,
              id: currentRowId
            }
          });

          totalReLoad();
          const notiOps = getNotificationOpt(sType, 'success', 'delete');
          notify(notiOps.message, notiOps.options);
          setCheckbox(false);
        }
      } catch (error) {
        notify(error.message, { variant: 'error' });
      }
      setOpenDeleteDialog(false);
      setCurrentRowId();
    } else {
      try {
        const value = currentRowId;
        if (value && decision && checkbox) {
          const tmp = loadedData.find((el) => el.id === currentRowId);
          if (tmp) {
            await updateGroupingList({
              variables: {
                id: tmp.id,
                schemaType: 'student',
                item: docId,
                fieldName: 'childrenIdList',
                type: 'remove',
                trackingAuthorName: currentUser?.name
              }
            });

            await updateGroupingList({
              variables: {
                id: docId,
                schemaType: doc?.schemaType,
                item: currentRowId,
                fieldName: 'assigneeIdList',
                type: 'remove',
                trackingAuthorName: currentUser?.name
              }
            });
            const notiOps = getNotificationOpt('student', 'success', 'delete');
            notify(notiOps.message, notiOps.options);
            totalReLoad();
            setPage(1);
          }
        }
      } catch (error) {
        notify(error.message, { variant: 'error' });
      }
      setOpenDeleteDialog(false);
    }
  };

  const removeClassFromSchoolTerm = async (pickedClass, schoolTerm) => {
    let variables = {
      id: pickedClass?._id,
      schoolTermId: null,
      schemaType: 'class',
      version: pickedClass?.version
    };
    await updateGrouping({
      variables: {
        id: pickedClass?._id,
        schoolTermId: null,
        schemaType: 'class',
        version: pickedClass?.version
      }
    });
  };

  const getClassesView = (shoolTerm) => {
    let classes = allClasses?.filter(
      (item) => item?.schoolTermId === shoolTerm?.id
    );
    return (
      <>
        {classes?.length ? (
          <CustomSelectBox
            variant="outlined"
            addMarginTop={true}
            defaultValue={
              classes.sort((a, b) => (a.name > b.name ? 1 : -1))[0]?._id
            }
            resources={classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
            onChange={(data) => {
              // console.log('selected Canvas:', data);
              // const selected = canvasList.find(
              //   (item) => item.value === data.value
              // );
              // setSelectedCanvas(selected);
            }}
            size="small"
            style={{ width: '80%' }}
          />
        ) : (
          []
        )}
      </>
    );
  };

  // return (
  //   <div
  //     style={{
  //       display: 'flex',
  //       justifyContent: 'space-between',
  //       alignItems: 'center',
  //       marginTop: index === 0 ? 0 : 10,
  //       marginBottom: index === length - 1 ? 0 : 10,
  //       maxWidth: 180
  //     }}
  //   >
  //     <Box
  //       key={index}
  //       style={{
  //         maxWidth: 160,
  //         lineBreak: 'anywhere',
  //         textOverflow: 'ellipsis',
  //         overflow: 'hidden',
  //         whiteSpace: 'nowrap'
  //       }}
  //     >
  //       {el.name}
  //     </Box>
  //     {/* <div
  //       onClick={() => removeClassFromSchoolTerm(el, schoolTerm)}
  //       style={{ cursor: 'pointer' }}
  //     >
  //       <FontAwesomeIcon
  //         icon={faClose}
  //         size="sm"
  //         style={{ marginRight: 7 }}
  //       />
  //     </div> */}
  //   </div>
  // );

  const handleTableChange = async (method, value) => {
    setAnchorEl(null);
    try {
      if (method === 'edit') {
        setEditRow(loadedData?.find((el) => el.id === value));
        setOpenEditDialog(true);
      }

      if (method === 'delete') {
        setCheckbox(false);
        setCurrentRowId(value);
        setOpenDeleteDialog(true);
      }

      if (method === 'add') {
        setOpenCreate(true);
      }

      if (method === 'close') {
        setOpenEditDialog(false);
      }

      if (method === 'info') {
        const displayData = wholeData?.find((item) => item?._id === value?.id);
        setSelectedInfo(displayData);
        setOpenInfo(true);
      }
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const getDateStr_YYYY_MM_DD = (dateStr, type) => {
    if (!dateStr?.length) return null;
    let result = getISOTimeString(dateStr, type);
    return result;
  };

  const handleDialogChange = async (status, value) => {
    try {
      if (status) {
        if (!value?.name?.length) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'emailRequired'
          );
          notify('Name is required!', notiOps.options);
          setSchoolTermCreating(false);
          return;
        }

        setSchoolTermCreating(true);

        let variables = {
          name: value?.name,
          status: value?.status,
          schemaType: 'schoolTerm',
          version: 1,
          parentId: doc?._id,
          topology: {
            state: doc?.topology?.state,
            station: doc?.topology?.station,
            district: doc?.topology?.district,
            school: doc?._id
          },
          schedule: {
            startAt: getDateStr_YYYY_MM_DD(value?.startAt, 'start'),
            endAt: getDateStr_YYYY_MM_DD(value?.endAt, 'end')
          }
        };

        const response = await createGrouping({
          variables: variables
        });
        const { data } = response;
        setOpenEditDialog(false);
        setCreatedResponse(data.createGrouping);
        setOpenCreate(false);
        const notiOps = getNotificationOpt('schoolTerm', 'success', 'create');
        notify(notiOps.message, notiOps.options);
        totalReLoad();
      } else {
        setOpenCreate(false);
      }
    } catch (error) {
      setSchoolTermCreating(false);
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(error.message, notiOps.options);
    }
    setSchoolTermCreating(false);
  };

  const handleDeviceChange = async (method, updateData) => {
    try {
      if (method === 'editSave') {
        let variables = {
          id: updateData.id,
          name: updateData.name,
          version: updateData?.version,
          schemaType: updateData?.schemaType,
          schedule: {
            startAt: getDateStr_YYYY_MM_DD(
              updateData?.schedule?.startDate,
              'start'
            ),
            endAt: getDateStr_YYYY_MM_DD(updateData?.schedule?.endDate, 'end')
          }
        };
        setSchoolTermCreating(true);
        await updateGrouping({ variables });
        setSchoolTermCreating(false);
        setOpenEditDialog(false);
        const notiOps = getNotificationOpt('schoolTerm', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error);
      setSchoolTermCreating(false);
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      if (error.message === en['data_changed']) {
        notify(error.message, notiOps.options);
      } else {
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleEllipsisClose = () => {
    setAnchorEl(null);
  };

  const handleEllipsisClicked = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const getStatusLabel = (value) => {
    let returnData = '';
    switch (value) {
      case 'created':
        returnData = 'Created';
        break;
      case 'active':
        returnData = 'Active';
        break;
      case 'inactive':
        returnData = 'Pending';
        break;
      case 'pending':
        returnData = 'Pending';
        break;
      case 'expired':
        returnData = 'Expired';
        break;
      case 'delete':
        returnData = 'To be deleted';
        break;
      default:
        returnData = 'Active';
        break;
    }
    return returnData;
  };

  useEffect(() => {
    setLoadTableData(loadedData);
  }, [loadedData]);

  const drawTable = () => {
    return (
      loadTableData?.length > 0 &&
      loadTableData.map((row, index) => {
        return (
          <TableRow
            hover
            key={index}
            className={clsx({
              [classes.selectedRow]: false //selectedRow?.id === row?.id
            })}
            // onClick={(e) => {
            //   if (setSelectedRow) {
            //     setSelectedRow(row);
            //   }
            // }}
            onDoubleClick={(e) => {
              if (row.disable) {
                handleTableChange('edit', row.id);
              }
            }}
          >
            <TableCell component="th" align="left">
              {index + 1}
            </TableCell>
            <TableCell component="th" align="left">
              {row.name}
            </TableCell>
            <TableCell component="th" align="left">
              <span>
                {row.schedule?.startAt?.length
                  ? getFormattedDate(row.schedule?.startAt, 'MM-DD-yyyy')
                  : ''}
              </span>
            </TableCell>
            <TableCell component="th" align="left">
              <span>
                {row.schedule?.endAt?.length
                  ? getFormattedDate(row.schedule?.endAt, 'MM-DD-yyyy')
                  : ''}
              </span>
            </TableCell>
            <TableCell component="th" align="left">
              {getClassesView(row)}
            </TableCell>

            <TableCell component="th" align="left">
              {getStatusLabel(row?.schedule?.status)}
            </TableCell>

            {isSmallScreen ? (
              <TableCell component="th" align="center" className={classes.cell}>
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
                  <StyledMenuItem>
                    <div
                      onClick={() =>
                        handleTableChange('edit', mobSelectedRow?.id)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faEdit}
                        size="xs"
                        style={{ marginRight: 7 }}
                      />
                      {en['Edit']}
                    </div>
                  </StyledMenuItem>
                  <StyledMenuItem
                    disabled={currentUser?._id === mobSelectedRow?.id}
                  >
                    <div
                      onClick={() =>
                        handleTableChange('delete', mobSelectedRow?.id)
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

                  {isSuperAdmin && (
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
                  )}
                </StyledMenu>
              </TableCell>
            ) : (
              <TableCell component="th" align="center" className={classes.cell}>
                <Box textAlign="center" style={{ minWidth: 90 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleTableChange('edit', row.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleTableChange('delete', row.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  {isSuperAdmin && (
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
                  )}
                </Box>
              </TableCell>
            )}
          </TableRow>
        );
      })
    );
  };

  const handleSearch = (value) => {
    setTotalRow(0);
    setNameRegExp(value?.toLowerCase());
  };

  const handleNameSort = () => {
    setSortKey('name');
    setNameSortDirection(nameSortDirection !== 'desc' ? 'desc' : 'asc');
  };
  const handleStatusSort = () => {
    setSortKey('schedule.status');
    setStatusSortDirection(statusSortDirection !== 'desc' ? 'desc' : 'asc');
  };

  const handleStartAtSort = () => {
    setSortKey('schedule.startAt');
    setStartAtSortDirection(startAtSortDirection !== 'desc' ? 'desc' : 'asc');
  };

  const handleEndAtSort = () => {
    setSortKey('schedule.endAt');
    setEndAtSortDirection(endAtSortDirection !== 'desc' ? 'desc' : 'asc');
  };
  return (
    <LoadingCard loading={loadingPanel} isProgress={true}>
      <Box display="flex" alignItems="center" marginLeft={0}>
        <span style={{ display: 'flex' }}>
          <UserSearch
            type={'School Terms'}
            fromTable={true}
            onChange={(value) => handleSearch(value)}
            useStyles={useStylesSearch}
          />
        </span>
      </Box>
      <div style={{ position: 'relative' }}>
        <TableContainer
          style={{
            maxHeight: isSmallScreen
              ? `calc(100vh - 354px)`
              : `calc(100vh - 298px)`
          }}
        >
          <Table stickyHeader aria-label="sticky table" ref={mainTable}>
            <TableHead>
              <TableRow>
                <TableCell align="left">{en['No']}</TableCell>
                <TableCell align="left">
                  <TableSortLabel
                    active={true}
                    onClick={handleNameSort}
                    direction={nameSortDirection}
                    style={{ minWidth: 68 }}
                  >
                    {en['Name']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '106px' }}>
                  <TableSortLabel
                    active={true}
                    onClick={handleStartAtSort}
                    style={{ minWidth: 120 }}
                    direction={startAtSortDirection}
                  >
                    {en['Start Date']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '120px' }}>
                  <TableSortLabel
                    active={true}
                    onClick={handleEndAtSort}
                    style={{ minWidth: 120 }}
                    direction={endAtSortDirection}
                  >
                    {en['End Date']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '112px' }}>
                  {en['Classes']}
                </TableCell>
                <TableCell align="left" style={{ minWidth: 68 }}>
                  <TableSortLabel
                    active={true}
                    onClick={handleStatusSort}
                    style={{ minWidth: 68 }}
                    direction={statusSortDirection}
                  >
                    {en['Status']}
                  </TableSortLabel>
                </TableCell>
                {isSuperAdmin ||
                currentUser?.schemaType === 'sysAdmin' ||
                currentUser?.schemaType === 'stationAdmin' ||
                currentUser?.schemaType === 'districtAdmin' ||
                currentUser?.schemaType === 'schoolAdmin' ? (
                  <TableCell align="center" style={{ minWidth: 88 }}>
                    # {en['Action']}
                  </TableCell>
                ) : (
                  []
                )}
              </TableRow>
            </TableHead>
            <TableBody>{drawTable(loadedData)}</TableBody>
          </Table>
        </TableContainer>
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
      </div>
      <CreateSchoolTermDialog
        open={openCreate}
        onChange={handleDialogChange}
        isSchoolTermCreating={isSchoolTermCreating}
        setSchoolTermCreating={setSchoolTermCreating}
      />
      <EditSchoolTermDialog
        open={openEditDialog}
        type={sType}
        resources={editRow}
        onChange={(type, value) => {
          if (type === 'close') setOpenEditDialog(false);
        }}
        onSaveChange={handleDeviceChange}
        isSchoolTermUpdating={isSchoolTermCreating}
      />
      <CustomDialog
        open={openDeleteDialog}
        title={en['Do you want to delete this'] + ` ${sType}?`}
        mainBtnName="Delete"
        onChange={deleteData}
      >
        {en['Are you sure want to delete this data?']}
        <br />
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openClassRemoveDialog}
        title={en[`Do you want to remove this class from the student?`]}
        mainBtnName={en['Delete']}
        onChange={removeClassFromStudent}
      >
        {en['Are you sure want to remove this class?']}
        <br />
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title="Information"
        maxWidth="sm"
        fullWidth={true}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={selectedInfo} />
        </Grid>
      </CustomDialog>
    </LoadingCard>
  );
};

export default SchoolTermTable;
