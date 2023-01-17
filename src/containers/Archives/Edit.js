/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Select,
  MenuItem,
  Input,
  ListItemText,
  Typography,
  Box
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { EditPanel } from '@app/components/Panels';
import {
  CustomDialog,
  CustomCheckBox,
  CustomInput
} from '@app/components/Custom';
import { ConfigForm } from '@app/components/Forms';
import { getDisplayName, getAssetUrl, getUUID } from '@app/utils/functions';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useGalleryContext } from '@app/providers/GalleryContext';
import graphql from '@app/graphql';
import { useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import clsx from 'clsx';
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
  StateSelectForm,
  MultiTagsForm
} from '@app/components/Forms';
import { DefaultCard } from '@app/components/Cards';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { uploadFileToS3 } from '@app/utils/aws_s3_bucket';
import { getFileExtension } from '@app/utils/file-manager';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import { useSelectionContext } from '@app/providers/SelectionContext';
import CustomModal from '@app/components/Modal';
import HtmlContainer from '@app/containers/HtmlContainer';
import { useSearchContext } from '@app/providers/SearchContext';
import { useAssetContext } from '@app/providers/AssetContext';
import useStyles from './style';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { en } from '@app/language';
import { useSmallScreen } from '@app/utils/hooks';
import { CustomSelectBox } from '@app/components/Custom';
import langs from '@app/constants/lang/language.json';

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

const theme1 = createTheme({
  overrides: {
    MuiSelect: {
      select: {
        '&:focus': {
          background: '$labelcolor'
        }
      }
    }
  }
});

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

const ArchivesEdit = ({
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
  addNewClass
}) => {
  const classes = globalStyles.globaluseStyles();
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
  const [openDeleteAbort, setOpenDeleteAbort] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const { openSearch: openLessonSearch, setOpenSearch: setOpenLessonSearch } =
    useSearchContext();
  const [updateValue, setUpdateValue] = useState(false);
  const { setOpenRight } = useGalleryContext();
  const [checkbox, setCheckbox] = useState(false);
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
  const [teacherEditRow, setTeacherEditRow] = useState();
  const [studentEditRow, setStudentEditRow] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [studentResources, setStudentResources] = useState([]);
  const [bucketName, setBucketName] = useState();
  const [packageRefresh, setPackageRefresh] = useState(true);
  const [triggedPackage, setTriggedPackage] = useState(true);
  const [showLearnerDashboard, setShowLearnerDashboard] = useState(false);
  const client = useApolloClient();
  const { nextSelected, setShowRoot } = useSelectionContext();
  const [stateLabel, setStateLabel] = useState();
  const { userTableLoadData } = useAssetContext();
  const [currentUser] = useUserContext();
  const [avatarSize, setAvatarSize] = useState();
  const [language, setLanguage] = useState('en');
  const [openPublishConfirmation, setOpenPublishConfirmation] = useState(false);
  const [schoolAdminData, setSchoolAdminData] = useState([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canIngestGoogleClasses, setCanIngestGoogleClasses] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const isSmallScreen = useSmallScreen();
  const [createDialogSetting, setCreateDialogSetting] = useState({});
  const [newElName, setNewElName] = useState('');
  const [isCreateFocus, setCreateFocus] = useState(false);

  const [ingestGoogle] = useMutation(graphql.mutations.ingestGoogle);

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );
  const [restoreArchive] = useMutation(graphql.mutations.restoreArchive);
  // New Class
  const [showNewDialog, setShowNewDialog] = useState(false);

  const changePage = (item) => {
    setEditPanelData(item);
    setSelectedTreeItem(item);
    setSelected(item?._id);
  };

  useEffect(() => {
    if (topologyData?.state) {
      let state = StatesList.filter((el) => el.value === topologyData?.state);
      setStateLabel(state && state[0] && state[0].label);
    }
  }, [topologyData]);

  useEffect(() => {
    if (schoolAdminData && schoolAdminData?.length > 0) {
      let validSchoolAdmins = schoolAdminData.filter(
        (item) =>
          item.data?.google_auth &&
          item.data?.google_auth?.access_token &&
          // && item.data?.expiry_date > (new Date()).getTime()
          item.data?.google_auth?.id_token &&
          item.data?.google_auth?.refresh_token &&
          item.data?.google_auth?.scope
      );

      if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
        setCanIngestGoogleClasses(false);
      } else {
        setCanIngestGoogleClasses(true);
      }
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
          id: item.topology.station,
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
          setTopologyTitle(`${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'educator') {
          setTopologyTitle(`${district} > ${school}`);
          return `${item.name}`;
        } else if (currentUser?.schemaType === 'schoolAdmin') {
          setTopologyTitle(`${school}`);
          return `${item.name}`;
        }
        return `${item.name}`;
      }
    } else {
      let stationItem = stationLoadedData.find(
        (el) => el._id === item.topology.station
      );
      let station = getDisplayName(stationItem?.name);
      if (item.schemaType === 'station') {
        return <span className={classes.breadcrumb}>{station}</span>;
      }

      let districtItem = districtLoadedData.find(
        (el) => el._id === item.topology.district
      );
      let district = getDisplayName(districtItem?.name);
      if (item.schemaType === 'district') {
        return (
          <>
            <span
              className={classes.breadcrumbLink}
              onClick={() => changePage(stationItem)}
            >
              {station}
            </span>
            {` > `}
            <span className={classes.breadcrumb}>{district}</span>
          </>
        );
      }

      let schoolItem = schoolLoadedData.find(
        (el) => el._id === item.topology.school
      );
      let school = getDisplayName(schoolItem?.name);
      if (item.schemaType === 'school') {
        return (
          <>
            <span
              className={classes.breadcrumbLink}
              onClick={() => changePage(stationItem)}
            >
              {station}
            </span>
            {` > `}
            <span
              className={classes.breadcrumbLink}
              onClick={() => changePage(districtItem)}
            >
              {district}
            </span>
            {` > `}
            <span className={classes.breadcrumb}>{school}</span>
          </>
        );
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
              <span
                className={classes.breadcrumbLink}
                onClick={() => changePage(stationItem)}
              >
                {station}
              </span>
              {` > `}
              <span
                className={classes.breadcrumbLink}
                onClick={() => changePage(districtItem)}
              >
                {district}
              </span>
              {` > `}
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

  useEffect(() => {
    const onLoad = async () => {
      setCheckbox(false);
      setTriggerPackage(false);
      let title = await getTitle(resources);
      setTitle(title);
      setUpdateValue(false);
      setShowUserDialog(false);

      if (resources?._id !== currentSource?._id && nextSelected) {
        if (resources?.schemaType !== currentSource?.schemaType) {
          const schemaType = resources?.schemaType;
          setIsTabReset(true);
          handleTabStatus(0, schemaType);
        }
        setCurrentSource(resources);
      }

      setLoadedUser();
      resources.desc !== undefined &&
        setDescData({
          title: resources?.desc?.title || '',
          short: resources?.desc?.short || '',
          long: resources?.desc?.long || ''
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
    };
    if (resources) {
      if (!isRoot) {
        onLoad();
      }
    } else {
      if (isRoot) {
        const schemaType = resources?.schemaType;
        setIsTabReset(true);
        handleTabStatus(0, schemaType);
        setCurrentSource();
        setTitle('Stations');
      }
    }
  }, [resources]);

  useEffect(() => {
    if (forceSave) {
      handleEditPanelChange('save');
    }
  }, [forceSave]);

  const handleShowPanel = async (value) => {
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
    if (isRoot) {
      setIsHideAction(true);
      setCanUpload(false);
      setUpdateValue(false);
      setCanSaveConfig(false);
      setCanPublish(false);
      setCanShowInfo(false);
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
          styles: false,
          right: false,
          analyse: true
        });
        return;
      }
      setTabStatus({
        desc: true,
        config: false,
        packages: false,
        people: false,
        teachers: false,
        students: false,
        administrator: false,
        styles: false,
        right: false,
        analyse: false
      });
    } else if (value === 1) {
      setOpenRight(false);
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
            teachers: false,
            students: true,
            administrator: false,
            styles: false,
            right: false
          });
        } else {
          setTabStatus({
            desc: false,
            packages: false,
            people: false,
            teachers: true,
            students: false,
            administrator: false,
            styles: false,
            right: false
          });
        }
      } else if (schemaType === 'station') {
        setCanPublish(true);
        setTabStatus({
          desc: false,
          config: false,
          packages: true,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          styles: false,
          right: false
        });
      } else if (schemaType === 'school') {
        setIsHideAction(true);
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: true,
          styles: false,
          right: false
        });
      }
    } else if (value === 2) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      setIsHideAction(true);
      if (schemaType === 'district') {
        setCanUpload(true);
      }
      if (schemaType === 'station') {
        setCanSaveConfig(true);
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: true,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: false,
            styles: false,
            right: false
          });
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: true,
            styles: false,
            right: false
          });
        }
      } else {
        if (currentUser?.schemaType === 'educator') {
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
        } else {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: true,
            administrator: false,
            styles: false,
            right: false
          });
        }
      }
    } else if (value === 3) {
      setOpenRight(false);
      setOpenLessonSearch(false);
      if (schemaType === 'district') {
        setIsHideAction(true);
        setTabStatus({
          desc: false,
          config: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: true,
          styles: false,
          right: false,
          analyse: false
        });
      } else if (schemaType === 'station') {
        setCanSaveConfig(true);
        if (
          currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin'
        ) {
          setTabStatus({
            desc: false,
            config: false,
            packages: false,
            people: false,
            teachers: false,
            students: false,
            administrator: true,
            styles: false,
            right: false,
            analyse: false
          });
        } else {
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
      } else if (schemaType === 'class' || schemaType === 'googleClass') {
        setTabStatus({
          desc: false,
          packages: false,
          people: false,
          teachers: false,
          students: false,
          administrator: false,
          analyse: true,
          styles: false,
          right: false
        });
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
          styles: true,
          right: false,
          analyse: false
        });
      } else if (schemaType === 'station') {
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
    }
  };

  const handleRefresh = (value) => {
    setRefresh(value);
  };

  const handleFormChange = (type, value) => {
    if (type === 'description') {
      setDescData(value);
      onForceChange && onForceChange('desc', value);
    }

    if (type === 'long') {
      setDescData({
        ...descData,
        [type]: value
      });
      onForceChange && onForceChange('desc', value);
    }

    if (type === 'contact') {
      setContactData(value);
      onForceChange && onForceChange('contact', value);
    }

    if (type === 'altText') {
      setAltText(value);
      onForceChange && onForceChange('altText', value);
    }

    if (type === 'avatarType') {
      setAvatarType(value);
    }

    if (type === 'avatarUpload') {
      if (value === 'remove') {
        setAvatarS3URL('');
        onForceChange && onForceChange('avatar', '');
      } else {
        setAvatarS3URL(value);
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
      setTopologyData({
        ...topologyData,
        [type]: value
      });
    }

    if (type === 'grades') {
      setGradesData(value);
      // onForceChange && onForceChange('grades', value);
      setSelectOpen(false);
    }

    if (type === 'user') {
      setLoadedUser(value);
      setOpenSearch(false);
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
    }
    onChange('update', true);
  };

  // const updateGoogleClassesConfig = async (station) => {
  //   let googleClasses = googleClassLoadedData?.filter(
  //     (item) =>
  //       item.topology?.station === station?._id &&
  //       item.source?.classSource?.name === 'Google Classroom'
  //   );
  //   if (googleClasses?.length > 0) {
  //     for (const googleClass of googleClasses) {
  //       const gcConfig = {
  //         packagingCycleTime: selectedTime?.toString(),
  //         googleIngestCycleTime: selectedTime?.toString()
  //       };
  //       await updateGrouping({
  //         variables: {
  //           id: googleClass['_id'],
  //           schemaType: googleClass.schemaType,
  //           version: googleClass.version,
  //           trackingAuthorName: currentUser?.name,
  //           config: gcConfig
  //         }
  //       });
  //     }
  //   }
  // };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'refresh') {
        // package refresh
        setPackageRefresh(!packageRefresh);
        setRefresh(true);
      }

      if (type === 'cancel') {
        setSelectedTreeItem(resources?.parentId);
        setShowEdit(false);
      }

      if (type === 'add') {
        setShowUserDialog(true);
        return;
      }

      if (type === 'new') {
        setNewElName(resources?.name);
        setShowNewDialog(true);
        return;
      }

      if (type === 'publish') {
        setTriggedPackage(!triggedPackage);
        // handleFormChange('package', value);
        return;
      }

      if (type === 'preview') {
        setShowLearnerDashboard(true);
      }
      if (type === 'upload') {
        setOpenUpload(true);
        setUploadDialogTitle(
          tabStatus.teachers ? en['Upload Teachers'] : en['Upload Students']
        );
      }

      if (type === 'search') {
        if (parentPage === 'Lessons') {
          setOpenLessonSearch(!openLessonSearch);
        } else {
          setOpenSearch(true);
          setSearchDialogTitle(
            tabStatus.teachers ? en['Search Teacher'] : en['Search Student']
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

        let desc = {
          title: descData ? descData.title : '',
          short: descData ? descData.short : '',
          long: descData ? descData.long : ''
        };

        const categories = {
          grades: gradesData
        };

        let variableData = {
          id: resources['_id'],
          schemaType: resources.schemaType,
          version: resources.version
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

        if (
          avatar?.fileName !== resources.avatar?.fileName ||
          altText !== resources.avatar?.altText
        ) {
          variableData = avatarS3URL
            ? {
                ...variableData,
                avatar: {
                  ...avatar,
                  altText
                }
              }
            : {
                ...variableData,
                avatar: null
              };
        }

        if (tabStatus?.config && resources?.schemaType === 'station') {
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
          variableData = {
            ...variableData,
            config
          };
        }

        // if (
        //   resources.schemaType === 'class' ||
        //   resources.schemaType === 'googleClass' ||
        //   resources.schemaType === 'station'
        // ) {
        //   variableData = contactData?.firstName && contactData?.lastName && contactData?.email && contactData?.phone ? {
        //     ...variableData,
        //     contact: contactData
        //   } : {
        //     ...variableData,
        //     contact: null
        //   };
        // }

        if (resources.schemaType === 'district') {
          variableData = {
            ...variableData,
            data: {
              ...resources?.data,
              styles: stylesData?.bg && stylesData?.fg ? stylesData : null
            }
          };
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
          variableData = {
            ...variableData,
            topology: topologyData
          };
        }

        if (
          resources.schemaType === 'class' &&
          categories?.grades !== resources?.categories?.grades
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

        const result = await updateGrouping({
          variables: variableData
        });

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
        }

        if (isAvatarAttached) {
          setAvatarUpload(true);
          setAvatarAttached(false);
        }

        if (forceSave) {
          onChange('forceSave', false);

          if (nextSelected == null) {
            setCurrentSource();
            setShowRoot(true);
            handleMainChange('root', nextSelected);
          } else {
            handleMainChange('elSingleClick', nextSelected);
          }
        } else {
          handleMainChange('elSingleClick', result?.data?.updateGrouping);
          setEditPanelData(result?.data?.updateGrouping);
        }
        if (!isAvatarAttached) {
          // setRefresh(true);
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
            // && item.data?.expiry_date > (new Date()).getTime()
            item.data?.google_auth?.id_token &&
            item.data?.google_auth?.refresh_token &&
            item.data?.google_auth?.scope
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

        setOpenPublishConfirmation(true);
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
                await updateGrouping({
                  variables: {
                    id: el._id,
                    schemaType: el.schemaType,
                    version: el.version,
                    trackingAuthorName: currentUser?.name,
                    childrenIdList: el.childrenIdList?.filter(
                      (ci) => ci !== resource._id
                    )
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
              schemaType: 'archiveClass'
            }
          });

          if (
            resource?.schemaType === 'class' ||
            resource.schemaType === 'googleClass'
          ) {
            const schools = schoolLoadedData?.filter(
              (item) => item['_id'] === resource?.parentId
            );
            if (schools) {
              const school = schools[0];
              const schoolClasses = classLoadedData.filter(
                (item) => item.parentId === resource.parentId
              );
              let childrenIdList = [];
              for (const sClass of schoolClasses) {
                if (sClass._id !== resource['_id']) {
                  childrenIdList.push(sClass._id);
                }
              }
              await updateGrouping({
                variables: {
                  id: school['_id'],
                  schemaType: school.schemaType,
                  version: school.version,
                  trackingAuthorName: currentUser?.name,
                  childrenIdList: childrenIdList ? childrenIdList : []
                }
              });

              let currentSchool = { ...school };
              currentSchool['childrenIdList'] = childrenIdList;
              parentItem = currentSchool;
            }

            if (studentResources) {
              const myStudents = studentResources?.filter((el) =>
                el.childrenIdList?.includes(resource._id)
              );
              if (myStudents) {
                try {
                  for (let el of myStudents) {
                    await updateGrouping({
                      variables: {
                        id: el._id,
                        schemaType: el.schemaType,
                        version: el.version,
                        trackingAuthorName: currentUser?.name,
                        childrenIdList: el.childrenIdList?.filter(
                          (ci) => ci !== resource._id
                        )
                      }
                    });
                  }
                } catch (err) {
                  console.log(err.message);
                }
              }
            }
          } else if (resource?.schemaType === 'school') {
            const districts = districtLoadedData?.filter(
              (item) => item['_id'] === resource?.parentId
            );
            if (districts) {
              const district = districts[0];
              const childrenIdList = district?.childrenIdList?.filter(
                (item) => item !== resource['_id']
              );
              await updateGrouping({
                variables: {
                  id: district['_id'],
                  schemaType: district.schemaType,
                  version: district.version,
                  trackingAuthorName: currentUser?.name,
                  childrenIdList: childrenIdList ? childrenIdList : []
                }
              });
              let currentDistrict = { ...district };
              currentDistrict['childrenIdList'] = childrenIdList;
              parentItem = currentDistrict;
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
              const childrenIdList = station?.childrenIdList?.filter(
                (item) => item !== resource['_id']
              );
              await updateGrouping({
                variables: {
                  id: station['_id'],
                  schemaType: station.schemaType,
                  version: station.version,
                  trackingAuthorName: currentUser?.name,
                  childrenIdList: childrenIdList ? childrenIdList : []
                }
              });
              let currentStation = { ...station };
              currentStation['childrenIdList'] = childrenIdList;
              parentItem = currentStation;
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
    const docId = resources['_id'];
    const type = tabStatus.students ? 'student' : 'educator';
    try {
      const fileExt = getFileExtension(file.name);
      const fileName = getCurrentUTCTime();

      const awsDirectory = docId;
      const uploadKey = awsDirectory + '/' + fileName + '.' + fileExt;
      const assetUrl = (await uploadFileToS3(file, uploadKey, 0)).replace(
        /%3A/g,
        ':'
      );

      await createBulkUsersGrouping({
        variables: {
          parentDocId: docId,
          type: type,
          assetUrl: assetUrl
        }
      });

      setUpdateValue(true);
      const notiOps = getNotificationOpt(type, 'success', 'upload');
      notify(notiOps.message, notiOps.options);
      onChange('clear');
      handleMainChange('refresh');
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

  const handleUploadDialogChange = (type, value) => {
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
        uploadFile(loadedStudentFile);
      }
      if (tabStatus.teachers) {
        uploadFile(loadedTeacherFile);
      }
      setOpenUpload(false);
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

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
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
        students: false,
        teachers: false,
        administrator: false,
        styles: false,
        disableMenu: { right: false },
        systemMessages: false
      };
    } else {
      if (
        resources?.schemaType === 'district' ||
        resources?.schemaType === 'googleClass'
      ) {
        return {
          desc: true,
          packages: false,
          topology: false,
          people: false,
          right: false,
          students: true,
          teachers: currentUser?.schemaType === 'educator' ? false : true,
          administrator: resources?.schemaType === 'district' ? true : false,
          styles: resources?.schemaType === 'district' ? true : false,
          analyse: true,
          disableMenu: { right: true }
        };
      } else {
        if (resources?.schemaType === 'station') {
          return {
            desc: true,
            packages: true,
            config:
              currentUser.schemaType === 'superAdmin' ||
              currentUser.schemaType === 'stationAdmin',
            analyse: true,
            topology: false,
            people: false,
            right: false,
            students: false,
            teachers: false,
            styles: false,
            administrator: true,
            disableMenu: { right: true }
          };
        } else {
          return {
            desc: true,
            packages: false,
            config: false,
            analyse: false,
            topology: false,
            people: false,
            right: false,
            students: false,
            teachers: false,
            administrator: false,
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
    setWhenState(true);
  };

  const handleClassPublish = async (type, value) => {
    if (!value) {
      setOpenPublishConfirmation(false);
      return;
    }
    if (schoolAdminData === null || schoolAdminData?.length === 0) {
      setOpenPublishConfirmation(false);
      return;
    }

    try {
      let validSchoolAdmins = schoolAdminData.filter(
        (item) =>
          item.data?.google_auth &&
          item.data?.google_auth?.access_token &&
          // && item.data?.expiry_date > (new Date()).getTime()
          item.data?.google_auth?.id_token &&
          item.data?.google_auth?.refresh_token &&
          item.data?.google_auth?.scope
      );

      if (validSchoolAdmins == null || validSchoolAdmins?.length === 0) {
        const notiOps = getNotificationOpt(
          'googleClass',
          'warning',
          'impossible'
        );
        notify(notiOps.message, notiOps.options);
        setOpenPublishConfirmation(false);
        return;
      } else {
        for (let i = 0; i < validSchoolAdmins?.length; i++) {
          const response = await ingestGoogle({
            variables: {
              userId: validSchoolAdmins[i]._id
            }
          });
        }
      }
      setOpenPublishConfirmation(false);
      const notiOps = getNotificationOpt('googleClass', 'success', 'import');
      notify(notiOps.message, notiOps.options);
    } catch (err) {
      console.log(err.response);
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const displayGrades = (gradeList) => {
    const names = [];
    gradeList.forEach((item) => {
      if (item !== 'Select Grades...') {
        names.push(item);
      }
    });
    if (names.length === 0) {
      return ['Select Grades...'];
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

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (type === 'input') {
        setNewElName(value);
        setCreateDialogSetting({
          error: false,
          helpText: en['Please input the name. It is required'],
          autoFocus: true
        });
      }

      if (type === 'btnClick') {
        if (value) {
          let variables = {
            _id: resources?._id,
            schemaType: 'archiveClass',
            name: newElName
          };
          let data = await restoreArchive({
            variables: variables
          });
          console.log(data);
          const notiOps = getNotificationOpt('class', 'success', 'create');
          notify(notiOps.message, notiOps.options);
        } else {
          setNewElName('');
        }

        setShowNewDialog(false);
      }
    } catch (error) {
      console.log(error.message);
      setNewElName('');
      if (error.message?.includes('Name exists')) {
        setCreateDialogSetting({
          error: true,
          helpText: en['Name exists already. Name must be unique.'],
          autoFocus: true
        });
      } else if (error.message === 'Name exists already') {
        const notiOps = getNotificationOpt('class', 'error', 'create');
        notify('Same Class name exits already!', notiOps.options);
      }
    }
  };

  return (
    <EditPanel
      title={title && title !== '' ? title : resources?.name}
      page={'Archives'}
      schemaType={resources?.schemaType}
      canUpload={false}
      canDownload={false}
      canAdd={false}
      canList={false}
      canDelete={resources?.schemaType === 'class' ? true : false}
      canSaveConfig={false}
      canEdit={false}
      canUpdate={false}
      canSave={false}
      canNewClass={true}
      hideSaveOrEdit={tabStatus?.analyse}
      canGallery={false}
      canSearch={parentPage === 'Lessons'}
      isMenuCenter={parentPage === 'Lessons'}
      canShowInfo={true}
      canPublish={false}
      canIngest={false}
      publishType={false}
      canShowPublis={false}
      canRefresh={
        tabStatus?.packages || tabStatus?.teachers || tabStatus?.students
          ? true
          : false
      }
      canCancel={false}
      tabSetting={getTabSettings()}
      hideAction={true}
      isTabReset={isTabReset}
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      selectedTreeItem={selectedTreeItem}
      showPreview={false}
      hideTitleOnMobile={true}
      hasNoActions={true}
    >
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        style={
          tabStatus.analyse ||
          tabStatus.teachers ||
          tabStatus.students ||
          tabStatus.administrator ||
          tabStatus.packages
            ? {}
            : { pointerEvents: 'none', opacity: '0.8' }
        }
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
              style={isSmallScreen ? {} : { width: '680px', minWidth: '680px' }}
              direction="column"
            >
              {/* topology */}
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
                      />
                    </DefaultCard>
                  </>
                ) : (
                  []
                )}
              </Grid>
              <Grid item xs={12}>
                <DefaultCard
                  // style={clsx({ [classes.stationEdit]: true })}
                  inline={false}
                  disableGray={false}
                >
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
                            disable={false}
                            resources={avatarS3URL}
                            docId={resources?._id}
                            stationId={resources?.topology?.station}
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
                            resourceType={resources?.schemaType}
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
                isSmallScreen
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
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AvatarUploadForm
                        disable={false}
                        resources={avatarS3URL}
                        docId={resources?._id}
                        stationId={resources?.topology?.station}
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
                      />
                    </Grid>
                  </Grid>
                </DefaultCard>
                {resources?.schemaType === 'class' && (
                  <DefaultCard disableGray={false}>
                    <Grid container>
                      <Grid item xs={9}>
                        <MuiThemeProvider theme={theme1}>
                          <Select
                            labelId={'demo-mutiple-chip-label-'}
                            id={'demo-mutiple-chip-'}
                            multiple={true}
                            open={selectOpen}
                            placeholder={en['Grades'] + '...'}
                            onOpen={() => setSelectOpen(true)}
                            onClose={() => setSelectOpen(false)}
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
                        </MuiThemeProvider>
                      </Grid>
                      <Grid item xs={3} style={{ paddingLeft: 12 }}>
                        <CustomSelectBox
                          variant="outlined"
                          addMarginTop={true}
                          style={classes.selectFilter}
                          customStyle={{ margin: 0, width: '100%' }}
                          value={language ? language : 'en'}
                          resources={langs}
                          // onChange={handleLanguageChange}
                          size="small"
                          noPadding={true}
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
                    />
                  </DefaultCard>
                )}
              </Grid>
              {/* topology */}
            </Grid>
          ))}

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
            isRefresh={packageRefresh}
            triggedPackage={triggedPackage}
            triggerPackage={triggerPackage}
            setTriggerPackage={setTriggerPackage}
          />
        ) : (
          []
        )}

        {tabStatus.config &&
        resources?.schemaType === 'station' &&
        (currentUser.schemaType === 'superAdmin' ||
          currentUser.schemaType === 'stationAdmin' ||
          currentUser.schemaType === 'sysAdmin') ? (
          <div>
            <ConfigForm
              selectedTime={selectedTime}
              savingConfig={savingConfig}
              title={'Packaging Trigger Period:'}
              onChange={(value) => handleConfig('packageTime', value)}
            />
            <div style={{ marginTop: 50 }}>
              <ConfigForm
                selectedTime={selectedGoogleTime}
                savingConfig={savingConfig}
                title={'Google Ingest Cycle Time:'}
                onChange={(value) => handleConfig('googleTime', value)}
              />
            </div>
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
                  classLoadedData={classLoadedData}
                  schoolLoadedData={schoolLoadedData}
                  showUserDialog={showUserDialog}
                  studentEditRow={studentEditRow}
                  teacherEditRow={teacherEditRow}
                  setShowUserDialog={setShowUserDialog}
                  onChange={(value) => handleFormChange('studentEdit', value)}
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
            style={isSmallScreen ? {} : { width: '680px', minWidth: '680px' }}
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
            isRoot={isRoot}
            resources={resources}
            schemaType={resources?.schemaType}
          />
        )}
      </Grid>
      <CustomDialog
        open={openDelete}
        title={
          en['Do you want to delete this'] +
          ` ${!isDeleting ? resources?.schemaType : ''}` +
          '?'
        }
        mainBtnName="Remove"
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
        title={en['Do you want to delete this class?']}
        mainBtnName="Remove"
        onChange={handleConfirmDeleteDialog}
        buttonDisable={isDeleting}
      >
        <Typography variant="subtitle1">{en['delete alert']}</Typography>
      </CustomDialog>

      <CustomDialog
        open={openDeleteAbort}
        title={en["Can't delete the data."]}
        secondaryBtnName="Ok"
        onChange={() => {
          setOpenDeleteAbort(false);
          setOpenDelete(false);
        }}
      >
        <Typography variant="h6">{en['delete notify']}</Typography>
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
        open={openPublishConfirmation}
        title={en['Import Class?']}
        onChange={handleClassPublish}
      >
        <Typography variant="h6">
          {en['This will import the class.']}
        </Typography>
      </CustomDialog>
      <CustomDialog
        mainBtnName={en['Create']}
        open={showNewDialog}
        buttonDisable={false}
        customClass={
          !selectedTreeItem ? classes.dialogWidth : classes.customDialogContent
        }
        title={`${en['Create a new']} ${'Class'}`}
        onChange={handleCreateDialogChange}
        reduceContentHeight
        isCreateFocus={isCreateFocus}
        setCreateFocus={setCreateFocus}
      >
        <CustomInput
          my={2}
          size="small"
          type="text"
          autoFocus={true}
          label={`Enter the Class name *`}
          value={newElName}
          onChange={(value) => handleCreateDialogChange('input', value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Tab') {
              if (selectedTreeItem) {
                handleCreateDialogChange('btnClick', event.target.value);
              } else {
                event.preventDefault();
              }
            }
          }}
          fullWidth
          error={createDialogSetting.error}
          helperText={createDialogSetting.helpText}
          variant="outlined"
          width="300px"
        />
      </CustomDialog>
    </EditPanel>
  );
};

export default ArchivesEdit;
