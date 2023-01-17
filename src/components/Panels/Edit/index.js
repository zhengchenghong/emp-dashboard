import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMenuContext } from '@app/providers/MenuContext';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import {
  Box,
  Grid,
  Button,
  Typography,
  Divider,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Select,
  Tooltip,
  MenuItem,
  ListItemText,
  ClickAwayListener
} from '@material-ui/core';
import { Auth } from 'aws-amplify';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  Save,
  Publish,
  Cancel,
  Delete,
  Edit,
  CloudUpload,
  RemoveRedEye,
  CloudDownload,
  Search,
  Add,
  GetApp,
  ArrowBackIosRounded,
  Archive
} from '@material-ui/icons';
import {
  faPlus,
  faUserPlus,
  faSearch,
  faList,
  faInfo,
  faCopy,
  faUndo,
  faChevronRight,
  faChevronLeft,
  faFileImport,
  faEllipsisV,
  faUser,
  faCog,
  faSignOutAlt,
  faTabletAlt
} from '@fortawesome/free-solid-svg-icons';
import useStyles from './style';
import { ImageList } from '@app/components/GalleryPanel';
import { useUserContext } from '@app/providers/UserContext';
import { useGalleryContext } from '@app/providers/GalleryContext';
import ResourcesSearchForm from '@app/components/Forms/ResourcesSearch';
import { en } from '@app/language';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { Cookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import CustomModal from '@app/components/Modal';
import EULAModal from '@app/components/Forms/EULAModal/EULAModal';
import SettingForm from '@app/components/Cards/UserProfile/setting';
import { useWindowSize } from '@app/utils/hooks/window';
import useSmallScreen from '@app/utils/hooks/useSmallScreen';
import useMediumScreen from '@app/utils/hooks/useMediumScreen';
import useMediumExtScreen from '@app/utils/hooks/useMediumExtScreen';
import { useSelectionContext } from '@app/providers/SelectionContext';
import { clearLocalStorage } from '@app/utils/functions';
import { useLessonViewModeContext } from '@app/providers/LessonViewModeContext';

const StyledMenuItem = withStyles((theme) => ({
  root: {
    backgroundColor: 'transition',
    color: 'inherit',
    '&:hover': {
      color: 'transition'
    },
    '&:focus': {
      backgroundColor: 'transition',
      color: 'inherit',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: 'inherit'
      }
    },
    justifyContent: 'center',
    fontFamily: 'Roboto',
    fontWeight: '800',
    minHeight: '32px !important'
  }
}))(MenuItem);

const EditPanel = ({
  pageDisable,
  title,
  page,
  schemaType,
  panelSize,
  canPublish,
  publishType,
  canShowPublis,
  canUpdate,
  canEdit,
  canNew,
  canDelete,
  canUpload,
  canFilter,
  canAdd,
  canAddSchoolTerm,
  canList,
  canGallery,
  galleryType,
  canAddDevice,
  canResSearch,
  canSearch,
  canReset,
  resourceReset,
  setReSourceReset,
  canShowInfo,
  tabSetting,
  isTabReset,
  onChange,
  onSearch,
  canClearFilters,
  onTabChange,
  children,
  hideAction,
  filterData,
  filterValue,
  onFilter,
  showLeftDropDown,
  showPreview,
  activePreview,
  canRefresh,
  currentMenu,
  canSaveConfig,
  canSave,
  canCreate,
  canDownload,
  selectedData,
  canIngest,
  isMenuCenter,
  canCancel,
  gradeResources,
  showMoreMode,
  UserSearch,
  tabValue,
  tabStatus,
  canSubmit,
  topBarMinWidth,
  mainSelectLayout,
  hideTitleOnMobile,
  hasNoSliderMenu,
  hasNoActions,
  canCopy,

  // For New Buttons on Topologies and Lessons
  selectedTreeItem,
  disableAddBtn,
  totalDisable,
  // New Class on Archives
  canNewClass
}) => {
  const classes = useStyles();
  const pathName = window.location.pathname;
  const { lessonViewMode, setLessonViewMode } = useLessonViewModeContext();
  const [value, setValue] = useState(tabValue || 0);
  const [superAdmin, setSuperAdmin] = useState(false);
  const {
    openRight,
    setOpenRight,
    setGalleryChildren,
    setGalleryData,
    setSearchGallery
  } = useGalleryContext();
  const [
    currentUser,
    ,
    ,
    ,
    userFirstName,
    ,
    userLastName,
    ,
    currentUserRole,
    ,
    userAvatarUrl
  ] = useUserContext();
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    isMobildModeEllipsisClicked,
    setMobildModeEllipsisClicked,
    ,
    setIngestGoogleClicked,
    ,
    setIngestCanvasClicked
  ] = useMenuContext();
  const windowSize = useWindowSize();
  const [spinRefresh, setSpinRefresh] = useState(false);
  const { notify } = useNotifyContext();
  const isMediumScreen = useMediumScreen();
  const isMediumExtScreen = useMediumExtScreen();
  const isSmallScreen = useSmallScreen();
  const theme = useTheme();
  const [openSettings, setOpenSettings] = useState(false);
  const [openViewMode, setOpenViewMode] = useState(false);
  const history = useHistory();
  const [openSettingModal, setOpenSettingMoal] = useState(false);
  const [openEULAModal, setOpenEULAModal] = useState(false);
  const { isLastTab, setIsLastTab, focusFirstAction, setFocusFirstAction } =
    useSelectionContext();
  const saveBtnRef = useRef();
  const deleteBtnRef = useRef();
  const publishBtnRef = useRef();
  const searchBtnRef = useRef();

  const handleClickSettings = (event) => {
    setOpenSettings(!openSettings);
  };

  const handleClickView = (event) => {
    setOpenViewMode(!openViewMode);
  };

  const onSignOut = async () => {
    await Auth.signOut();
    clearLocalStorage();
    localStorage.removeItem('ConfigParams');
    window.sessionStorage.setItem('last_path', window.location.pathname);
    window.sessionStorage.setItem('user_name', currentUser?.name);
    history.push('/');
  };

  useEffect(() => {
    const onLoad = async () => {
      try {
        if (currentUser?.schemaType === 'superAdmin') {
          setSuperAdmin(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (currentUser) {
      onLoad();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isTabReset) {
      setValue(0);
    }
  }, [isTabReset]);

  useEffect(() => {
    setMobildModeEllipsisClicked(false);
  }, [title, isMediumScreen]);

  useEffect(() => {
    if (isMobildModeEllipsisClicked) setOpenSettings(false);
  }, [isMobildModeEllipsisClicked]);

  // useEffect(() => {
  //   if (tabStatus?.analyse && schemaType === 'station') {
  //     setValue(4);
  //   }
  // }, [tabSetting]);

  useEffect(() => {
    setValue(tabValue || 0);
    if (onTabChange) onTabChange(tabValue || 0);
  }, [tabValue]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onTabChange(newValue);
    setMobildModeEllipsisClicked(false);
  };

  function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  const handleRefresh = async () => {
    setSpinRefresh(true);
    onChange('refresh');
    setMobildModeEllipsisClicked(false);
  };

  useEffect(() => {
    const doRefresh = async () => {
      if (spinRefresh) {
        await wait(1000);
        setSpinRefresh(false);
      }
    };

    doRefresh();
  }, [spinRefresh]);

  const setUpGallery = () => {
    if (!openRight) {
      setSearchGallery('');
      if (galleryType === 'banner') {
        setGalleryData((data) => ({ ...data, title: 'Banner Gallery' }));
        setGalleryChildren(<ImageList schemaType="stockBanner" />);
      } else if (galleryType === 'avatar') {
        setGalleryData((data) => ({ ...data, title: 'Avatar Gallery' }));
        setGalleryChildren(<ImageList schemaType="stockAvatar" />);
      } else if (galleryType === 'image') {
        setGalleryData((data) => ({ ...data, title: 'Image Gallery' }));
        setGalleryChildren(<ImageList schemaType="stockImage" />);
      } else {
        setGalleryData((data) => ({ ...data, title: 'Logo Gallery' }));
        setGalleryChildren(<ImageList schemaType="stockLogo" />);
      }
    }

    setOpenRight((state) => !state);
    setMobildModeEllipsisClicked(false);
  };

  const handleDrawerClose = () => {
    setMobildModeEllipsisClicked(!isMobildModeEllipsisClicked);
    setOpenSettings(false);
  };

  const closeEllipsisView = () => {
    setMobildModeEllipsisClicked(false);
  };

  const handlEllipsisButtonClicked = (type) => {
    setMobildModeEllipsisClicked(false);
    if (type === 'ingest' && currentUser?.schemaType === 'schoolAdmin') {
      setIngestGoogleClicked(true);
    } else if (
      type === 'ingestCanvas' &&
      currentUser?.schemaType === 'schoolAdmin'
    ) {
      setIngestCanvasClicked(true);
    } else if (type === 'ingestSchoology') {
      onChange('ingestSchoology');
    } else {
      onChange(type);
    }
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode === lessonViewMode || newViewMode == null) return;
    const cookies = new Cookies();
    cookies.set('viewMode', newViewMode);

    setLessonViewMode(newViewMode);
    setMobildModeEllipsisClicked(false);
  };

  const closeEllipsisArea = () => {
    setMobildModeEllipsisClicked(false);
  };

  useEffect(() => {
    setTimeout(function () {
      if (isLastTab) {
        saveBtnRef.current?.focus();
        setIsLastTab(false);
      }
    }, 100);
  }, [isLastTab]);

  useEffect(() => {
    if (focusFirstAction) {
      if (page === 'Lessons') {
        publishBtnRef.current?.focus();
      }

      if (page === 'Tutorials') {
        saveBtnRef.current?.focus();
      }

      if (page === 'Messages') {
        saveBtnRef.current?.focus();
      }

      if (page === 'Resources') {
        searchBtnRef.current?.focus();
      }
      setFocusFirstAction(false);
    }
  }, [focusFirstAction]);

  return (
    <Box
      className={classes.root}
      style={{
        overflowX: !isSmallScreen ? 'auto' : 'inherit',
        pointerEvents: pageDisable ? 'none' : 'inherit'
      }}
    >
      {isSmallScreen && (
        <div style={{ width: windowSize?.width - 10 }}>{mainSelectLayout}</div>
      )}
      {tabSetting && !isMediumScreen && !isSmallScreen && (
        <div
          className={classes.sliderMenuArea}
          style={{
            width:
              currentUser.schemaType === 'schoolAdmin'
                ? 'calc(100% - 670px)'
                : 'calc(100% - 520px)'
          }}
        >
          <Paper
            elevation={0}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              position: isMenuCenter ? 'relative' : 'absolute',
              backgroundColor: 'transparent'
            }}
            className={classes.sliderMenu}
          >
            <Tabs
              value={
                tabStatus?.analyse && schemaType === 'station'
                  ? 5
                  : tabStatus?.analyse && schemaType === 'district'
                  ? 5
                  : tabStatus?.analyse &&
                    (schemaType === 'school' || schemaType === 'class')
                  ? 3
                  : value
              }
              onChange={handleChange}
              classes={{
                indicator: classes.indicator
              }}
              style={{ background: 'white' }}
            >
              {tabSetting?.desc && (
                <Tab label={en['Description']} className={classes.tab} />
              )}

              {tabSetting?.packages && (
                <Tab label={en['Packages']} className={classes.tab} />
              )}

              {tabSetting?.config && (
                <Tab label={en['Config']} className={classes.tab} />
              )}

              {tabSetting?.schoolTerms && (
                <Tab label={en['School Terms']} className={classes.tab} />
              )}

              {tabSetting?.topology && (
                <Tab label={en['Topology']} className={classes.tab} />
              )}
              {tabSetting?.people && (
                <Tab label={en['Users']} className={classes.tab} />
              )}
              {tabSetting?.htmlEditor && (
                <Tab label={en['HTML Editor']} className={classes.tab} />
              )}
              {tabSetting?.attachment && (
                <Tab label={en['Attachments']} className={classes.tab} />
              )}
              {tabSetting?.teachers && (
                <Tab label={en['Educators']} className={classes.tab} />
              )}
              {tabSetting?.students && (
                <Tab label={en['Students']} className={classes.tab} />
              )}

              {tabSetting?.administrator && (
                <Tab label={en['Administrators']} className={classes.tab} />
              )}

              {tabSetting?.devices && (
                <Tab label={en['Devices']} className={classes.tab} />
              )}

              {tabSetting?.categories && (
                <Tab label={en['Categories']} className={classes.tab} />
              )}
              {tabSetting?.asset && (
                <Tab label={en['Asset']} className={classes.tab} />
              )}
              {tabSetting?.styles && (
                <Tab label={en['Styles']} className={classes.tab} />
              )}

              {tabSetting?.analyse && (
                <Tab label={en['Analytics']} className={classes.tab} />
              )}

              {tabSetting?.systemMessages && (
                <Tab label={en['System Messages']} className={classes.tab} />
              )}

              {tabSetting?.criteria && (
                <Tab label={en['Metadata']} className={classes.tab} />
              )}

              {tabSetting?.data && (
                <Tab label={en['Data']} className={classes.tab} />
              )}

              {tabSetting?.files && (
                <Tab label={en['Files']} className={classes.tab} />
              )}

              {tabSetting?.schedule && (
                <Tab label={en['Schedule']} className={classes.tab} />
              )}

              {tabSetting?.right && (
                <Tab
                  label={en['Rights Management']}
                  disabled={tabSetting?.disableMenu?.right ? true : false}
                  className={classes.tab}
                />
              )}
              {tabSetting?.accessConfig && (
                <Tab label={en['Config']} className={classes.tab} />
              )}
            </Tabs>
          </Paper>
        </div>
      )}
      <Box p={1}>
        <div
          className={classes.toolbar}
          style={
            isMediumScreen ||
            (currentUser?.schemaType === 'schoolAdmin' && isMediumExtScreen)
              ? { overflow: 'unset' }
              : { overflow: 'hidden' }
          }
        >
          <div
            style={
              page !== 'Resources'
                ? {
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxHeight: 25
                  }
                : {
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }
            }
          >
            {!(hideTitleOnMobile && isSmallScreen) && (
              <div
                style={{
                  width:
                    page === 'Topologies' ||
                    page === 'Lessons' ||
                    page === 'Archives'
                      ? 'min-content'
                      : '100%',
                  overflow: 'hidden'
                }}
              >
                {schemaType === 'tutorial' &&
                ((!canUpdate && canAdd) || !showMoreMode) ? (
                  <Typography
                    noWrap
                    variant="subtitle1"
                    style={{ fontWeight: 500 }}
                  >
                    {UserSearch ? UserSearch : title}
                  </Typography>
                ) : schemaType === 'tutorial' && (!canAdd || canUpdate) ? (
                  <Button
                    onClick={(e) => {
                      schemaType === 'tutorial' && !canAdd
                        ? onChange('backToTutorials')
                        : onChange('cancel');
                    }}
                    className={classes.actionButton}
                    startIcon={<ArrowBackIosRounded />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Back to Tutorials']}
                  </Button>
                ) : title === en['Resources'] ? (
                  <ResourcesSearchForm
                    reset={resourceReset}
                    setReset={setReSourceReset}
                    resources={gradeResources}
                    sourceType={'All Resources'}
                    onChange={(type, value) => onChange(type, value)}
                  />
                ) : page === 'Topologies' ||
                  page === 'Lessons' ||
                  page === 'Archives' ? (
                  <Tooltip
                    title={
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 500 }}
                      >
                        {title}
                      </Typography>
                    }
                    interactive
                  >
                    <Typography
                      noWrap
                      variant="subtitle1"
                      classes={{ noWrap: classes.noWrap }}
                      style={{
                        fontWeight: 500,
                        maxHeight: 25,
                        direction: 'ltr'
                      }}
                    >
                      {title}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography
                    noWrap
                    variant="subtitle1"
                    style={{ fontWeight: 500 }}
                  >
                    {UserSearch ? UserSearch : title}
                  </Typography>
                )}
              </div>
            )}
            {((currentUser?.schemaType === 'schoolAdmin' &&
              isMediumExtScreen) ||
              isMediumScreen) &&
            !isSmallScreen &&
            (!hasNoActions || !hasNoSliderMenu) ? (
              <IconButton
                className={classes.actionGroup1}
                onClick={handleDrawerClose}
              >
                <Box className={classes.logo}>
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    size="1x"
                    style={{ width: '16px', height: '16px' }}
                  />
                </Box>
              </IconButton>
            ) : !hideAction && !isSmallScreen ? (
              <div className={classes.actionGroup1}>
                {canIngest && (
                  <Button
                    onClick={() => onChange('ingest')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faFileImport}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Ingest Google']}
                  </Button>
                )}
                {canIngest && (
                  <Button
                    onClick={() => onChange('ingestCanvas')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faFileImport}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Ingest Canvas']}
                  </Button>
                )}
                {canIngest && (
                  <Button
                    onClick={() => onChange('ingestSchoology')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faFileImport}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Ingest Schoology']}
                  </Button>
                )}
                {canAddDevice && (
                  <Button
                    onClick={() => onChange('addDevice')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faTabletAlt}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Add Device']}
                  </Button>
                )}
                {canAddSchoolTerm && (
                  <Button
                    onClick={() => onChange('addSchoolTerm')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faPlus}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['New']}
                  </Button>
                )}
                {title !== 'Tutorial' && canAdd && (
                  <Button
                    onClick={() => onChange('add')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faUserPlus}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {tabStatus?.teachers ? en['Add Educator'] : en['Add User']}
                  </Button>
                )}
                {canClearFilters && (
                  <Button
                    onClick={() => onChange('clearFilter')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    // startIcon={
                    //   <FontAwesomeIcon
                    //     icon={faPlus}
                    //     size="sm"
                    //     style={{ cursor: 'pointer' }}
                    //   />
                    // }
                    variant="contained"
                    color="primary"
                  >
                    {en['Clear Filters']}
                  </Button>
                )}
                {title === 'Tutorial' && canAdd && !canUpdate && (
                  <Button
                    onClick={() => onChange('add')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faPlus}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['New']}
                  </Button>
                )}

                {publishType && (
                  <Button
                    onClick={() => onChange('packageDownload')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={<GetApp />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Download All']}
                  </Button>
                )}
                {canPublish && (
                  <Button
                    ref={publishBtnRef}
                    onClick={() => onChange('publish')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={<Publish />}
                    variant="contained"
                    color="primary"
                  >
                    {publishType ? en['Trigger Packaging'] : en['Publish']}
                  </Button>
                )}
                {publishType && (
                  <Button
                    onClick={() => onChange('downloadCSV')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={<GetApp />}
                    variant="contained"
                    color="primary"
                  >
                    Download CSV file
                  </Button>
                )}
                {title !== 'Tutorial' &&
                  schemaType !== 'tutorial' &&
                  canSave &&
                  (canUpdate ? (
                    <Button
                      ref={saveBtnRef}
                      onClick={() => onChange('save')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<Save />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Save']}
                    </Button>
                  ) : (
                    title !== 'Resources' &&
                    title !== 'Clear' && (
                      <IconButton
                        onClick={() => onChange('edit')}
                        className={classes.actionButton}
                        disabled={!canEdit}
                        style={{ cursor: 'pointer', color: 'white' }}
                      >
                        <Edit />
                      </IconButton>
                    )
                  ))}
                {title === 'Tutorial' && canUpdate && (
                  <Button
                    ref={saveBtnRef}
                    onClick={() => onChange('save')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={<Save />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Save']}
                  </Button>
                )}
                {page === 'Lessons' && (
                  <Button
                    onClick={() => onChange('copy')}
                    className={
                      canCopy
                        ? classes.actionButton
                        : classes.disabledActionButton
                    }
                    disabled={!canCopy}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faCopy}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Copy']}
                  </Button>
                )}
                {canDelete && (
                  <Button
                    ref={deleteBtnRef}
                    onClick={() => onChange('delete')}
                    className={classes.actionButton}
                    // disabled={!canEdit}
                    startIcon={<Delete />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Delete']}
                  </Button>
                )}
                {canRefresh && (
                  <Button
                    onClick={() => onChange('refresh')}
                    className={classes.actionButton}
                    disabled={!canRefresh}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faUndo}
                        spin={spinRefresh}
                        size="sm"
                        style={{
                          animationDirection: 'alternate-reverse',
                          cursor: 'pointer'
                        }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Refresh']}
                  </Button>
                )}
                {schemaType === 'class' && (
                  <Button
                    onClick={() => {
                      onChange('archive');
                    }}
                    className={
                      selectedTreeItem?.schoolTermId
                        ? classes.disabledActionButton
                        : classes.actionButton
                    }
                    startIcon={<Archive />}
                    variant="contained"
                    color="primary"
                    disabled={selectedTreeItem?.schoolTermId ? true : false}
                  >
                    {'Archive'}
                  </Button>
                )}
                {showPreview && (
                  <Button
                    onClick={() => {
                      if (!activePreview) {
                        notify(
                          'There are no active students published for this station.',
                          {
                            variant: 'warning',
                            autoHideDuration: 3000
                          }
                        );
                      } else onChange('preview');
                    }}
                    className={classes.actionButton}
                    // disabled={!canEdit}
                    startIcon={<RemoveRedEye />}
                    variant="contained"
                    color={activePreview ? 'primary' : 'inherit'}
                  >
                    {en['Preview']}
                  </Button>
                )}
                {canShowInfo && superAdmin && (
                  <Button
                    onClick={() => onChange('info')}
                    className={classes.actionButton}
                    disabled={!canShowInfo}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faInfo}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                  >
                    {en['Info']}
                  </Button>
                )}
                {canGallery ? (
                  <Button
                    onClick={setUpGallery}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={
                      <FontAwesomeIcon
                        icon={openRight ? faChevronLeft : faChevronRight}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    variant="contained"
                    color="primary"
                    style={{ zIndex: canAdd ? 1350 : 'auto' }}
                  >
                    {en['Galleries']}
                  </Button>
                ) : (
                  []
                )}

                {canSearch && page !== 'Resources' && (
                  <Button
                    onClick={() => onChange('search')}
                    className={classes.actionButton}
                    // disabled={!canEdit}
                    startIcon={<Search />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Search']}
                  </Button>
                )}

                {canReset && page === 'Resources' && (
                  <Button
                    ref={searchBtnRef}
                    onClick={() => onChange('reset')}
                    className={classes.resSearchButton}
                    // disabled={!canEdit}
                    variant="contained"
                    color="primary"
                  >
                    {en['Reset']}
                  </Button>
                )}

                {canSearch && page === 'Resources' && (
                  <Button
                    ref={searchBtnRef}
                    onClick={() => onChange('search')}
                    className={classes.resSearchButton}
                    // disabled={!canEdit}
                    variant="contained"
                    color="primary"
                  >
                    {en['Search']}
                  </Button>
                )}

                {canDownload && (
                  <Button
                    onClick={() => onChange('download')}
                    className={classes.actionButton}
                    disabled={!canEdit}
                    startIcon={<CloudDownload />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Download Data']}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    onClick={() => onChange('cancel')}
                    className={classes.actionButton}
                    startIcon={<Cancel />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Cancel']}
                  </Button>
                )}
                {canSubmit && (
                  <Button
                    onClick={() => onChange('submit')}
                    className={classes.actionButton}
                    // startIcon={<Cancel />}
                    variant="contained"
                    color="primary"
                  >
                    {en['Submit']}
                  </Button>
                )}
              </div>
            ) : (
              !isSmallScreen && (
                <div className={classes.actionGroup1}>
                  {canSaveConfig && (
                    <Button
                      ref={saveBtnRef}
                      onClick={() => onChange('save')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<Save />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Save']}
                    </Button>
                  )}
                  {canUpload && (
                    <Button
                      onClick={() => onChange('upload')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<CloudUpload />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Bulk Upload']}
                    </Button>
                  )}
                  {canIngest && (
                    <Button
                      onClick={() => onChange('ingest')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faFileImport}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Ingest Google']}
                    </Button>
                  )}
                  {canIngest && (
                    <Button
                      onClick={() => onChange('ingestCanvas')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faFileImport}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Ingest Canvas']}
                    </Button>
                  )}
                  {canIngest && (
                    <Button
                      onClick={() => onChange('ingestSchoology')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faFileImport}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Ingest Schoology']}
                    </Button>
                  )}
                  {canClearFilters && (
                    <Button
                      onClick={() => onChange('clearFilter')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      // startIcon={
                      //   <FontAwesomeIcon
                      //     icon={faPlus}
                      //     size="sm"
                      //     style={{ cursor: 'pointer' }}
                      //   />
                      // }
                      variant="contained"
                      color="primary"
                    >
                      {en['Clear Filters']}
                    </Button>
                  )}
                  {canAddDevice && (
                    <Button
                      onClick={() => onChange('addDevice')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faTabletAlt}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Add Device']}
                    </Button>
                  )}
                  {canAddSchoolTerm && (
                    <Button
                      onClick={() => onChange('addSchoolTerm')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faPlus}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['New']}
                    </Button>
                  )}
                  {canAdd && (
                    <Button
                      onClick={() => onChange('add')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faUserPlus}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {tabStatus?.teachers
                        ? en['Add Educator']
                        : page === 'Archives' && schemaType === 'school'
                        ? en['New']
                        : en['Add User']}
                    </Button>
                  )}

                  {canNewClass && schemaType === 'class' && (
                    <Button
                      onClick={() => onChange('new')}
                      className={classes.actionButton}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faPlus}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['New Class']}
                    </Button>
                  )}

                  {canDelete &&
                    (currentMenu === 'user' || page === 'Archives') && (
                      <Button
                        ref={deleteBtnRef}
                        onClick={() => onChange('delete')}
                        className={classes.actionButton}
                        startIcon={<Delete />}
                        variant="contained"
                        color="primary"
                      >
                        {en['Delete']}
                      </Button>
                    )}
                  {canList && (
                    <IconButton
                      onClick={() => onChange('list')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                    >
                      <FontAwesomeIcon
                        icon={faList}
                        size="sm"
                        style={{ cursor: 'pointer', color: 'white' }}
                      />
                    </IconButton>
                  )}
                  {canSearch && (
                    <IconButton
                      onClick={() => onChange('search')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                    >
                      <FontAwesomeIcon
                        icon={faSearch}
                        size="sm"
                        style={{ cursor: 'pointer', color: 'white' }}
                      />
                    </IconButton>
                  )}
                  {canFilter && !showLeftDropDown && (
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filterValue}
                      style={{ minWidth: '150px' }}
                      onChange={(event) => onFilter(event.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      {filterData.map((item, index) => (
                        <MenuItem value={item.value} key={index}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}

                  {publishType && (
                    <Button
                      onClick={() => onChange('packageDownload')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<GetApp />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Download All']}
                    </Button>
                  )}

                  {canPublish && (
                    <Button
                      ref={publishBtnRef}
                      onClick={() => onChange('publish')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<Publish />}
                      variant="contained"
                      color="primary"
                    >
                      {publishType ? en['Trigger Packaging'] : en['Publish']}
                    </Button>
                  )}
                  {publishType && (
                    <Button
                      onClick={() => onChange('downloadCSV')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<GetApp />}
                      variant="contained"
                      color="primary"
                    >
                      Download CSV file
                    </Button>
                  )}
                  {canRefresh && (
                    <Button
                      onClick={handleRefresh}
                      className={classes.actionButton}
                      disabled={!canRefresh}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faUndo}
                          spin={spinRefresh}
                          size="sm"
                          style={{
                            animationDirection: 'alternate-reverse',
                            cursor: 'pointer'
                          }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Refresh']}
                    </Button>
                  )}

                  {canShowInfo && superAdmin && (
                    <Button
                      onClick={() => onChange('info')}
                      className={classes.actionButton}
                      disabled={!canShowInfo}
                      startIcon={
                        <FontAwesomeIcon
                          icon={faInfo}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                    >
                      {en['Info']}
                    </Button>
                  )}
                  {canNew && (
                    <Button
                      variant="contained"
                      size="small"
                      style={{ marginBottom: 5 }}
                      onClick={() => onChange('new')}
                      className={classes.actionButton}
                      startIcon={<Add />}
                      color="primary"
                    >
                      {en['New']}
                    </Button>
                  )}

                  {canDownload && (
                    <Button
                      onClick={() => onChange('download')}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={<CloudDownload />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Download Data']}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      onClick={() => onChange('cancel')}
                      className={classes.actionButton}
                      startIcon={<Cancel />}
                      variant="contained"
                      color="primary"
                    >
                      {en['Cancel']}
                    </Button>
                  )}
                  {canGallery ? (
                    <Button
                      onClick={setUpGallery}
                      className={classes.actionButton}
                      disabled={!canEdit}
                      startIcon={
                        <FontAwesomeIcon
                          icon={openRight ? faChevronLeft : faChevronRight}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      variant="contained"
                      color="primary"
                      style={{ zIndex: canAdd ? 1350 : 'auto' }}
                    >
                      {en['Galleries']}
                    </Button>
                  ) : (
                    []
                  )}
                </div>
              )
            )}
          </div>
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={closeEllipsisView}
          >
            <Box>
              {isMobildModeEllipsisClicked && (
                <div
                  className={classes.dropdownMenu}
                  style={{
                    marginTop: isSmallScreen
                      ? page === 'Tutorials' ||
                        page === 'Resources' ||
                        page === 'Clear'
                        ? '-30px'
                        : '-80px'
                      : '0px',
                    maxHeight: `calc(100vh - 155px)`,
                    overflowX: 'hidden',
                    overflowY: 'scroll'
                  }}
                >
                  <Grid container spacing={2}>
                    {isSmallScreen && (
                      <>
                        <Grid
                          container
                          direction="row"
                          alignItems="center"
                          style={{
                            justifyContent: 'center',
                            marginTop: 15,
                            marginBottom: 5
                          }}
                        >
                          <Grid
                            item
                            container
                            justifyContent="center"
                            style={{
                              alignSelf: 'center',
                              width: '35px'
                            }}
                          >
                            {userAvatarUrl ? (
                              <img
                                title={currentUser?.email}
                                src={userAvatarUrl}
                                style={{
                                  width: 35,
                                  height: 35,
                                  borderRadius: '50%'
                                }}
                                alt=""
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faUser}
                                size="lg"
                                color={theme.palette.primary.contrastText}
                                title={currentUser?.email}
                                style={{
                                  background: '#b0bec5',
                                  borderRadius: '100%',
                                  padding: 10,
                                  width: 35,
                                  height: 35,
                                  marginLeft: 10
                                }}
                              />
                            )}
                          </Grid>
                          <Grid
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              alignSelf: 'center',
                              marginLeft: 10
                            }}
                          >
                            <Grid style={{ paddingLeft: 5, paddingRight: 4 }}>
                              <ListItemText
                                primary={`${userFirstName} ${userLastName}`}
                                classes={{ primary: classes.userNameText }}
                              />
                              <ListItemText
                                primary={currentUserRole}
                                classes={{ primary: classes.roleText }}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        <div className={classes.ellipsisDivider} />
                      </>
                    )}

                    {tabSetting && !hasNoSliderMenu && (
                      <>
                        <Grid item xs={12}>
                          <div>
                            <Tabs
                              value={
                                tabStatus?.analyse && schemaType === 'station'
                                  ? 4
                                  : tabStatus?.analyse &&
                                    schemaType === 'district'
                                  ? 5
                                  : tabStatus?.analyse &&
                                    (schemaType === 'school' ||
                                      schemaType === 'class')
                                  ? 3
                                  : value
                              }
                              onChange={handleChange}
                              orientation={'vertical'}
                              classes={{
                                indicator: classes.indicator
                              }}
                            >
                              {tabSetting?.desc && (
                                <Tab
                                  label={en['Description']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.packages && (
                                <Tab
                                  label={en['Packages']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.config && (
                                <Tab
                                  label={en['Config']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.schoolTerms && (
                                <Tab
                                  label={en['School Terms']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.topology && (
                                <Tab
                                  label={en['Topology']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.people && (
                                <Tab
                                  label={en['Users']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.htmlEditor && (
                                <Tab
                                  label={en['HTML Editor']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.attachment && (
                                <Tab
                                  label={en['Attachments']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.teachers && (
                                <Tab
                                  label={en['Educators']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.students && (
                                <Tab
                                  label={en['Students']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.administrator && (
                                <Tab
                                  label={en['Administrators']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.devices && (
                                <Tab
                                  label={en['Devices']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.categories && (
                                <Tab
                                  label={en['Categories']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.asset && (
                                <Tab
                                  label={en['Asset']}
                                  className={classes.tab1}
                                />
                              )}
                              {tabSetting?.styles && (
                                <Tab
                                  label={en['Styles']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.analyse && (
                                <Tab
                                  label={en['Analytics']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.systemMessages && (
                                <Tab
                                  label={en['System Messages']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.criteria && (
                                <Tab
                                  label={en['Metadata']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.data && (
                                <Tab
                                  label={en['Data']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.files && (
                                <Tab
                                  label={en['Files']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.schedule && (
                                <Tab
                                  label={en['Schedule']}
                                  className={classes.tab1}
                                />
                              )}

                              {tabSetting?.right && (
                                <Tab
                                  label={en['Rights Management']}
                                  disabled={
                                    tabSetting?.disableMenu?.right
                                      ? true
                                      : false
                                  }
                                  className={classes.tab1}
                                />
                              )}
                            </Tabs>
                          </div>
                        </Grid>
                        {(!hasNoActions || (hasNoActions && isSmallScreen)) && (
                          <div className={classes.ellipsisDivider} />
                        )}
                      </>
                    )}

                    {!hasNoActions && (
                      <Grid item xs={12}>
                        {!hideAction ? (
                          <div className={classes.dropdownMenu1}>
                            <ul>
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('ingest')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Google']}
                                  </Button>
                                </li>
                              )}
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('ingestCanvas')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Canvas']}
                                  </Button>
                                </li>
                              )}
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'ingestSchoology'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Schoology']}
                                  </Button>
                                </li>
                              )}
                              {canIngest &&
                                currentUser?.schemaType === 'schoolAdmin' && (
                                  <div
                                    className={classes.insideEllipsisDivider}
                                    style={{
                                      marginRight: '8px',
                                      marginLeft: '8px'
                                    }}
                                  />
                                )}

                              {(page === 'Topologies' ||
                                page === 'Lessons' ||
                                page === 'Messages') &&
                                canCreate &&
                                isSmallScreen && (
                                  <Button
                                    onClick={() =>
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                        ? onChange('')
                                        : handlEllipsisButtonClicked('create')
                                    }
                                    className={
                                      !canEdit ||
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                        ? classes.disabledButton
                                        : classes.actionButton1
                                    }
                                    disabled={
                                      !canEdit ||
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                    }
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['New']}
                                  </Button>
                                )}
                              {canClearFilters && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('clearFilter')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Clear Filters']}
                                  </Button>
                                </li>
                              )}
                              {canAddDevice && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('addDevice')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Add Device']}
                                  </Button>
                                </li>
                              )}

                              {canAddSchoolTerm && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'addSchoolTerm'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['New']}
                                  </Button>
                                </li>
                              )}

                              {title !== 'Tutorial' && canAdd && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('add')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {tabStatus?.teachers
                                      ? en['Add Educator']
                                      : en['Add User']}
                                  </Button>
                                </li>
                              )}

                              {publishType && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'packageDownload'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={<GetApp />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Download All']}
                                  </Button>
                                </li>
                              )}
                              {canPublish && (
                                <li>
                                  <Button
                                    ref={publishBtnRef}
                                    onClick={() =>
                                      handlEllipsisButtonClicked('publish')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={<Publish />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {publishType
                                      ? en['Trigger Packaging']
                                      : en['Publish']}
                                  </Button>
                                </li>
                              )}
                              {publishType && (
                                <Button
                                  onClick={() =>
                                    handlEllipsisButtonClicked('downloadCSV')
                                  }
                                  className={classes.actionButton1}
                                  disabled={!canEdit}
                                  variant="contained"
                                  color="primary"
                                >
                                  Download CSV file
                                </Button>
                              )}
                              {title !== 'Tutorial' &&
                                schemaType !== 'tutorial' &&
                                canSave &&
                                (canUpdate ? (
                                  <li>
                                    <Button
                                      onClick={() =>
                                        handlEllipsisButtonClicked('save')
                                      }
                                      className={classes.actionButton1}
                                      disabled={!canEdit}
                                      // startIcon={<Save />}
                                      variant="contained"
                                      color="primary"
                                    >
                                      {en['Save']}
                                    </Button>
                                  </li>
                                ) : (
                                  title !== 'Resources' &&
                                  title !== 'Clear' && (
                                    <li>
                                      <Button
                                        onClick={() =>
                                          handlEllipsisButtonClicked('edit')
                                        }
                                        className={classes.actionButton1}
                                        disabled={!canEdit}
                                        // startIcon={<Save />}
                                        variant="contained"
                                        color="primary"
                                      >
                                        {en['Edit']}
                                      </Button>
                                    </li>
                                  )
                                ))}
                              {page === 'Lessons' && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('copy')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canCopy}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Copy']}
                                  </Button>
                                </li>
                              )}
                              {title === 'Tutorial' && canUpdate && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('save')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={<Save />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Save']}
                                  </Button>
                                </li>
                              )}
                              {canDelete && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('delete')
                                    }
                                    className={classes.actionButton1}
                                    // disabled={!canEdit}
                                    // startIcon={<Delete />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Delete']}
                                  </Button>
                                </li>
                              )}
                              {canRefresh && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('refresh')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canRefresh}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Refresh']}
                                  </Button>
                                </li>
                              )}
                              {title === 'Tutorial' && canAdd && !canUpdate && (
                                <Button
                                  onClick={() =>
                                    handlEllipsisButtonClicked('add')
                                  }
                                  className={classes.actionButton1}
                                  disabled={!canEdit}
                                  variant="contained"
                                  color="primary"
                                >
                                  {en['New']}
                                </Button>
                              )}
                              {showPreview && (
                                <li>
                                  <Button
                                    onClick={() => {
                                      if (!activePreview) {
                                        notify(
                                          'There are no active students published for this station.',
                                          {
                                            variant: 'warning',
                                            autoHideDuration: 3000
                                          }
                                        );
                                      } else
                                        handlEllipsisButtonClicked('preview');
                                    }}
                                    className={classes.actionButton1}
                                    // disabled={!canEdit}
                                    // startIcon={<RemoveRedEye />}
                                    variant="contained"
                                    color={
                                      activePreview ? 'primary' : 'inherit'
                                    }
                                  >
                                    {en['Preview']}
                                  </Button>
                                </li>
                              )}
                              {canShowInfo && superAdmin && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('info')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canShowInfo}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Info']}
                                  </Button>
                                </li>
                              )}
                              {canGallery ? (
                                <li>
                                  <Button
                                    onClick={setUpGallery}
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Galleries']}
                                  </Button>
                                </li>
                              ) : (
                                []
                              )}

                              {canSearch && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('search')
                                    }
                                    className={classes.actionButton1}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Search']}
                                  </Button>
                                </li>
                              )}
                              {canReset && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('reset')
                                    }
                                    className={classes.actionButton1}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Reset']}
                                  </Button>
                                </li>
                              )}
                              {canDownload && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('download')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Download Data']}
                                  </Button>
                                </li>
                              )}
                              {canSubmit && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('submit')
                                    }
                                    className={classes.actionButton1}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Submit']}
                                  </Button>
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <div className={classes.dropdownMenu1}>
                            <ul>
                              {(page === 'Topologies' ||
                                page === 'Lessons' ||
                                page === 'Messages') &&
                                canCreate &&
                                isSmallScreen &&
                                !canAddSchoolTerm && (
                                  <Button
                                    onClick={() =>
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                        ? onChange('')
                                        : handlEllipsisButtonClicked('create')
                                    }
                                    className={
                                      !canEdit ||
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                        ? classes.disabledButton
                                        : classes.actionButton1
                                    }
                                    disabled={
                                      !canEdit ||
                                      (selectedTreeItem && disableAddBtn) ||
                                      totalDisable
                                    }
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['New']}
                                  </Button>
                                )}
                              {canSaveConfig && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('save')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={<Save />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Save']}
                                  </Button>
                                </li>
                              )}
                              {page === 'Lessons' && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('copy')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canCopy}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Copy']}
                                  </Button>
                                </li>
                              )}
                              {canUpload && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('upload')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={<CloudUpload />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Bulk Upload']}
                                  </Button>
                                </li>
                              )}
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('ingest')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Google']}
                                  </Button>
                                </li>
                              )}
                              {canClearFilters && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('clearFilter')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    // startIcon={
                                    //   <FontAwesomeIcon
                                    //     icon={faPlus}
                                    //     size="sm"
                                    //     style={{ cursor: 'pointer' }}
                                    //   />
                                    // }
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Clear Filters']}
                                  </Button>
                                </li>
                              )}
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('ingestCanvas')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Canvas']}
                                  </Button>
                                </li>
                              )}
                              {canIngest && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'ingestSchoology'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Ingest Schoology']}
                                  </Button>
                                </li>
                              )}

                              {canAddDevice && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('addDevice')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Add Device']}
                                  </Button>
                                </li>
                              )}

                              {canAddSchoolTerm && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'addSchoolTerm'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['New']}
                                  </Button>
                                </li>
                              )}

                              {canAdd && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('add')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {tabStatus?.teachers
                                      ? en['Add Educator']
                                      : en['Add User']}
                                  </Button>
                                </li>
                              )}

                              {canDelete && currentMenu === 'user' && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('delete')
                                    }
                                    className={classes.actionButton1}
                                    // startIcon={<Delete />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Delete']}
                                  </Button>
                                </li>
                              )}

                              {canList && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('list')
                                    }
                                    className={classes.actionButton1}
                                    // startIcon={<Delete />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['List']}
                                  </Button>
                                </li>
                              )}
                              {canSearch && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('search')
                                    }
                                    className={classes.actionButton1}
                                    // startIcon={<Delete />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Search']}
                                  </Button>
                                </li>
                              )}
                              {canFilter && !showLeftDropDown && (
                                <li>
                                  <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={filterValue}
                                    style={{ minWidth: '150px' }}
                                    onChange={(event) =>
                                      handlEllipsisButtonClicked(
                                        event.target.value
                                      )
                                    }
                                  >
                                    <MenuItem value="all">All</MenuItem>
                                    {filterData.map((item, index) => (
                                      <MenuItem value={item.value} key={index}>
                                        {item.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </li>
                              )}

                              {publishType && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked(
                                        'packageDownload'
                                      )
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Download All']}
                                  </Button>
                                </li>
                              )}
                              {canPublish && (
                                <li>
                                  <Button
                                    ref={publishBtnRef}
                                    onClick={() =>
                                      handlEllipsisButtonClicked('publish')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {publishType
                                      ? en['Trigger Packaging']
                                      : en['Publish']}
                                  </Button>
                                </li>
                              )}
                              {publishType && (
                                <Button
                                  onClick={() =>
                                    handlEllipsisButtonClicked('downloadCSV')
                                  }
                                  className={classes.actionButton1}
                                  disabled={!canEdit}
                                  variant="contained"
                                  color="primary"
                                >
                                  Download CSV file
                                </Button>
                              )}
                              {canShowInfo && superAdmin && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('info')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canShowInfo}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Info']}
                                  </Button>
                                </li>
                              )}
                              {canNew && (
                                <li>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    style={{ marginBottom: 5 }}
                                    onClick={() =>
                                      handlEllipsisButtonClicked('new')
                                    }
                                    className={classes.actionButton1}
                                    color="primary"
                                  >
                                    {en['New']}
                                  </Button>
                                </li>
                              )}

                              {canRefresh && (
                                <Button
                                  onClick={() =>
                                    handlEllipsisButtonClicked('refresh')
                                  }
                                  className={classes.actionButton1}
                                  disabled={!canRefresh}
                                  variant="contained"
                                  color="primary"
                                >
                                  {en['Refresh']}
                                </Button>
                              )}

                              {canDownload && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('download')
                                    }
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Download Data']}
                                  </Button>
                                </li>
                              )}
                              {canCancel && (
                                <li>
                                  <Button
                                    onClick={() =>
                                      handlEllipsisButtonClicked('cancel')
                                    }
                                    className={classes.actionButton1}
                                    // startIcon={<Cancel />}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Cancel']}
                                  </Button>
                                </li>
                              )}
                              {canGallery ? (
                                <li>
                                  <Button
                                    onClick={setUpGallery}
                                    className={classes.actionButton1}
                                    disabled={!canEdit}
                                    variant="contained"
                                    color="primary"
                                  >
                                    {en['Galleries']}
                                  </Button>
                                </li>
                              ) : (
                                []
                              )}
                            </ul>
                          </div>
                        )}
                      </Grid>
                    )}

                    {!hasNoActions && isSmallScreen && (
                      <div className={classes.ellipsisDivider} />
                    )}

                    {pathName.includes('/materials') && isSmallScreen && (
                      <Grid
                        style={{
                          alignItems: 'center',
                          alignSelf: 'center',
                          marginBottom: 10,
                          width: '100%'
                        }}
                      >
                        <Button
                          onClick={handleClickView}
                          className={classes.actionButton1}
                          // startIcon={<CloudDownload />}
                          variant="contained"
                          color="primary"
                        >
                          {en['View']}
                        </Button>
                        {openViewMode && (
                          <Grid
                            // className={classes.root}
                            style={{
                              display: 'flex',
                              right: 5,
                              height: 36,
                              marginBottom: 20,
                              width: 160,
                              marginLeft: 20
                            }}
                          >
                            <ToggleButtonGroup
                              value={lessonViewMode}
                              exclusive
                              onChange={handleViewModeChange}
                              aria-label="view-mode"
                              style={{ paddingBottom: '1px' }}
                            >
                              <ToggleButton
                                value="list"
                                aria-label="left aligned"
                                classes={{ label: classes.toggleButton }}
                              >
                                List View
                              </ToggleButton>
                              <ToggleButton
                                value="card"
                                aria-label="centered"
                                classes={{ label: classes.toggleButton }}
                              >
                                Card View
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </Grid>
                        )}

                        {isSmallScreen && (
                          <div className={classes.insideEllipsisDivider} />
                        )}
                      </Grid>
                    )}
                    {isSmallScreen && (
                      <>
                        <Grid
                          container
                          direction="row"
                          alignItems="center"
                          style={{ justifyContent: 'center' }}
                        >
                          <Grid
                            style={{
                              alignItems: 'center',
                              alignSelf: 'center',
                              marginBottom: 10,
                              width: '100%'
                            }}
                          >
                            <StyledMenuItem>
                              <div onClick={handleClickSettings}>
                                <FontAwesomeIcon
                                  icon={faCog}
                                  size="xs"
                                  style={{ marginRight: 7 }}
                                />
                                {en['Settings']}
                              </div>
                            </StyledMenuItem>
                            {openSettings && (
                              <StyledMenuItem
                                onClick={() => {
                                  setMobildModeEllipsisClicked(false);
                                  setOpenSettingMoal(true);
                                }}
                                classes={{ root: classes.subMenuItem }}
                              >
                                {en['Config']}
                              </StyledMenuItem>
                            )}
                            {openSettings && (
                              <StyledMenuItem
                                classes={{ root: classes.subMenuItem }}
                                onClick={() => {
                                  setMobildModeEllipsisClicked(false);
                                  setOpenEULAModal(true);
                                }}
                              >
                                EULA
                              </StyledMenuItem>
                            )}
                            <StyledMenuItem onClick={onSignOut}>
                              <FontAwesomeIcon
                                icon={faSignOutAlt}
                                size="xs"
                                style={{ marginRight: 7 }}
                              />
                              {en['Logout']}
                            </StyledMenuItem>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </div>
              )}
            </Box>
          </ClickAwayListener>
        </div>
        {!(hideTitleOnMobile && isSmallScreen) && (
          <Divider className={classes.separator} />
        )}
        <main
          className={classes.main}
          style={{
            height: isSmallScreen
              ? page === 'Libraries' || page === 'Messages'
                ? 'calc(100vh - 211px)'
                : page === 'Tutorials'
                ? 'calc(100vh - 193px)'
                : page === 'Resources'
                ? 'calc(100vh - 259px)'
                : page === 'Galleries'
                ? 'calc(100vh - 245px)'
                : 'calc(100vh - 206px)'
              : page === 'Resources'
              ? 'calc(100vh - 216px)'
              : 'calc(100vh - 189px)'
          }}
        >
          {children}
        </main>
        <CustomModal
          icon={
            <FontAwesomeIcon
              icon={faCog}
              size="xs"
              style={{ marginRight: 7 }}
            />
          }
          title="Setting"
          Children={SettingForm}
          openModal={openSettingModal}
          setOpenModal={setOpenSettingMoal}
        />
        <EULAModal openModal={openEULAModal} setOpenModal={setOpenEULAModal} />
      </Box>
    </Box>
  );
};

export default EditPanel;
