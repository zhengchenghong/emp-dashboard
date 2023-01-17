/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  Typography
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import { Delete as DeleteIcon, GetApp as GetAppIcon } from '@material-ui/icons';
import {
  faInfo,
  faDownload,
  faEllipsisV,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useLazyQuery, isReference } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import graphql from '@app/graphql';
import useStyles from './style';
import { exportToCsv, getDisplayName } from '@app/utils/functions';
import { getFormattedDate } from '@app/utils/date-manager';
import JSONEditor from '@app/components/JSONEditor';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { en } from '@app/language';
import { useUserContext } from '@app/providers/UserContext';
import UserSearch from '@app/components/Forms/UserList/Search';
import {
  usePackageFetchData,
  useTotalCountFetchQuery,
  useSDashPackageFetchData
} from '@app/utils/hooks/form';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import { withStyles } from '@material-ui/core/styles';
import { PACKAGE_STATUS } from '@app/utils/constants';

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

const PackageListForm = ({
  docId,
  type,
  updateValue,
  filterValue,
  disable,
  hasTypeField,
  userTypeData,
  onChange,
  packageRefresh,
  setPackageRefresh,
  triggedPackage,
  triggerPackage,
  setTriggerPackage,
  packageDownload,
  setPackageDownload,
  csv = false,
  setCSV = () => {}
}) => {
  const classes = useStyles();
  const mainTable = useRef();
  const { notify } = useNotifyContext();
  const [loadedData, setLoadedData] = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [currentRowId, setCurrentRowId] = useState();
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [nameRegExp, setNameRegExp] = useState(null);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const { pageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [openInfo, setOpenInfo] = useState(false);
  const [isCreated, setCreated] = useState(false);
  const [sortKey, setSortKey] = useState('createdAt');
  const [typeSortDirection, setTypeSortDirection] = useState('asc');
  const [updatedAtSortDirection, setUpdatedAtSortDirection] = useState('asc');
  const [statusSortDirection, setStatusSortDirection] = useState('asc');
  const [IDSortDirection, setIDSortDirection] = useState('asc');
  const [groupIdSortDirection, setGroupIdSortDirection] = useState('asc');
  const [nameSortDirection, setNameSortDirection] = useState('asc');
  const [sizeSortDirection, setSizeSortDirection] = useState('asc');
  const [otaSortDirection, setOtaSortDirection] = useState('asc');

  const [selectedInfo, setSelectedInfo] = useState(null);
  const [currentUser] = useUserContext();
  const [isResetSearch, setResetSearch] = useState();
  const isSmallScreen = useSmallScreen();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobSelectedRow, setMobSelectedRow] = useState();

  const [allPackages, setAllPackages] = useState();
  const [sDashPackages, setSDashPackages] = useState();
  const [sDashSize, setSDashSize] = useState();
  const [eDashSize, setEDashSize] = useState();
  const [totalSize, setTotalSize] = useState();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);
  const [packageStation] = useMutation(graphql.mutations.packageStation);

  const totalReLoad = async () => {
    await getTotalCount({
      variables: {
        schemaType: 'package',
        parentId: docId,
        nameRegExp: nameRegExp,
        type: 'EDU'
      }
    });
    totalRefetch();
    allPackageRefetch();
    sDashPackageRefetch();
  };

  const {
    loading: totalLoading,
    error: totalError,
    data: totalData,
    refetch: totalRefetch
  } = usePackageFetchData({
    schemaType: 'package',
    parentId: docId,
    sortBy: sortKey === 'type' ? 'desc.short' : sortKey,
    type: 'EDU',
    orderType:
      sortKey === 'type'
        ? typeSortDirection
        : sortKey === 'status'
        ? statusSortDirection
        : sortKey === 'name'
        ? IDSortDirection
        : sortKey === 'desc.title'
        ? nameSortDirection
        : sortKey === 'size'
        ? sizeSortDirection
        : sortKey === 'groupId'
        ? groupIdSortDirection
        : updatedAtSortDirection,
    nameRegExp: nameRegExp
    // offset: pageCount * (page - 1),
    // limit: pageCount
  });

  const {
    loading: allPackageLoading,
    error: allPackageError,
    data: allPackageData,
    refetch: allPackageRefetch
  } = usePackageFetchData({
    schemaType: 'package',
    parentId: docId,
    type: 'EDU'
  });

  const {
    loading: sDashPackageLoading,
    error: sDashPackageError,
    data: sDashPackageData,
    refetch: sDashPackageRefetch
  } = useSDashPackageFetchData({
    schemaType: 'package',
    parentId: docId,
    type: 'KSK'
  });

  useEffect(() => {
    if (!allPackageLoading && !allPackageError && allPackageData) {
      setAllPackages(allPackageData.grouping);
    }
  }, [allPackageLoading, allPackageError, allPackageData]);

  useEffect(() => {
    if (!sDashPackageLoading && !sDashPackageError && sDashPackageData) {
      setSDashPackages(sDashPackageData.sigGrouping);
    }
  }, [sDashPackageLoading, sDashPackageError, sDashPackageData]);

  const { data: totalPageCount, refetch: getTotalCount } =
    useTotalCountFetchQuery({
      schemaType: 'package',
      parentId: docId,
      nameRegExp: nameRegExp,
      type: 'EDU'
    });

  useEffect(() => {
    setTypeSortDirection('asc');
    setStatusSortDirection('asc');
    setUpdatedAtSortDirection('asc');
    setSortKey('createdAt');
    setResetSearch(true);
    setNameRegExp(null);
    setPage(1);
  }, [docId]);

  useEffect(() => {
    if (!packageRefresh) {
      // const onLoad = async () => {
      //   try {
      //     setLoadedData([]);
      //     setTotalRow(0);
      //     setTimeout(totalReLoad, 1000);
      //   } catch (err) {
      //     console.log(err);
      //   }
      // };
      // onLoad();
      totalReLoad();
    }
    if (setPackageRefresh) setPackageRefresh(true);
  }, [packageRefresh]);

  useEffect(() => {
    if (totalPageCount) {
      setTotalRow(totalPageCount?.totalCount);
    }
  }, [totalPageCount]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    totalRefetch();
  }, [
    pageCount,
    sortKey,
    typeSortDirection,
    statusSortDirection,
    updatedAtSortDirection,
    sizeSortDirection
  ]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
  }, [totalRow]);

  useEffect(() => {
    if (!totalError && !totalLoading && totalData) {
      setLoadedData(totalData?.grouping);
    }
  }, [totalLoading, totalError, totalData]);

  useEffect(() => {
    if (!isCreated) {
      setCreated(true);
    } else {
      handleTableChange('add');
    }
  }, [triggedPackage]);

  useEffect(() => {
    if (triggerPackage) {
      handleTableChange('add');
      setTriggerPackage(false);
    }
  }, [triggerPackage]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    async function fetchData() {
      let wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const onDownload = async (el) => {
        try {
          if (checkDownloadButton(el)) {
            await wait(500);
            let value =
              el.multimediaAssets[0]?.baseUrl +
              el.multimediaAssets[0]?.fileDir +
              el.multimediaAssets[0]?.fileName;

            let res = await getAssetUrlFromS3(value, 2);

            let elDom = document.createElement('a');
            elDom.setAttribute('href', res);
            elDom.setAttribute('download', '');
            // elDom.setAttribute('target', '_blank');
            elDom.setAttribute('rel', 'noopener noreferrer');
            elDom.click();
          }
        } catch (err) {
          console.log(err);
        }
      };
      if (packageDownload) {
        for (let el of loadedData) {
          await onDownload(el);
        }
      }
      if (setPackageDownload) setPackageDownload(false);
    }
    fetchData();
  }, [packageDownload]);

  const deleteData = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('material', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (changeType && decision && checkbox) {
      const response = await deleteDocument({
        variables: {
          schemaType: 'package',
          id: currentRowId,
          type: 'EDU'
        }
      });
      const tmp = loadedData.filter((el) => el._id !== currentRowId);
      // const copyTotalData = totalPackages.filter(
      //   (el) => el._id !== currentRowId
      // );
      setLoadedData(tmp);
      // setTotalPackages(copyTotalData);

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
      if (method === 'download') {
        let elDom = document.createElement('a');
        getAssetUrlFromS3(value, 2).then((res) => {
          elDom.setAttribute('href', res);
          elDom.setAttribute('download', '');
          elDom.setAttribute('rel', 'noopener noreferrer');
          elDom.setAttribute('target', '_blank');
          elDom.click();
        });
      }

      if (method === 'delete') {
        setCurrentRowId(value);
        setOpenDeleteDialog(true);
        totalReLoad();
      }

      if (method === 'add') {
        packageStation({
          variables: {
            parentId: docId
          }
        });
        const notiOps = getNotificationOpt('package', 'success', 'packaged');
        notify(notiOps.message, notiOps.options);
      }

      if (method === 'info') {
        setSelectedInfo(value);
        setOpenInfo(true);
      }

      if (method === 'refresh') {
        await updateGrouping({
          variables: {
            id: value?._id,
            schemaType: 'package',
            version: value?.version,
            trackingAuthorName: currentUser?.name,
            status: 'repackage',
            type: 'EDU'
          }
        });
        totalReLoad();
      }
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleChangePage = (event, newPage) => {
    setOffset(newPage * pageCount);
    setPage(newPage);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleTypeSort = () => {
    setTypeSortDirection(typeSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('type');
  };

  const handleStatusSort = () => {
    setStatusSortDirection(statusSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('status');
  };

  const handleIDSort = () => {
    setIDSortDirection(IDSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('name');
  };

  const handleGroupIdSort = () => {
    setGroupIdSortDirection(groupIdSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('groupId');
  };

  const handleNameSort = () => {
    setNameSortDirection(nameSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('desc.title');
  };

  const handleUpdatedAtSort = () => {
    setUpdatedAtSortDirection(
      updatedAtSortDirection !== 'desc' ? 'desc' : 'asc'
    );
    setSortKey('updatedAt');
  };

  const handleOTASort = () => {
    setOtaSortDirection(otaSortDirection !== 'desc' ? 'desc' : 'asc');
    console.log(otaSortDirection);
    const sorted = loadedData.sort((a, b) => {
      if (a?.response?.length && b?.response?.length) {
        if (otaSortDirection !== 'desc') {
          return (
            new Date(a.response[a.response.length - 1].createdAt).valueOf() -
            new Date(b.response[b.response.length - 1].createdAt).valueOf()
          );
        } else {
          return (
            new Date(b.response[b.response.length - 1].createdAt).valueOf() -
            new Date(a.response[a.response.length - 1].createdAt).valueOf()
          );
        }
      } else return 0;
    });
    setLoadedData(sorted);
  };

  const handleSizeSort = () => {
    setSizeSortDirection(sizeSortDirection !== 'desc' ? 'desc' : 'asc');
    setSortKey('size');
  };

  const checkDownloadButton = (row) => {
    const assets =
      row?.multimediaAssets?.length > 0 ? row.multimediaAssets[0] : null;
    if (!assets) return false;

    if (!assets.baseUrl || !assets.fileName) return false;

    return (
      assets.data?.size &&
      (row.status === 'ready' || row.status === 'repackage')
    );
  };

  const handleSearch = (value) => {
    setPage(1);
    setTotalRow(0);
    setNameRegExp(value?.toLowerCase().replace(/ /g, ''));
  };

  const handleEllipsisClose = () => {
    setMobSelectedRow(null);
    setAnchorEl(null);
  };

  const handleEllipsisClicked = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const getTableViewData = (data) => {
    let tmp = data.slice(pageCount * (page - 1), pageCount * page);
    return tmp;
  };

  const convertSizeUnit = (size) => {
    if (size > 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + 'MB';
    } else if (size > 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else {
      return size + 'B';
    }
  };

  useEffect(() => {
    if (allPackages?.length && sDashPackages?.length) {
      let sSize = 0;
      sDashPackages?.forEach((item) => {
        if (item.multimediaAssets?.length > 0)
          sSize += item.multimediaAssets[0].data?.size || 0;
      });
      let eSize = 0;
      allPackages?.forEach((item) => {
        if (item.multimediaAssets?.length > 0)
          eSize += item.multimediaAssets[0].data?.size || 0;
      });

      let stationPK = allPackages?.find(
        (item) => item.desc?.short === 'station'
      );
      let stationSize = 0;
      if (stationPK && stationPK.multimediaAssets?.length)
        stationSize = stationPK.multimediaAssets[0].data?.size || 0;

      let devicePk = allPackages?.find(
        (item) => item.desc?.title === 'deviceInfo.json'
      );
      let deviceSize = 0;
      if (devicePk && devicePk.multimediaAssets?.length)
        deviceSize = devicePk.multimediaAssets[0].data?.size || 0;

      let totalS = sSize + eSize - stationSize - deviceSize;
      setEDashSize(eSize);
      setTotalSize(totalS);
      setSDashSize(sSize);
    } else {
      setEDashSize(0);
      setTotalSize(0);
      setSDashSize(0);
    }
  }, [allPackages, sDashPackages]);

  const getOTAStatus = (pkg) => {
    if (pkg?.response?.length) {
      return pkg.response[pkg.response.length - 1];
    } else {
      return {};
    }
  };

  const getOTAStyle = (row) => {
    if (getOTAStatus(row).state === undefined) {
      return {};
    } else {
      return getOTAStatus(row).state === PACKAGE_STATUS.PACKAGE_DELIVERED
        ? { background: 'green' }
        : { background: 'red' };
    }
  };

  const downloadCSV = () => {
    const cols = [
      'ID',
      'Status',
      'Identifier',
      'GroupId',
      'Name',
      'Type',
      'Size(KB)',
      'Updated At',
      'OTA'
    ];
    const rows = getTableViewData(loadedData).map((row, index) => {
      return [
        row._id,
        (row.status || '').capitalizeFirstLetter(),
        row.name === 'app' ? row.desc?.short : row.name,
        row.groupId ? row.groupId : '',
        getDisplayName(row.desc?.title),
        row.name === 'app' ? row.name : row.desc?.short,
        row.multimediaAssets?.length > 0 && row.multimediaAssets[0].data?.size
          ? Number((row.multimediaAssets[0].data?.size / 1000).toFixed(1))
          : null,
        getFormattedDate(row.updatedAt),
        getOTAStatus(row).createdAt
          ? getFormattedDate(getOTAStatus(row).createdAt)
          : ''
      ];
    });
    rows.unshift(cols);
    exportToCsv('package.csv', rows);
  };

  useEffect(() => {
    if (csv) {
      downloadCSV();
      setCSV(false);
    }
  }, [csv]);

  return (
    <LoadingCard
      loading={loadingPanel}
      percentage={percentage}
      isProgress={true}
      rootWidth="100%"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginRight: 16
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginLeft={0}
        >
          <UserSearch
            isResetSearch={isResetSearch}
            setResetSearch={setResetSearch}
            type={'Packages'}
            fromTable={true}
            onChange={(value) => handleSearch(value)}
          />
        </Box>
        <Typography
          className="text-video-status"
          style={{ fontSize: 16, marginTop: '-10px' }}
        >
          {'SDash Size: ' +
            convertSizeUnit(sDashSize) +
            ',   ' +
            'EDash Size: ' +
            convertSizeUnit(eDashSize) +
            ',   ' +
            'Total Size: ' +
            convertSizeUnit(totalSize)}
        </Typography>
      </div>

      <div style={{ position: 'relative' }}>
        <TableContainer
          style={
            isSmallScreen
              ? { maxHeight: `calc(100vh - 308px)` }
              : { maxHeight: `calc(100vh - 290px)` }
          }
        >
          <Table stickyHeader aria-label="sticky table" ref={mainTable}>
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ minWidth: '60px' }}>
                  # ID
                </TableCell>
                {/* <TableCell align="left">{en['Status']}</TableCell> */}
                <TableCell align="left" style={{ minWidth: '68px' }}>
                  <TableSortLabel
                    active={true}
                    direction={statusSortDirection}
                    onClick={handleStatusSort}
                  >
                    {en['Status']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '84px' }}>
                  <TableSortLabel
                    active={true}
                    direction={IDSortDirection}
                    onClick={handleIDSort}
                  >
                    {en['Identifier']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '84px' }}>
                  <TableSortLabel
                    active={true}
                    direction={groupIdSortDirection}
                    onClick={handleGroupIdSort}
                  >
                    {en['GroupId']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '65px' }}>
                  <TableSortLabel
                    active={true}
                    direction={nameSortDirection}
                    onClick={handleNameSort}
                  >
                    {en['Name']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '58px' }}>
                  <TableSortLabel
                    active={true}
                    direction={typeSortDirection}
                    onClick={handleTypeSort}
                  >
                    {en['Type']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '90px' }}>
                  <TableSortLabel
                    active={true}
                    direction={sizeSortDirection}
                    onClick={handleSizeSort}
                  >
                    {en['Size']}(KB)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '130px' }}>
                  <TableSortLabel
                    active={true}
                    direction={updatedAtSortDirection}
                    onClick={handleUpdatedAtSort}
                  >
                    {en['Updated At']}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" style={{ minWidth: '130px' }}>
                  <TableSortLabel
                    active={true}
                    direction={otaSortDirection}
                    onClick={handleOTASort}
                  >
                    OTA
                  </TableSortLabel>
                </TableCell>
                {!disable ? (
                  <TableCell align="center" style={{ minWidth: '87px' }}>
                    # {en['Action']}
                  </TableCell>
                ) : (
                  []
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loadedData.length > 0 &&
                getTableViewData(loadedData).map((row, index) => (
                  <TableRow hover key={row._id}>
                    <TableCell component="th" scope="row" align="center">
                      {page === 1
                        ? index + 1
                        : index + 1 + (page - 1) * pageCount}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {(row.status || '').capitalizeFirstLetter()}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.name === 'app' ? row.desc?.short : row.name}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.groupId ? row.groupId : ''}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {getDisplayName(row.desc?.title)}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.name === 'app' ? row.name : row.desc?.short}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {row.multimediaAssets?.length > 0 &&
                      row.multimediaAssets[0].data?.size
                        ? Number(
                            (row.multimediaAssets[0].data?.size / 1000).toFixed(
                              1
                            )
                          )
                        : null}
                    </TableCell>
                    <TableCell component="th" align="left">
                      {getFormattedDate(row.updatedAt)}
                    </TableCell>
                    <TableCell component="th" align="left">
                      <div className={classes.ota}>
                        <div
                          className={classes.ota_status}
                          style={getOTAStyle(row)}
                        />
                        <span className={classes.ota_label}>
                          {getOTAStatus(row).createdAt
                            ? getFormattedDate(getOTAStatus(row).createdAt)
                            : ''}
                        </span>
                      </div>
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
                              {checkDownloadButton(mobSelectedRow) ? (
                                <StyledMenuItem>
                                  <div
                                    onClick={() =>
                                      handleTableChange(
                                        'download',
                                        mobSelectedRow?.multimediaAssets[0]
                                          ?.baseUrl +
                                          mobSelectedRow?.multimediaAssets[0]
                                            ?.fileDir +
                                          mobSelectedRow?.multimediaAssets[0]
                                            ?.fileName
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faDownload}
                                      size="xs"
                                      style={{ marginRight: 7 }}
                                    />
                                    {en['Download']}
                                  </div>
                                </StyledMenuItem>
                              ) : (
                                <StyledMenuItem>
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
                                    handleTableChange('refresh', mobSelectedRow)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faSyncAlt}
                                    size="xs"
                                    style={{ marginRight: 7 }}
                                  />
                                  {en['Repackage']}
                                </div>
                              </StyledMenuItem>
                            </StyledMenu>
                          </>
                        ) : (
                          <Box textAlign="center">
                            {checkDownloadButton(row) ? (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleTableChange(
                                    'download',
                                    row.multimediaAssets[0]?.baseUrl +
                                      row.multimediaAssets[0]?.fileDir +
                                      row.multimediaAssets[0]?.fileName
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
                              onClick={() => handleTableChange('refresh', row)}
                            >
                              {' '}
                              <AutorenewIcon />
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
        </TableContainer>
        <Pagination
          count={totalPage || 1}
          size="small"
          page={page}
          siblingCount={0}
          showFirstButton
          showLastButton
          onChange={handleChangePage}
          className={classes.pagination}
        />
      </div>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="sm"
        fullWidth={true}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor
            disable={false}
            resources={selectedInfo}
            // showTabs={true}
          />
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

export default PackageListForm;
