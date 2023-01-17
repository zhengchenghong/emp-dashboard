/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withStyles } from '@material-ui/core/styles';
import { useLazyQuery, useMutation } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import graphql from '@app/graphql';
import { useMediaQuery } from 'react-responsive';
import {
  faUser,
  faSignOutAlt,
  faCog,
  faFileImport,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useUserContext } from '@app/providers/UserContext';
import { useStateContext } from '@app/providers/StateContext';
import { getCurrentUTCTime } from '@app/utils/date-manager';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {
  Grid,
  Button,
  ListItemText,
  Menu,
  Typography,
  Box,
  MenuItem,
  IconButton
} from '@material-ui/core';
import useStyles from './style';
import { Auth } from 'aws-amplify';
import CustomModal from '@app/components/Modal';
import { CustomDialog, CustomSelectBox } from '@app/components/Custom';
import { AccessConfigForm } from '@app/components/Forms';
import SettingForm from './setting';
import { getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import EULAModal from '@app/components/Forms/EULAModal/EULAModal';
import { en } from '@app/language';
import { useMenuContext } from '@app/providers/MenuContext';
import { useSmallScreen } from '@app/utils/hooks';
import { useMediumScreen } from '@app/utils/hooks';
import { useMediumExtScreen } from '@app/utils/hooks';
import { clearLocalStorage, openPopupWindow } from '@app/utils/functions';
import { useSearchContext } from '@app/providers/SearchContext';

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

const types = {
  sysAdmin: 'stationAdmin',
  stationAdmin: 'districtAdmin',
  districtAdmin: 'schoolAdmin',
  schoolAdmin: 'educator'
};

const UserProfile = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const [
    currentUser,
    setCurrentUser,
    status,
    setStatus,
    userFirstName,
    setUserFirstName,
    userLastName,
    setUserLastName,
    currentUserRole,
    setCurrentUserRole,
    userAvarUrl,
    setUserAvatarUrl
  ] = useUserContext();
  const [user, setUser] = useState();
  const { notify } = useNotifyContext();
  const { openLessonNameSearch } = useSearchContext();
  const [schemaType, setSchemaType] = useState('sysAdmin');
  const [other, setOther] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [assetUrl, setAssetUrl] = useState(null);
  const [openSettingModal, setOpenSettingMoal] = useState(false);
  const [openEULAModal, setOpenEULAModal] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState();
  const [currentStation, setCurrentStation] = useState();
  const [districtAssetUrl, setDistrictAssetUrl] = useState(null);
  const isSmallScreen = useSmallScreen();
  const isMediumScreen = useMediumScreen();
  const isMediumExtScreen = useMediumExtScreen();
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
    isIngestGoogleClicked,
    setIngestGoogleClicked,
    isIngestCanvasClicked,
    setIngestCanvasClicked
  ] = useMenuContext();
  const [canvasList, setCanvasList] = useState([]);
  const [selectedCanvas, setSelectedCanvas] = useState();
  const [openCanvasSelect, setOpenCanvasSelect] = useState(false);
  const [openCanvasAdd, setOpenCanvasAdd] = useState(false);
  const [accessConfig, setAccessConfig] = useState({});
  const [authPopup, setAuthPopup] = useState(null);

  const [createGrouping] = useMutation(graphql.mutations.createGrouping);
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const [upsertTracking] = useMutation(graphql.mutations.upsertTracking);
  const [getData, { loading, data, error }] = useLazyQuery(
    graphql.queries.userGrouping
  );
  const [ingestGoogle] = useMutation(graphql.mutations.ingestGoogle);
  const [ingestCanvas] = useMutation(graphql.mutations.IngestCanvas);
  const [openAuthModal, setOpenAuthModal] = useState({
    open: false,
    type: 'google'
  });
  const [
    googleAuthUrl,
    { loading: authUrlLoading, error: authUrlError, data: authUrl }
  ] = useLazyQuery(graphql.queries.googleAuthUrl, {
    fetchPolicy: 'no-cache'
  });

  const [
    getCanvasAuthUrl,
    {
      loading: canvasAuthUrlLoading,
      error: canvasAuthUrlError,
      data: canvasAuthUrl
    }
  ] = useLazyQuery(graphql.queries.canvasAuthUrl, {
    fetchPolicy: 'no-cache'
  });

  const [
    getDistrictData,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getStationData,
    { loading: stationLoading, data: stationData, error: stationError }
  ] = useLazyQuery(graphql.queries.StationGrouping);

  const [
    getCanvasData,
    { loading: canvasLoading, error: canvasError, data: canvasData }
  ] = useLazyQuery(graphql.queries.grouping, {
    fetchPolicy: 'no-cache'
  });

  const fetchCanvasData = async () => {
    await getCanvasData({
      variables: {
        schemaType: 'accessConfig',
        parentId: currentUser?.topology?.district
      }
    });
  };

  useEffect(() => {
    if (!canvasLoading && !canvasError && canvasData) {
      const formatedCanvasList = canvasData.grouping.map((item) => {
        return {
          label: item.data.canvas.baseUrl,
          value: item.data.canvas.clientId,
          ...item.data
        };
      });
      setCanvasList(formatedCanvasList);
      setSelectedCanvas(formatedCanvasList[0]);
    }
  }, [canvasLoading, canvasError, canvasData]);

  useEffect(() => {
    if (!authUrlError && !authUrlLoading && authUrl) {
      console.log(authUrl);
      const { googleAuthUrl } = authUrl;
      if (authPopup) {
        authPopup.location.href = googleAuthUrl;
      }
    }
  }, [authUrlLoading, authUrlError, authUrl]);

  useEffect(() => {
    if (!canvasAuthUrlLoading && !canvasAuthUrlError && canvasAuthUrl) {
      console.log(canvasAuthUrl);
      const { canvasAuthUrl: authUrl } = canvasAuthUrl;
      let elDom = document.createElement('a');
      elDom.setAttribute('href', authUrl);
      elDom.setAttribute('download', '');
      elDom.setAttribute('rel', 'noopener noreferrer');
      elDom.setAttribute('target', '_blank');
      elDom.click();
    }
  }, [canvasAuthUrlLoading, canvasAuthUrlError, canvasAuthUrl]);

  useEffect(() => {
    if (!loading && !error && data) {
      const { grouping } = data;
      if (grouping.length) {
        setOther(grouping[0]);
        setCurrentUser(grouping[0]);
      } else {
        if (schemaType !== 'educator') {
          const nextSchemaType = types[schemaType];
          getData({
            variables: {
              name: user?.email,
              schemaType: nextSchemaType
            }
          });
          setSchemaType(nextSchemaType);
        }
      }
    }
  }, [loading, data, error]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      if (grouping.length) {
        setCurrentDistrict(grouping[0]);
      } else {
        setCurrentDistrict();
      }
    }
  }, [districtLoading, districtData, districtError]);

  useEffect(() => {
    if (!stationLoading && !stationError && stationData) {
      const { grouping } = stationData;
      if (grouping.length) {
        setCurrentStation(grouping[0]);
      } else {
        setCurrentStation();
      }
    }
  }, [stationLoading, stationData, stationError]);

  useEffect(() => {
    if (!currentUser?.loginInfo?.EULAsignedAt) return;
    const setLoggedTime = async () => {
      try {
        const timestamp = getCurrentUTCTime();
        const result = await updateGrouping({
          variables: {
            id: currentUser['_id'],
            schemaType: currentUser.schemaType,
            version: currentUser.version,
            trackingAuthorName: currentUser?.name,
            status: 'active',
            loginInfo: {
              EULAsignedAt: currentUser?.loginInfo?.EULAsignedAt,
              lastSeenAt: timestamp,
              count: currentUser?.loginInfo?.count
                ? parseInt(currentUser?.loginInfo?.count) + 1 + ''
                : '1'
            }
          }
        });

        if (
          currentUser.schemaType === 'educator' ||
          currentUser.schemaType === 'districtAdmin'
        ) {
          getDistrictData({
            variables: {
              id: currentUser.parentId,
              schemaType: 'district'
            }
          });
          getStationData({
            variables: {
              id: currentUser?.topology?.station,
              schemaType: 'station'
            }
          });
        } else {
          /*
          await upsertTracking({
            variables: {
              schemaType: 'tracking',
              name: 'signed_in',
              parent: {
                schemaType: currentUser?.schemaType,
                _id: currentUser?._id
              }
            }
          });
          */
        }

        localStorage?.setItem('saveLoginInfo', true);
        setStatus(false);

        if (result?.data?.updateGrouping) {
          setCurrentUser(result?.data?.updateGrouping);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (
      status &&
      currentUser &&
      currentUser.schemaType !== 'superAdmin' &&
      !localStorage?.getItem('saveLoginInfo', '')
    ) {
      setLoggedTime();
    }
    if (
      currentUser?.schemaType === 'educator' ||
      currentUser?.schemaType === 'districtAdmin'
    ) {
      getDistrictData({
        variables: {
          id: currentUser.parentId,
          schemaType: 'district'
        }
      });
      getStationData({
        variables: {
          id: currentUser?.topology?.station,
          schemaType: 'station'
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const loadUser = () => {
      return Auth.currentUserInfo({ bypassCache: true });
    };

    const loadFederatedUser = () => {
      return Auth.currentAuthenticatedUser({ bypassCache: true });
    };

    const onLoad = async () => {
      try {
        let currentUser = await loadUser();
        if (!currentUser?.attributes) {
          const federatedInfo = await loadFederatedUser();
          currentUser = {
            attributes: federatedInfo?.signInUserSession?.idToken?.payload
          };
        }
        setUser(currentUser?.attributes);
        console.log('currentUser', currentUser);
        if (
          currentUser?.attributes['custom:userrole']?.toLowerCase() !==
          'superadmin'
        ) {
          getData({
            variables: {
              name: currentUser?.attributes?.email,
              schemaType
            }
          });
        } else {
          setCurrentUser({
            schemaType: 'superAdmin',
            name: currentUser?.attributes?.email
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    onLoad();
    fetchCanvasData();
  }, []);

  useEffect(async () => {
    if (String(other?.avatar?.baseUrl).includes('http')) {
      const url =
        other?.avatar?.baseUrl +
        other?.avatar?.fileDir +
        other?.avatar?.fileName;
      const assetUrl = await getAssetUrlFromS3(url, 0);
      setAssetUrl(assetUrl);
      setUserAvatarUrl(assetUrl);
    } else {
      setAssetUrl(other?.avatar?.baseUrl);
      setUserAvatarUrl(other?.avatar?.baseUrl);
    }
  }, [other?.avatar?.baseUrl]);

  useEffect(async () => {
    if (String(currentDistrict?.avatar?.baseUrl).includes('http')) {
      const url =
        currentDistrict?.avatar?.baseUrl +
        currentDistrict?.avatar?.fileDir +
        currentDistrict?.avatar?.fileName;
      const assetUrl = await getAssetUrlFromS3(url, 0);
      setDistrictAssetUrl(assetUrl);
    } else {
      setDistrictAssetUrl(currentDistrict?.avatar?.baseUrl);
    }
  }, [currentDistrict]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const getAuthGoogle = async () => {
    const popup = openPopupWindow('', 'Google Auth');
    setAuthPopup(popup);
    await googleAuthUrl();
    setOpenAuthModal({ open: false, type: 'google' });
  };

  const getAuthCanvas = async () => {
    // await getCanvasAuthUrl();
    setOpenAuthModal({ open: false, type: 'canvas' });
    setOpenCanvasSelect(true);
  };

  const handleConfirmIngest = (type, value) => {
    if (value) {
      if (openAuthModal.type === 'google') {
        getAuthGoogle();
      }

      if (openAuthModal.type === 'canvas') {
        getAuthCanvas();
      }
    } else {
      setOpenAuthModal({ open: false, type: openAuthModal.type });
    }
  };

  const ingestGoogleClasses = async (type) => {
    if (
      currentUser?.data?.google_auth == null ||
      currentUser?.data?.google_auth?.expiry_date == null ||
      !currentUser?.data?.google_auth?.refresh_token
    ) {
      const notiOps = getNotificationOpt(
        'googleClass',
        'warning',
        'impossibleAdmin'
      );
      notify(notiOps.message, notiOps.options);
      setOpenAuthModal({ open: true, type: 'google' });
      return;
    }
    const expireDate = new Date(currentUser.data?.expiry_date);
    const isExpired = expireDate < new Date();
    // if (isExpired) {
    //   const notiOps = getNotificationOpt(
    //     'googleClass',
    //     'warning',
    //     'expiredAdmin'
    //   );
    //   notify(notiOps.message, notiOps.options);
    //   return;
    // }
    const response = await ingestGoogle({
      variables: {
        userId: currentUser._id
      }
    });
    const notiOps = getNotificationOpt('googleClass', 'success', 'import');
    notify(notiOps.message, notiOps.options);
  };

  const ingestCanvasClasses = async (type) => {
    if (
      currentUser?.data?.canvas_auth == null ||
      !currentUser?.data?.canvas_auth?.refresh_token
    ) {
      const notiOps = getNotificationOpt(
        'school',
        'warning',
        'validCanvasAdmin'
      );
      notify(notiOps.message, notiOps.options);
      setOpenAuthModal({ open: true, type: 'canvas' });
      return;
    }
    // const expireDate = new Date(currentUser.data?.canvas_auth?.expires_in);
    // const isExpired = expireDate < new Date();
    const response = await ingestCanvas({
      variables: {
        userId: currentUser._id
      }
    });
    const notiOps = getNotificationOpt('school', 'success', 'import');
    notify(notiOps.message, notiOps.options);
  };

  const handleClickSettings = (event) => {
    setOpenSettings(!openSettings);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenSettings(false);
  };

  const onSignOut = async () => {
    setStatus(true);
    await Auth.signOut();
    clearLocalStorage();
    localStorage.removeItem('ConfigParams');
    window.sessionStorage.setItem('last_path', window.location.pathname);
    window.sessionStorage.setItem('user_name', currentUser?.name);
    setCurrentUser(null);
    history.push('/');
  };

  let firstName = !user
    ? ''
    : user['custom:firstName']
    ? user['custom:firstName']
    : other?.contact?.firstName
    ? other?.contact?.firstName
    : '';

  let lastName = !user
    ? ''
    : user['custom:lastName']
    ? user['custom:lastName']
    : other?.contact?.lastName
    ? other?.contact?.lastName
    : '';
  let userRole = !user
    ? ''
    : user['custom:userrole']
    ? user['custom:userrole']
    : other?.schemaType
    ? other?.schemaType
    : '';
  useEffect(async () => {
    let firstName = !user
      ? ''
      : user['custom:firstName']
      ? user['custom:firstName']
      : other?.contact?.firstName
      ? other?.contact?.firstName
      : '';
    setUserFirstName(firstName);
    let lastName = !user
      ? ''
      : user['custom:lastName']
      ? user['custom:lastName']
      : other?.contact?.lastName
      ? other?.contact?.lastName
      : '';
    setUserLastName(lastName);
    let userRole = !user
      ? ''
      : user['custom:userrole']
      ? user['custom:userrole']
      : other?.schemaType
      ? other?.schemaType
      : '';
    setCurrentUserRole(userRole);
  }, [user, other]);

  useEffect(() => {
    if (isIngestGoogleClicked) {
      ingestGoogleClasses('ingest');
      setIngestGoogleClicked(false);
    }
  }, [isIngestGoogleClicked]);

  useEffect(() => {
    if (isIngestCanvasClicked) {
      ingestCanvasClasses('ingest');
      setIngestCanvasClicked(false);
    }
  }, [isIngestCanvasClicked]);

  const handleDrawerClose = () => {
    setMobildModeEllipsisClicked(!isMobildModeEllipsisClicked);
  };

  const handleCanvasSelectConfirm = async (type, value) => {
    if (value && currentUser) {
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
            await fetchCanvasData();
          }
          setOpenCanvasAdd(false);
        } else {
          await updateGrouping({
            variables: {
              id: currentUser._id,
              schemaType: currentUser.schemaType,
              version: currentUser.version,
              data: {
                ...currentUser.data,
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
            currentUser._id;
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
        setOpenCanvasAdd(false);
        const notiOps = getNotificationOpt('user', 'error', 'name');
        notify(err?.message, notiOps.options);
      }
    } else {
      // if (type === 'btnClick') {
      //   if (openCanvasAdd) {
      //     setOpenCanvasAdd(false);
      //   } else {
      //     setOpenCanvasAdd(true);
      //   }
      // } else {
      setOpenCanvasSelect(false);
      setOpenCanvasAdd(false);
      // }
    }
  };

  const handleAccessConfigInput = (type, value) => {
    console.log('accessConfig', accessConfig);
    setAccessConfig({
      ...accessConfig,
      [type]: value
    });
  };

  return (
    <>
      {!isSmallScreen ? (
        <>
          {currentUser?.schemaType === 'educator' && !openLessonNameSearch && (
            <Grid
              className={classes.root}
              style={{ position: 'absolute', display: 'flex' }}
            >
              {districtAssetUrl && (
                <Grid
                  item
                  container
                  justifyContent="center"
                  style={{
                    marginRight: '10px',
                    width: 40,
                    display: 'flex',
                    alignContent: 'center'
                  }}
                >
                  <img
                    src={districtAssetUrl}
                    style={{ width: 35, height: 35, borderRadius: '50%' }}
                    alt=""
                  />
                </Grid>
              )}
              <Grid
                item
                container
                justifyContent="center"
                style={{
                  margin: 'auto',
                  maxHeight: 36,
                  maxWidth: 320,
                  fontSize: '13px'
                }}
              >
                {currentDistrict?.name}
              </Grid>
            </Grid>
          )}
          <Grid className={classes.root}>
            <Grid
              container
              direction="row"
              alignItems="center"
              style={{ flexWrap: 'nowrap' }}
            >
              <Grid item container justifyContent="center">
                {assetUrl ? (
                  <img
                    title={user?.email}
                    src={assetUrl}
                    style={{ width: 35, height: 35, borderRadius: '50%' }}
                    alt=""
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUser}
                    size="lg"
                    color={theme.palette.primary.contrastText}
                    title={user?.email}
                    style={{
                      background: '#b0bec5',
                      borderRadius: '100%',
                      padding: 10,
                      width: 35,
                      height: 35,
                      marginLeft: 10,
                      boxSizing: 'inherit'
                    }}
                  />
                )}
              </Grid>
              {user ? (
                <Grid style={{ display: 'flex', alignItems: 'center' }}>
                  <Grid style={{ paddingLeft: 5, paddingRight: 4 }}>
                    <ListItemText
                      primary={`${firstName} ${lastName}`}
                      classes={{ primary: classes.userNameText }}
                    />
                    <ListItemText
                      primary={userRole}
                      classes={{ primary: classes.roleText }}
                    />
                  </Grid>
                </Grid>
              ) : (
                []
              )}

              <Grid>
                <IconButton onClick={handleClick}>
                  <ArrowDropDownIcon />
                </IconButton>
                <StyledMenu
                  id="customized-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  style={{ zIndex: 1400 }}
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
                        handleClose();
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
                        handleClose();
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
                </StyledMenu>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <IconButton
            className={classes.actionGroup}
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
        </>
      )}
      <CustomModal
        icon={
          <FontAwesomeIcon icon={faCog} size="xs" style={{ marginRight: 7 }} />
        }
        title="Setting"
        Children={SettingForm}
        openModal={openSettingModal}
        setOpenModal={setOpenSettingMoal}
      />
      <CustomDialog
        mainBtnName={'Login'}
        open={openAuthModal.open}
        title={en['Import Class?']}
        onChange={handleConfirmIngest}
      >
        <Typography variant="h6">
          {`You didn\'t log in to ${openAuthModal.type} yet. Please login first and allow to access your data.`}
        </Typography>
      </CustomDialog>
      <EULAModal openModal={openEULAModal} setOpenModal={setOpenEULAModal} />
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
          <CustomSelectBox
            variant="outlined"
            addMarginTop={true}
            style={classes.selectFilter}
            value={selectedCanvas?.value}
            resources={canvasList}
            onChange={(data) => {
              console.log('selected Canvas:', data);
              const selected = canvasList.find(
                (item) => item.value === data.value
              );
              setSelectedCanvas(selected);
            }}
            size="small"
          />
        ) : (
          <AccessConfigForm
            onInputChange={handleAccessConfigInput}
            canvas={accessConfig}
          />
        )}
      </CustomDialog>
    </>
  );
};

export default React.memo(UserProfile);
