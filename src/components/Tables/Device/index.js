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
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
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
import CreateDeviceDialog from './Dialog';
import EditDeviceDialog from './EditDialog';
import UserSearch from './Search';
import { useStyles, useStylesSearch } from './style';
import clsx from 'clsx';
import JSONEditor from '@app/components/JSONEditor';
import { useUserContext } from '@app/providers/UserContext';
import { useNotifyContext } from '@app/providers/NotifyContext';
import {
  getDisplayName,
  isValidSerialNumber,
  isDuplicatedSerialNumber
} from '@app/utils/functions';
import { usePageCountContext } from '@app/providers/PageCountContext';
import {
  create,
  remove,
  update,
  groupingList
} from '@app/utils/ApolloCacheManager';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { withStyles } from '@material-ui/core/styles';
import { CustomSelectBox } from '@app/components/Custom';

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

const DeviceTable = ({
  docId,
  updateValue,
  disable,
  selectedRow,
  setSelectedRow,
  userTypeData,
  stationLoadedData,
  filterValue,
  onFilter,
  doc,
  refresh,
  setRefresh,
  showAddDeviceDlg,
  setShowAddDeviceDlg,
  setStructuredData,
  searchValue,
  isDevicesMenu,
  clearFilter,
  setClearFilter
}) => {
  const sType = 'device';
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
  const [lastSeenSortDirection, setLastSeenSortDirection] = useState('asc');
  const [statusSortDirection, setStatusSortDirection] = useState('asc');
  const [sortKey, setSortKey] = useState();
  const [isUserCreating, setUserCreating] = useState(false);
  const [editRow, setEditRow] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [data, setData] = useState();
  const [allClasses, setAllClasses] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
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
    if (showAddDeviceDlg) {
      if (doc?.schemaType === 'class') {
        handleTableChange('add');
      } else {
        setOpenCreate(true);
      }
      setShowAddDeviceDlg(false);
    }
  }, [showAddDeviceDlg]);

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
    schemaType: sType,
    sortBy: sortKey,
    parentId: doc?.topology?.station,
    orderType:
      sortKey === 'status' ? statusSortDirection : lastSeenSortDirection,
    nameRegExp: nameRegExp,
    offset: pageCount * (page - 1),
    limit: pageCount,
    // type: 'EDU',
    groupIdList:
      allDistricts?.find((item) => item._id === filterValue)?.groupId == null
        ? null
        : [allDistricts?.find((item) => item._id === filterValue)?.groupId]
  });

  const getVariables = (schemaType) => {
    if (schemaType === 'district') {
      return {
        schemaType: schemaType,
        stationId: docId
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

  const [
    allDistrictRefetch,
    {
      loading: allDistrictsLoading,
      error: allDistrictsError,
      data: allDistrictsData
    }
  ] = useLazyQuery(getGroupingByVariables(getVariables('district')), {
    fetchPolicy: 'network-only'
  });

  const [
    allSchoolsRefetch,
    { loading: allSchoolsLoading, error: allSchoolsError, data: allSchoolsData }
  ] = useLazyQuery(getGroupingByVariables(getVariables('school')), {
    fetchPolicy: 'network-only'
  });

  const [
    allStudentsRefetch,
    {
      loading: allStudentsLoading,
      error: allStudentsError,
      data: allStudentsData
    }
  ] = useLazyQuery(getGroupingByVariables(getVariables('student')), {
    fetchPolicy: 'network-only'
  });

  const { data: totalPageCount, refetch: getTotalCount } =
    useTotalCountFetchQuery({
      schemaType: sType,
      parentId: doc?.topology?.station,
      nameRegExp: nameRegExp,
      // type: 'EDU',
      groupIdList:
        allDistricts?.find((item) => item._id === filterValue)?.groupId == null
          ? null
          : [allDistricts?.find((item) => item._id === filterValue)?.groupId]
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
    if (searchValue != null) handleSearch(searchValue);
  }, [searchValue]);

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
        totalData?.grouping.filter(
          (item) =>
            item.parentId === docId &&
            (item.type !== 'KSK' || !item.childrenIdList?.length)
        )
      );
    }
  }, [totalLoading, totalError, totalData]);

  useEffect(() => {
    if (!allClassesError && !allClassesLoading && allClassesData) {
      setAllClasses(allClassesData.grouping);
    }
  }, [allClassesLoading, allClassesError, allClassesData]);

  useEffect(() => {
    if (!allDistrictsError && !allDistrictsLoading && allDistrictsData) {
      setAllDistricts(allDistrictsData.grouping);
    }
  }, [allDistrictsLoading, allDistrictsError, allDistrictsData]);

  useEffect(() => {
    if (!allSchoolsError && !allSchoolsLoading && allSchoolsData) {
      setAllSchools(allSchoolsData.grouping);
    }
  }, [allSchoolsLoading, allSchoolsError, allSchoolsData]);

  useEffect(() => {
    if (!allStudentsError && !allStudentsLoading && allStudentsData) {
      setAllStudents(allStudentsData.grouping);
    }
  }, [allStudentsLoading, allStudentsError, allStudentsData]);

  useEffect(() => {
    if (docId) {
      allDeviceRefetch({
        variables: getVariables('class')
      });
      allDistrictRefetch({
        variables: getVariables('district')
      });
      allSchoolsRefetch({
        variables: getVariables('school')
      });
      allStudentsRefetch({
        variables: getVariables('student')
      });
    }
  }, [docId]);

  useEffect(() => {
    if (refresh) {
      if (doc?.schemaType === 'station') return;
      allDeviceRefetch({
        variables: {
          schemaType: 'class',
          topology: {
            station: docId
          }
        }
      });
      totalReLoad();
      setPage(1);
    }
    if (setRefresh) setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    if (updateValue) {
      totalReLoad();
      setPage(1);
    }
  }, [updateValue]);

  useEffect(async () => {
    if (data) {
      setWholeData(data);
      if (setStructuredData) {
        setStructuredData(data);
      }
      const tmp = data.map((el) =>
        el
          ? {
              ...el,
              id: el._id,
              childrenIdList: el.childrenIdList ?? [],
              disable: true
            }
          : null
      );
      setLoadedData(tmp.filter((item) => item.parentId === docId));
    }
  }, [data]);

  useEffect(() => {
    if (page === 1) {
      totalRefetch();
    }
    setPage(1);
  }, [lastSeenSortDirection, sortKey, statusSortDirection]);

  useEffect(() => {
    setPage(1);
    totalReLoad();
  }, [nameRegExp, filterValue]);

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

  const getDistrictView = (device) => {
    let districts = allDistricts?.filter(
      (item) =>
        device?.groupIdList?.includes(item.groupId) &&
        item.topology?.station === device?.topology?.station
    );

    return (
      <>
        {districts?.map((el, index, { length }) => {
          return (
            <Box
              key={index}
              style={{
                marginTop: index === 0 ? 0 : 10,
                marginBottom: index === length - 1 ? 0 : 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              {el?.name}
            </Box>
          );
        })}
      </>
    );
  };

  const getGroupsView = (device) => {
    let groups = [];
    let station = stationLoadedData?.find(
      (item) => item._id === device?.parentId
    );
    if (station) groups.push('Station: ' + station?.name);
    let districts = allDistricts?.filter(
      (item) =>
        device?.groupIdList?.includes(item.groupId) &&
        item.topology?.station === device?.topology?.station
    );
    if (districts?.length) {
      districts?.forEach((item) => groups.push('District: ' + item.name));
    }
    let schools = allSchools?.filter(
      (item) =>
        device?.groupIdList?.includes(item.groupId) &&
        item.topology?.station === device?.topology?.station
    );
    if (schools?.length) {
      schools?.forEach((item) => groups.push('School: ' + item.name));
    }
    let classes = allClasses?.filter(
      (item) =>
        device?.groupIdList?.includes(item.groupId) &&
        item.topology?.station === device?.topology?.station
    );
    if (classes?.length) {
      classes?.forEach((item) => groups.push('Class: ' + item.name));
    }
    let students = allStudents?.filter(
      (item) =>
        device?.groupIdList?.includes(item.groupId) &&
        item.topology?.station === device?.topology?.station
    );
    if (students?.length) {
      students?.forEach((item) => groups.push('Student: ' + item.name));
    }

    return (
      <>
        {groups?.map((el, index, { length }) => {
          return (
            <Box
              key={index}
              style={{
                marginTop: index === 0 ? 0 : 10,
                marginBottom: index === length - 1 ? 0 : 10,
                maxWidth: 160,
                lineBreak: 'anywhere',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {el}
            </Box>
          );
        })}
      </>
    );
  };

  const handleDeviceChange = async (method, updateData) => {
    try {
      if (method === 'editSave') {
        const findedData = loadedData?.find((el) => el.id === updateData?.id);

        let variables = {
          id: updateData.id,
          name: updateData.name,
          schemaType: sType,
          version: findedData.version,
          desc: updateData.desc,
          status: updateData?.status,
          trackingAuthorName: currentUser?.name,
          updatedAt: updateData?.updatedAt
        };
        setUserCreating(true);
        await updateGrouping({ variables });
        setUserCreating(false);
        setOpenEditDialog(false);
        const notiOps = getNotificationOpt('device', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error);
      setUserCreating(false);
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      if (error.message === en['data_changed']) {
        notify(error.message, notiOps.options);
      } else {
        notify(notiOps.message, notiOps.options);
      }
    }
  };

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

  const handleDialogChange = async (status, value) => {
    try {
      if (status) {
        if (!value?.name?.length) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'emailRequired'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        if (!isValidSerialNumber(value?.name)) {
          const notiOps = getNotificationOpt(
            'device',
            'error',
            'invalidSerialNumber'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        if (isDuplicatedSerialNumber(value?.name, loadedData)) {
          const notiOps = getNotificationOpt(
            'device',
            'error',
            'duplicatedSerialNumber'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        setUserCreating(true);

        let variables = {
          ...value,
          schemaType: 'device',
          version: 1,
          groupIdList: [doc?.groupId]
        };
        if (value.name.length === 12) {
          let macAddress = '';
          for (var i = 0; i < 6; i++) {
            macAddress += value.name.charAt(i * 2);
            macAddress += value.name.charAt(i * 2 + 1);
            if (i !== 5) {
              macAddress += ':';
            }
          }
          variables = {
            ...variables,
            name: macAddress
          };
        }

        const response = await createGrouping({
          variables: variables
        });
        const { data } = response;
        setOpenEditDialog(false);
        setCreatedResponse(data.createGrouping);
        setOpenCreate(false);
        const notiOps = getNotificationOpt('device', 'success', 'create');
        notify(notiOps.message, notiOps.options);
        totalReLoad();
      } else {
        setOpenCreate(false);
      }
    } catch (error) {
      setUserCreating(false);
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(error.message, notiOps.options);
    }
    setUserCreating(false);
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

  const handleSearch = (value) => {
    setTotalRow(0);
    setNameRegExp(value?.toLowerCase());
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const getModelMake = (str) => {
    if (str == null) return '';
    if (str?.split(':')?.length > 1) {
      let modelNumber = str?.split(':')[str?.split(':')?.length - 1];
      return str?.replace(':' + modelNumber, '');
    } else if (str && str?.split(':')?.length === 1) {
      return str;
    } else {
      return '';
    }
  };

  const getModelNumber = (str) => {
    if (str?.split(':')?.length > 1) {
      let modelNumber = str?.split(':')[str?.split(':')?.length - 1];
      return modelNumber;
    } else {
      return '';
    }
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
        returnData = 'Inactive';
        break;
      case 'published':
        returnData = 'Published';
        break;
      case 'delete':
        returnData = 'To be deleted';
        break;
      default:
      // code block
    }
    return returnData;
  };

  useEffect(() => {
    setLoadTableData(loadedData);
  }, [loadedData]);

  useEffect(() => {
    if (clearFilter) {
      // handleSearch('');
      onFilter('all');
      setClearFilter(false);
    }
  }, [clearFilter]);

  const drawTable = () => {
    return (
      loadTableData?.length > 0 &&
      loadTableData.map((row, index) => {
        return (
          <TableRow
            hover
            key={index}
            className={clsx({
              [classes.selectedRow]: selectedRow?.id === row?.id
            })}
            onClick={(e) => {
              if (setSelectedRow) {
                setSelectedRow(row);
              }
            }}
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
              {row.desc?.short}
            </TableCell>

            {isDevicesMenu && (
              <TableCell component="th" align="left">
                {getDistrictView(row)}
              </TableCell>
            )}

            <TableCell component="th" align="left">
              {getModelMake(row.desc?.title)}
            </TableCell>

            <TableCell component="th" align="left">
              {getModelNumber(row.desc?.title)}
            </TableCell>
            <TableCell component="th" align="left">
              <Tooltip
                title={
                  <div>
                    Created At{' '}
                    <span style={{ color: 'yellow' }}>
                      {new Date(row.createdAt).toString()}
                    </span>
                    <br />
                    <br />
                    Updated At{' '}
                    <span style={{ color: 'yellow' }}>
                      {new Date(row.updatedAt).toString()}
                    </span>
                  </div>
                }
                classes={{ tooltip: classes.tooltip }}
              >
                <span>{getDisplayName(row.name)}</span>
              </Tooltip>
            </TableCell>
            <TableCell component="th" align="left">
              {row.desc?.long}
            </TableCell>
            <TableCell component="th" align="left">
              {getGroupsView(row)}
            </TableCell>
            <TableCell component="th" align="left">
              {allClasses
                ?.filter((el) => row.childrenIdList?.includes(el._id))
                ?.map((el, index, { length }) => {
                  return (
                    <Box
                      style={{
                        marginTop: index === 0 ? 0 : 10,
                        marginBottom: index === length - 1 ? 0 : 10,
                        display: 'flex',
                        flexDirection: 'row'
                      }}
                    >
                      {el.name}
                    </Box>
                  );
                })}
            </TableCell>

            <TableCell component="th" align="left">
              {getStatusLabel(row?.status)}
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

  const handleStatusSort = () => {
    setSortKey('status');
    setStatusSortDirection(statusSortDirection !== 'desc' ? 'desc' : 'asc');
  };
  return (
    <LoadingCard loading={loadingPanel} isProgress={true} rootWidth="100%">
      <Box display="flex" alignItems="center" marginLeft={0}>
        <span style={{ display: 'flex' }}>
          <UserSearch
            type={'Devices'}
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
                <TableCell align="left">{en['Manufacturer']}</TableCell>
                {isDevicesMenu && (
                  <TableCell align="left">
                    <CustomSelectBox
                      variant="outlined"
                      addMarginTop={true}
                      style={classes.selectFilter}
                      value={filterValue}
                      resources={[
                        {
                          label: en['All Districts'],
                          value: 'all',
                          _id: 'all',
                          name: en['All Districts']
                        },
                        ...allDistricts
                      ]}
                      onChange={(data) => onFilter(data?._id)}
                      size="small"
                      disabled={false}
                      limitWidth
                    />
                  </TableCell>
                )}
                <TableCell align="left" style={{ minWidth: '106px' }}>
                  {en['Make']}
                </TableCell>
                <TableCell align="left" style={{ minWidth: '120px' }}>
                  {en['Model']}
                </TableCell>
                <TableCell align="left" style={{ minWidth: '112px' }}>
                  {en['Serial Number']}
                </TableCell>
                <TableCell align="left" style={{ minWidth: '116px' }}>
                  {en['WiFi Password']}
                </TableCell>
                <TableCell align="left" style={{ minWidth: '112px' }}>
                  {'Group Info'}
                </TableCell>
                <TableCell align="left" style={{ minWidth: 180 }}>
                  {en['Classes']}
                </TableCell>

                <TableCell align="left">
                  <TableSortLabel
                    active={true}
                    onClick={handleStatusSort}
                    direction={statusSortDirection}
                    style={{ minWidth: 68 }}
                  >
                    {en['Status']}
                  </TableSortLabel>
                </TableCell>

                {!disable &&
                (isSuperAdmin ||
                  currentUser?.schemaType === 'sysAdmin' ||
                  currentUser?.schemaType === 'stationAdmin' ||
                  currentUser?.schemaType === 'districtAdmin' ||
                  currentUser?.schemaType === 'schoolAdmin') ? (
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
      <CreateDeviceDialog
        type={'device'}
        userTypeData={userTypeData}
        open={openCreate}
        doc={doc}
        onChange={handleDialogChange}
        stationLoadedData={stationLoadedData || []}
        createdResponse={createdResponse}
        isUserCreating={isUserCreating}
        setUserCreating={setUserCreating}
      />
      <EditDeviceDialog
        open={openEditDialog}
        type={sType}
        resources={editRow}
        onChange={handleTableChange}
        onSaveChange={handleDeviceChange}
        isUserCreating={isUserCreating}
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

export default DeviceTable;
