import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  Select,
  Input,
  InputLabel,
  MenuItem,
  DialogContentText,
  FormControl,
  CircularProgress
} from '@material-ui/core';
import graphql from '@app/graphql';
import { useLazyQuery } from '@apollo/client';
import USStates from '@app/constants/states.json';
import { useInput } from '@app/utils/hooks/form';
import { ImageList } from '@app/components/GalleryPanel';
import { AvatarUploadForm } from '@app/components/Forms';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useStyles } from './style';
import { getDisplayName } from '@app/utils/functions';
import { useStateContext } from '@app/providers/StateContext';

const ConfirmDialogue = (props) => {
  const { open, onYes, onNo } = props;

  return (
    <Dialog
      aria-labelledby="confirm-dialog-title"
      open={open}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle id="confirm-dialog-title">Save your changes</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Will you discard your current changes?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onYes} color="default">
          Discard
        </Button>
        <Button onClick={onNo} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const dropDownLabel = (type) => {
  const label = {
    student: 'district',
    educator: 'district',
    districtAdmin: 'district',
    schoolAdmin: 'school',
    stationAdmin: 'station'
  };
  return label[type];
};

const displayLabel = (type) => {
  const label = {
    student: 'Student',
    educator: 'Educator',
    districtAdmin: 'District Administrator',
    schoolAdmin: 'School Administrator',
    stationAdmin: 'Station Administrator',
    sysAdmin: 'System Administrator'
  };
  return label[type];
};

const statusTypeData = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'delete', label: 'To be deleted' }
];

const getStructuredData = (data) => {
  return data?.map((item) => ({
    label: item?.name,
    value: item?._id
  }));
};

const CreateUserDialog = ({
  open,
  type,
  onChange,
  doc,
  currentMenu,
  isUserMenu,
  hasTypeField,
  userTypeData,
  filterUser,
  stationLoadedData,
  isAvatarAttached,
  setAvatarAttached,
  setAvatarURL: setAvatar,
  isAvatarUpload,
  setAvatarUpload = () => {},
  createdResponse,
  isUserCreating,
  setUserCreating,
  allDevices
}) => {
  const classes = useStyles();
  const nameRef = useRef();
  const [stationList, setStationList] = useState([]);
  const [districtLoadedData, setDistrictLoadedData] = useState([]);
  const [schoolLoadedData, setSchoolLoadedData] = useState([]);
  const { setGalleryChildren, setGalleryData } = useGalleryContext();
  const [closePrompt, setClosePrompt] = useState(false);
  const [imageSize, setImageSize] = useState();

  const [
    getDistrict,
    { loading: districtLoading, data: districtData, error: districtError }
  ] = useLazyQuery(graphql.queries.DistrictGrouping);

  const [
    getSchool,
    { loading: schoolLoading, data: schoolData, error: schoolError }
  ] = useLazyQuery(graphql.queries.SchoolGrouping);

  const {
    value: name,
    setValue: setName,
    reset: resetName,
    bind: bindName
  } = useInput('');
  const {
    value: avatarURL,
    setValue: setAvatarURL,
    reset: resetAvatarURL,
    bind: bindAvatarURL
  } = useInput('');
  const {
    value: firstName,
    reset: resetFirstName,
    setValue: setFirstName,
    bind: bindFirstName
  } = useInput('');
  const {
    value: lastName,
    reset: resetLastName,
    setValue: setLastName,
    bind: bindLastName
  } = useInput('');
  const {
    value: email,
    reset: resetEmail,
    setValue: setEmail,
    bind: bindEmail
  } = useInput('');

  const {
    value: parentId,
    reset: resetParentId,
    setValue: setParentId,
    bind: bindParentId
  } = useInput('');

  const {
    value: station,
    reset: resetStation,
    setValue: setStation,
    bind: bindStation
  } = useInput('');

  const {
    value: district,
    reset: resetDistrict,
    setValue: setDistrict,
    bind: bindDistrict
  } = useInput('');

  const {
    value: school,
    reset: resetSchool,
    setValue: setSchool,
    bind: bindSchool
  } = useInput('');

  const {
    value: state,
    reset: resetState,
    setValue: setState,
    bind: bindState
  } = useInput('');

  const {
    value: status,
    reset: resetStatus,
    setValue: setStatus,
    bind: bindStatus
  } = useInput(type === 'educator' ? 'created' : 'active');
  const {
    value: deviceId,
    reset: resetDeviceId,
    setValue: setDeviceId,
    bind: bindDeviceId
  } = useInput('');
  const {
    value: deviceType,
    reset: resetDeviceType,
    setValue: setDeviceType,
    bind: bindDeviceType
  } = useInput('');

  const schoolVariables = {
    schemaType: 'school',
    parentId: district
  };

  const districtVariables = {
    schemaType: 'district',
    parentId: station
  };

  const districtWithStateVariables = {
    schemaType: 'district',
    state: state
  };

  const fetchSchool = async () => {
    await getSchool({
      variables: schoolVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchDistrict = async () => {
    await getDistrict({
      variables: districtVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchDistrictWithState = async () => {
    await getDistrict({
      variables: districtWithStateVariables,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const onChangedState = (e) => {
    if (e.target.value === state) {
      return;
    }
    setState(e.target.value);
    setStation('');
    setDistrict('');
    setSchool('');
  };

  useEffect(() => {
    if (!schoolLoading && !schoolError && schoolData) {
      const { grouping } = schoolData;
      // setSchoolLoadedData(grouping);
      setSchoolLoadedData(getStructuredData(grouping));
    }
  }, [schoolLoading, schoolError, schoolData]);

  useEffect(() => {
    if (!districtLoading && !districtError && districtData) {
      const { grouping } = districtData;
      // setDistrictLoadedData(grouping);
      setDistrictLoadedData(getStructuredData(grouping));
    }
  }, [districtLoading, districtError, districtData]);

  const getStationList = () =>
    getStructuredData(
      stationLoadedData?.filter(
        (item) => item?.topology?.state && item?.topology?.state === state
      )
    );
  const [stateContext] = useStateContext();

  useEffect(() => {
    resetName();
    resetFirstName();
    resetLastName();
    // resetPhone();
    resetEmail();
    resetAvatarURL();
    resetStatus();
    setTimeout(() => {
      nameRef.current && nameRef.current.focus();
    }, 100);
  }, [open]);

  useEffect(() => {
    setTimeout(() => {
      if (isAvatarAttached) {
        nameRef.current && nameRef.current.focus();
      }
    }, 100);
  }, [isAvatarAttached]);

  useEffect(() => {
    if (!isUserMenu && state) {
      fetchDistrictWithState();
    } else if (state) {
      setStationList(getStationList());
      setDistrictLoadedData([]);
      setSchoolLoadedData([]);
    }
    if (type !== 'districtAdmin') {
      setStation('');
      setDistrict('');
      setSchool('');
    }
  }, [state]);

  useEffect(() => {
    if (!isUserMenu) {
      return;
    }
    if (station && station?.length > 0) {
      fetchDistrict();
    } else {
      setDistrictLoadedData([]);
      setSchoolLoadedData([]);
    }
    if (type !== 'districtAdmin') {
      setDistrict('');
      setSchool('');
    }
  }, [station]);

  useEffect(() => {
    if (district && district?.length > 0) {
      fetchSchool();
    } else {
      setSchoolLoadedData([]);
    }
  }, [district]);

  useEffect(() => {
    if (parentId !== '') {
      const { district } = stateContext;
      let dist = district.find((item) => item._id === parentId);
      if (dist) {
        setStation(dist?.topology?.station);
        setState(dist?.topology?.state);
      }
    }
  }, [parentId]);

  const handleClose = () => {
    if (name || firstName || lastName || email) {
      setClosePrompt(true);
      return;
    }
    onChange(false);
    resetParentId();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChange();
    }
  };

  const handleKeyDown = (key, value) => {
    if (key === 'Enter') {
      handleChange();
    }
  };

  const handleChange = () => {
    setUserCreating(true);
    const parent = type === 'schoolAdmin' ? school : district;
    const stateVal =
      state == null || state === '' ? doc?.topology?.state : state;
    onChange(true, {
      name,
      firstName,
      lastName,
      // phone,
      email,
      avatarURL,
      parentId: filterUser ? (doc?._id ? doc?._id : parent) : parentId,
      status:
        type === 'educator' ||
        type === 'student' ||
        type === 'districtAdmin' ||
        type === 'sysAdmin' ||
        type === 'schoolAdmin'
          ? 'created'
          : 'active',
      station: station,
      district: district,
      state: stateVal,
      school: school,
      deviceId,
      imageSize
    });
    resetParentId();
    setClosePrompt(false);
  };

  const setGallery = () => {
    setGalleryData((data) => ({ ...data, title: 'Avatar Gallery' }));
    setGalleryChildren(<ImageList schemaType="stockAvatar" />);
  };

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarURL();
      setAvatar();
      console.log('avatar dettached');
    } else {
      setAvatarURL(value);
      setAvatar(value);
    }
  };

  const getStatusList = () => {
    if (type === 'educator') {
      return [...[{ value: 'created', label: 'Created' }], ...statusTypeData];
    }

    return statusTypeData;
  };

  const handleNameChange = (e) => {
    setName(e.target.value.replace(/ /g, ''));
  };

  return (
    <>
      <Dialog
        maxWidth="xs"
        onClose={handleClose}
        open={open}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.dialogTitle} onClose={handleClose}>
          Add a new {displayLabel(type)}
        </DialogTitle>
        {!isUserMenu && (
          <Box className={classes.uploadFromContainer}>
            <AvatarUploadForm
              acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
              resources={avatarURL}
              title="Drag and Drop an image"
              customAction={() => setGallery()}
              onChange={(value) => handleOnAvatarChange(value)}
              type={type === 'student' ? 'student' : 'user'}
              stationId={doc ? doc.topology?.station : station}
              isUpload={isAvatarUpload}
              setUpload={setAvatarUpload}
              docId={createdResponse ? createdResponse._id : null}
              doc={createdResponse}
              setAvatarSize={setImageSize}
            />
          </Box>
        )}

        <DialogContent dividers>
          <TextField
            label={type === 'schoolAdmin' ? 'Email' : 'User name/Email'}
            className={classes.createInput}
            onChange={(e) => handleNameChange(e)}
            // {...bindName}
            value={name}
            inputRef={nameRef}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="First name"
            className={classes.createInput}
            onChange={(e) => setFirstName(e.target.value)}
            {...bindFirstName}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="Last name"
            className={classes.createInput}
            onChange={(e) => setLastName(e.target.value)}
            {...bindLastName}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          {isUserMenu ? (
            <TextField
              label="Contact Email"
              className={classes.createInput}
              onChange={(e) => setEmail(e.target.value)}
              {...bindEmail}
              onKeyDown={(e) => handleKeyPress(e)}
            />
          ) : (
            []
          )}

          {type === 'educator' ? (
            <>
              <FormControl
                className={classes.createInput}
                style={{ width: '100%' }}
                disabled={isUserCreating}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginBottom: 5 }}
                >
                  Status
                </InputLabel>
                <Select
                  id="status-type-selector"
                  defaultValue={type === 'educator' ? 'created' : 'active'}
                  style={{ minWidth: '80px' }}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {getStatusList().map((item, index) => (
                    <MenuItem
                      value={item.value}
                      key={index}
                      onKeyDown={(e) => handleKeyDown(e.key, index)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            []
          )}
          {hasTypeField && !filterUser ? (
            <>
              <FormControl style={{ width: '100%' }}>
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginBottom: 5 }}
                >
                  {dropDownLabel(type)}
                </InputLabel>
                <Select
                  id="user-type-selector"
                  style={{ minWidth: '80px', width: '100%' }}
                  placeholder="sas"
                  onChange={(e) => {
                    if (dropDownLabel(type) === 'station') {
                      setStation(e.target.value);
                    } else if (dropDownLabel(type) === 'district') {
                      setDistrict(e.target.value);
                    } else if (dropDownLabel(type) === 'school') {
                      setSchool(e.target.value);
                    }
                    setParentId(e.target.value);
                  }}
                >
                  {userTypeData?.map((item, index) => (
                    <MenuItem value={item.value} key={index}>
                      {getDisplayName(item.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            []
          )}
          {type === 'student' && (
            <>
              <FormControl
                className={classes.createInput}
                style={{ width: '100%' }}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginBottom: 5 }}
                  onKeyDown={(e) => handleKeyPress(e)}
                >
                  Device
                </InputLabel>
                <Select
                  id="status-type-selector"
                  // defaultValue={rowData.intRef?._id}
                  style={{ minWidth: '80px', maxWidth: '400px' }}
                  onChange={(e) => setDeviceId(e.target.value)}
                  // value={selectedDevice?._id}
                  input={<Input id="select-multiple-chip" />}
                >
                  {allDevices?.map((item, index) => (
                    <MenuItem value={item._id} key={index}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleChange}
            className={classes.dialogAddBtn}
            variant={'contained'}
            disabled={isUserCreating}
          >
            {isUserCreating ? <CircularProgress size={25} my={5} /> : 'Save'}
          </Button>
          <Button
            autoFocus
            onClick={() => onChange(false)}
            className={classes.dialogAddBtn}
            variant={'contained'}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialogue
        onYes={() => {
          setClosePrompt(false);
          onChange(false);
        }}
        onNo={handleChange}
        open={closePrompt}
      />
    </>
  );
};

export default CreateUserDialog;
