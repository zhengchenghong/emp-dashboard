/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Grid,
  Select,
  MenuItem,
  Input,
  ListItemText,
  Typography,
  FormControl
} from '@material-ui/core';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import { AccessConfigForm, ConfigForm } from '@app/components/Forms';
import {
  getDisplayName,
  getAssetUrl,
  getUUID,
  exportToCsv
} from '@app/utils/functions';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useGalleryContext } from '@app/providers/GalleryContext';
import graphql from '@app/graphql';
import { useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import {
  archivedClass,
  create,
  update,
  updateAll
} from '@app/utils/ApolloCacheManager';
import { useUserContext } from '@app/providers/UserContext';
import {
  UserUploadForm,
  SearchUserForm,
  UserInfoForm,
  UserListForm,
  PackageListForm,
  AvatarUploadForm,
  SingleContactForm,
  AltText,
  StylesForm,
  AnalyticForm,
  DescriptionForm,
  StateSelectForm
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { uploadFileToS3 } from '@app/utils/aws_s3_bucket';
import { getFileExtension } from '@app/utils/file-manager';
import {
  getCurrentUTCTime,
  getFormattedDate,
  getISOTimeString
} from '@app/utils/date-manager';
import { useSelectionContext } from '@app/providers/SelectionContext';
import CustomModal from '@app/components/Modal';
import HtmlContainer from '@app/containers/HtmlContainer';
import { useSearchContext } from '@app/providers/SearchContext';
import { useAssetContext } from '@app/providers/AssetContext';
import useStyles from './style';
import { CustomSelectBox } from '@app/components/Custom';
import langs from '@app/constants/lang/language.json';
import { en } from '@app/language';
import { groupingList } from '@app/utils/ApolloCacheManager';
import DeviceTable from '@app/components/Tables/Device';
import { useMediumScreen, useSmallScreen } from '@app/utils/hooks';
import transmissions from '@app/constants/transmissions.json';
import ConfigIngest from '@app/components/Forms/ConfigIngest';
import { faSlideshare } from '@fortawesome/free-brands-svg-icons';
import SchoolTermTable from '@app/components/Tables/SchoolTermTable';
import CreateSchoolTermDialog from '@app/components/Tables/SchoolTermTable/Dialog';

const getStructuredData = (data) => {
  return data?.map((item) => ({
    label: item?.name,
    value: item?._id
  }));
};

const MenuProps = {
  PaperProps: {
    style: {
      // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const getGrades = () => {
  return [
    'Preschool',
    'Lower Primary (K-2)',
    'Upper Primary (3-5)',
    'Middle School',
    'High School',
    'Community College',
    'College',
    'Graduate',
    'Career'
  ];
};

const convertUTCDateToLocalDate = (date) => {
  var newDate = new Date(date);
  newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return newDate.toISOString().slice(0, 16);
};

const convertLocalDateToUTCDate = (date) => {
  var newDate = new Date(date);
  // newDate.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return newDate.toISOString();
};

const TopologyEdit = ({
  forceSave,
  resources,
  parentPage,
  selectedTreeItem,
  setSelectedTreeItem,
  setRefresh,
  setEditPanelData,
  setWhenState,
  whenState,
  stationLoadedData,
  classLoadedData,
  districtLoadedData,
  schoolLoadedData,
  allDistrictResources,
  onChange,
  handleMainChange,
  createBulkUsersGrouping,
  updateGrouping,
  deleteDocument,
  allSchoolResources,
  setSelected,
  parentTreeItem,
  forceChangeItem,
  setTopologyTitle,
  onForceChange,
  isMaterial,
  showEyeIcon,
  isRoot,
  StatesList,
  loadedData,
  viewMethod,
  setShowEdit,
  schoolTerms,
  userInfo,
  setCreateNew,

  newTopologyId,
  setNewTopologyId
}) => {
  const classes = globalStyles.globaluseStyles();
  const avatarRef = useRef();
  const classes1 = useStyles();
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [avatarS3URL, setAvatarS3URL] = useState('');
  const [avatarType, setAvatarType] = useState();
  const [gradesData, setGradesData] = useState([]);
  const [descData, setDescData] = useState({});
  const [altText, setAltText] = useState();
  const [contactData, setContactData] = useState({});
  const [topologyData, setTopologyData] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openAbort, setOpenAbort] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddDeviceDlg, setShowAddDeviceDlg] = useState(false);
  const [showAddSchoolTermDlg, setShowAddSchoolTermDlg] = useState(false);
  const [isSchoolTermCreating, setSchoolTermCreating] = useState(false);
  const [openDeleteAbort, setOpenDeleteAbort] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const { openSearch: openLessonSearch, setOpenSearch: setOpenLessonSearch } =
    useSearchContext();
  const [updateValue, setUpdateValue] = useState(false);
  const { setOpenRight } = useGalleryContext();
  const [checkbox, setCheckbox] = useState(false);
  const [configAppCheckBox, setConfigAppCheckBox] = useState(false);
  const [configAppUnCheckOpen, setConfigAppUnCheckOpen] = useState(false);
  const [allowChangeConfigApp, setAllowChangeConfigApp] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [triggerPackage, setTriggerPackage] = useState(false);
  const [canSaveConfig, setCanSaveConfig] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [isTabReset, setIsTabReset] = useState(false);
  const [tabStatus, setTabStatus] = useState({});
  const [isHideAction, setIsHideAction] = useState(false);
  const [uploadDialogTitle, setUploadDialogTitle] = useState('');
  const [searchDialogTitle, setSearchDialogTitle] = useState('');
  const [loadedUser, setLoadedUser] = useState();
  const [loadedStudentFile, setLoadedStudentFile] = useState();
  const [loadedTeacherFile, setLoadedTeacherFile] = useState();
  const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [currentSource, setCurrentSource] = useState();
  const [canShowInfo, setCanShowInfo] = useState(true);
  const [openInfo, setOpenInfo] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [stylesData, setStylesData] = useState();
  const [selectedTime, setSelectedTime] = useState(0);

  const [selectedGoogleTime, setSelectedGoogleTime] = useState(0);
  const [selectedCanvasTime, setSelectedCanvasTime] = useState(0);
  const [selectedSchoologyTime, setSelectedSchoologyTime] = useState(0);
  const [scheduleData, setScheduleData] = useState({});
  const [lifecycleData, setLifecycleData] = useState({});
  const [updatedResource, setUpdatedResource] = useState();

  const [teacherEditRow, setTeacherEditRow] = useState();
  const [studentEditRow, setStudentEditRow] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [studentResources, setStudentResources] = useState([]);
  const [bucketName, setBucketName] = useState();
  const [packageRefresh, setPackageRefresh] = useState(false);
  const [triggedPackage, setTriggedPackage] = useState(true);
  const [packageDownload, setPackageDownload] = useState(false);
  const [showLearnerDashboard, setShowLearnerDashboard] = useState(false);
  const client = useApolloClient();
  const { nextSelected, setShowRoot } = useSelectionContext();
  const [stateLabel, setStateLabel] = useState();
  const { userTableLoadData } = useAssetContext();
  const [currentUser] = useUserContext();
  const [avatarSize, setAvatarSize] = useState();
  const [openIngestGoogleConfirmation, setOpenIngestGoogleConfirmation] =
    useState(false);
  const [schoolAdminData, setSchoolAdminData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canIngestGoogleClasses, setCanIngestGoogleClasses] = useState(false);
  const [openConfirmIngestCanvas, setOpenIngestCanvas] = useState(false);
  const [openConfirmIngestSchoology, setOpenConfirmIngestSchoology] =
    useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [refetchValue, setRefetchValue] = useState(false);
  const [canGallery, setCanGallery] = useState(false);
  const [galleryType, setGalleryType] = useState();
  const [language, setLanguage] = useState('en');
  const [classSchoolTerm, setClassSchoolTerm] = useState('en');
  const [classSchoolTerms, setClassSchoolTerms] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const isMediumScreen = useMediumScreen();
  const isSmallScreen = useSmallScreen();
  const [openGrades, setOpenGrades] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openSchoolTerms, setOpenSchoolTerms] = useState(false);

  const [openSave, setOpenSave] = useState(false);

  const [sliderTapValue, setSliderTapValue] = useState();

  const [transmission, setTransmission] = useState();
  const [createAccessConfig, setCreateAccessConfig] = useState(false);
  const [openArchivePopup, setOpenArchivePopup] = useState(false);
  const [downloadCSV, setDownloadCSV] = useState(false);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping, {
    update: create
  });

  const [updateGroupingStation] = useMutation(
    graphql.mutations.updateGroupingStation,
    {
      update: update
    }
  );
  const [updateGroupingDistrict] = useMutation(
    graphql.mutations.updateGroupingDistrict,
    {
      update: update
    }
  );
  const [updateGroupingSchool] = useMutation(
    graphql.mutations.updateGroupingSchool,
    {
      update: update
    }
  );
  const [updateGroupingClass] = useMutation(
    graphql.mutations.updateGroupingClass,
    {
      update: update
    }
  );
  const [ingestGoogle] = useMutation(graphql.mutations.ingestGoogle);
  const [ingestCanvas] = useMutation(graphql.mutations.IngestCanvas);
  const [ingestSchoology] = useMutation(graphql.mutations.IngestSchoology);
  const [updateConfigApp] = useMutation(graphql.mutations.UpdateConfigApp);
  const [archiveClass] = useMutation(graphql.mutations.ArchiveClass, {
    update: archivedClass
  });

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const [
    getConfigApp,
    { loading: broadCaseLoading, data: broadCastData, error: broadCastError }
  ] = useLazyQuery(graphql.queries.BroadCastAppGrouping, {
    fetchPolicy: 'network-only'
  });

  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  const changePage = (item) => {
    handleMainChange('elSingleClick', item, whenState);
    // setEditPanelData(item);
    // setSelectedTreeItem(item);
    // setSelected(item?._id);
  };

  const [
    getPublishedStudentCount,
    {
      loading: publishedStudentCountLoading,
      error: publishedStudentCountError,
      data: publishedStudentCountData
    }
  ] = useLazyQuery(graphql.queries.totalCount, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const fetchTotalCount = async () => {
    if (
      resources?.schemaType === 'station' ||
      resources?.schemaType === 'class'
    ) {
      const variables =
        resources?.schemaType === 'class'
          ? {
              schemaType: 'student',
              parentId: resources?.topology?.district,
              classId: resources?._id,
              status: 'published'
            }
          : {
              schemaType: 'student',
              topology: {
                station: resources?.topology?.station
              },
              status: 'published'
            };
      await getPublishedStudentCount({
        variables: variables
      });
    }
  };

  useEffect(() => {
    if (!broadCaseLoading && !broadCastError && broadCastData) {
      if (broadCastData?.grouping?.length) {
        setConfigAppCheckBox(true);
      } else {
        setConfigAppCheckBox(false);
      }
    }
  }, [broadCaseLoading, broadCastData, broadCastError]);

  useEffect(() => {
    setPackageDownload(false);
    if (
      resources?.schemaType === 'station' ||
      resources?.schemaType === 'class'
    ) {
      fetchTotalCount();

      setTransmission(resources.transmission);
    }
  }, [resources]);

  useEffect(() => {
    if (resources?.schemaType === 'station' && tabStatus.config) {
      setAllowChangeConfigApp(false);
      setConfigAppCheckBox(false);
      getConfigApp({
        variables: {
          schemaType: 'broadcastApp',
          stationId: resources?._id,
          type: 'EDU'
        },
        fetchPolicy: 'network-only'
      });
    }
  }, [resources, tabStatus.config]);

  useEffect(() => {
    if (topologyData?.state) {
      let state = StatesList.filter((el) => el.value === topologyData?.state);
      setStateLabel(state && state[0] && state[0].label);
    }
  }, [topologyData]);
  useEffect(() => {
    if (schoolAdminData && schoolAdminData?.length > 0) {
      setCanIngestGoogleClasses(true);
    } else {
      setCanIngestGoogleClasses(false);
    }
  }, [schoolAdminData]);

  const studentVariables = {
    schemaType: 'student',
    offset: null
  };
  const [
    getStudentItems,
    { loading: studentLoading, error: studentError, data: studentData }
  ] = useLazyQuery(graphql.queries.userGrouping);

  const fetchStudents = async (variables) => {
    await getStudentItems({
      variables: variables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    if (!tabStatus.hasOwnProperty() || tabStatus?.desc || tabStatus?.analyse)
      return;
    if (studentResources == null || studentResources?.length === 0) {
      fetchStudents(studentVariables);
    }
  }, []);

  useEffect(() => {
    if (!studentLoading && !studentError && studentData) {
      setStudentResources(studentData.grouping);
    }
  }, [studentLoading, studentError, studentData]);

  const getTitle = async (item) => {
    if (isMaterial) {
      let { data: stationItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item?.topology?.station,
          schemaType: 'station'
        }
      });
      let station = getDisplayName(stationItem?.grouping[0]?.name);
      let { data: districtItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item.topology.district,
          schemaType: 'district'
        }
      });
      let district = getDisplayName(districtItem?.grouping[0]?.name);

      let { data: schoolItem } = await client.query({
        query: graphql.queries.nameGrouping,
        variables: {
          id: item.topology.school,
          schemaType: 'school'
        }
      });
      let school = getDisplayName(schoolItem?.grouping[0]?.name);

      if (item.schemaType === 'class' || item.schemaType === 'googleClass') {
        if (
          currentUser?.schemaType === 'superAdmin' ||
          currentUser?.schemaType === 'sysAdmin'
        ) {
          setTopologyTitle(`${station} > ${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'stationAdmin') {
          setTopologyTitle(`${station} > ${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'districtAdmin') {
          setTopologyTitle(`${station} > ${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'educator') {
          setTopologyTitle(`${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'schoolAdmin') {
          setTopologyTitle(`${school}`);
          return `${item.name}`;
        }
        // return `${station} > ${district} > ${school} > ${item.name}`;
        return `${item.name}`;
      }
    } else {
      let stationItem1 = stationLoadedData?.find(
        (el) => el._id === item?.topology?.station
      );

      if (stationItem1 == null) {
        let { data: stationItem } = await client.query({
          query: graphql.queries.nameGrouping,
          variables: {
            id: item?.topology?.station,
            schemaType: 'station'
          }
        });
        stationItem1 =
          stationItem?.grouping?.length > 0 ? stationItem?.grouping[0] : null;
      }

      let station = getDisplayName(stationItem1?.name);
      if (item.schemaType === 'station') {
        return <span className={classes.breadcrumb}>{station}</span>;
      }

      let districtItem = districtLoadedData.find(
        (el) => el._id === item.topology.district
      );
      let district = getDisplayName(districtItem?.name);
      if (item.schemaType === 'district') {
        let breadcrumb = (
          <>
            {currentUser?.schemaType !== 'districtAdmin' ? (
              <>
                <span
                  className={classes.breadcrumbLink}
                  onClick={() => changePage(stationItem1)}
                >
                  {station}
                </span>
                {` > `}
              </>
            ) : (
              <>
                <span>{station}</span>
                {` > `}
              </>
            )}
            <span className={classes.breadcrumb}>{district}</span>
          </>
        );
        return breadcrumb;
      }

      let schoolItem = schoolLoadedData.find(
        (el) => el._id === item.topology.school
      );
      let school = getDisplayName(schoolItem?.name);

      if (item.schemaType === 'school') {
        let breadcrumb = (
          <>
            {currentUser?.schemaType !== 'districtAdmin' &&
            currentUser?.schemaType !== 'schoolAdmin' ? (
              <>
                <span
                  className={classes.breadcrumbLink}
                  onClick={() => changePage(stationItem1)}
                >
                  {station}
                </span>
                {` > `}
              </>
            ) : (
              currentUser?.schemaType !== 'schoolAdmin' && (
                <>
                  <span>{station}</span>
                  {` > `}
                </>
              )
            )}
            {currentUser?.schemaType !== 'schoolAdmin' && (
              <>
                <span
                  className={classes.breadcrumbLink}
                  onClick={() => changePage(districtItem)}
                >
                  {district}
                </span>
                {` > `}
              </>
            )}

            <span className={classes.breadcrumb}>{school}</span>
          </>
        );
        return breadcrumb;
      }

      let classItem = classLoadedData.find(
        (el) => el._id === item.topology.class
      );
      let className = getDisplayName(classItem?.name);

      if (item.schemaType === 'class' || item.schemaType === 'googleClass') {
        if (parentPage === 'Lessons') {
          return (
            <>
              <span className={classes.breadcrumb}>{className}</span>
            </>
          );
        } else {
          return (
            <>
              {currentUser?.schemaType !== 'districtAdmin' &&
              currentUser?.schemaType !== 'schoolAdmin' ? (
                <>
                  <span
                    className={classes.breadcrumbLink}
                    onClick={() => changePage(stationItem1)}
                  >
                    {station}
                  </span>
                  {` > `}
                </>
              ) : (
                currentUser?.schemaType !== 'schoolAdmin' && (
                  <>
                    <span>{station}</span>
                    {` > `}
                  </>
                )
              )}
              {currentUser?.schemaType !== 'schoolAdmin' && (
                <>
                  <span
                    className={classes.breadcrumbLink}
                    onClick={() => changePage(districtItem)}
                  >
                    {district}
                  </span>
                  {` > `}
                </>
              )}

              <span
                className={classes.breadcrumbLink}
                onClick={() => changePage(schoolItem)}
              >
                {school}
              </span>
              {` > `}
              <span className={classes.breadcrumb}>{className}</span>
            </>
          );
        }
      }
    }
  };

  useEffect(async () => {
    if (resources) {
      if (!isRoot) {
        let title = await getTitle(resources);
        setTitle(title);
      }
    }
  }, [resources?._id, whenState]);

  useEffect(() => {
    const onLoad = async () => {
      setCheckbox(false);
      setTriggerPackage(false);
      setUpdateValue(false);
      setShowUserDialog(false);

      if (resources?._id !== currentSource?._id && nextSelected) {
        if (newTopologyId === resources?._id) {
          setTabValue(0);
          setIsTabReset(true);
          handleTabStatus(0, resources?.schemaType);
          avatarRef.current?.focus();
          setNewTopologyId(null);
        } else {
          if (resources?.schemaType !== currentSource?.schemaType) {
            const schemaType = resources?.schemaType;
            if (tabStatus?.analyse && currentSource) {
              setIsTabReset(false);
              if (schemaType === 'station') {
                setTabValue(5);
                handleTabStatus(5, schemaType);
              } else if (schemaType === 'district') {
                setTabValue(5);
                handleTabStatus(5, schemaType);
              } else if (schemaType === 'school') {
                setTabValue(3);
                handleTabStatus(3, schemaType);
              } else if (schemaType === 'class') {
                setTabValue(3);
                handleTabStatus(3, schemaType);
              }
            } else if (tabStatus?.administrator) {
              setIsTabReset(false);
              if (schemaType === 'station') {
                setTabValue(3);
                handleTabStatus(3, schemaType);
              } else if (schemaType === 'district') {
                setTabValue(3);
                handleTabStatus(3, schemaType);
              } else if (schemaType === 'school') {
                setTabValue(2);
                handleTabStatus(2, schemaType);
              } else if (schemaType === 'class') {
                setIsTabReset(true);
                setTabValue(0);
                handleTabStatus(0, schemaType);
              }
            } else {
              setIsTabReset(true);
              // setTabValue(0);
              handleTabStatus(0, schemaType);
            }
          }
        }

        setCurrentSource(resources);
      }

      setLoadedUser();
      resources.desc !== undefined &&
        setDescData({
          title: resources?.desc?.title?.replace(/<[^>]+>/g, '') || '',
          short: resources?.desc?.short?.replace(/<[^>]+>/g, '') || '',
          long: resources?.desc?.long?.replace(/<[^>]+>/g, '') || ''
        });

      setStylesData(
        resources?.data?.styles || {
          bg: '',
          fg: ''
        }
      );

      setContactData(
        resources?.contact || {
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        }
      );

      if (resources.avatar) {
        const url =
          resources.avatar?.baseUrl +
          resources.avatar?.fileDir +
          resources.avatar?.fileName;
        setAvatarS3URL(url || '');
        setAltText(resources.avatar?.altText || '');
        setAvatarType(resources?.avatar?.type || '');
      } else {
        setAvatarS3URL('');
        setAltText('');
        setAvatarType('');
      }

      setTopologyData({
        ...topologyData,
        state: resources?.topology?.state || '',
        station: resources.topology?.station || '',
        school: resources.topology?.school || '',
        district: resources.topology?.district || '',
        class: resources.topology?.class || ''
      });

      setGradesData(resources.categories?.grades || []);
      setSelectedTime(resources?.config?.packagingCycleTime);
      setSelectedGoogleTime(resources?.config?.googleIngestCycleTime);
      setSelectedCanvasTime(resources.config?.canvasIngestCycleTime);
      setSelectedSchoologyTime(resources.config?.schoologyIngestCycleTime);
      setLanguage(resources?.categories?.lang);
      setClassSchoolTerm(resources?.schoolTermId);

      if (resources?.lifecycle) {
        let lifecycle = {};
        if (resources?.lifecycle?.archiveOn) {
          const archiveOnInUTC = new Date(resources?.lifecycle?.archiveOn);
          const archiveOnInLacal = convertUTCDateToLocalDate(archiveOnInUTC);
          lifecycle.archiveOn = archiveOnInLacal;
        } else {
          lifecycle.archiveOn = '';
        }

        if (resources?.lifecycle?.deleteOn) {
          const deleteOnInUTC = new Date(resources.lifecycle.deleteOn);
          const deleteOn = convertUTCDateToLocalDate(deleteOnInUTC);
          lifecycle.deleteOn = deleteOn;
        } else {
          lifecycle.deleteOn = '';
        }

        if (resources?.lifecycle?.publishedOn) {
          const publishedOnInUTC = new Date(resources.lifecycle.publishedOn);
          const publishedOn = convertUTCDateToLocalDate(publishedOnInUTC);
          lifecycle.publishedOn = publishedOn;
        } else {
          lifecycle.publishedOn = '';
        }

        if (resources?.lifecycle?.unpublishedOn) {
          const unpublishedOnInUTC = new Date(
            resources.lifecycle.unpublishedOn
          );
          const unpublishedOn = convertUTCDateToLocalDate(unpublishedOnInUTC);
          lifecycle.unpublishedOn = unpublishedOn;
        } else {
          lifecycle.unpublishedOn = '';
        }
        setLifecycleData(lifecycle);
      } else {
        setLifecycleData({
          archiveOn: '',
          deleteOn: '',
          publishedOn: '',
          unpublishedOn: ''
        });
      }
      if (schoolAdminData && schoolAdminData?.length > 0) {
        setCanIngestGoogleClasses(true);
      } else {
        setCanIngestGoogleClasses(false);
      }
    };
    if (resources) {
      if (!isRoot) {
        onLoad();
      }
    } else {
      if (isRoot) {
        const schemaType = resources?.schemaType;
        setIsTabReset(true);
        setTabValue(0);
        handleTabStatus(0, schemaType);
        setCurrentSource();
        setTitle('Stations');
      }
    }
  }, [resources, selectedTreeItem]);

  useEffect(() => {
    let allSchoolTerms = [{ _id: 'empty', name: 'No school term' }];
    if (
      ['superAdmin', 'sysAdmin', 'stationAdmin', 'districtAdmin'].includes(
        currentUser?.schemaType
      ) &&
      currentUser?.schemaType
    ) {
      allSchoolTerms.push({ _id: 'new', name: '+ New School Term' });
    }
    setClassSchoolTerms(allSchoolTerms);
  }, [schoolTerms]);

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
    }
  }, [forceSave]);

  const handleShowPanel = async (value) => {
    if (!isRoot) {
      if (tabStatus.desc && value !== 0 && whenState) {
        setSliderTapValue(value);
        setOpenSave(true);
        return;
      }
    }
    const schemaType = resources?.schemaType;
    setIsTabReset(false);
    handleTabStatus(value, schemaType);
  };

  const handleTabStatus = async (value, schemaType) => {
    setIsHideAction(false);
    setCanUpload(false);
    setUpdateValue(false);
    setCanSaveConfig(false);
    setCanPublish(false);
    setCanShowInfo(true);
    setRefetchValue(false);
    setCanGallery(false);
    setOpenRight(false);
    if (isRoot) {
      setIsHideAction(true);
      setCanUpload(false);
      setUpdateValue(false);
      setCanSaveConfig(false);
      setCanPublish(false);
      setCanShowInfo(false);
    }
    if (value !== 0) {
      setGalleryType('logos');
    }

    if (value === 0) {
      if (isRoot) {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: false,
          styles: false,
          right: false,
          analyse: true
        });
        return;
      } else {
        setCanGallery(true);
      }
      setTabStatus({
        desc: true,
        config: false,
        packages: false,
        people: false,
        teachers: false,
        students: false,
        administrator: false,
        devices: false,
        styles: false,
        right: false,
        analyse: false
      });
      setGalleryType(schemaType === 'class' ? 'banner' : 'logos');
    } else if (value === 1) {
      setOpenLessonSearch(false);
      setIsHideAction(true);
      if (isRoot) {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: false,
          styles: false,
          right: false,
          analyse: false,
          systemMessages: true
        });

        return;
      }
      if (
        schemaType === 'district' ||
        schemaType === 'class' ||
        schemaType === 'googleClass'
      ) {
        setCanUpload(true);
        if (currentUser?.schemaType === 'educator') {
          setTabStatus({
            desc: false,
            packages: false,
            people: false,
            teachers: true,
            students: false,
            schoolTerms: false,
            administrator: false,
            devices: false,
            styles: false,
            right: false
          });
          setGalleryType('avatar');
        } else {
          setCanGallery(true);
          setTabStatus({
            desc: false,
            packages: false,
            people: false,
            teachers: true,
            students: false,
            schoolTerms: false,
            administrator: false,
            devices: false,
            analyse: false,
            styles: false,
            right: false
          });
          setGalleryType('avatar');
        }
      } else if (schemaType === 'station') {
        setCanPublish(true);
        setTabStatus({
          desc: false,
          config: false,
          packages: true,
          schoolTerms: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: false,
          styles: false,
          right: false
        });
      } else if (schemaType === 'school') {
        setCanSaveConfig(schemaType !== 'school');
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'districtAdmin' ||
          currentUser.schemaType === 'sysAdmin' ||
          currentUser.schemaType === 'schoolAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: schemaType === 'station',
            packages: false,
            people: false,
            teachers: false,
            students: false,
            schoolTerms: schemaType === 'school',
            administrator: false,
            devices: false,
            styles: false,
            analyse: false,
            right: false
          });
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            schoolTerms: false,
            students: false,
            administrator: false,
            devices: false,
            styles: false,
            analyse: true,
            right: false
          });
        }

        // setIsHideAction( true);
        // setCanSaveConfig(
        //   currentUser.schemaType === 'superAdmin' ||
        //   currentUser.schemaType === 'stationAdmin' ||
        //   currentUser.schemaType === 'sysAdmin' ||
        //   currentUser.schemaType === 'schoolAdmin'
        // );
        // setTabStatus({
        //   desc: false,
        //   config: schemaType !== 'school' && (
        //     currentUser.schemaType === 'superAdmin' ||
        //     currentUser.schemaType === 'stationAdmin' ||
        //     currentUser.schemaType === 'sysAdmin' ||
        //     currentUser.schemaType === 'schoolAdmin'
        //   ),
        //   packages: false,
        //   people: false,
        //   teachers: false,
        //   students: false,
        //   schoolTerms: false,
        //   administrator: !(
        //     currentUser.schemaType === 'superAdmin' ||
        //     currentUser.schemaType === 'stationAdmin' ||
        //     currentUser.schemaType === 'sysAdmin' ||
        //     currentUser.schemaType === 'schoolAdmin'
        //   ),
        //   devices: false,
        //   analyse: false,
        //   styles: false,
        //   right: false
        // });
        // if (
        //   !(
        //     currentUser.schemaType === 'superAdmin' ||
        //     currentUser.schemaType === 'stationAdmin'
        //   )
        // ) {
        //   setGalleryType('avatar');
        // }
      }
    } else if (value === 2) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      setIsHideAction(true);
      if (schemaType === 'district' || schemaType === 'class') {
        setCanUpload(true);
      }
      if (schemaType === 'station') {
        setCanSaveConfig(schemaType !== 'school');
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'sysAdmin' ||
          currentUser.schemaType === 'schoolAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: schemaType === 'station',
            packages: false,
            people: false,
            teachers: false,
            students: false,
            schoolTerms: schemaType === 'school',
            administrator: false,
            devices: false,
            styles: false,
            analyse: false,
            right: false
          });
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            schoolTerms: false,
            students: false,
            administrator: false,
            devices: false,
            styles: false,
            analyse: true,
            right: false
          });
        }
      } else if (schemaType === 'school') {
        setCanSaveConfig(true);
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'districtAdmin' ||
          currentUser.schemaType === 'sysAdmin' ||
          currentUser.schemaType === 'schoolAdmin'
        ) {
          setCanGallery(schemaType === 'station' || schemaType === 'school');
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: schemaType === 'station' || schemaType === 'school',
            devices: false,
            styles: false,
            right: false,
            analyse: false
          });
          if (schemaType === 'station' || schemaType === 'school') {
            setGalleryType('avatar');
          }
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: false,
            schoolTerms: false,
            devices: false,
            styles: false,
            right: false,
            analyse: true
          });
        }
      } else {
        if (
          currentUser?.schemaType === 'educator' ||
          currentUser?.schemaType === 'schoolAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: true,
            schoolTerms: false,
            administrator: false,
            devices: false,
            styles: false,
            right: false,
            analyse: false
          });
        } else {
          setCanGallery(true);
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            schoolTerms: false,
            students: true,
            administrator: false,
            devices: false,
            styles: false,
            right: false
          });
          setGalleryType('avatar');
        }
      }
    } else if (value === 3) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      if (schemaType === 'district') {
        setIsHideAction(true);
        setCanGallery(true);
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          schoolTerms: false,
          administrator: true,
          devices: false,
          styles: false,
          right: false,
          analyse: false
        });
        setGalleryType('avatar');
      } else if (schemaType === 'station') {
        setCanSaveConfig(true);
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'sysAdmin' ||
          currentUser.schemaType === 'schoolAdmin'
        ) {
          setCanGallery(schemaType === 'station' || schemaType === 'school');
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: schemaType === 'station' || schemaType === 'school',
            devices: false,
            styles: false,
            right: false,
            analyse: false
          });
          if (schemaType === 'station' || schemaType === 'school') {
            setGalleryType('avatar');
          }
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: false,
            schoolTerms: false,
            devices: false,
            styles: false,
            right: false,
            analyse: true
          });
        }
      } else if (schemaType === 'school') {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: schemaType === 'station',
          styles: false,
          right: false,
          analyse: schemaType === 'school'
        });
      } else if (schemaType === 'class' || schemaType === 'googleClass') {
        if (
          currentUser?.schemaType === 'educator' ||
          currentUser?.schemaType === 'schoolAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: false,
            schoolTerms: false,
            devices: false,
            styles: false,
            right: false,
            analyse: true
          });
        } else {
          setTabStatus({
            desc: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: false,
            devices: false,
            analyse: true,
            styles: false,
            right: false
          });
        }
      }
    } else if (value === 4) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      if (schemaType === 'district') {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: false,
          styles: true,
          right: false,
          analyse: false
        });
      } else if (schemaType === 'station' || schemaType === 'school') {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: schemaType === 'station',
          styles: false,
          right: false,
          analyse: schemaType === 'school'
        });
      }
    } else if (value === 5) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      if (schemaType === 'district') {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          styles: false,
          right: false,
          analyse: true
        });
      }
      if (schemaType === 'station') {
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          devices: false,
          styles: false,
          right: false,
          analyse: true
        });
      }
    } else if (value === 6) {
      setIsHideAction(true);
      setTabStatus({
        desc: false,
        config: false,
        packages: false,
        people: false,
        teachers: false,
        students: false,
        administrator: false,
        devices: false,
        styles: false,
        right: false,
        analyse: false,
        accessConfig: true
      });
    }
  };

  const handleRefresh = (value) => {
    setRefresh(value);
  };

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
      setWhenState(true);
    }

    if (type === 'long') {
      setDescData({
        ...descData,
        [type]: value
      });
      setWhenState(true);
    }

    if (type === 'contact') {
      setContactData(value);
      setWhenState(true);
    }

    if (type === 'altText') {
      setAltText(value);
      setWhenState(true);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarAttached(false);
        setAvatarS3URL('');
        setWhenState(true);
        onForceChange && onForceChange('avatar', '');
      } else {
        setAvatarAttached(false);
        setAvatarS3URL(value);
        setWhenState(true);
        onForceChange && onForceChange('avatar', value);
      }
      onChange('update', true);
      return;
    }

    if (
      type === 'station' ||
      type === 'school' ||
      type === 'district' ||
      type === 'class' ||
      type === 'state' ||
      type === 'googleClass'
    ) {
      setWhenState(true);
      setTopologyData({
        ...topologyData,
        [type]: value
      });
    }

    if (type === 'grades') {
      let validValues = [];
      value?.forEach((val) => {
        if (val != null) {
          validValues.push(val);
        }
      });
      setGradesData(validValues);
      setOpenGrades(false);
      setOpenLang(true);
      setWhenState(true);
    }

    if (type === 'user') {
      setLoadedUser(value);
      setOpenSearch(false);
      return;
    }

    if (type === 'userInfo') {
      setLoadedUser();
    }

    if (type === 'userUpload') {
      if (value === 'clear') {
        return;
      }

      if (tabStatus.students) setLoadedStudentFile(value);
      if (tabStatus.teachers) setLoadedTeacherFile(value);
      return;
    }

    if (type === 'teacherEdit') {
      if (!value) {
        setTeacherEditRow();
        onChange('update', false);
        return;
      }
      setTeacherEditRow(value);
    }
    if (type === 'studentEdit') {
      if (!value) {
        setStudentEditRow();
        onChange('update', false);
        return;
      }
      setStudentEditRow(value);
    }

    if (type === 'styles') {
      setStylesData(value);
      setWhenState(true);
    }

    if (type === 'transmission') {
      setTransmission(value);
      setWhenState(true);
    }
    // onChange('update', true);
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'packageDownload') {
        setPackageDownload(true);
      }
      if (type === 'refresh') {
        // package refresh
        if (
          resources?.schemaType === 'station' ||
          resources?.schemaType === 'district' ||
          resources?.schemaType === 'class'
        ) {
          setPackageRefresh(!packageRefresh);
        } else {
          setPackageRefresh(!packageRefresh);
          setRefresh(true);
        }
      }

      if (type === 'create') {
        setCreateNew(true);
      }

      if (type === 'cancel') {
        setSelectedTreeItem(resources?.parentId);
        setShowEdit(false);
      }

      if (type === 'add') {
        setShowUserDialog(true);
        return;
      }

      if (type === 'addDevice') {
        setShowAddDeviceDlg(true);
        return;
      }

      if (type === 'addSchoolTerm') {
        setShowAddSchoolTermDlg(true);
        return;
      }

      if (type === 'publish') {
        setTriggedPackage(!triggedPackage);
        return;
      }

      if (type === 'preview') {
        setShowLearnerDashboard(true);
      }
      if (type === 'upload') {
        setOpenUpload(true);
        setUploadDialogTitle(
          tabStatus.teachers ? 'Upload Teachers' : 'Upload Students'
        );
      }

      if (type === 'search') {
        if (parentPage === 'Lessons') {
          setOpenLessonSearch(!openLessonSearch);
        } else {
          setOpenSearch(true);
          setSearchDialogTitle(
            tabStatus.teachers ? 'Search Teacher' : 'Search Student'
          );
          setOpenRight(true);
        }
      }

      if (type === 'edit') onChange('update', true);
      if (type === 'delete') setOpenDelete(true);
      if (type === 'save') {
        if (!resources?._id) {
          return;
        }

        if (!whenState && !forceSave) {
          return;
        }
        updateResource();
      }

      if (type === 'info') {
        setOpenInfo(true);
      }

      if (type === 'ingest') {
        if (schoolAdminData == null || schoolAdminData?.length === 0) {
          const notiOps = getNotificationOpt(
            'googleClass',
            'warning',
            'impossible'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        let validSchoolAdmins = schoolAdminData.filter(
          (item) =>
            item.data?.google_auth &&
            item.data?.google_auth?.access_token &&
            item.data?.google_auth?.id_token &&
            item.data?.google_auth?.scope &&
            item.data?.google_auth?.refresh_token
        );

        if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
          const notiOps = getNotificationOpt(
            'googleClass',
            'warning',
            'impossible'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        setOpenIngestGoogleConfirmation(true);
      }

      if (type === 'ingestCanvas') {
        if (schoolAdminData == null || schoolAdminData?.length === 0) {
          const notiOps = getNotificationOpt(
            'school',
            'warning',
            'validCanvasAdmin'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        let validSchoolAdmins = schoolAdminData.filter(
          (item) => item.data && item.data?.canvas_auth
        );

        if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
          const notiOps = getNotificationOpt(
            'school',
            'warning',
            'validCanvasAdmin'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        setOpenIngestCanvas(true);
      }

      if (type === 'ingestSchoology') {
        if (schoolAdminData == null || schoolAdminData?.length === 0) {
          const notiOps = getNotificationOpt(
            'school',
            'warning',
            'validSchoologyAdmin'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }
        let validSchoolAdmins = schoolAdminData.filter(
          (item) => item.data && item.data?.schoology
        );

        if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
          const notiOps = getNotificationOpt(
            'school',
            'warning',
            'validSchoologyAdmin'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        setOpenConfirmIngestSchoology(true);
      }

      if (type === 'new' && tabStatus.accessConfig) {
        setCreateAccessConfig(true);
      }

      if (type === 'archive') {
        setOpenArchivePopup(true);
      }

      if (type === 'downloadCSV') {
        setDownloadCSV(true);
      }
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt(
        resources?.schemaType,
        'error',
        'update'
      );
      notify(notiOps.message, notiOps.options);
    }
  };

  const archiveClassDoc = async (action, status) => {
    if (status) {
      console.log(resources._id);
      await archiveClass({
        variables: {
          id: resources._id
        }
      });
    }
    setOpenArchivePopup(false);
  };

  const updateResource = async (updatedValue) => {
    if (
      !isAvatarAttached &&
      !avatarS3URL?.length &&
      selectedTreeItem?.schemaType === 'station'
    ) {
      const notiOps = getNotificationOpt('station', 'error', 'avatar');
      notify(en['Station Logo is required!'], notiOps.options);
      return;
    }

    let variableData = {
      id: resources['_id'],
      schemaType: resources.schemaType,
      version: resources.version,
      updatedAt: resources.updatedAt
    };

    try {
      let avatar = avatarS3URL
        ? {
            uId: resources.avatar?.uId ? resources.avatar?.uId : getUUID(),
            type: avatarType || 'avatar',
            baseUrl: resources.avatar?.baseUrl,
            fileDir: resources.avatar?.fileDir,
            status: 'ready',
            altText: altText,
            mimeType: resources.avatar?.mimeType,
            fileName: resources.avatar?.fileName,
            data: resources.avatar?.data
          }
        : altText
        ? {
            altText: altText
          }
        : null;

      if (
        avatarS3URL &&
        // avatarS3URL.includes('galleries') &&
        avatarS3URL !== avatar.baseUrl + avatar.fileDir + avatar.fileName
      ) {
        avatar.baseUrl =
          avatarS3URL.split(resources.topology?.station)[0] +
          resources.topology?.station +
          '/';
        avatar.fileName = avatarS3URL.split('/').pop();
        avatar.fileDir = avatarS3URL
          .replace(avatar.baseUrl, '')
          .replace(avatar.fileName, '');
        avatar.data = {
          imageSize: avatarSize
        };
        avatar.mimeType = avatarS3URL.toLowerCase().endsWith('png')
          ? 'image/png'
          : 'image/jpej';
      }

      if (avatar?.fileName !== resources.avatar?.fileName) {
        variableData = avatarS3URL
          ? {
              ...variableData,
              avatar: {
                ...avatar
              }
            }
          : {
              ...variableData,
              avatar: altText ? { altText } : null
            };
      }

      if (
        ((!altText && resources.avatar?.altText) ||
          (altText && !resources.avatar?.altText)) &&
        altText !== resources.avatar?.altText
      ) {
        avatar = {
          ...avatar,
          altText
        };
        variableData = {
          ...variableData,
          avatar
        };
      }

      let desc = {
        title: descData ? descData.title : '',
        short: descData ? descData.short : '',
        long: descData ? descData.long : ''
      };

      const categories = {
        grades: gradesData,
        lang: language
      };

      if (
        desc.title !== resources.desc?.title ||
        desc.short !== resources.desc?.short ||
        desc.long !== resources.desc?.long
      ) {
        variableData = {
          ...variableData,
          desc
        };
      }

      if (tabStatus?.config) {
        if (resources?.schemaType === 'station') {
          let config = { ...resources.config };
          delete config.__typename;
          if (
            selectedTime?.toString() !== resources.config?.packagingCycleTime
          ) {
            config.packagingCycleTime = selectedTime?.toString();
          }

          if (
            selectedGoogleTime?.toString() !==
            resources.config?.googleIngestCycleTime
          ) {
            config.googleIngestCycleTime = selectedGoogleTime?.toString();
          }
          if (
            selectedCanvasTime?.toString() !==
            resources.config?.canvasIngestCycleTime
          ) {
            config.canvasIngestCycleTime = selectedCanvasTime?.toString();
          }
          if (
            selectedSchoologyTime?.toString() !==
            resources.config?.schoologyIngestCycleTime
          ) {
            config.schoologyIngestCycleTime = selectedSchoologyTime?.toString();
          }

          variableData = {
            ...variableData,
            config
          };
        } else if (resources?.schemaType === 'school') {
          // let lifecycle = resources.lifecycle;
          let lifecycle = JSON.parse(JSON.stringify(resources.lifecycle));
          if (lifecycle?.hasOwnProperty('__typename')) {
            delete lifecycle?.__typename;
          }
          if (lifecycleData.archiveOn && lifecycleData.archiveOn !== '') {
            let archiveOnInUTC = convertLocalDateToUTCDate(
              new Date(lifecycleData.archiveOn)
            );
            lifecycle = {
              ...lifecycle,
              archiveOn: archiveOnInUTC
            };
          }

          if (lifecycleData.deleteOn && lifecycleData.deleteOn !== '') {
            let deleteOnInUTC = convertLocalDateToUTCDate(
              new Date(lifecycleData.deleteOn)
            );
            lifecycle = {
              ...lifecycle,
              deleteOn: deleteOnInUTC
            };
          }

          if (
            lifecycleData.unpublishedOn &&
            lifecycleData.unpublishedOn !== ''
          ) {
            let unpublishedOnInUTC = convertLocalDateToUTCDate(
              new Date(lifecycleData.unpublishedOn)
            );
            lifecycle = {
              ...lifecycle,
              unpublishedOn: unpublishedOnInUTC
            };
          }

          variableData = {
            ...variableData,
            lifecycle
          };
        }
      }

      // For NOW, we are not going to provide per station contact information on the LDASH

      if (
        resources.schemaType === 'class' ||
        resources.schemaType === 'googleClass'
        // resources.schemaType === 'station'
      ) {
        variableData =
          contactData?.firstName ||
          contactData?.lastName ||
          contactData?.email ||
          contactData?.phone
            ? {
                ...variableData,
                contact: contactData
              }
            : {
                ...variableData,
                contact: null
              };
      }

      if (resources.schemaType === 'district') {
        if (stylesData?.bg) {
          variableData = {
            ...variableData,
            data: {
              ...resources?.data,
              styles: {
                ...resources?.data?.styles,
                bg: stylesData?.bg
              }
            }
          };
        }
        if (stylesData?.fg) {
          variableData = {
            ...variableData,
            data: {
              ...resources?.data,
              styles: {
                ...resources?.data?.styles,
                fg: stylesData?.fg
              }
            }
          };
        }
      }

      if (resources.schemaType === 'googleClass') {
        const children = loadedData.filter((el) =>
          el.parentIdList.includes(resources._id)
        );
        if (children == null || children?.length === 0) {
          variableData = {
            ...variableData,
            childrenIdList: []
          };
        }
      }

      if (resources.schemaType === 'station') {
        if (topologyData.state !== resources.topology.state)
          variableData = {
            ...variableData,
            topology: topologyData
          };

        if (resources.transmission !== transmission)
          variableData = {
            ...variableData,
            transmission
          };
      }

      if (
        resources.schemaType === 'class' &&
        (categories?.grades !== resources?.categories?.grades ||
          categories?.lang !== resources?.categories?.lang)
      ) {
        variableData = {
          ...variableData,
          categories
        };
      }
      variableData = {
        ...variableData,
        trackingAuthorName: currentUser?.name
      };

      variableData = {
        ...variableData,
        ...updatedValue
      };

      if (variableData.schemaType === 'class' && classSchoolTerm?.length) {
        variableData = {
          ...variableData,
          schoolTermId: classSchoolTerm === 'empty' ? null : classSchoolTerm
        };
      }

      let result = null;
      console.log(variableData);
      if (variableData.schemaType === 'station') {
        result = await updateGroupingStation({
          variables: variableData
        });
      } else if (variableData.schemaType === 'district') {
        result = await updateGroupingDistrict({
          variables: variableData
        });
      } else if (variableData.schemaType === 'school') {
        result = await updateGroupingSchool({
          variables: variableData
        });
      } else if (variableData.schemaType === 'class') {
        result = await updateGroupingClass({
          variables: variableData
        });
      } else {
        result = await updateGrouping({
          variables: variableData
        });
      }

      console.log(
        'Updated Successfully: resources.avatar ===>',
        resources.avatar
      );

      if (teacherEditRow) {
        await updateGrouping({
          variables: {
            id: teacherEditRow.id,
            schemaType: teacherEditRow.schemaType,
            version: teacherEditRow.version,
            trackingAuthorName: currentUser?.name,
            contact: {
              firstName: teacherEditRow?.firstName,
              lastName: teacherEditRow?.lastName,
              email: teacherEditRow?.email
              // phone: teacherEditRow?.phone
            }
          }
        });
      }

      if (studentEditRow) {
        await updateGrouping({
          variables: {
            id: studentEditRow.id,
            schemaType: studentEditRow.schemaType,
            version: studentEditRow.version,
            trackingAuthorName: currentUser?.name,
            contact: {
              firstName: studentEditRow?.firstName,
              lastName: studentEditRow?.lastName,
              email: studentEditRow?.email
              // phone: studentEditRow?.phone
            }
          }
        });
      }

      setStudentEditRow();
      setTeacherEditRow();
      onChange('update', false);

      if (resources.avatar?.fileName) {
        if (resources.avatar?.fileDir?.includes(resources?._id)) {
          console.log('Delete case ===>', resources.avatar);
          const avatarURL = `${resources.avatar?.baseUrl}${resources.avatar?.fileDir}${resources.avatar?.fileName}`;
          if (
            (!avatarS3URL && resources.avatar?.fileName) ||
            avatarS3URL !== avatarURL
          ) {
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }
        } else {
          console.log('SKIP case ===>', resources.avatar);
        }
      }

      if (isAvatarAttached) {
        setUpdatedResource(result);
        // setAvatarUpload(true);
        // setAvatarAttached(false);
      }

      if (forceSave) {
        onChange('forceSave', false);

        if (nextSelected == null) {
          setCurrentSource();
          setShowRoot(true);
          handleMainChange('root', nextSelected);
        } else {
          if (selectedTreeItem?._id !== nextSelected?._id) {
            handleMainChange('elSingleClick', nextSelected);
          }
        }
      } else {
        handleMainChange('elSingleClick', result?.data?.updateGrouping);
        setEditPanelData(result?.data?.updateGrouping);
      }
      if (!isAvatarAttached) {
        const notiOps = getNotificationOpt(
          resources.schemaType,
          'success',
          'update'
        );
        notify(notiOps.message, notiOps.options);
      }

      if (
        viewMethod === 'Card View' &&
        isMaterial &&
        resources?.schemaType === 'class'
      ) {
        setSelectedTreeItem(resources?.parentId);
        setShowEdit(false);
      }
    } catch (error) {
      const notiOps = getNotificationOpt('message', 'error', 'update');
      notify(notiOps.message, notiOps.options);
      if (error.message === en['data_changed']) {
        notify(error.message, notiOps.options);
      } else {
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  useEffect(() => {
    if (updatedResource) {
      if (isAvatarAttached) {
        setAvatarUpload(true);
        setAvatarAttached(false);
      }
      setUpdatedResource(null);
      setIsTabReset(false);
      if (openSave) {
        setTimeout(function () {
          handleTabStatus(sliderTapValue, resources?.schemaType);
        }, 2000);
      }
      setOpenSave(false);
    }
  }, [updatedResource]);

  const removeSchoolChildren = async (children) => {
    return Promise.all(
      children.map(async (resource) => {
        await deleteDocument({
          variables: {
            id: resource['_id'],
            schemaType: resource.schemaType
          }
        });

        if (studentResources) {
          const myStudents = studentResources?.filter((el) =>
            el.childrenIdList?.includes(resource._id)
          );
          if (myStudents) {
            try {
              for (let el of myStudents) {
                await updateGroupingList({
                  variables: {
                    id: el._id,
                    schemaType: el.schemaType,
                    item: resource._id,
                    fieldName: 'childrenIdList',
                    type: 'remove',
                    trackingAuthorName: currentUser?.name
                  }
                });
              }
            } catch (err) {
              console.log(err);
              console.log(err.message);
            }
          }
        }
      })
    );
  };

  const deleteHandle = async (children) => {
    return Promise.all(
      children.map(async (resource) => {
        try {
          let parentItem = parentTreeItem;
          if (resource?.childrenIdList?.length) {
            if (resource.schemaType === 'station') {
              const districtCheck = districtLoadedData?.filter(
                (item) => item.parentId === resource['_id']
              );
              if (districtCheck.length) await deleteHandle(districtCheck);
            } else if (resource.schemaType === 'district') {
              const schoolCheck = schoolLoadedData?.filter(
                (item) => item.parentId === resource['_id']
              );
              if (schoolCheck.length) await deleteHandle(schoolCheck);
            } else if (resource.schemaType === 'school') {
              const schoolCheck = classLoadedData?.filter(
                (item) => item.parentId === resource['_id']
              );
              if (schoolCheck.length) await removeSchoolChildren(schoolCheck);
            }
          }

          await deleteDocument({
            variables: {
              id: resource['_id'],
              schemaType: resource.schemaType
            }
          });

          if (
            resource?.schemaType === 'class' ||
            resource.schemaType === 'googleClass'
          ) {
            const parentDoc = schoolLoadedData?.find(
              (item) => item['_id'] === resource?.parentId
            );
            if (parentDoc)
              await updateGroupingList({
                variables: {
                  id: parentDoc._id,
                  schemaType: parentDoc.schemaType,
                  item: resource._id,
                  fieldName: 'childrenIdList',
                  type: 'remove',
                  trackingAuthorName: currentUser?.name
                }
              });

            if (studentResources) {
              const myStudents = studentResources?.filter((el) =>
                el.childrenIdList?.includes(resource._id)
              );
              if (myStudents) {
                try {
                  for (let el of myStudents) {
                    await updateGroupingList({
                      variables: {
                        id: el._id,
                        schemaType: el.schemaType,
                        item: resource._id,
                        fieldName: 'childrenIdList',
                        type: 'remove',
                        trackingAuthorName: currentUser?.name
                      }
                    });
                  }
                } catch (err) {
                  console.log(err.message);
                }
              }
            }
            if (isMaterial) {
              setSelectedTreeItem(null);
              setEditPanelData(null);
            }
          } else if (resource?.schemaType === 'school') {
            const districts = districtLoadedData?.filter(
              (item) => item['_id'] === resource?.parentId
            );
            if (districts) {
              const district = districts[0];
              await updateGroupingList({
                variables: {
                  id: district['_id'],
                  schemaType: district.schemaType,
                  item: resource._id,
                  fieldName: 'childrenIdList',
                  type: 'remove',
                  trackingAuthorName: currentUser?.name
                }
              });
            }

            let { data: schoolAdmin } = await client.query({
              query: graphql.queries.userGrouping,
              variables: {
                parentId: resource?._id,
                schemaType: 'schoolAdmin'
              }
            });

            if (schoolAdmin?.grouping && schoolAdmin?.grouping?.length > 0) {
              for (const admin of schoolAdmin?.grouping) {
                await deleteDocument({
                  variables: {
                    id: admin._id,
                    schemaType: 'schoolAdmin'
                  }
                });
              }
            }
          } else if (resource?.schemaType === 'district') {
            const stations = stationLoadedData?.filter(
              (item) => item['_id'] === resource?.parentId
            );
            if (stations) {
              const station = stations[0];
              await updateGroupingList({
                variables: {
                  id: station['_id'],
                  schemaType: station.schemaType,
                  item: resource._id,
                  fieldName: 'childrenIdList',
                  type: 'remove',
                  trackingAuthorName: currentUser?.name
                }
              });
            }
          }
        } catch (error) {
          console.error(error);
        }
      })
    );
  };

  const handleDeleteDialogChange = async (type, value) => {
    if (type === 'btnClick') {
      if (!checkbox && value) {
        const notiOps = getNotificationOpt(
          resources.schemaType,
          'warning',
          'delete'
        );
        notify(notiOps.message, notiOps.options);
        return;
      }
      if (checkbox && value) {
        setOpenConfirm(true);
      }

      setCheckbox(false);
      setOpenDelete(false);
    }
  };

  const handleConfirmDeleteDialog = async (type, value) => {
    try {
      if (type === 'btnClick' && value) {
        setIsDeleting(true);
        let parentItem = parentTreeItem;
        await deleteHandle([resources]);
        setIsDeleting(false);
        const notiOps = getNotificationOpt(
          resources.schemaType,
          'success',
          'delete'
        );
        notify(notiOps.message, notiOps.options);
        onChange('delete');
        // setRefresh(true);
        handleMainChange('elSingleClick', parentItem);
        setWhenState(false);
      }
      setOpenConfirm(false);
    } catch (error) {
      console.log(error.message);
      const notiOps = getNotificationOpt(
        resources?.schemaType,
        'error',
        'delete'
      );
      notify(notiOps.message, notiOps.options);
    }
  };

  const uploadFile = async (file) => {
    let docId = resources['_id'];
    if (resources.schemaType === 'class') {
      docId = resources?.topology?.district;
    }
    const type = tabStatus.students ? 'student' : 'educator';
    try {
      const fileExt = getFileExtension(file.name);
      const fileName = getCurrentUTCTime();

      const awsDirectory = resources?.topology?.station + '/' + docId;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      const assetUrl = (await uploadFileToS3(file, uploadKey, 0)).replace(
        /%3A/g,
        ':'
      );

      await createBulkUsersGrouping({
        variables: {
          parentDocId: docId,
          type: type,
          assetUrl: assetUrl,
          classId: resources?.schemaType === 'class' ? resources._id : null
        }
      });

      const notiOps = getNotificationOpt(type, 'success', 'upload');
      notify(notiOps.message, notiOps.options);
      onChange('clear');
      setTimeout(function () {
        handleEditPanelChange('refresh');
      }, 5000);
      if (resources?.schemaType === 'class') {
        handleMainChange('classUpdate');
      }
    } catch (error) {
      console.log(error);
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleUploadDialogChange = async (type, value) => {
    if (type === 'btnClick') {
      if (!value) {
        setLoadedStudentFile();
        setLoadedTeacherFile();
        setOpenUpload(false);
        return;
      }

      if (userTableLoadData.length > 1000) {
        if (tabStatus.students) {
          const notiOps = getNotificationOpt('student', 'error', 'upload');
          notify(notiOps.message, notiOps.options);
        }
        if (tabStatus.teachers) {
          const notiOps = getNotificationOpt('educator', 'error', 'upload');
          notify(notiOps.message, notiOps.options);
        }
        return;
      }

      if (tabStatus.students) {
        let res = await uploadFile(loadedStudentFile);
      }
      if (tabStatus.teachers) {
        let res = await uploadFile(loadedTeacherFile);
      }
      setOpenUpload(false);
      setTimeout(() => {
        handleEditPanelChange('refresh');
      }, 2500);
    }
  };

  const handleSearchDialogChange = (type, value) => {
    setOpenSearch(false);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handlePreviewDialogChange = async (type, value) => {
    setOpenPreview(false);
  };

  var user = {
    id: resources?._id,
    parentId: resources?.parentId,
    version: resources?.version
  };
  localStorage.removeItem('user');
  localStorage.setItem('user', JSON.stringify(user));

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
      setWhenState(true);
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL('');
      console.log('avatar dettached');
      setWhenState(true);
    } else {
      handleFormChange('avatarUpload', value);
    }
  };

  const getTabSettings = () => {
    if (isRoot) {
      return {
        desc: false,
        packages: false,
        config: false,
        analyse: true,
        topology: false,
        people: false,
        right: false,
        schoolTerms: false,
        students: false,
        teachers: false,
        devices: false,
        administrator: false,
        styles: false,
        disableMenu: { right: false },
        systemMessages: false
      };
    } else {
      if (
        resources?.schemaType === 'class' ||
        resources?.schemaType === 'district' ||
        resources?.schemaType === 'googleClass'
      ) {
        return {
          desc: true,
          packages: false,
          topology: false,
          people: false,
          right: false,
          schoolTerms: false,
          students: true,
          teachers: true,
          administrator: resources?.schemaType === 'district' ? true : false,
          devices: false,
          styles: resources?.schemaType === 'district' ? true : false,
          analyse: true,
          disableMenu: { right: true },
          accessConfig: resources?.schemaType === 'district'
        };
      } else {
        if (
          resources?.schemaType === 'station' ||
          resources?.schemaType === 'school'
        ) {
          return {
            desc: true,
            packages: resources?.schemaType === 'station',
            config:
              resources?.schemaType !== 'school' &&
              (currentUser.schemaType === 'superAdmin' ||
                currentUser.schemaType === 'sysAdmin' ||
                currentUser.schemaType === 'stationAdmin' ||
                currentUser.schemaType === 'schoolAdmin'),
            analyse: true,
            schoolTerms: resources?.schemaType === 'school',
            topology: false,
            people: false,
            right: false,
            students: false,
            teachers: false,
            styles: false,
            administrator: true,
            devices: resources?.schemaType === 'station',
            disableMenu: { right: true }
          };
        } else {
          return {
            desc: true,
            packages: false,
            config: false,
            analyse: false,
            topology: false,
            schoolTerms: false,
            people: false,
            right: false,
            students: false,
            teachers: false,
            administrator: true,
            devices: false,
            styles: false,
            disableMenu: { right: true }
          };
        }
      }
    }
  };

  const handleConfig = (type, value) => {
    if (type === 'packageTime') {
      setSelectedTime(value);
    }
    if (type === 'googleTime') {
      setSelectedGoogleTime(value);
    }
    if (type === 'canvasTime') {
      setSelectedCanvasTime(value);
    }

    if (type === 'schoologyTime') {
      setSelectedSchoologyTime(value);
    }

    if (type === 'lifecycle') {
      setLifecycleData(value);
    }
    if (type === 'schedule') {
      setScheduleData(value);
    }

    setWhenState(true);
  };

  const handleClassPublish = async (type, value) => {
    if (!value) {
      setOpenIngestGoogleConfirmation(false);
      return;
    }
    if (schoolAdminData === null || schoolAdminData?.length === 0) {
      setOpenIngestGoogleConfirmation(false);
      return;
    }

    try {
      let validSchoolAdmins = schoolAdminData;

      if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
        const notiOps = getNotificationOpt(
          'googleClass',
          'warning',
          'allexpired'
        );
        notify(notiOps.message, notiOps.options);
        setOpenIngestGoogleConfirmation(false);
        return;
      } else {
        for (const admin of validSchoolAdmins) {
          const response = await ingestGoogle({
            variables: {
              userId: admin._id
            }
          });
        }
      }
      setOpenIngestGoogleConfirmation(false);
      const notiOps = getNotificationOpt('googleClass', 'success', 'import');
      notify(notiOps.message, notiOps.options);
    } catch (err) {
      console.log(err.response);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleConfirmIngestCanvas = async (type, value) => {
    if (!value) {
      setOpenIngestCanvas(false);
      return;
    }
    if (schoolAdminData === null || schoolAdminData?.length === 0) {
      setOpenIngestCanvas(false);
      return;
    }

    try {
      let validSchoolAdmins = [];
      for (const admin of schoolAdminData) {
        if (admin.data?.canvas_auth && admin.data?.canvas_auth?.refresh_token) {
          validSchoolAdmins.push(admin);
        }
      }
      if (validSchoolAdmins?.length === 0) {
        const notiOps = getNotificationOpt(
          'school',
          'warning',
          'validCanvasAdmin'
        );
        notify(notiOps.message, notiOps.options);
        setOpenIngestCanvas(false);
        return;
      } else {
        for (const admin of validSchoolAdmins) {
          const response = await ingestCanvas({
            variables: {
              userId: admin._id
            }
          });
        }
      }
      setOpenIngestCanvas(false);
      const notiOps = getNotificationOpt('school', 'success', 'import');
      notify('Canvas modules ingested successfully', notiOps.options);
    } catch (err) {
      console.log(err.response);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleConfirmIngestSchoology = async (type, value) => {
    if (!value) {
      setOpenConfirmIngestSchoology(false);
      return;
    }
    if (schoolAdminData === null || schoolAdminData?.length === 0) {
      setOpenConfirmIngestSchoology(false);
      return;
    }

    try {
      let validSchoolAdmins = [];
      for (const admin of schoolAdminData) {
        if (admin.data?.schoology && admin.data?.schoology?.key) {
          validSchoolAdmins.push(admin);
        }
      }
      if (validSchoolAdmins?.length === 0) {
        const notiOps = getNotificationOpt(
          'school',
          'warning',
          'validSchoologyAdmin'
        );
        notify(notiOps.message, notiOps.options);
        setOpenConfirmIngestSchoology(false);
        return;
      } else {
        for (const admin of validSchoolAdmins) {
          const response = await ingestSchoology({
            variables: {
              userId: admin._id
            }
          });
        }
      }
      setOpenConfirmIngestSchoology(false);
      const notiOps = getNotificationOpt('school', 'success', 'import');
      notify('Schoology sections ingested successfully', notiOps.options);
    } catch (err) {
      console.log(err.response);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleSchoolTermChange = (data) => {
    if (data?._id === 'new') {
      setShowAddSchoolTermDlg(true);
      setClassSchoolTerm(resources?.schoolTermId);
      return;
    }
    setClassSchoolTerm(data?._id);
    setWhenState(true);
  };

  const handleLanguageChange = (data) => {
    setLanguage(data?.value);
    setWhenState(true);
  };

  const displayGrades = (gradeList) => {
    const names = [];
    gradeList.forEach((item) => {
      if (item !== en['Select Grades'] + '...') {
        names.push(item);
      }
    });
    if (names.length === 0) {
      return [en['Select Grades'] + '...'];
    } else {
      return names.join(', ');
    }
  };

  const getDeleteMessage = () => {
    switch (resources?.schemaType) {
      case 'class':
        return en['remove class'];
      case 'school':
        return en['remove school'];
      case 'district':
        return en['remove district'];
      case 'station':
        return en['remove station'];
      default:
        return '';
    }
  };

  const willChangeConfigAppInfo = (value) => {
    if (value) {
      setAllowChangeConfigApp(true);
      updateConfigAppValue(true);
    } else {
      setAllowChangeConfigApp(false);
      setConfigAppUnCheckOpen(true);
    }
  };

  const updateConfigAppInfo = (value) => {
    if (value) {
      updateConfigAppValue(value);
    }
  };

  const updateConfigAppValue = async (value) => {
    let response = await updateConfigApp({
      variables: {
        stationId: resources?._id,
        status: value
      }
    });
    if (response?.data?.configApp) {
      notify(response?.data?.configApp, {
        variant: 'success',
        autoHideDuration: 10000
      });
    }
    setConfigAppCheckBox(value);
    setAllowChangeConfigApp(false);
  };

  const configAppUnCheckHandle = (value) => {
    if (value) {
      updateConfigAppValue(false);
      setAllowChangeConfigApp(true);
    }
  };

  const handleSaveChange = async (value, type) => {
    if (type) {
      await handleEditPanelChange('save');
      if (!isAvatarAttached) {
        setOpenSave(false);
        setIsTabReset(false);
        handleTabStatus(sliderTapValue, resources?.schemaType);
      }
      setWhenState(false);
    } else {
      setOpenSave(false);
      const schemaType = resources?.schemaType;
      setIsTabReset(false);
      handleTabStatus(sliderTapValue, schemaType);
      setAvatarAttached(false);
      setAvatarS3URL(null);
      setWhenState(false);
      setClassSchoolTerm();
    }
  };

  const getDateStr_YYYY_MM_DD = (dateStr, type) => {
    if (!dateStr?.length) return null;
    let result = getISOTimeString(dateStr, type);
    return result;
  };

  const handleSchoolTermCreateDialogChange = async (status, value) => {
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
          parentId: selectedTreeItem?.topology?.school,
          topology: {
            state: selectedTreeItem?.topology?.state,
            station: selectedTreeItem?.topology?.station,
            district: selectedTreeItem?.topology?.district,
            school: selectedTreeItem?.topology?.school
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
        setShowAddSchoolTermDlg(false);
        const notiOps = getNotificationOpt('schoolTerm', 'success', 'create');
        notify(notiOps.message, notiOps.options);
        // totalReLoad();
      } else {
        setShowAddSchoolTermDlg(false);
      }
    } catch (error) {
      setSchoolTermCreating(false);
      console.log(error);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(error.message, notiOps.options);
    }
    setSchoolTermCreating(false);
  };

  return (
    <EditPanel
      title={title && title !== '' ? title : resources?.name}
      page={'Topologies'}
      schemaType={resources?.schemaType}
      canUpload={
        resources?.schemaType === 'class' ||
        resources?.schemaType === 'googleClass'
          ? //  && tabStatus?.teachers
            false
          : canUpload
      }
      canAdd={
        tabStatus?.teachers || tabStatus?.students || tabStatus?.administrator
      }
      canAddDevice={tabStatus?.devices}
      canAddSchoolTerm={tabStatus?.schoolTerms}
      canCreate={true}
      canList={false}
      canDelete={
        !tabStatus?.analyse && !tabStatus?.administrator && !tabStatus.devices
      }
      canSaveConfig={canSaveConfig}
      canEdit={true}
      canUpdate={true}
      canSave={
        tabStatus?.analyse || tabStatus?.administrator || tabStatus.devices
          ? false
          : true
      }
      hideSaveOrEdit={tabStatus?.analyse}
      canGallery={canGallery}
      galleryType={galleryType}
      canSearch={false}
      isMenuCenter={parentPage === 'Lessons'}
      canShowInfo={
        canShowInfo &&
        (tabStatus?.analyse ? false : true) &&
        !tabStatus.schoolTerms
      }
      canPublish={canPublish}
      canIngest={
        resources?.schemaType === 'school' &&
        tabStatus?.administrator &&
        canIngestGoogleClasses
      }
      publishType={tabStatus?.packages ? true : false}
      canShowPublis={true}
      canRefresh={
        tabStatus?.packages || tabStatus?.teachers || tabStatus?.students
          ? true
          : false
      }
      canCancel={
        false
        // viewMethod === 'Card View' && resources?.schemaType === 'class'
        //   ? true
        //   : false
      }
      tabSetting={getTabSettings()}
      hideAction={isHideAction}
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      selectedTreeItem={selectedTreeItem}
      activePreview={
        (resources?.schemaType === 'class' &&
          publishedStudentCountData?.totalCount > 0) ||
        (resources?.schemaType === 'station' &&
          publishedStudentCountData?.totalCount > 0)
      }
      showPreview={
        ((resources?.schemaType === 'station' || showEyeIcon ? true : false) &&
          !tabStatus.analyse) ||
        (resources?.schemaType === 'class' && !tabStatus.analyse)
      }
      tabValue={tabValue}
      tabStatus={tabStatus}
      topBarMinWidth={800}
      hideTitleOnMobile={true}
      hasNoSliderMenu={isRoot}
      hasNoActions={
        isSmallScreen
          ? false
          : isMediumScreen
          ? tabStatus?.analyse &&
            (isRoot || resources?.schemaType !== 'station')
            ? true
            : false
          : false
      }
      disableAddBtn={
        selectedTreeItem
          ? selectedTreeItem?.schemaType === 'class' && parentPage !== 'Lessons'
            ? true
            : false
          : true
      }
      totalDisable={
        typeof selectedTreeItem === 'undefined' &&
        userInfo?.schemaType === 'districtAdmin'
          ? true
          : false
      }
      canNew={
        tabStatus?.accessConfig &&
        !tabStatus?.schoolTerms &&
        !tabStatus?.administrator
      }
    >
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        style={{ width: '100%' }}
      >
        {!isRoot &&
          (tabStatus.desc ||
            (resources?.schemaType !== 'station' &&
              resources?.schemaType !== 'district' &&
              resources?.schemaType !== 'school' &&
              resources?.schemaType !== 'class' &&
              resources?.schemaType !== 'googleClass')) &&
          (resources?.schemaType !== 'class' &&
          resources?.schemaType !== 'googleClass' ? (
            <Grid
              container
              style={
                isMediumScreen ? {} : { width: '680px', minWidth: '680px' }
              }
              direction="column"
            >
              <Grid item xs={12}>
                {resources?.schemaType === 'station' ? (
                  <>
                    <DefaultCard inline={false} disableGray={false}>
                      <StateSelectForm
                        resources={descData}
                        stateValue={topologyData?.state}
                        onStateChange={(value) =>
                          handleFormChange('state', value)
                        }
                        onSaveChanges={(value) => {
                          setTopologyData({
                            ...topologyData,
                            state: value
                          });
                          updateResource({
                            topology: {
                              ...topologyData,
                              state: value
                            }
                          });
                        }}
                      />
                    </DefaultCard>
                    <DefaultCard inline={false} disableGray={false}>
                      <StateSelectForm
                        type={'Transmission'}
                        resources={descData}
                        stateValue={resources?.transmission}
                        disable={
                          resources?.transmission === transmissions[1].value
                        }
                        onStateChange={(value) =>
                          handleFormChange('transmission', value)
                        }
                        onSaveChanges={(value) => {
                          setTransmission(value);
                          updateResource({
                            transmission: value
                          });
                        }}
                        listData={transmissions}
                      />
                    </DefaultCard>
                  </>
                ) : (
                  []
                )}
              </Grid>
              <Grid item xs={12}>
                <DefaultCard inline={false} disableGray={false}>
                  <Grid container spacing={4}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      style={{ paddingRight: 6 }}
                    >
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <AvatarUploadForm
                            // ref={avatarRef}
                            disable={false}
                            resources={avatarS3URL}
                            docId={resources?._id}
                            stationId={
                              resources?.topology?.station
                                ? resources?.topology?.station
                                : resources?._id
                            }
                            acceptedFiles={[
                              'image/png',
                              'image/jpg',
                              'image/jpeg'
                            ]}
                            onChange={(value) => handleOnAvatarChange(value)}
                            changeAlt={(value) =>
                              handleFormChange('altText', value)
                            }
                            changeAvatarType={(value) =>
                              handleFormChange('avatarType', value)
                            }
                            extraStyle={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              objectFit: 'contain'
                            }}
                            hideArrow={true}
                            extraClass={classes.dropzone}
                            type={resources?.schemaType}
                            title={en['Drag and Drop a Logo Here']}
                            isUpload={isAvatarUpload}
                            doc={resources}
                            altText={altText}
                            setUpload={setAvatarUpload}
                            setAvatarSize={setAvatarSize}
                          />
                        </Grid>
                        <Grid item xs={12} style={{ paddingTop: 0 }}>
                          <AltText
                            disable={false}
                            resources={altText}
                            onChange={(value) =>
                              handleFormChange('altText', value)
                            }
                            onSaveContents={(value) => {
                              setAltText(value);
                              setWhenState(true);
                              updateResource('save');
                            }}
                            isAvatarAttached={isAvatarAttached}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                      <Grid container>
                        <Grid item xs={12}>
                          <DescriptionForm
                            disable={false}
                            onChange={(value) =>
                              handleFormChange('description', value)
                            }
                            type="station"
                            resources={descData}
                            onSaveContents={(value) => {
                              setDescData(value);
                              setWhenState(true);
                              handleEditPanelChange('save');
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </DefaultCard>
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              spacing={4}
              direction="column"
              style={
                isMediumScreen
                  ? { width: 'calc(100% + 12px)' }
                  : { width: '680px', minWidth: '680px' }
              }
            >
              <Grid item xs={12}>
                <DefaultCard disableGray={false}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} style={{ paddingBottom: 0 }}>
                      <DescriptionForm
                        disable={false}
                        resources={descData}
                        onChange={(value) =>
                          handleFormChange('description', value)
                        }
                        type="station"
                        hideDescription
                        hideHelpText
                        onSaveContents={(value) => {
                          setDescData(value);
                          setWhenState(true);
                          handleEditPanelChange('save');
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AvatarUploadForm
                        // ref={avatarRef}
                        disable={false}
                        resources={avatarS3URL}
                        docId={resources?._id}
                        stationId={
                          resources?.topology?.station
                            ? resources?.topology?.station
                            : resources?._id
                        }
                        acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
                        onChange={(value) => handleOnAvatarChange(value)}
                        changeAlt={(value) =>
                          handleFormChange('altText', value)
                        }
                        changeAvatarType={(value) =>
                          handleFormChange('avatarType', value)
                        }
                        extraStyle={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          objectFit: 'contain'
                        }}
                        hideArrow={true}
                        extraClass={classes.dropzone}
                        type={resources.schemaType}
                        title={en['Drag and Drop a Banner Here']}
                        isUpload={isAvatarUpload}
                        doc={resources}
                        altText={altText}
                        setUpload={setAvatarUpload}
                        setAvatarSize={setAvatarSize}
                      />
                    </Grid>
                    {(avatarS3URL || isAvatarAttached) && (
                      <Grid item xs={12} style={{ paddingTop: 0 }}>
                        <AltText
                          disable={false}
                          resources={altText}
                          onChange={(value) =>
                            handleFormChange('altText', value)
                          }
                          type="class"
                          onSaveContents={(value) => {
                            setAltText(value);
                            setWhenState(true);
                            handleEditPanelChange('save');
                          }}
                          isAvatarAttached={isAvatarAttached}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} style={{ paddingTop: 0 }}>
                      <DescriptionForm
                        disable={false}
                        resources={descData}
                        onChange={(value) =>
                          handleFormChange('description', value)
                        }
                        type="station"
                        hideName
                        onSaveContents={(value) => {
                          setDescData(value);
                          setWhenState(true);
                          handleEditPanelChange('save');
                        }}
                        setOpenGrades={setOpenGrades}
                      />
                    </Grid>
                  </Grid>
                </DefaultCard>
                {resources?.schemaType === 'class' &&
                schoolTerms?.filter(
                  (item) => item?.schedule?.status !== 'expired'
                )?.length ? (
                  <DefaultCard disableGray={false}>
                    <Grid container>
                      <Grid item xs={12}>
                        <CustomSelectBox
                          type={'schoolTerm'}
                          variant="outlined"
                          addMarginTop={true}
                          style={classes.selectFilter}
                          customStyle={{ margin: 0, width: '100%' }}
                          value={classSchoolTerm}
                          label={'Select School term...'}
                          resources={[
                            ...classSchoolTerms,
                            ...schoolTerms
                              ?.filter(
                                (item) => item?.schedule?.status !== 'expired'
                              )
                              ?.sort((a, b) => (a.name > b.name ? 1 : -1))
                          ]}
                          onChange={handleSchoolTermChange}
                          onClose={() => {
                            setOpenSchoolTerms(false);
                          }}
                          size="small"
                          noPadding={true}
                          openState={openSchoolTerms}
                          setOpenState={setOpenSchoolTerms}
                        />
                      </Grid>
                    </Grid>
                  </DefaultCard>
                ) : (
                  []
                )}
                {resources?.schemaType === 'class' &&
                !schoolTerms?.filter(
                  (item) => item?.schedule?.status !== 'expired'
                )?.length ? (
                  <DefaultCard disableGray={false}>
                    <Grid container>
                      <Grid item xs={12}>
                        <CustomSelectBox
                          type={'schoolTerm'}
                          variant="outlined"
                          addMarginTop={true}
                          style={classes.selectFilter}
                          customStyle={{ margin: 0, width: '100%' }}
                          value={classSchoolTerm}
                          label={'Select School term...'}
                          resources={[...classSchoolTerms]}
                          onChange={handleSchoolTermChange}
                          onClose={() => {
                            setOpenSchoolTerms(false);
                          }}
                          size="small"
                          noPadding={true}
                          openState={openSchoolTerms}
                          setOpenState={setOpenSchoolTerms}
                        />
                      </Grid>
                    </Grid>
                  </DefaultCard>
                ) : (
                  []
                )}
                {resources?.schemaType === 'class' && (
                  <DefaultCard disableGray={false}>
                    <Grid container>
                      <Grid item xs={9}>
                        <FormControl
                          variant="outlined"
                          className={clsx(classes.root, {
                            [classes.fullWidth]: true,
                            [classes.noPadding]: true
                          })}
                          focused={false}
                          autoComplete="off"
                        >
                          <Select
                            open={openGrades}
                            labelId={'demo-mutiple-chip-label-'}
                            id={'demo-mutiple-chip-'}
                            multiple={true}
                            placeholder={en['Grades'] + '...'}
                            onOpen={() => setOpenGrades(true)}
                            onClose={() => {
                              setOpenGrades(false);
                              setOpenLang(true);
                            }}
                            value={
                              gradesData.length > 0
                                ? gradesData
                                : [en['Select Grades'] + '...']
                            }
                            onChange={(e) =>
                              handleFormChange(
                                'grades',
                                e.target.value.filter(
                                  (item) => item !== en['Select Grades'] + '...'
                                )
                              )
                            }
                            disableUnderline
                            input={<Input id={'demo-mutiple-chip-'} />}
                            renderValue={(selected) => displayGrades(selected)}
                            MenuProps={MenuProps}
                            className={classes1.gradesSelect}
                            style={{
                              color:
                                gradesData.length > 0 ? 'black' : 'lightGray',
                              marginTop: 0
                            }}
                            classes={{ root: classes1.gradesSelectInputRoot }}
                          >
                            {getGrades().map((item, index) => (
                              <MenuItem key={index} value={item}>
                                <ListItemText
                                  primary={item}
                                  style={{
                                    borderColor: '#c1bdbd'
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3} style={{ paddingLeft: 12 }}>
                        <CustomSelectBox
                          type={'lang'}
                          variant="outlined"
                          addMarginTop={true}
                          style={classes.selectFilter}
                          customStyle={{ margin: 0, width: '100%' }}
                          value={language ? language : 'en'}
                          resources={langs}
                          onChange={handleLanguageChange}
                          onClose={() => {
                            setOpenLang(false);
                          }}
                          size="small"
                          noPadding={true}
                          openState={openLang}
                          setOpenState={setOpenLang}
                        />
                      </Grid>
                    </Grid>
                  </DefaultCard>
                )}
                {(resources?.schemaType === 'class' ||
                  resources?.schemaType === 'googleClass') && (
                  <DefaultCard inline={false} disableGray={false}>
                    <SingleContactForm
                      disable={false}
                      resources={contactData}
                      onChange={(value) => handleFormChange('contact', value)}
                      onSaveContents={(value) => {
                        setContactData(value);
                        setWhenState(true);
                        handleEditPanelChange('save');
                      }}
                    />
                  </DefaultCard>
                )}
              </Grid>
            </Grid>
          ))}

        {tabStatus.devices && resources?.schemaType === 'station' && (
          <DeviceTable
            type={'student'}
            canUpload={true}
            currentMenu="user"
            disable={false}
            showAddDeviceDlg={showAddDeviceDlg}
            isUserMenu={true}
            setShowAddDeviceDlg={setShowAddDeviceDlg}
            userTypeData={districtLoadedData}
            updateValue={updateValue}
            doc={resources}
            docId={resources._id}
            classLoadedData={classLoadedData}
            schoolLoadedData={schoolLoadedData}
            stationLoadedData={stationLoadedData}
            districtLoadedData={districtLoadedData}
            onRefresh={handleRefresh}
          />
        )}

        {tabStatus.schoolTerms && resources?.schemaType === 'school' && (
          <SchoolTermTable
            showAddSchoolTermDlg={showAddSchoolTermDlg}
            setShowAddSchoolTermDlg={setShowAddSchoolTermDlg}
            updateValue={updateValue}
            doc={resources}
            docId={resources._id}
            // onRefresh={handleRefresh}
          />
        )}

        {tabStatus.administrator && resources?.schemaType === 'station' ? (
          <UserListForm
            type="stationAdmin"
            filterUser={true}
            doc={resources}
            docId={resources._id}
            updateValue={updateValue}
            hasTypeField={true}
            userTypeData={districtLoadedData}
            showUserDialog={showUserDialog}
            setShowUserDialog={setShowUserDialog}
            onChange={(value) => handleFormChange('studentEdit', value)}
            classLoadedData={classLoadedData}
            schoolLoadedData={schoolLoadedData}
            stationLoadedData={stationLoadedData}
            onRefresh={handleRefresh}
          />
        ) : (
          []
        )}

        {tabStatus.administrator && resources?.schemaType === 'district' ? (
          <UserListForm
            type="districtAdmin"
            filterUser={true}
            doc={resources}
            docId={resources._id}
            updateValue={updateValue}
            hasTypeField={true}
            userTypeData={districtLoadedData}
            showUserDialog={showUserDialog}
            setShowUserDialog={setShowUserDialog}
            onChange={(value) => handleFormChange('studentEdit', value)}
            classLoadedData={classLoadedData}
            schoolLoadedData={schoolLoadedData}
            stationLoadedData={stationLoadedData}
            onRefresh={handleRefresh}
          />
        ) : (
          []
        )}

        {tabStatus.administrator && resources?.schemaType === 'school' ? (
          <UserListForm
            type="schoolAdmin"
            filterUser={true}
            isUserMenu={false}
            doc={resources}
            docId={resources._id}
            updateValue={updateValue}
            hasTypeField={true}
            userTypeData={getStructuredData(schoolLoadedData)}
            showUserDialog={showUserDialog}
            setShowUserDialog={setShowUserDialog}
            onChange={(value) => handleFormChange('studentEdit', value)}
            classLoadedData={classLoadedData}
            schoolLoadedData={schoolLoadedData}
            onRefresh={handleRefresh}
            districtLoadedData={getStructuredData(districtLoadedData)}
            stationLoadedData={stationLoadedData}
            setSchoolAdminData={setSchoolAdminData}
          />
        ) : (
          []
        )}

        {tabStatus.packages && resources?.schemaType === 'station' ? (
          <PackageListForm
            docId={resources?._id}
            onChange={(value) => handleFormChange('package', value)}
            packageRefresh={packageRefresh}
            setPackageRefresh={setPackageRefresh}
            triggedPackage={triggedPackage}
            triggerPackage={triggerPackage}
            setTriggerPackage={setTriggerPackage}
            setPackageDownload={setPackageDownload}
            packageDownload={packageDownload}
            csv={downloadCSV}
            setCSV={setDownloadCSV}
          />
        ) : (
          []
        )}

        {tabStatus.config &&
        (resources?.schemaType === 'station' ||
          resources?.schemaType === 'school') &&
        (currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'sysAdmin' ||
          currentUser.schemaType === 'schoolAdmin') ? (
          <div>
            <ConfigForm
              selectedTime={selectedTime}
              savingConfig={savingConfig}
              type={resources?.schemaType}
              scheduleData={scheduleData}
              lifecycleData={lifecycleData}
              title={en['Packaging Trigger Period'] + ':'}
              onChange={(type, value) => {
                if (type === 'lifecycle') {
                  handleConfig(type, value);
                } else if (type === 'schedule') {
                  handleConfig(type, value);
                } else {
                  handleConfig('packageTime', type);
                }
              }}
            />
            {resources?.schemaType === 'station' && (
              <div style={{ marginTop: 50 }}>
                <ConfigForm
                  selectedTime={selectedGoogleTime}
                  savingConfig={savingConfig}
                  title={en['Google Ingest Cycle Time'] + ':'}
                  onChange={(value) => handleConfig('googleTime', value)}
                />
              </div>
            )}
            {resources?.schemaType === 'station' && (
              <div style={{ marginTop: 50 }}>
                <ConfigForm
                  selectedTime={selectedCanvasTime}
                  savingConfig={savingConfig}
                  title={en['Canvas Ingest Cycle Time'] + ':'}
                  onChange={(value) => handleConfig('canvasTime', value)}
                />
              </div>
            )}
            {resources?.schemaType === 'station' && (
              <div style={{ marginTop: 50 }}>
                <ConfigForm
                  selectedTime={selectedSchoologyTime}
                  savingConfig={savingConfig}
                  title={en['Schoology Ingest Cycle Time'] + ':'}
                  onChange={(value) => handleConfig('schoologyTime', value)}
                />
              </div>
            )}
            {resources?.schemaType === 'station' && (
              <div style={{ marginTop: 50, marginLeft: 20 }}>
                <CustomCheckBox
                  color="primary"
                  value={configAppCheckBox}
                  label={en['Education Application Exists (yes/no)']}
                  onChange={(value) => updateConfigAppInfo(!value)}
                  willChange={(value) => willChangeConfigAppInfo(!value)}
                  allowChange={allowChangeConfigApp}
                />
              </div>
            )}
          </div>
        ) : (
          []
        )}

        {resources &&
          tabStatus.students &&
          (resources?.schemaType === 'class' ||
          resources?.schemaType === 'googleClass' ? (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              {loadedUser && loadedUser.schemaType === 'student' && (
                <>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <UserInfoForm
                      resources={loadedUser}
                      onChange={(value) => handleFormChange('userInfo', value)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <UserListForm
                  docId={resources._id}
                  doc={resources}
                  schemaType={resources?.schemaType}
                  type="student"
                  canUpload={true}
                  updateValue={updateValue}
                  refetchValue={refetchValue}
                  classLoadedData={classLoadedData}
                  schoolLoadedData={schoolLoadedData}
                  districtLoadedData={districtLoadedData}
                  stationLoadedData={stationLoadedData}
                  showUserDialog={showUserDialog}
                  studentEditRow={studentEditRow}
                  teacherEditRow={teacherEditRow}
                  setShowUserDialog={setShowUserDialog}
                  onChange={(value) => handleFormChange('studentEdit', value)}
                  refresh={packageRefresh}
                  setRefresh={setPackageRefresh}
                  onRefresh={handleRefresh}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              {loadedUser && loadedUser.schemaType === 'student' && (
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <UserInfoForm
                    resources={loadedUser}
                    onChange={(value) => handleFormChange('userInfo', value)}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <UserListForm
                  docId={resources['_id']}
                  doc={resources}
                  type="student"
                  canUpload={true}
                  updateValue={updateValue}
                  studentEditRow={studentEditRow}
                  teacherEditRow={teacherEditRow}
                  showUserDialog={showUserDialog}
                  setShowUserDialog={setShowUserDialog}
                  onChange={(value) => handleFormChange('studentEdit', value)}
                  refresh={packageRefresh}
                  stationLoadedData={stationLoadedData}
                  classLoadedData={classLoadedData}
                  schoolLoadedData={schoolLoadedData}
                  districtLoadedData={districtLoadedData}
                  onRefresh={handleRefresh}
                />
              </Grid>
            </Grid>
          ))}
        {resources &&
          tabStatus.teachers &&
          (resources?.schemaType === 'class' ||
          resources?.schemaType === 'googleClass' ? (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              {loadedUser && loadedUser.schemaType === 'educator' && (
                <>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <UserInfoForm
                      resources={loadedUser}
                      onChange={(value) => handleFormChange('userInfo', value)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <UserListForm
                  docId={resources['_id']}
                  doc={resources}
                  type="educator"
                  pageType="lessons"
                  canUpload={true}
                  schemaType={resources?.schemaType}
                  updateValue={updateValue}
                  studentEditRow={studentEditRow}
                  teacherEditRow={teacherEditRow}
                  showUserDialog={showUserDialog}
                  schoolLoadedData={schoolLoadedData}
                  setShowUserDialog={setShowUserDialog}
                  onChange={(value) => handleFormChange('teacherEdit', value)}
                  refresh={packageRefresh}
                  stationLoadedData={stationLoadedData}
                  onRefresh={handleRefresh}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              {loadedUser && loadedUser.schemaType === 'educator' && (
                <>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <UserInfoForm
                      resources={loadedUser}
                      onChange={(value) => handleFormChange('userInfo', value)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <UserListForm
                  docId={resources['_id']}
                  doc={resources}
                  type="educator"
                  pageType="topologies"
                  canUpload={true}
                  updateValue={updateValue}
                  studentEditRow={studentEditRow}
                  teacherEditRow={teacherEditRow}
                  showUserDialog={showUserDialog}
                  setShowUserDialog={setShowUserDialog}
                  onChange={(value) => handleFormChange('teacherEdit', value)}
                  refresh={packageRefresh}
                  stationLoadedData={stationLoadedData}
                  onRefresh={handleRefresh}
                />
              </Grid>
            </Grid>
          ))}
        {tabStatus.styles && (
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            style={isMediumScreen ? {} : { width: '680px', minWidth: '680px' }}
          >
            <StylesForm
              resources={resources}
              stylesData={stylesData}
              onChange={(value) => handleFormChange('styles', value)}
            />
          </Grid>
        )}

        {tabStatus.analyse && (
          <AnalyticForm
            stationId={resources?.topology?.station}
            districtId={resources?.topology?.district}
            classId={resources?.topology?.class}
            districtLoadedData={districtLoadedData}
            stationLoadedData={stationLoadedData}
            allDistrictResources={allDistrictResources}
            schoolLoadedData={schoolLoadedData}
            allSchoolResources={allSchoolResources}
            isRoot={isRoot}
            resources={resources}
            schemaType={resources?.schemaType}
          />
        )}
        {tabStatus.accessConfig && (
          <ConfigIngest
            createAccessConfig={createAccessConfig}
            setCreateAccessConfig={setCreateAccessConfig}
            district={resources}
          />
        )}
      </Grid>
      <CustomDialog
        open={openDelete}
        title={
          en['Do you want to delete this'] +
          ' ' +
          `${!isDeleting ? resources?.schemaType : ''}` +
          '?'
        }
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
        buttonDisable={isDeleting}
      >
        <Typography variant="subtitle1">{getDeleteMessage()}</Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={
            resources?.schemaType === 'class'
              ? en['I agree to delete the class.']
              : en['I agree with this action.']
          }
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>

      <CustomDialog
        open={openConfirm}
        title={
          en['Do you want to delete this'] +
          ' ' +
          `${!isDeleting ? resources?.schemaType : ''}` +
          '?'
        }
        mainBtnName={en['Remove']}
        onChange={handleConfirmDeleteDialog}
        buttonDisable={isDeleting}
      >
        <Typography variant="subtitle1">{en['delete alert']}</Typography>
      </CustomDialog>

      <CustomDialog
        open={openDeleteAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName={en['Ok']}
        onChange={() => {
          setOpenDeleteAbort(false);
          setOpenDelete(false);
        }}
      >
        <Typography variant="h6">{en['delete notify']}</Typography>
      </CustomDialog>
      <CustomDialog
        open={configAppUnCheckOpen}
        title={en['Warning']}
        mainBtnName={en['Yes']}
        secondaryBtnName={en['No']}
        onChange={(type, value) => {
          setConfigAppUnCheckOpen(false);
          configAppUnCheckHandle(value);
        }}
      >
        <Typography variant="h6">{en['UnCheckConfig_warning']}</Typography>
      </CustomDialog>
      <CustomDialog
        open={openAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName={en['Ok']}
        onChange={() => setOpenAbort(false)}
      >
        <Typography variant="h6">
          {en['There is an active user using this, so it cannot be deleted.']}
        </Typography>
      </CustomDialog>
      <CustomDialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="lg"
        open={openUpload}
        title={uploadDialogTitle}
        mainBtnName={en['Upload']}
        onChange={handleUploadDialogChange}
      >
        <UserUploadForm
          onChange={(value) => handleFormChange('userUpload', value)}
          schemaType={tabStatus.teachers ? 'educator' : 'student'}
        />
      </CustomDialog>
      <CustomDialog
        disableBackdropClick
        disableEscapeKeyDown
        open={openSearch}
        title={searchDialogTitle}
        onChange={handleSearchDialogChange}
      >
        <SearchUserForm
          schemaType={tabStatus.teachers ? 'educator' : 'student'}
          onChange={(value) => handleFormChange('user', value)}
        />
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title={en['Information']}
        maxWidth="sm"
        fullWidth={true}
        customClass={classes.infoDialogContent}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={resources} />
        </Grid>
      </CustomDialog>
      <CustomDialog
        open={openPreview}
        title={en['Preview']}
        maxWidth="lg"
        fullWidth={true}
        onChange={handlePreviewDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <iframe
            src={`../../../emp-studentapp/index.html?station_id=${resources?._id}&bucketName=${bucketName}`}
            width="100%"
            height="500"
            title={bucketName}
          >
            {en['Sorry your browser does not support inline frames.']}
          </iframe>
        </Grid>
      </CustomDialog>
      <CustomModal
        icon={null}
        title={en["Learner's Dashboard"]}
        resources={resources}
        openModal={showLearnerDashboard}
        setOpenModal={setShowLearnerDashboard}
        Children={HtmlContainer}
        flag="ldash"
      />
      <CustomDialog
        mainBtnName={en['Import']}
        open={openIngestGoogleConfirmation}
        title={en['Import Class?']}
        onChange={handleClassPublish}
      >
        <Typography variant="h6">
          {en['This will import the class.']}
        </Typography>
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Import']}
        open={openConfirmIngestCanvas}
        title={en['Import Class?']}
        onChange={handleConfirmIngestCanvas}
      >
        <Typography variant="h6">
          {en['This will import the canvas modules.']}
        </Typography>
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Import']}
        open={openConfirmIngestSchoology}
        title={en['Import Class?']}
        onChange={handleConfirmIngestSchoology}
      >
        <Typography variant="h6">
          {'This will import the schoology sections.'}
        </Typography>
      </CustomDialog>
      <CustomDialog
        // mainBtnName={en['SAVE']}
        // dismissBtnName="Dismiss"
        mainBtnName="Save"
        secondaryBtnName="Discard"
        open={openSave}
        onChange={handleSaveChange}
      >
        <main>
          <Typography variant="subtitle1" className={classes.warning}>
            {en['There are unsaved changes on the panel.']}
            <br />
            {en['Will you discard your current changes?']}
          </Typography>
        </main>
      </CustomDialog>
      <CustomDialog
        mainBtnName="Submit"
        secondaryBtnName="Cancel"
        open={openArchivePopup}
        onChange={archiveClassDoc}
      >
        <Typography variant="h6">Your class will be archived.</Typography>
      </CustomDialog>
      <CreateSchoolTermDialog
        open={showAddSchoolTermDlg}
        onChange={handleSchoolTermCreateDialogChange}
        isSchoolTermCreating={isSchoolTermCreating}
        setSchoolTermCreating={setSchoolTermCreating}
      />
    </EditPanel>
  );
};

export default TopologyEdit;
