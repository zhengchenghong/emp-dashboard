/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Select,
  Table,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  IconButton,
  ListItemText,
  LinearProgress,
  Typography,
  Input,
  Grid,
  Menu
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close
} from '@material-ui/icons';
import {
  faTimes,
  faInfo,
  faEdit,
  faSave,
  faTrash,
  faEllipsisV,
  faS
} from '@fortawesome/pro-solid-svg-icons';
import { faGoogle, faCuttlefish } from '@fortawesome/free-brands-svg-icons';
import { AccessConfigForm, AvatarUploadForm } from '@app/components/Forms';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import { getFileExtension } from '@app/utils/file-manager';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import {
  useFetchDataByVariables,
  useTotalCountFetchQuery,
  getGroupingByVariables
} from '@app/utils/hooks/form';
import graphql from '@app/graphql';
import CreateUserDialog from './Dialog';
import EditUserDialog from './EditDialog';
import UserSearch from './Search';
import { useStyles, useStylesSearch } from './style';
import { UsersResource } from './data';
import clsx from 'clsx';
import JSONEditor from '@app/components/JSONEditor';
import { useUserContext } from '@app/providers/UserContext';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import FilterEducator from '@app/components/Tables/Educator/Filter';
import FilterStudent from '@app/components/Tables/Student/Filter';
import {
  uploadFileToS3,
  getBaseUrlforBackend,
  isFileExistS3
} from '@app/utils/aws_s3_bucket';
import {
  getDisplayName,
  getFileNameFromURL,
  getFileDirectFromURL,
  getFileBaseURLFromURL,
  getUUID,
  openPopupWindow
} from '@app/utils/functions';
import AvatarImage from '@app/components/Custom/AvatarImage/AvatarImage';
import { usePageCountContext } from '@app/providers/PageCountContext';
import {
  create,
  remove,
  update,
  groupingList
} from '@app/utils/ApolloCacheManager';

import { useFilterContext } from '@app/providers/FilterContext';
import { CustomSelectBox } from '@app/components/Custom';
import StatesList from '@app/constants/states.json';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { en } from '@app/language';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { withStyles } from '@material-ui/core/styles';
import SchoologyAuth from '../SchoologyAuth';

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

const getTypeLabel = (value) => {
  if (value === 'stationAdmin') return 'Station';
  if (value === 'districtAdmin' || value === 'educator' || value === 'student')
    return 'District';
  if (value === 'schoolAdmin') return 'School';
  return 'Type';
};

const isValidEmail = (email) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};
const MenuProps = {
  PaperProps: {
    style: {
      width: 250
    }
  }
};
const statusTypeData = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'delete', label: 'To be deleted' }
];

const userTypes = [
  'sysAdmin',
  'stationAdmin',
  'districtAdmin',
  'schoolAdmin',
  'educator',
  'student'
];

const UserListForm = ({
  file,
  docId,
  type,
  filterUser,
  updateValue,
  filterValue,
  canUpload,
  onChange,
  disable,
  currentMenu,
  selectedRow,
  setSelectedRow,
  isUserMenu,
  hasTypeField,
  userTypeData,
  classLoadedData,
  schoolLoadedData,
  stationLoadedData,
  districtLoadedData,
  studentEditRow,
  teacherEditRow,
  doc,
  refresh,
  setRefresh,
  pageType,
  dataToFilter,
  onFilter,
  showUserDialog,
  setShowUserDialog,
  setStructuredData,
  setSchoolAdminData,
  // For Educator Editing on Class
  schemaType,
  resources,
  refetchValue,
  searchValue
}) => {
  const classes = useStyles();
  const mainTable = useRef();
  const isSmallScreen = useSmallScreen();
  const { notify } = useNotifyContext();
  const { setOpenUserModal } = useGalleryContext();
  const [selectOpen, setSelectOpen] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [schoolData, setSchoolData] = useState([]);
  const [currentRowId, setCurrentRowId] = useState();
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openClassRemoveDialog, setOpenClassRemoveDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [studentClasses, setStudentClasses] = useState([{}]);
  const [openCreate, setOpenCreate] = useState(false);
  const [nameRegExp, setNameRegExp] = useState(null);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const [openSFDialog, setOpenSFDialog] = useState(false);
  const [openEFDialog, setOpenEFDialog] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { pageCount, setPageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [wholeData, setWholeData] = useState();
  const [isSuperAdmin, setSuperAdmin] = useState(false);
  const [lastSeenSortDirection, setLastSeenSortDirection] = useState('asc');
  const [statusSortDirection, setStatusSortDirection] = useState('asc');
  const [sortKey, setSortKey] = useState();
  const [isUserCreating, setUserCreating] = useState(false);
  const [rowData, setRowData] = useState({
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    parentId: null,
    avatar: null,
    childrenIdList: [],
    status: null,
    state: null,
    station: null,
    district: null,
    class: null
  });
  const [isFilter, setIsFilter] = useState(false);
  const [editRow, setEditRow] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [data, setData] = useState();
  const [allData, setAllData] = useState([]);
  const [loadTableData, setLoadTableData] = useState();
  const [currentUser] = useUserContext();
  const client = useApolloClient();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [avatarURL, setAvatarURL] = useState();
  const [createdResponse, setCreatedResponse] = useState();
  const [filteredStateList, setFilteredStateList] = useState([]);
  const [pickedUser, setPickedUser] = useState();
  const [pickedClass, setPickedClass] = useState();
  const [canvasList, setCanvasList] = useState([]);
  const [filteredCanvasList, setFilteredCanvasList] = useState([]);
  const [selectedCanvas, setSelectedCanvas] = useState();
  const [openCanvasSelect, setOpenCanvasSelect] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [openCanvasAdd, setOpenCanvasAdd] = useState(false);
  const [accessConfig, setAccessConfig] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobSelectedRow, setMobSelectedRow] = useState();
  const [allDevices, setAllDevices] = useState();

  const [allStudents, setAllStudents] = useState();
  const [authPopup, setAuthPopup] = useState(null);
  const [openSchoologyAuth, setOpenSchoologyAuth] = useState(false);
  const [schoology, setSchoology] = useState({});
  const {
    filterStateValue,
    setFilterStateValue,
    filteredStationList,
    filteredStationId,
    setFilteredStationId,
    filteredDistrictId,
    setFilteredDistrictId,
    filteredDistrictList,
    setCurrentSelectedType,
    setUserDataforStations,
    setUserDataforDistricts
  } = useFilterContext();

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const [
    googleAuthUrl,
    { loading: authUrlLoading, error: authUrlError, data: authUrl }
  ] = useLazyQuery(graphql.queries.googleAuthUrl, {
    fetchPolicy: 'no-cache'
  });

  const [
    getCanvasData,
    { loading: canvasLoading, error: canvasError, data: canvasData }
  ] = useLazyQuery(graphql.queries.grouping, {
    fetchPolicy: 'no-cache'
  });

  const fetchCanvasData = async (districtId) => {
    await getCanvasData({
      variables: {
        schemaType: 'accessConfig',
        parentId: districtId
      }
    });
  };

  useEffect(() => {
    if (!canvasLoading && !canvasError && canvasData) {
      const formatedCanvasList = canvasData.grouping?.map((item) => {
        return {
          label: item.data.canvas.baseUrl,
          value: item.data.canvas.clientId,
          id: item._id,
          schemaType: item.schemaType,
          district: item.parentId,
          ...item.data
        };
      });
      setCanvasList(formatedCanvasList);
    }
  }, [canvasLoading, canvasError, canvasData]);

  useEffect(() => {
    fetchCanvasData(null);
  }, []);

  useEffect(() => {
    if (showUserDialog) {
      if (doc?.schemaType === 'class' || doc?.schemaType === 'googleClass') {
        handleTableChange('add');
      } else {
        setOpenCreate(true);
        setOpenUserModal(true);
      }
      setShowUserDialog(false);
    }
  }, [showUserDialog]);

  useEffect(() => {
    const stateListFromTopology = allData
      ?.map((item) => item?.topology?.state)
      ?.filter((item) => item !== null && item?.length > 0);

    const filteredStateLists = StatesList.filter((item) =>
      stateListFromTopology.includes(item?.value)
    );
    setFilteredStateList(filteredStateLists);
  }, [allData]);

  useEffect(() => {
    setSuperAdmin(currentUser.schemaType === 'superAdmin');
  }, [currentUser]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    if (!authUrlError && !authUrlLoading && authUrl) {
      console.log(authUrl);
      const { googleAuthUrl } = authUrl;
      if (authPopup) {
        authPopup.location.href = googleAuthUrl;
      }
    }
  }, [authUrlLoading, authUrlError, authUrl]);

  const displayStudents = (studentList) => {
    const names = [];
    studentList.forEach((item) => {
      let name =
        classLoadedData?.find((classItem) => classItem['value'] === item)
          ?.label &&
        getDisplayName(
          classLoadedData?.find((classItem) => classItem['value'] === item)
            ?.label
        );
      if (name) {
        names.push(name);
      }
    });
    return names.join(', ');
  };

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });
  const [createBulkUsersGrouping] = useMutation(
    graphql.mutations.createBulkUsersGrouping
  );
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
  } = useFetchDataByVariables(
    (type === 'student' || type === 'educator') && doc?.schemaType === 'class'
      ? {
          schemaType: type,
          parentId: doc?.topology?.district,
          classId: doc?._id,
          sortBy: sortKey,
          orderType:
            sortKey === 'status' ? statusSortDirection : lastSeenSortDirection,
          nameRegExp: nameRegExp,
          offset: pageCount * (page - 1),
          limit: pageCount
        }
      : !isUserMenu
      ? {
          schemaType: type,
          topology: {
            state: doc?.topology?.state,
            station: doc?.topology?.station,
            district: doc?.topology?.district
          },
          sortBy: sortKey,
          orderType:
            sortKey === 'status' ? statusSortDirection : lastSeenSortDirection,
          nameRegExp: nameRegExp,
          offset: pageCount * (page - 1),
          limit: pageCount
        }
      : filterStateValue === 'all'
      ? {
          schemaType: type,
          sortBy: sortKey,
          orderType:
            sortKey === 'status' ? statusSortDirection : lastSeenSortDirection,
          nameRegExp: nameRegExp,
          topology: {
            state: null
          },
          offset: pageCount * (page - 1),
          limit: pageCount
        }
      : {
          schemaType: type,
          topology: {
            state: filterStateValue,
            station: filteredStationId === 'all' ? null : filteredStationId,
            district: filteredDistrictId === 'all' ? null : filteredDistrictId
          },
          sortBy: sortKey,
          orderType:
            sortKey === 'status' ? statusSortDirection : lastSeenSortDirection,
          nameRegExp: nameRegExp,
          offset: pageCount * (page - 1),
          limit: pageCount
        }
  );

  const [
    allStudentsRefresh,
    {
      loading: allStudentsLoading,
      error: allStudentsError,
      data: allStudentsData
    }
  ] = useLazyQuery(graphql.queries.StudentGrouping, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    totalReLoad();
  }, [doc]);

  const allUserVariable = {
    schemaType: type,
    parentId: isUserMenu
      ? null
      : (type === 'student' || type === 'educator') &&
        (doc?.schemaType === 'class' || doc?.schemaType === 'googleClass')
      ? doc?.topology?.district
      : docId
  };

  const [
    allUserRefetch,
    { loading: allUserLoading, error: allUserError, data: allUserData }
  ] = useLazyQuery(getGroupingByVariables(allUserVariable), {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const { data: totalPageCount, refetch: getTotalCount } =
    useTotalCountFetchQuery(
      (type === 'student' || type === 'educator') && doc?.schemaType === 'class'
        ? {
            schemaType: type,
            parentId: doc?.topology?.district,
            classId: doc?._id,
            nameRegExp: nameRegExp
          }
        : !isUserMenu
        ? {
            schemaType: type,
            topology: {
              state: doc?.topology?.state,
              station: doc?.topology?.station,
              district: doc?.topology?.district
            },
            nameRegExp: nameRegExp
          }
        : filterStateValue === 'all'
        ? {
            schemaType: type,
            nameRegExp: nameRegExp,
            topology: {
              state: null
            }
          }
        : {
            schemaType: type,
            topology: {
              state: filterStateValue,
              station: filteredStationId === 'all' ? null : filteredStationId,
              district: filteredDistrictId === 'all' ? null : filteredDistrictId
            },
            nameRegExp: nameRegExp
          }
    );

  const logValues = () => {
    console.log('State ======>', filterStateValue);
    console.log('Station ======>', filteredStationId);
    let variables =
      (type === 'student' || type === 'educator') && doc?.schemaType === 'class'
        ? {
            schemaType: type,
            parentId: doc?.topology?.district,
            classId: doc?._id,
            sortBy: sortKey,
            orderType:
              sortKey === 'status'
                ? statusSortDirection
                : lastSeenSortDirection,
            nameRegExp: nameRegExp,
            offset: pageCount * (page - 1),
            limit: pageCount
          }
        : !isUserMenu
        ? {
            schemaType: type,
            topology: {
              state: doc?.topology?.state,
              station: doc?.topology?.station,
              district: doc?.topology?.district
            },
            sortBy: sortKey,
            orderType:
              sortKey === 'status'
                ? statusSortDirection
                : lastSeenSortDirection,
            nameRegExp: nameRegExp,
            offset: pageCount * (page - 1),
            limit: pageCount
          }
        : filterStateValue === 'all'
        ? {
            schemaType: type,
            sortBy: sortKey,
            orderType:
              sortKey === 'status'
                ? statusSortDirection
                : lastSeenSortDirection,
            nameRegExp: nameRegExp,
            topology: {
              state: null
            },
            offset: pageCount * (page - 1),
            limit: pageCount
          }
        : {
            schemaType: type,
            topology: {
              state: filterStateValue,
              station: filteredStationId === 'all' ? null : filteredStationId,
              district: filteredDistrictId === 'all' ? null : filteredDistrictId
            },
            sortBy: sortKey,
            orderType:
              sortKey === 'status'
                ? statusSortDirection
                : lastSeenSortDirection,
            nameRegExp: nameRegExp,
            offset: pageCount * (page - 1),
            limit: pageCount
          };
    console.log('variables ====>', variables);
  };

  const totalReLoad = async () => {
    logValues();
    getTotalCount();
    totalRefetch();
  };
  useEffect(() => {
    if (type === 'student') {
      const variables = isUserMenu
        ? {
            schemaType: 'student'
          }
        : {
            schemaType: 'student',
            topology: {
              station: doc?.topology.station
            }
          };
      allStudentsRefresh({ variables: variables });
    }
  }, [type, doc, isUserMenu]);

  const allDevicesVariable = {
    schemaType: 'device'
    // type: 'EDU'
  };

  const [
    allDeviceRefetch,
    { loading: allDevicesLoading, error: allDevicesError, data: allDevicesData }
  ] = useLazyQuery(getGroupingByVariables(allDevicesVariable), {
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (!allDevicesError && !allDevicesLoading && allDevicesData) {
      console.log('allDevicesData:', allDevicesData);
      setAllDevices(allDevicesData.grouping);
    }
  }, [allDevicesLoading, allDevicesError, allDevicesData]);

  useEffect(() => {
    if (type === 'student') {
      const variables = isUserMenu
        ? {
            schemaType: 'student'
          }
        : {
            schemaType: 'student',
            topology: {
              station: doc?.topology.station
            }
          };
      allStudentsRefresh({ variables: variables });
    }
  }, [type, doc, isUserMenu]);

  useEffect(() => {
    if (type === 'student' && (doc?.topology?.station || isUserMenu)) {
      allDeviceRefetch({
        variables: isUserMenu
          ? {
              schemaType: 'device'
              // type: 'EDU'
            }
          : {
              schemaType: 'device',
              // type: 'EDU',
              parentId: doc?.topology?.station
            }
      });
    }
  }, [doc?.topology?.station, isUserMenu, type]);

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

  const title = UsersResource?.find(
    (item) => item['schemaType'] === type
  )?.name;

  useEffect(() => {
    if (isUserMenu) {
      setTotalPage(Math.ceil(totalRow / pageCount));
      totalReLoad();
    }
  }, [
    // filterDate1,
    // filterDate2,
    // isFilter,
    filterStateValue,
    filteredStationId,
    filteredDistrictId
  ]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    // if (page === 1) {
    //   totalRefetch();
    // }
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
    // setAllData(sortedData);
    let tempFilteredData = [];
    if (filterStateValue) {
      if (filterStateValue !== 'all') {
        tempFilteredData = allData.filter(
          (item, index) => item?.topology?.state === filterStateValue
        );
      } else {
        tempFilteredData = allData;
      }
      setUserDataforStations(tempFilteredData);
    }

    if (filteredStationId) {
      if (filteredStationId !== 'all') {
        tempFilteredData = tempFilteredData.filter(
          (item) => item?.topology?.station === filteredStationId
        );
      }
      setUserDataforDistricts(tempFilteredData);
    }

    if (filteredDistrictId) {
      if (filteredDistrictId !== 'all') {
        tempFilteredData = tempFilteredData.filter(
          (item) => item?.topology?.district === filteredDistrictId
        );
      }
    }
  }, [filterStateValue, filteredStationId, filteredDistrictId, allData]);

  const getTopologyState = (item) => {
    if (
      stationLoadedData &&
      item &&
      item.schemaType !== 'station' &&
      item?.topology
    ) {
      if (item?.topology?.state == null || item?.topology?.state === '') {
        let tpStation = stationLoadedData.filter(
          (el) => el._id === item?.topology?.station
        );
        if (tpStation.length > 0) {
          return tpStation[0]?.topology?.state;
        }
      } else {
        return item.topology.state;
      }
    }
    return '';
  };

  useEffect(() => {
    if (!totalError && !totalLoading && totalData) {
      if (!isUserMenu && type === 'schoolAdmin') {
        setSchoolAdminData(totalData?.grouping);
      }
      setData(totalData?.grouping);
    }
  }, [totalLoading, totalError, totalData]);

  useEffect(() => {
    if (!allStudentsLoading && !allStudentsError && allStudentsData) {
      setAllStudents(allStudentsData?.grouping);
    }
  }, [allStudentsLoading, allStudentsError, allStudentsData]);

  useEffect(() => {
    if (
      currentUser?.schemaType === 'superAdmin' ||
      currentUser?.schemaType === 'sysAdmin'
    ) {
      if (isUserMenu && type !== 'sysAdmin') {
        allUserRefetch({
          variables: allUserVariable
        });
      }
    }
  }, [type]);

  useEffect(() => {
    if (!allUserError && !allUserLoading && allUserData) {
      setAllData(allUserData.grouping);
    }
  }, [allUserLoading, allUserError, allUserData]);

  useEffect(() => {
    if (refresh) {
      if (doc?.schemaType === 'station') return;
      if (
        (doc?.schemaType === 'district' || doc?.schemaType === 'class') &&
        !isUserMenu
      ) {
        totalReLoad();
        setPage(1);
      } else {
        allUserRefetch({
          variables: allUserVariable
        });
        totalReLoad();
        setPage(1);
      }
    }
    if (setRefresh) setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    if (updateValue) {
      totalReLoad();
      setPage(1);
    }
  }, [updateValue]);

  const handleAdded = (methode, value, addedStudent) => {
    if (methode === 'added') {
      if (type === 'educator') {
        setOpenEFDialog(false);
      }
      if (type === 'student') {
        setOpenSFDialog(false);
        // updateStudentGroupIdList(addedStudent);
      }
      totalReLoad();
    }
  };

  useEffect(async () => {
    if (data) {
      const editRow =
        type && type === 'student' ? studentEditRow : teacherEditRow;
      setWholeData(data);
      if (setStructuredData) {
        setStructuredData(data);
      }
      const tmp = data.map((el) =>
        editRow?.id === el['_id']
          ? {
              id: editRow?.id,
              name: editRow?.name,
              firstName: editRow.firstName,
              lastName: editRow.lastName,
              email: editRow?.name,
              status: editRow?.status,
              parentId: editRow.parentId,
              schemaType: editRow.schemaType,
              avatar:
                editRow?.avatar?.baseUrl +
                editRow?.avatar?.fileDir +
                editRow?.avatar?.fileName,
              childrenIdList: editRow.childrenIdList
                ? editRow.childrenIdList
                : [],
              version: editRow.version,
              contact: editRow.contact,
              data: editRow.data,
              loginInfo: editRow.loginInfo,
              disable: false,
              station: editRow?.station,
              groupId: editRow?.groupId,
              state: editRow?.state,
              school: editRow?.school,
              district: editRow?.district,
              class: editRow?.class,
              deviceType: editRow?.deviceType,
              createdAt: editRow?.createdAt,
              updatedAt: editRow?.updatedAt,
              intRef: editRow?.intRef
            }
          : {
              id: el._id,
              name: el.name,
              firstName: el.contact?.firstName,
              lastName: el.contact?.lastName,
              email: el.contact?.email,
              parentId: el.parentId,
              status: el?.status,
              schemaType: el?.schemaType,
              avatar:
                el?.avatar?.baseUrl +
                el?.avatar?.fileDir +
                el?.avatar?.fileName,
              childrenIdList: el.childrenIdList ? el.childrenIdList : [],
              version: el.version,
              contact: el.contact,
              loginInfo: el.loginInfo,
              data: el.data,
              disable: true,
              groupId: el.groupId,
              topology: el?.topology,
              station: el?.topology?.station,
              state: el?.topology?.state,
              school: el?.topology?.school,
              district: el?.topology?.district,
              class: el?.topology?.class,
              deviceId: el?.destination?._id,
              deviceType: el?.destination?.type,
              createdAt: el?.createdAt,
              updatedAt: el?.updatedAt,
              intRef: el?.intRef
            }
      );

      if ((type === 'student' || type === 'educator') && hasTypeField) {
        const studentClass = {};
        const districts = {};
        const schools = {};
        tmp.forEach((item) => {
          studentClass[item.id] = item.childrenIdList;
          const districtChildren = userTypeData?.find(
            (data) => data['value'] === item?.parentId
          )?.childrenIdList;
          districts[item.id] = districtChildren;
          let schoolsList = schoolLoadedData?.filter(
            (item) => districtChildren?.indexOf(item['value']) > -1
          );
          let schoolChildrenList = [];
          schoolsList.forEach(
            (item) =>
              (schoolChildrenList = [
                ...schoolChildrenList,
                ...item.childrenIdList
              ])
          );
          schools[item.id] = schoolChildrenList;
        });
        setSchoolData(() => (schools ? schools : []));
        setStudentClasses(studentClass || []);
      }

      if (filterValue && filterValue !== 'all') {
        setLoadedData(tmp.filter((item) => item.parentId === filterValue));
      } else {
        setLoadedData(tmp);
      }
    }
  }, [data, filterValue]);

  useEffect(() => {
    if (page === 1) {
      totalRefetch();
    }
    setPage(1);
  }, [lastSeenSortDirection, sortKey, statusSortDirection]);

  useEffect(() => {
    setPage(1);
  }, [nameRegExp]);

  const getAssetUrl = (signedUrl) => {
    const temp =
      signedUrl.split('/')[0] +
      '//' +
      signedUrl.split('/')[2] +
      '/' +
      signedUrl.split('/')[3];
    return temp;
  };

  const uploadFile = async (file) => {
    try {
      setLoadingPanel(true);
      const fileExt = getFileExtension(file.name);
      const fileName = getCurrentUTCTime();
      const awsDirectory = docId;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      let assetUrl = await uploadFileToS3(file, uploadKey);

      await createBulkUsersGrouping({
        variables: {
          parentDocId: docId,
          type: type,
          assetUrl: assetUrl
        }
      });

      setRefresh(true);
      const notiOps = getNotificationOpt('userlist', 'success', 'upload');
      notify(notiOps.message, notiOps.options);
      setLoadingPanel(false);
      onChange('clear');
    } catch (error) {
      console.log(error.message);
      setLoadingPanel(false);
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  useEffect(() => {
    if (file && canUpload) {
      uploadFile(file);
    }
  }, [file, canUpload]);

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
              item: isUserMenu ? pickedClass?.value : pickedClass?._id,
              fieldName: 'childrenIdList',
              type: 'remove',
              trackingAuthorName: currentUser?.name
            }
          });

          await updateGroupingList({
            variables: {
              id: isUserMenu ? pickedClass?.value : pickedClass?._id,
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
          // removeClassGroupIdFromDevice(pickedUser, pickedClass);
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

    if (
      isUserMenu ||
      (doc?.schemaType !== 'class' && doc?.schemaType !== 'googleClass')
    ) {
      try {
        if (changeType && decision && checkbox) {
          // delete avatar from s3
          await deleteDocument({
            variables: {
              schemaType: type,
              id: currentRowId
            }
          });

          totalReLoad();
          let typeName =
            type === 'student'
              ? 'student'
              : type === 'educator'
              ? 'educator'
              : 'userlist';
          const notiOps = getNotificationOpt(typeName, 'success', 'delete');
          notify(notiOps.message, notiOps.options);
          setCheckbox(false);
        }
      } catch (error) {
        notify(error.message, { variant: 'error' });
      }
      setOpenDeleteDialog(false);
      setCurrentRowId();
    } else {
      if (type === 'educator') {
        try {
          const value = currentRowId;
          if (value && decision && checkbox) {
            const tmp = loadedData?.find((el) => el.id === currentRowId);
            if (tmp) {
              await updateGroupingList({
                variables: {
                  id: tmp.id,
                  schemaType: 'educator',
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
                  fieldName: 'authorIdList',
                  type: 'remove',
                  trackingAuthorName: currentUser?.name
                }
              });
              const notiOps = getNotificationOpt(
                'educator',
                'success',
                'delete'
              );
              notify(notiOps.message, notiOps.options);
              totalReLoad();
            }
          }
        } catch (error) {
          notify(error.message, { variant: 'error' });
        }
        setOpenDeleteDialog(false);
      }
      if (type === 'student') {
        try {
          const value = currentRowId;
          if (value && decision && checkbox) {
            const tmp = loadedData?.find((el) => el.id === currentRowId);
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

              if (tmp?.intRef?._id) {
                let sameDeviceUsers = loadedData.filter(
                  (el) =>
                    el.intRef?._id === tmp?.intRef?._id && el.id !== tmp.id
                );
                if (sameDeviceUsers == null || sameDeviceUsers.length === 0) {
                  let userDevice = allDevices?.find(
                    (item) => item._id === tmp?.intRef?._id
                  );
                  if (userDevice) {
                    await updateGroupingList({
                      variables: {
                        id: userDevice?._id,
                        schemaType: 'device',
                        item: docId,
                        fieldName: 'childrenIdList',
                        type: 'remove',
                        trackingAuthorName: currentUser?.name
                      }
                    });
                  }
                }
              }
              const notiOps = getNotificationOpt(
                'student',
                'success',
                'delete'
              );
              notify(notiOps.message, notiOps.options);
              // removeClassGroupIdFromDevice(tmp, doc);
              totalReLoad();
              setPage(1);
            }
          }
        } catch (error) {
          notify(error.message, { variant: 'error' });
        }
        setOpenDeleteDialog(false);
      }
    }
  };

  const assignClassToStudent = async (classItem, value) => {
    await updateGroupingList({
      variables: {
        id: classItem?.value,
        schemaType: classItem?.schemaType,
        item: value,
        fieldName: 'assigneeIdList',
        type: 'add',
        trackingAuthorName: currentUser?.name
      }
    });
  };

  const handleUserChange = async (
    method,
    updateData,
    newAvatar,
    additionalAction
  ) => {
    try {
      if (method === 'editSave') {
        const findedData = loadedData?.find((el) => el.id === updateData?.id);
        if (!updateData?.name?.length) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'emailRequired'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        if (
          !isValidEmail(
            updateData?.name ? updateData.name : findedData?.name
          ) &&
          type !== 'student'
        ) {
          const notiOps = getNotificationOpt('userlist', 'error', 'email');
          notify(notiOps.message, notiOps.options);
          return;
        }

        let newStatus = updateData?.status;
        if (updateData?.childrenIdList && hasTypeField && type === 'student') {
          updateData?.childrenIdList.map((item) => {
            const selectedClass = classLoadedData?.find(
              (el) => el?.value === item
            );

            if (selectedClass?.status === 'published') {
              newStatus = 'published';
            }
          });
        }

        let variables = {
          id: updateData.id,
          name: updateData.name.toLowerCase(),
          schemaType: type,
          version: findedData.version,
          status: updateData?.status ? updateData?.status : newStatus
        };

        if (!(type === 'sysAdmin' || type === 'superAdmin')) {
          variables = {
            ...variables,
            childrenIdList:
              hasTypeField && type === 'student'
                ? studentClasses[updateData.id]
                : updateData.childrenIdList
          };
        }

        const topology = {
          state: updateData?.state,
          station: updateData?.station,
          district: updateData?.district,
          school: updateData?.school,
          class: updateData?.class
        };

        if (
          topology.state !== findedData.state ||
          topology.station !== findedData.station ||
          topology.district !== findedData.district ||
          topology.school !== findedData.school ||
          topology.class !== findedData.class
        ) {
          variables = {
            ...variables,
            topology
          };
        }

        if (updateData?.parentId !== findedData.parentId) {
          variables = {
            ...variables,
            parentId: updateData.parentId
          };
        }

        let contact = {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData?.email
            ? updateData.email.toLowerCase()
            : updateData.name.toLowerCase()
          // phone: updateData.phone
        };

        if (
          findedData.firstName !== contact.firstName ||
          findedData.lastName !== contact.lastName ||
          findedData.email !== contact.email
          // || findedData.phone !== contact.phone
        ) {
          variables = {
            ...variables,
            contact
          };
        }

        if (findedData.avatar !== updateData.avatar) {
          let baseUrl;
          let fileDir;
          let fileName;
          let mimeType;

          if (updateData.avatar) {
            fileDir = getFileDirectFromURL(updateData.avatar);
            baseUrl = getFileBaseURLFromURL(updateData.avatar);
            fileName = getFileNameFromURL(updateData.avatar);
            if (updateData?.avatar.toLowerCase().endsWith('png')) {
              mimeType = 'image/png';
            } else {
              mimeType = 'image/jpeg';
            }
          }
          const avatar = fileName
            ? {
                uId: getUUID(),
                baseUrl,
                fileDir,
                fileName,
                mimeType,
                status: 'ready',
                type: 'avatar',
                data: {
                  imageSize: updateData?.imageSize
                }
              }
            : null;
          variables = {
            ...variables,
            avatar
          };
        }

        if (type === 'student' && updateData.device === 'no device') {
          variables = {
            ...variables,
            intRef: null
          };
        }

        if (
          type === 'student' &&
          updateData.device?._id &&
          updateData.device?._id !== findedData?.intRef?._id
        ) {
          variables = {
            ...variables,
            intRef: {
              _id: updateData.device?._id,
              schemaType: 'device'
            }
          };
        }

        variables = {
          ...variables,
          trackingAuthorName: currentUser?.name
        };

        await updateGrouping({ variables });
        setAvatarUpload(true);

        if (additionalAction !== 'fileRemoved') setOpenEditDialog(false);

        if (findedData?.avatar) {
          if (findedData.avatar !== updateData?.avatar) {
            const assetUrl = getAssetUrl(findedData?.avatar).split('/')[3];
            if (assetUrl) {
              const key = findedData?.avatar.split(assetUrl)[1].slice(1);
              if (key) {
                try {
                  await deleteAssetS3Grouping({
                    variables: {
                      bucket: assetUrl,
                      key: key
                    }
                  });
                } catch (err) {}
              }
            }
          }
        }
        const notiOps = getNotificationOpt('userlist', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }
    } catch (error) {
      console.log(error);
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleTableChange = async (method, value) => {
    setAnchorEl(null);
    try {
      if (method === 'edit') {
        setEditRow(loadedData?.find((el) => el.id === value));
        setRowData(loadedData?.find((el) => el.id === value));
        setOpenEditDialog(true);
      }

      if (method === 'delete') {
        setCheckbox(false);
        setCurrentRowId(value);
        setOpenDeleteDialog(true);
      }

      if (method === 'save') {
        const findedData = loadedData?.find((el) => el.id === value);

        if (!rowData?.name?.length) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'emailRequired'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        if (
          !isValidEmail(rowData?.name ? rowData.name : findedData?.name) &&
          type !== 'student'
        ) {
          const notiOps = getNotificationOpt('userlist', 'error', 'email');
          notify(notiOps.message, notiOps.options);
          return;
        }

        let newStatus = rowData?.status;
        if (rowData?.childrenIdList && hasTypeField && type === 'student') {
          rowData?.childrenIdList.map((item) => {
            const selectedClass = classLoadedData?.find(
              (el) => el?.value === item
            );

            if (selectedClass?.status === 'published') {
              newStatus = 'published';
            }
          });
        }

        let variables = {
          id: value,
          name: rowData.name.toLowerCase(),
          schemaType: type,
          version: rowData.version,
          status: rowData?.status ? rowData?.status : newStatus,
          childrenIdList:
            hasTypeField && type === 'student'
              ? studentClasses[value]
              : rowData.childrenIdList
        };

        if (findedData.avatar !== rowData.avatar) {
          let baseUrl;
          let fileDir;
          let fileName;
          let mimeType;

          if (rowData.avatar) {
            fileDir = getFileDirectFromURL(rowData.avatar);
            baseUrl = getBaseUrlforBackend(rowData.avatar, fileDir);
            fileName = getFileNameFromURL(rowData.avatar);
            if (rowData?.avatar.toLowerCase().endsWith('png')) {
              mimeType = 'image/png';
            } else {
              mimeType = 'image/jpeg';
            }
          }

          const avatar = fileName
            ? {
                uId: getUUID(),
                baseUrl,
                fileDir,
                fileName,
                mimeType,
                status: 'ready',
                type: 'avatar'
              }
            : null;
          variables = {
            ...variables,
            avatar
          };
        }

        const topology = {
          state: rowData?.state,
          station: rowData?.station,
          district: rowData?.district,
          school: rowData?.school
        };

        if (
          topology.state !== findedData.state ||
          topology.station !== findedData.station ||
          topology.district !== findedData.district ||
          topology.school !== findedData.school ||
          topology.class !== findedData.class
        ) {
          variables = {
            ...variables,
            topology
          };
        }

        if (rowData?.parentId !== findedData.parentId) {
          variables = {
            ...variables,
            parentId: rowData.parentId
          };
        }

        const contact = {
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          email: rowData.name
          // phone: rowData.phone
        };

        if (
          findedData.firstName !== contact.firstName ||
          findedData.lastName !== contact.lastName ||
          findedData.email !== contact.email
        ) {
          variables = {
            ...variables,
            contact
          };
        }

        variables = {
          ...variables,
          trackingAuthorName: currentUser?.name
        };

        const response = await updateGrouping({ variables });

        if (findedData?.avatar) {
          if (findedData.avatar !== rowData?.avatar) {
            const assetUrl = getAssetUrl(findedData?.avatar).split('/')[3];
            if (assetUrl) {
              const key = findedData?.avatar.split(assetUrl)[1].slice(1);
              if (key) {
                await deleteAssetS3Grouping({
                  variables: {
                    bucket: assetUrl,
                    key: key
                  }
                });
              }
            }
          }
        }

        const { data } = response;
        let tmp = loadedData.slice();
        const idx = tmp?.findIndex((el) => el.id === value.toString());

        let avatarUrl =
          data.updateGrouping?.avatar?.baseUrl &&
          data.updateGrouping?.avatar?.fileDir &&
          data.updateGrouping?.avatar?.fileName
            ? data.updateGrouping?.avatar?.baseUrl +
              data.updateGrouping?.avatar?.fileDir +
              data.updateGrouping?.avatar?.fileName
            : '';
        tmp[idx] = {
          ...tmp[idx],
          name: data.updateGrouping.name,
          firstName: data.updateGrouping.contact?.firstName,
          lastName: data.updateGrouping.contact?.lastName,
          email: data.updateGrouping.contact?.email,
          parentId: data.updateGrouping.parentId,
          status: data.updateGrouping?.status,
          avatar: avatarUrl,
          childrenIdList: data.updateGrouping.childrenIdList,
          version: data.updateGrouping.version,
          disable: true
        };

        let wholeTmp = wholeData.slice();
        const index = wholeTmp?.findIndex((el) => el.id === value.toString());
        wholeTmp[index] = data.grouping;
        setWholeData(wholeTmp);

        if (rowData?.childrenIdList && hasTypeField && type === 'student') {
          rowData?.childrenIdList.forEach((item) => {
            let selectedClass = classLoadedData?.find(
              (el) => el?.value === item
            );
            if (
              selectedClass &&
              !selectedClass?.assigneeIdList?.find((el) => el === value)
            ) {
              assignClassToStudent(selectedClass, value);
            }
          });
        }

        if (filterValue && filterValue !== 'all') {
          setLoadedData(tmp.filter((item) => item.parentId === filterValue));
          // setLoadedDataCopy(
          //   tmp.filter((item) => item.parentId === filterValue)
          // );
        } else {
          console.log('tmp:', tmp);
          setLoadedData(tmp);
          // setLoadedDataCopy(tmp);
        }
        onChange('');
        setOpenEditDialog(false);
        const notiOps = getNotificationOpt('userlist', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }

      if (method === 'add') {
        if (doc?.schemaType === 'class' || doc?.schemaType === 'googleClass') {
          if (type === 'educator') {
            setOpenEFDialog(true);
          }
          if (type === 'student') {
            setOpenSFDialog(true);
          }
        } else {
          setOpenCreate(true);
          setOpenUserModal(true);
        }
      }

      if (method === 'close') {
        setOpenEditDialog(false);
      }

      if (method === 'info') {
        const displayData = wholeData?.find((item) => item?._id === value?.id);
        setSelectedInfo(displayData);
        setOpenInfo(true);
      }

      if (method === 'googleAuth') {
        const displayData = wholeData?.find((item) => item?._id === value);
        if (displayData.data?.google_auth?.refresh_token) {
          const notiOps = getNotificationOpt(
            'userlist',
            'warning',
            'reAuthGoogle'
          );
          notify(notiOps.message, notiOps.options);
        } else {
          const popup = openPopupWindow('', 'Google Auth');
          setAuthPopup(popup);
          await googleAuthUrl();
        }
      }

      if (method === 'canvasAuth') {
        const user = wholeData?.find((item) => item?._id === value);
        console.log('canvas user:', user);
        setSelectedUser(user);
        const canvasInstances = canvasList?.filter(
          (item) => item.district === user.topology.district
        );
        if (!canvasInstances?.length) {
          const notiOps = getNotificationOpt('user', 'error', 'name');
          notify(
            'District is not configured for Canvas Ingest.',
            notiOps.options
          );
          return;
        }
        setFilteredCanvasList(canvasInstances);
        setSelectedCanvas(canvasInstances[0]);
        setOpenCanvasSelect(true);
      }

      if (method === 'schoologyAuth') {
        const user = wholeData?.find((item) => item?._id === value);
        setSelectedUser(user);
        setSchoology(user?.data?.schoology);
        setOpenSchoologyAuth(true);
      }
    } catch (error) {
      console.log(error);
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const isDuplicateEmail = (name) => {
    const findedData = loadedData?.find(
      (el) => el.name.toLowerCase() === name.toLowerCase()
    );
    if (findedData) {
      return true;
    }
    return false;
  };

  const handleRemoveClass = (classData, studentData) => {
    setPickedUser(studentData);
    setPickedClass(classData);
    setCheckbox(false);
    setOpenClassRemoveDialog(true);
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

        if (!isValidEmail(value.name) && type !== 'student') {
          const notiOps = getNotificationOpt('userlist', 'error', 'email');
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        if (isDuplicateEmail(value.name)) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'duplicateEmail'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }
        for (let el of userTypes) {
          let { data: userData } = await client.query({
            query: graphql.queries.nameGrouping,
            variables: {
              schemaType: el,
              name: value.name.toLowerCase()
            }
          });
          if (userData?.grouping.length > 0) {
            const notiOps = getNotificationOpt(
              'userlist',
              'error',
              'duplicateEmail'
            );
            notify(notiOps.message, notiOps.options);
            setUserCreating(false);
            return;
          }
        }

        if (hasTypeField && type === 'student' && !value.parentId) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'selectDistrict'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        if (hasTypeField && type === 'educator' && !value.parentId) {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'selectDistrict'
          );
          notify(notiOps.message, notiOps.options);
          setUserCreating(false);
          return;
        }

        setUserCreating(true);

        const topology = {
          station: !doc ? value?.station : doc?.topology?.station,
          district: !doc ? value?.district : doc?.topology?.district,
          school: !doc ? value?.school : doc?.topology?.school,
          state: !doc
            ? value?.state
            : doc?.topology?.state && doc?.topology?.state !== ''
            ? doc?.topology?.state
            : getTopologyState(doc),
          class: doc?.topology?.class
        };

        let variables = {
          schemaType: type,
          version: 1,
          name: value.name.toLowerCase(),
          contact: {
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email
              ? value.email.toLowerCase()
              : value.name.toLowerCase()
            // phone: value.phone
          },
          // avatar: value?.imageSize
          //   ? {
          //       data: {
          //         imageSize: value?.imageSize
          //       }
          //     }
          //   : null,
          status: 'created'
        };

        if (!(type === 'sysAdmin' || type === 'superAdmin')) {
          variables = {
            ...variables,
            parentId:
              hasTypeField || isUserMenu
                ? isUserMenu
                  ? value?.school
                  : value.parentId
                : docId,
            topology
          };
        }

        if (type === 'student' && value.deviceId) {
          variables = {
            ...variables,
            intRef: {
              _id: value.deviceId,
              schemaType: 'device'
            }
          };
        } else if (hasTypeField && type === 'educator' && value.parentId) {
          let selectedDistrict = userTypeData?.find(
            (el) => el.value === value.parentId
          );
          let topologyData = {
            state: selectedDistrict?.topology?.state,
            station: selectedDistrict?.topology?.station,
            district: selectedDistrict?.topology?.district,
            school: null,
            class: null
          };

          variables = {
            ...variables,
            trackingAuthorName: currentUser?.name,
            topology: topologyData
          };
        }

        if (value.avatarURL) {
          let mimeType;
          let baseUrl =
            value.avatarURL.split(doc?.topology?.station)[0] +
            doc?.topology?.station +
            '/';
          let fileName = value.avatarURL.split('/').pop();
          let fileDir = value.avatarURL
            .replace(baseUrl, '')
            .replace(fileName, '');
          if (value.avatarURL.toLowerCase().endsWith('png')) {
            mimeType = 'image/png';
          } else {
            mimeType = 'image/jpeg';
          }
          let avatar = {
            uId: getUUID(),
            baseUrl,
            fileDir,
            fileName,
            mimeType,
            type: 'avatar',
            status: 'ready'
          };
          variables = {
            ...variables,
            avatar
          };
        }

        variables = {
          ...variables,
          trackingAuthorName: currentUser?.name,
          type: 'EDU'
        };

        const response = await createGrouping({
          variables: variables
        });
        const { data } = response;
        setCreatedResponse(data.createGrouping);
        if (isAvatarAttached) {
          updateAvatar();
        } else {
          setOpenEditDialog(false);
          let notiOps = getNotificationOpt('userlist', 'success', 'create');
          if (type === 'student') {
            notiOps = getNotificationOpt('student', 'success', 'create');
          }
          notify(notiOps.message, notiOps.options);
        }
        totalReLoad();
        setOpenCreate(false);
        setOpenUserModal(false);
      } else {
        setOpenCreate(false);
        setOpenUserModal(false);
      }
    } catch (error) {
      setUserCreating(false);
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(error.message, notiOps.options);
    }
    setUserCreating(false);
  };

  const updateAvatar = async () => {
    if (isAvatarAttached) {
      setAvatarUpload(true);
      setAvatarAttached(false);
      return;
    }

    try {
      let baseUrl;
      let fileName;
      let fileDir;
      let mimeType;
      if (avatarURL) {
        fileDir = createdResponse._id + '/';
        baseUrl = avatarURL.split(fileDir)[0];
        fileName = avatarURL.split(fileDir)[1];
        if (avatarURL.toLowerCase().endsWith('png')) {
          mimeType = 'image/png';
        } else {
          mimeType = 'image/jpeg';
        }
      }

      let variables = {
        id: createdResponse._id,
        schemaType: createdResponse.schemaType,
        version: createdResponse.version,
        name: createdResponse.name,
        avatar: {
          uId: getUUID(),
          baseUrl,
          fileDir,
          fileName,
          mimeType,
          type: 'avatar',
          status: 'ready',
          data: createdResponse.avatar?.data
        },
        status: createdResponse?.status,
        contact: createdResponse.contact
      };

      if (!(type === 'sysAdmin' || type === 'superAdmin')) {
        variables = {
          ...variables,
          topology: {
            state: createdResponse.topology.state,
            station: createdResponse.topology.station,
            district: createdResponse.topology.district,
            school: createdResponse.topology.school
          },
          childrenIdList: createdResponse.childrenIdList
            ? createdResponse.childrenIdList
            : [],
          parentId: createdResponse.parentId
        };
      }

      variables = {
        ...variables,
        trackingAuthorName: currentUser?.name
      };

      await updateGrouping({ variables });

      setOpenCreate(false);
      setOpenUserModal(false);
      setOpenEditDialog(false);
      const notiOps = getNotificationOpt('userlist', 'success', 'create');
      notify(notiOps.message, notiOps.options);
    } catch (error) {
      console.log(error);
      const errorType = error?.message?.split(' ');
      if (errorType?.length) {
        const theError = error?.message?.split(' ')[0];
        if (theError === 'E11000') {
          const notiOps = getNotificationOpt(
            'userlist',
            'error',
            'duplicateEmail'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
      }
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(error.message, notiOps.options);
    }
  };

  const handleInputChange = async (method, value, id) => {
    if (
      (type === 'educator' || type === 'student') &&
      method === 'childrenIdList' &&
      hasTypeField
    ) {
      setStudentClasses((data) => ({ ...data, [id]: value }));
    }

    if (
      (type === 'educator' || type === 'student') &&
      method === 'parentId' &&
      hasTypeField
    ) {
      setStudentClasses((data) => ({ ...data, [id]: [] }));
      const district = userTypeData?.find(
        (item) => item['value'] === value
      )?.childrenIdList;
      const schools = schoolLoadedData?.filter(
        (item) => district?.indexOf(item['value']) > -1
      );
      let schoolChildrenList = [];
      schools.map(
        (item) =>
          (schoolChildrenList = [...schoolChildrenList, ...item.childrenIdList])
      );
      setSchoolData((data) => ({ ...data, [id]: schoolChildrenList }));
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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearch = (value) => {
    setTotalRow(0);
    setNameRegExp(value?.toLowerCase());
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const getSchoolgyIngestStatusClass = (row) => {
    if (row?.data?.schoology_status?.status) {
      let lastIngestAt = row?.data?.schoology_status?.ingestedAt;
      let recycleTime =
        stationLoadedData?.find((item) => item._id === row.station)?.config
          ?.schoologyIngestCycleTime || 30;
      if (recycleTime === 0 || recycleTime === '0') recycleTime = 30;
      if (lastIngestAt) {
        let diffTime =
          Math.abs(new Date() - new Date(lastIngestAt)) / 60 / 1000;
        if (diffTime / recycleTime > 2) {
          return classes.ingest_failed;
        } else {
          return classes.ingest_success;
        }
      } else {
        return classes.ingest_failed;
      }
    } else {
      return classes.ingest_failed;
    }
  };

  const getCanvasIngestStatusClass = (row) => {
    if (row?.data?.canvas_status?.status) {
      let lastIngestAt = row?.data?.canvas_status?.ingestedAt;
      let recycleTime =
        stationLoadedData?.find((item) => item._id === row.station)?.config
          ?.canvasIngestCycleTime || 30;
      if (recycleTime === 0 || recycleTime === '0') recycleTime = 30;
      if (lastIngestAt) {
        let diffTime =
          Math.abs(new Date() - new Date(lastIngestAt)) / 60 / 1000;
        if (diffTime / recycleTime > 2) {
          return classes.ingest_failed;
        } else {
          return classes.ingest_success;
        }
      } else {
        return classes.ingest_failed;
      }
    } else {
      return classes.ingest_failed;
    }
  };

  const getGoogleIngestStatusClass = (row) => {
    if (row?.data?.google_status?.status) {
      let lastIngestAt = row?.data?.google_status?.ingestedAt;
      let recycleTime =
        stationLoadedData?.find((item) => item._id === row.station)?.config
          ?.googleIngestCycleTime || 30;
      if (recycleTime === 0 || recycleTime === '0') recycleTime = 30;
      if (lastIngestAt) {
        let diffTime =
          Math.abs(new Date() - new Date(lastIngestAt)) / 60 / 1000;
        if (diffTime / recycleTime > 2) {
          return classes.ingest_failed;
        } else {
          return classes.ingest_success;
        }
      } else {
        return classes.ingest_failed;
      }
    } else {
      return classes.ingest_failed;
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
    }
    return returnData;
  };

  const convertTime = (value) => {
    const convert_date = moment(new Date(value)).format('MM/DD/YY hh:mm:ss');
    return convert_date;
  };

  useEffect(() => {
    setLoadTableData(loadedData);
  }, [loadedData]);

  useEffect(() => {
    if (isAvatarUpload && !openCreate) {
      // update Avatar here
      updateAvatar();
      setAvatarUpload(false);
    }
  }, [avatarURL]);

  useEffect(() => {
    if (filterStateValue === 'all' || filterStateValue == null) {
      setFilteredStationId('all');
      setFilteredDistrictId('all');
    }
  }, [filterStateValue]);

  const handleStateChange = (data) => {
    console.log(data);
    setCurrentSelectedType('state');
    // if (data?.value === 'all') {
    //   setFilteredStationId('all');
    //   setFilteredDistrictId('all');
    // }
    setFilterStateValue(data?.value);
  };

  const handleStationChange = (data) => {
    setCurrentSelectedType('station');
    setFilteredStationId(data?.value);
    if (data?.value === 'all') {
      setFilteredDistrictId('all');
    }
  };

  const handleDistrictChange = (data) => {
    setCurrentSelectedType('district');
    setFilteredDistrictId(data?.value);
  };

  const handleRemoveAvatar = async (user) => {
    let variables = {
      id: user.id,
      schemaType: user.schemaType,
      version: user.version,
      trackingAuthorName: currentUser?.name,
      avatar: null
    };

    let res = await updateGrouping({
      variables: variables
    });
  };

  const drawTable = () => {
    return (
      loadTableData?.length > 0 &&
      loadTableData
        .filter((item) => {
          if (filterUser && isUserMenu) {
            return item;
          }
          if (filterUser) {
            if (item?.parentId === doc?._id) {
              return item;
            }
          }
          return item;
        })
        .map((row, index) => {
          return (
            <TableRow
              hover
              key={row.id}
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
              {!isUserMenu && (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    row.avatar ? (
                      <div
                        style={{
                          position: 'relative',
                          display: 'inline - block',
                          textAlign: 'center'
                        }}
                      >
                        <AvatarImage
                          src={row.avatar}
                          style={{ height: 60, width: 80, background: 'white' }}
                          loader={<LinearProgress />}
                        />
                        <IconButton
                          style={{
                            position: 'absolute',
                            top: -5,
                            left: 60,
                            width: 15,
                            height: 15,
                            background: '#ffffffa0'
                          }}
                          // className={classes.closeButton}
                          onClick={() => handleRemoveAvatar(row)}
                        >
                          <Close style={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </div>
                    ) : (
                      // 'No Image'
                      <AvatarUploadForm
                        title="No Image"
                        acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                        resources={row.avatar}
                        stationId={row.topology?.station}
                        docId={row.id}
                        doc={row}
                        type={row.schemaType === 'student' ? 'student' : 'user'}
                        hideArrow={true}
                        extraStyle={{
                          height: 60,
                          width: 80,
                          background: 'white'
                        }}
                        onChange={(value) =>
                          handleInputChange('avatar', value, row.id)
                        }
                        buttonCustomize={{ top: '0px', right: '0px' }}
                        isUserInTable={true}
                        updateGrouping={updateGrouping}
                      />
                    )
                  ) : (
                    <AvatarUploadForm
                      acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                      resources={row.avatar}
                      hideArrow={true}
                      stationId={row.topology?.station}
                      docId={row.id}
                      doc={row}
                      type={row.schemaType === 'student' ? 'student' : 'user'}
                      onChange={(value) =>
                        handleInputChange('avatar', value, row.id)
                      }
                      extraStyle={{
                        height: 60,
                        width: 80,
                        background: 'white'
                      }}
                      buttonCustomize={{ top: '0px', right: '0px' }}
                    />
                  )}
                </TableCell>
              )}

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

              {!isUserMenu && type !== 'schoolAdmin' ? (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    row.firstName
                  ) : (
                    <TextField
                      defaultValue={row.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value, row.id)
                      }
                    />
                  )}
                </TableCell>
              ) : (
                []
              )}

              {!isUserMenu && type !== 'schoolAdmin' ? (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    row.lastName
                  ) : (
                    <TextField
                      defaultValue={row.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value, row.id)
                      }
                    />
                  )}
                </TableCell>
              ) : (
                []
              )}

              {isUserMenu &&
                (type === 'educator' ||
                  type === 'student' ||
                  type === 'stationAdmin' ||
                  type === 'districtAdmin' ||
                  type === 'schoolAdmin') && (
                  <TableCell align="left">{row.state}</TableCell>
                )}

              {isUserMenu &&
                (type === 'educator' ||
                  type === 'student' ||
                  type === 'stationAdmin' ||
                  type === 'districtAdmin' ||
                  type === 'schoolAdmin') && (
                  <TableCell align="left">
                    {
                      stationLoadedData?.find(
                        (item) => item._id === row.station
                      )?.name
                    }
                  </TableCell>
                )}

              {!isUserMenu && hasTypeField && !filterUser ? (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    userTypeData?.find(
                      (item) =>
                        item.label === row.parentId ||
                        item.value === row.parentId
                    )?.label ? (
                      getDisplayName(
                        userTypeData?.find(
                          (item) =>
                            item.label === row.parentId ||
                            item.value === row.parentId
                        )?.label
                      )
                    ) : (
                      ''
                    )
                  ) : (
                    <Select
                      id="user-type-selector"
                      defaultValue={row.parentId}
                      style={{ minWidth: '80px' }}
                      onChange={(e) =>
                        handleInputChange('parentId', e.target.value, row.id)
                      }
                    >
                      {userTypeData.map((item, index) => (
                        <MenuItem
                          value={item.value}
                          key={index}
                          selected={row.parentId === item.value}
                        >
                          {getDisplayName(item.label)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
              ) : (
                []
              )}

              {!isUserMenu && hasTypeField && type === 'student' ? (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    classLoadedData?.find((el) =>
                      row.childrenIdList.includes(el._id)
                    )?.name
                  ) : (
                    <>
                      <Select
                        labelId="demo-mutiple-chip-label"
                        id="demo-mutiple-chip"
                        multiple
                        open={selectOpen}
                        onOpen={() => setSelectOpen(true)}
                        onClose={() => setSelectOpen(false)}
                        value={studentClasses[row.id] || []}
                        onChange={(e) =>
                          handleInputChange(
                            'childrenIdList',
                            e.target.value,
                            row.id
                          )
                        }
                        input={<Input id="select-multiple-chip" />}
                        renderValue={(selected) => displayStudents(selected)}
                        MenuProps={MenuProps}
                        style={{ maxWidth: '400px' }}
                      >
                        <Grid container justifyContent="flex-end">
                          <FontAwesomeIcon
                            icon={faTimes}
                            size="sm"
                            style={{
                              background: '#b0bec5',
                              borderRadius: '50%',
                              padding: 5,
                              width: 20,
                              height: 20,
                              marginRight: 10,
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectOpen(false)}
                          />
                        </Grid>
                        {classLoadedData
                          .filter((item) =>
                            schoolData[row.id]
                              ? schoolData[row.id].indexOf(item.value) > -1
                              : false
                          )
                          .map((item, index) => (
                            <MenuItem key={index} value={item.value}>
                              <ListItemText
                                primary={getDisplayName(item.label)}
                              />
                            </MenuItem>
                          ))}
                      </Select>
                    </>
                  )}
                </TableCell>
              ) : (
                []
              )}

              {!isUserMenu &&
              !hasTypeField &&
              type === 'student' &&
              doc?.schemaType === 'district' ? (
                <TableCell component="th" align="left">
                  {row.disable
                    ? classLoadedData
                        ?.filter((el) => row.childrenIdList?.includes(el._id))
                        ?.map((el, index, { length }) => {
                          return (
                            <Box
                              key={index}
                              style={{
                                marginTop: index === 0 ? 0 : 10,
                                marginBottom: index === length - 1 ? 0 : 10
                              }}
                            >
                              {el.name}
                              <IconButton
                                className={classes.closeButton}
                                size="small"
                                onClick={() => handleRemoveClass(el, row)}
                              >
                                <Close style={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Box>
                          );
                        })
                    : []}
                </TableCell>
              ) : (
                []
              )}

              {isUserMenu &&
                (type === 'educator' ||
                  type === 'student' ||
                  type === 'districtAdmin' ||
                  type === 'schoolAdmin') && (
                  <TableCell align="left">
                    {districtLoadedData?.find(
                      (item) =>
                        item.label === row.district ||
                        item.value === row.district
                    )?.label
                      ? getDisplayName(
                          districtLoadedData?.find(
                            (item) =>
                              item.label === row.district ||
                              item.value === row.district
                          )?.label
                        )
                      : ''}
                  </TableCell>
                )}

              {isUserMenu && type === 'student' && currentMenu === 'user' && (
                <TableCell component="th" align="left">
                  {row.disable &&
                    classLoadedData
                      ?.filter((el) => row.childrenIdList?.includes(el.value))
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
                            {el.label}
                            <IconButton
                              className={classes.closeButton}
                              size="small"
                              onClick={() => handleRemoveClass(el, row)}
                            >
                              <Close style={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                </TableCell>
              )}

              {isUserMenu &&
                type === 'schoolAdmin' &&
                currentMenu === 'user' && (
                  <TableCell align="left">
                    {userTypeData?.find(
                      (item) =>
                        item.label === row.parentId ||
                        item.value === row.parentId
                    )?.label
                      ? getDisplayName(
                          userTypeData?.find(
                            (item) =>
                              item.label === row.parentId ||
                              item.value === row.parentId
                          )?.label
                        )
                      : ''}
                  </TableCell>
                )}

              {type === 'student' && (
                <TableCell align="left">
                  {
                    allDevices?.find((item) => item._id === row.intRef?._id)
                      ?.name
                  }
                </TableCell>
              )}

              {type !== 'schoolAdmin' && (
                <TableCell component="th" align="left">
                  {row.disable ? (
                    row?.status ? (
                      getStatusLabel(row?.status)
                    ) : (
                      ''
                    )
                  ) : (
                    <>
                      <Select
                        id="status-type-selector"
                        defaultValue={row?.status}
                        style={{ minWidth: '80px' }}
                        onChange={(e) =>
                          handleInputChange('status', e.target.value, row.id)
                        }
                      >
                        {statusTypeData.map((item, index) => (
                          <MenuItem
                            value={item.value}
                            key={index}
                            selected={row?.status === item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}
                </TableCell>
              )}

              {type === 'schoolAdmin' && (
                <TableCell component="th" align="left" style={{ padding: 10 }}>
                  <div
                    className={classes.ingest_status}
                    style={
                      row?.data?.google_auth?.auth_at ||
                      row?.data?.google_status
                        ? {
                            border: '1px solid gray',
                            borderRadius: 4,
                            padding: '6px 12px 6px'
                          }
                        : {}
                    }
                  >
                    <div>
                      {row?.data?.google_auth?.auth_at
                        ? convertTime(row?.data?.google_auth?.auth_at)
                        : ''}
                    </div>
                    {row?.data?.google_status ? (
                      <Tooltip
                        title={convertTime(
                          row?.data?.google_status?.ingestedAt
                        )}
                        classes={{ tooltip: classes.tooltip }}
                        placement="right"
                      >
                        <div
                          style={{
                            width: 25,
                            height: 25,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 7
                          }}
                        >
                          <div className={getGoogleIngestStatusClass(row)} />
                        </div>
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                  </div>
                </TableCell>
              )}

              {type === 'schoolAdmin' && (
                <TableCell component="th" align="left" style={{ padding: 10 }}>
                  <div
                    className={classes.ingest_status}
                    style={
                      row?.data?.canvas_auth?.auth_at ||
                      row?.data?.canvas_status
                        ? {
                            border: '1px solid gray',
                            borderRadius: 4,
                            padding: '6px 12px 6px'
                          }
                        : {}
                    }
                  >
                    <div>
                      {row?.data?.canvas_auth?.auth_at
                        ? convertTime(row?.data?.canvas_auth?.auth_at)
                        : ''}
                    </div>
                    {row?.data?.canvas_status ? (
                      <Tooltip
                        title={convertTime(
                          row?.data?.canvas_status?.ingestedAt
                        )}
                        classes={{ tooltip: classes.tooltip }}
                        placement="right"
                      >
                        <div
                          style={{
                            width: 25,
                            height: 25,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 7
                          }}
                        >
                          <div className={getCanvasIngestStatusClass(row)} />
                        </div>
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                  </div>
                </TableCell>
              )}

              {type === 'schoolAdmin' && (
                <TableCell component="th" align="left" style={{ padding: 10 }}>
                  <div
                    className={classes.ingest_status}
                    style={
                      row?.data?.schoology_auth?.auth_at ||
                      row?.data?.schoology_status
                        ? {
                            border: '1px solid gray',
                            borderRadius: 4,
                            padding: '6px 12px 6px'
                          }
                        : {}
                    }
                  >
                    <div>
                      {row?.data?.schoology_auth?.auth_at
                        ? convertTime(row?.data?.schoology_auth?.auth_at)
                        : ''}
                    </div>
                    {row?.data?.schoology_status ? (
                      <Tooltip
                        title={convertTime(
                          row?.data?.schoology_status?.ingestedAt
                        )}
                        classes={{ tooltip: classes.tooltip }}
                        placement="right"
                      >
                        <div
                          style={{
                            width: 25,
                            height: 25,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 7
                          }}
                        >
                          <div className={getSchoolgyIngestStatusClass(row)} />
                        </div>
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                  </div>
                </TableCell>
              )}

              {type !== 'student' && (
                <>
                  <TableCell component="th" align="left">
                    {row.disable && row?.loginInfo?.EULAsignedAt
                      ? convertTime(row?.loginInfo?.EULAsignedAt)
                      : ''}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable && row?.loginInfo?.lastSeenAt
                      ? convertTime(row?.loginInfo?.lastSeenAt)
                      : ''}
                  </TableCell>
                </>
              )}

              {type !== 'student' ? (
                <TableCell align="left">
                  {row?.loginInfo == null
                    ? 0
                    : row?.loginInfo.count == null
                    ? 1
                    : row?.loginInfo?.count}
                </TableCell>
              ) : (
                []
              )}

              {!disable &&
                (isSmallScreen ? (
                  <TableCell
                    component="th"
                    align="center"
                    className={classes.cell}
                  >
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
                      {type === 'schoolAdmin' && (
                        <>
                          <StyledMenuItem>
                            <div
                              onClick={() =>
                                handleTableChange(
                                  'googleAuth',
                                  mobSelectedRow?.id
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faGoogle}
                                size="xs"
                                style={{ marginRight: 7 }}
                              />
                              {en['Link Google']}
                            </div>
                          </StyledMenuItem>
                          <StyledMenuItem>
                            <div
                              onClick={() =>
                                handleTableChange(
                                  'canvasAuth',
                                  mobSelectedRow?.id
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCuttlefish}
                                size="xs"
                                style={{ marginRight: 7 }}
                              />
                              {en['Link Canvas']}
                            </div>
                          </StyledMenuItem>
                        </>
                      )}

                      <StyledMenuItem>
                        {row.disable ? (
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
                        ) : (
                          <div
                            onClick={() =>
                              handleTableChange('save', mobSelectedRow?.id)
                            }
                          >
                            <FontAwesomeIcon
                              icon={faSave}
                              size="xs"
                              style={{ marginRight: 7 }}
                            />
                            {en['Save']}
                          </div>
                        )}
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
                  <TableCell
                    component="th"
                    align="center"
                    className={classes.cell}
                  >
                    <Box textAlign="center" style={{ minWidth: 90 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleTableChange('googleAuth', row.id)}
                      >
                        {type === 'schoolAdmin' && (
                          <FontAwesomeIcon
                            icon={faGoogle}
                            size="sm"
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleTableChange('canvasAuth', row.id)}
                      >
                        {type === 'schoolAdmin' && (
                          <FontAwesomeIcon
                            icon={faCuttlefish}
                            size="sm"
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleTableChange('schoologyAuth', row.id)
                        }
                      >
                        {type === 'schoolAdmin' && (
                          <FontAwesomeIcon
                            icon={faS}
                            size="sm"
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleTableChange(
                            row.disable ? 'edit' : 'save',
                            row.id
                          )
                        }
                      >
                        {row.disable ? <EditIcon /> : <SaveIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={currentUser?._id === row.id}
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
                ))}
            </TableRow>
          );
        })
    );
  };

  const handleLastSeenAtSort = () => {
    setSortKey('lastSeenAt');
    setLastSeenSortDirection(lastSeenSortDirection !== 'desc' ? 'desc' : 'asc');
  };

  const handleStatusSort = () => {
    setSortKey('status');
    setStatusSortDirection(statusSortDirection !== 'desc' ? 'desc' : 'asc');
  };

  const handleCanvasSelectConfirm = async (type, value) => {
    if (value && selectedUser) {
      try {
        if (openCanvasAdd) {
          if (
            !accessConfig.baseUrl ||
            !accessConfig.clientId ||
            !accessConfig.secretkey ||
            !accessConfig.redirectUri
          ) {
            const notiOps = getNotificationOpt(
              'userlist',
              'error',
              'validAccessConfig'
            );
            notify(notiOps.message, notiOps.options);
          } else {
            await createGrouping({
              variables: {
                version: 1,
                schemaType: 'accessConfig',
                name: accessConfig.baseUrl,
                data: {
                  canvas: accessConfig
                },
                trackingAuthorName: currentUser?.name
              }
            });
            await fetchCanvasData(selectedUser?.topology?.district);
          }
          setOpenCanvasAdd(false);
        } else {
          await updateGrouping({
            variables: {
              id: selectedUser._id,
              schemaType: selectedUser.schemaType,
              version: selectedUser.version,
              data: {
                ...selectedUser.data,
                canvas: selectedCanvas.canvas
              },
              trackingAuthorName: currentUser?.name
            }
          });

          const authUrl =
            selectedCanvas.canvas.baseUrl +
            '/login/oauth2/auth' +
            '?client_id=' +
            selectedCanvas.canvas.clientId +
            '&response_type=code' +
            '&redirect_uri=' +
            selectedCanvas.canvas.redirectUri +
            '&purpose=' +
            selectedUser._id;
          let elDom = document.createElement('a');
          elDom.setAttribute('href', authUrl);
          elDom.setAttribute('download', '');
          elDom.setAttribute('rel', 'noopener noreferrer');
          // elDom.setAttribute('target', '_blank');
          elDom.click();
          setOpenCanvasSelect(false);
        }
      } catch (err) {
        console.log('handleCanvasSelectConfirm', err);
        const notiOps = getNotificationOpt('user', 'error', 'name');
        notify(err?.message, notiOps.options);
      }
    } else {
      setOpenCanvasSelect(false);
      setOpenCanvasAdd(false);
    }
  };

  const handleAccessConfigInput = (type, value) => {
    console.log('accessConfig', accessConfig);
    setAccessConfig({
      ...accessConfig,
      [type]: value
    });
  };

  const handleSchoologyAuthInputChange = (type, value) => {
    setSchoology({
      ...schoology,
      [type]: value
    });
  };

  const handleSchoologyAuthUpdate = async (type, value) => {
    if (value && selectedUser) {
      if (
        schoology?.key === '' ||
        schoology?.secret === '' ||
        !schoology?.key ||
        !schoology?.secret
      ) {
        const notiOps = getNotificationOpt('userlist', 'error', 'upload');
        notify('Credential is not valid!', notiOps.options);
        return;
      }
      await updateGrouping({
        variables: {
          id: selectedUser._id,
          schemaType: selectedUser.schemaType,
          version: selectedUser.version,
          data: {
            ...selectedUser.data,
            schoology
          },
          trackingAuthorName: currentUser?.name
        }
      });
    } else {
      setSchoology({});
    }
    setOpenSchoologyAuth(false);
  };

  // const handleRemoveCanvas = async () => {
  //   console.log(selectedCanvas);
  //   await deleteDocument({
  //     variables: {
  //       id: selectedCanvas.id,
  //       schemaType: selectedCanvas.schemaType
  //     }
  //   });
  //   await fetchCanvasData();
  // };

  return (
    <LoadingCard loading={loadingPanel} isProgress={true}>
      <Box display="flex" alignItems="center" marginLeft={0}>
        <span style={{ display: 'flex' }}>
          {currentMenu !== 'user' && (
            <UserSearch
              type={title}
              fromTable={true}
              onChange={(value) => handleSearch(value)}
              useStyles={useStylesSearch}
            />
          )}
          <Box display="flex" alignItems="center">
            {!disable && !setShowUserDialog ? (
              <Button
                variant="contained"
                size="small"
                className={classes.addBtn}
                onClick={() => handleTableChange('add')}
              >
                <AddIcon />
                {en['Add']}
              </Button>
            ) : (
              []
            )}
          </Box>
        </span>
        <div style={{ width: '100%' }}>
          <span style={{ float: 'right' }}>
            {isFilter && type === 'educator' ? (
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                marginBottom={2}
              >
                <Typography
                  variant="subtitle2"
                  component="h2"
                  style={{
                    marginLeft: 30,
                    marginRight: 30,
                    minWidth: 90,
                    marginTop: 20
                  }}
                >
                  {en['Last Seen At']}:
                </Typography>
              </Box>
            ) : (
              []
            )}
          </span>
        </div>
      </Box>
      <div style={{ position: 'relative' }}>
        <TableContainer
          style={{
            maxHeight:
              currentMenu === 'user'
                ? isSmallScreen
                  ? `calc(100vh - 293px)`
                  : `calc(100vh - 240px)`
                : isSmallScreen
                ? `calc(100vh - 305px)`
                : `calc(100vh - 285px)`
          }}
        >
          <Table stickyHeader aria-label="sticky table" ref={mainTable}>
            <TableHead>
              <TableRow>
                {!isUserMenu && (
                  <TableCell align="left">{en['Avatar']}</TableCell>
                )}
                {type === 'schoolAdmin' ? (
                  <TableCell align="left">{en['Email']}</TableCell>
                ) : (
                  <TableCell align="left">{en['Username/Email']}</TableCell>
                )}
                {!isUserMenu && type !== 'schoolAdmin' && (
                  <TableCell align="left" style={{ minWidth: 104 }}>
                    {en['First Name']}
                  </TableCell>
                )}
                {!isUserMenu && type !== 'schoolAdmin' && (
                  <TableCell align="left" style={{ minWidth: 104 }}>
                    {en['Last Name']}
                  </TableCell>
                )}

                {isUserMenu &&
                  (type === 'educator' ||
                    type === 'student' ||
                    type === 'stationAdmin' ||
                    type === 'districtAdmin' ||
                    type === 'schoolAdmin') && (
                    <TableCell align="left">
                      <CustomSelectBox
                        variant="outlined"
                        addMarginTop={true}
                        style={classes.selectFilter}
                        value={filterStateValue ? filterStateValue : 'all'}
                        resources={[
                          { label: en['All States'], value: 'all' },
                          ...filteredStateList
                        ]}
                        onChange={handleStateChange}
                        size="small"
                        disabled={false}
                        limitWidth
                      />
                    </TableCell>
                  )}

                {isUserMenu &&
                  (type === 'educator' ||
                    type === 'student' ||
                    type === 'stationAdmin' ||
                    type === 'districtAdmin' ||
                    type === 'schoolAdmin') && (
                    <TableCell align="left">
                      <CustomSelectBox
                        variant="outlined"
                        addMarginTop={true}
                        style={classes.selectFilter}
                        value={filteredStationId ? filteredStationId : 'all'}
                        resources={[
                          { label: en['All Stations'], value: 'all' },
                          ...filteredStationList
                        ]}
                        onChange={handleStationChange}
                        size="small"
                        disabled={false}
                        limitWidth
                      />
                    </TableCell>
                  )}

                {!isUserMenu &&
                hasTypeField &&
                !filterUser &&
                getTypeLabel(type) === 'District' ? (
                  <TableCell align="left">
                    {' '}
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filterValue}
                      style={{ minWidth: '150px' }}
                      disableUnderline={true}
                      onChange={(event) => onFilter(event.target.value)}
                    >
                      <MenuItem value="all">{en['All Districts']}</MenuItem>
                      {dataToFilter?.map((item, index) => (
                        <MenuItem value={item.value} key={index}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                ) : (
                  []
                )}

                {isUserMenu &&
                  (type === 'educator' ||
                    type === 'student' ||
                    type === 'districtAdmin' ||
                    type === 'schoolAdmin') && (
                    <TableCell align="left">
                      <CustomSelectBox
                        variant="outlined"
                        addMarginTop={true}
                        style={classes.selectFilter}
                        value={
                          filteredDistrictId?.length > 0
                            ? filteredDistrictId
                            : 'all'
                        }
                        resources={[
                          { label: en['All Districts'], value: 'all' },
                          ...filteredDistrictList
                        ]}
                        onChange={handleDistrictChange}
                        size="small"
                        disabled={false}
                        limitWidth
                      />
                    </TableCell>
                  )}

                {!isUserMenu && hasTypeField && type === 'student' ? (
                  <TableCell align="left" style={{ minWidth: 180 }}>
                    {en['Classes']}
                  </TableCell>
                ) : (
                  []
                )}

                {!isUserMenu &&
                  !hasTypeField &&
                  type === 'student' &&
                  doc?.schemaType === 'district' && (
                    <TableCell align="left" style={{ minWidth: 180 }}>
                      {en['Classes']}
                    </TableCell>
                  )}

                {isUserMenu && type === 'student' && currentMenu === 'user' && (
                  <TableCell align="left" style={{ minWidth: 180 }}>
                    {en['Classes']}
                  </TableCell>
                )}

                {isUserMenu &&
                  type === 'schoolAdmin' &&
                  currentMenu === 'user' && (
                    <TableCell align="left">{en['School']}</TableCell>
                  )}

                {type === 'student' && (
                  <TableCell align="left" style={{ minWidth: 180 }}>
                    {en['Device Serial No.']}
                  </TableCell>
                )}

                {type !== 'schoolAdmin' && (
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
                )}

                {type === 'schoolAdmin' && (
                  <TableCell align="left" style={{ minWidth: 184 }}>
                    {en['Google Auth']}
                  </TableCell>
                )}

                {type === 'schoolAdmin' && (
                  <TableCell align="left" style={{ minWidth: 184 }}>
                    {en['Canvas Auth']}
                  </TableCell>
                )}

                {type === 'schoolAdmin' && (
                  <TableCell align="left" style={{ minWidth: 184 }}>
                    {en['Schoology Auth']}
                  </TableCell>
                )}

                {type !== 'student' && (
                  <>
                    <TableCell align="left" style={{ minWidth: 132 }}>
                      {en['EULA signed at']}
                    </TableCell>
                    <TableCell align="left" style={{ minWidth: 142 }}>
                      <TableSortLabel
                        active={true}
                        direction={lastSeenSortDirection}
                        onClick={handleLastSeenAtSort}
                      >
                        {en['Last Seen At']}
                      </TableSortLabel>
                    </TableCell>
                  </>
                )}

                {type !== 'student' ? (
                  <TableCell align="left" style={{ minWidth: 105 }}>
                    {en['Signed in']} #
                  </TableCell>
                ) : (
                  []
                )}

                {!disable &&
                ((isUserMenu &&
                  (isSuperAdmin || currentUser?.schemaType === 'sysAdmin')) ||
                  !isUserMenu) ? (
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
      <CreateUserDialog
        type={type}
        currentMenu={currentMenu}
        filterUser={filterUser}
        hasTypeField={hasTypeField}
        userTypeData={userTypeData}
        isUserMenu={isUserMenu}
        open={openCreate}
        doc={doc}
        onChange={handleDialogChange}
        stationLoadedData={stationLoadedData || []}
        isAvatarAttached={isAvatarAttached}
        setAvatarAttached={setAvatarAttached}
        setAvatarURL={setAvatarURL}
        createdResponse={createdResponse}
        isAvatarUpload={isAvatarUpload}
        setAvatarUpload={setAvatarUpload}
        isUserCreating={isUserCreating}
        setUserCreating={setUserCreating}
        allDevices={allDevices}
      />
      <EditUserDialog
        type={type}
        currentMenu={currentMenu}
        updatedData={rowData}
        filterUser={filterUser}
        hasTypeField={hasTypeField}
        userTypeData={userTypeData}
        resources={editRow}
        isUserMenu={isUserMenu}
        stationLoadedData={stationLoadedData || []}
        classLoadedData={classLoadedData}
        studentClasses={studentClasses}
        schoolData={schoolData}
        selectOpen={selectOpen}
        isAvatarUpload={isAvatarUpload}
        setAvatarUpload={setAvatarUpload}
        topology={doc?.topology ? doc?.topology : null}
        setSelectOpen={setSelectOpen}
        open={openEditDialog}
        onChange={handleTableChange}
        onSaveChange={handleUserChange}
        onInputChange={handleInputChange}
        displayStudents={displayStudents}
      />
      <CustomDialog
        open={openDeleteDialog}
        title={en['Do you want to delete this'] + ` ${type}?`}
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
      <CustomDialog open={openEFDialog} onChange={() => setOpenEFDialog(false)}>
        <FilterEducator
          resources={doc}
          docId={docId}
          onChange={handleAdded}
          schoolLoadedData={schoolLoadedData}
        />
      </CustomDialog>
      <CustomDialog open={openSFDialog} onChange={() => setOpenSFDialog(false)}>
        <FilterStudent
          resources={doc}
          docId={docId}
          onChange={handleAdded}
          schoolLoadedData={schoolLoadedData}
          classLoadedData={classLoadedData}
          allDevices={allDevices}
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
      <CustomDialog
        mainBtnName={openCanvasAdd ? 'Add' : 'SEND'}
        // dismissBtnName={openCanvasAdd ? null : 'CANCEL'}
        // secondaryBtnName={openCanvasAdd ? 'CANCEL' : 'ADD CANVAS'}
        open={openCanvasSelect}
        title={
          openCanvasAdd
            ? 'Add new canvas configuration'
            : 'Send authentication request'
        }
        onChange={handleCanvasSelectConfirm}
      >
        {!openCanvasAdd ? (
          <div className={classes.canvasDialogContainer}>
            <CustomSelectBox
              variant="outlined"
              addMarginTop={true}
              style={classes.selectFilter}
              value={selectedCanvas?.value}
              resources={filteredCanvasList}
              onChange={(data) => {
                console.log('selected Canvas:', data);
                const selected = filteredCanvasList?.find(
                  (item) => item.value === data.value
                );
                setSelectedCanvas(selected);
              }}
              size="small"
            />
            {/* <Button
              color="default"
              onClick={() => handleRemoveCanvas()}
              className={classes.removeCanvas}
            >
              Remove Canvas
            </Button> */}
          </div>
        ) : (
          <AccessConfigForm
            onInputChange={handleAccessConfigInput}
            canvas={accessConfig}
          />
        )}
      </CustomDialog>
      <CustomDialog
        mainBtnName={schoology?.key ? 'UPDATE' : 'ADD'}
        open={openSchoologyAuth}
        title={'Add Schoology key & secret'}
        onChange={handleSchoologyAuthUpdate}
      >
        <SchoologyAuth
          onInputChange={handleSchoologyAuthInputChange}
          schoology={schoology}
        />
      </CustomDialog>
    </LoadingCard>
  );
};

export default UserListForm;
