/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Button,
  Select,
  InputLabel,
  MenuItem,
  DialogContentText,
  FormControl,
  ListItemText,
  Input,
  Grid,
  Box
} from '@material-ui/core';
import graphql from '@app/graphql';
import { useLazyQuery } from '@apollo/client';
import USStates from '@app/constants/states.json';
import { ImageList } from '@app/components/GalleryPanel';
import { AvatarUploadForm } from '@app/components/Forms';
import { useGalleryContext } from '@app/providers/GalleryContext';
import { useStyles } from './style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { getDisplayName } from '@app/utils/functions';
import resource from '@app/constants/Notifications/resource';
import { getGroupingByVariables } from '@app/utils/hooks/form';

const MenuProps = {
  PaperProps: {
    style: {
      // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
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

const TopologyInput = ({ name, onChange, data, defaultValue }) => {
  const isData = () => {
    return data && data.length > 0;
  };
  return (
    <FormControl style={{ width: '100%' }}>
      <InputLabel id="demo-simple-select-label" style={{ marginBottom: 5 }}>
        {name}
      </InputLabel>
      {isData() ? (
        <Select
          id="user-type-selector"
          defaultValue={defaultValue}
          style={{ minWidth: '80px', width: '100%' }}
          placeholder="sas"
          onChange={onChange}
        >
          {data?.map((item, index) => (
            <MenuItem value={item.value} key={index}>
              {getDisplayName(item.label)}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Select
          disabled="true"
          id="user-type-selector"
          style={{ minWidth: '80px', width: '100%' }}
          placeholder="sas"
        ></Select>
      )}
    </FormControl>
  );
};

const ConfirmDialogue = (props) => {
  const classes = useStyles();
  const { onClose, open, onYes, onNo } = props;

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

const EditUserDialog = ({
  open,
  type,
  resources,
  isUserMenu,
  stationLoadedData,
  classLoadedData,
  studentClasses,
  schoolData,
  onChange,
  onSaveChange,
  onInputChange,
  hasTypeField,
  userTypeData: utData,
  selectOpen,
  setSelectOpen,
  displayStudents,
  isAvatarUpload,
  setAvatarUpload,
  filterUser,
  topology,
  topologyEidt
}) => {
  const classes = useStyles();
  const nameRef = useRef();
  const [selectedData, setSelectedData] = useState({
    district: null,
    state: null,
    school: null,
    station: null
  });
  const { setGalleryChildren, setGalleryData } = useGalleryContext();
  const [closePrompt, setClosePrompt] = useState(false);
  const [rowData, setRowData] = useState({});
  const [stationId, setStationId] = useState();
  // const [isAvatarUpload, setAvatarUpload] = useState(false);
  const [isAvatarAttached, setAvatarAttached] = useState(false);
  const [avatarS3URL, setAvatarS3URL] = useState();
  const [userTypeData, setUserTypeData] = useState();
  const [allDevices, setAllDevices] = useState();
  const [selectedDevice, setSelectedDevice] = useState();
  const [updateData, setUpdateData] = useState({
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    // phone: null,
    parentId: null,
    avatar: null,
    childrenIdList: [],
    status: null,
    state: null,
    station: null,
    school: null,
    district: null,
    class: null,
    imageSize: null
  });
  const [isFileRemove, setFileRemove] = useState(false);

  const allDevicesVariable = {
    schemaType: 'device',
    parentId: resources?.station
  };

  const [
    allDeviceRefetch,
    { loading: allDevicesLoading, error: allDevicesError, data: allDevicesData }
  ] = useLazyQuery(getGroupingByVariables(allDevicesVariable), {
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (type && utData && resources) {
      if (
        type === 'schoolAdmin' &&
        resources?.topology?.district &&
        resources?.topology?.station
      ) {
        const filteredSchools = utData.filter(
          (item) =>
            item.topology?.district === resources?.district ||
            item.topology?.district === resources?.topology?.district
        );
        setUserTypeData(filteredSchools);
      } else {
        setUserTypeData(utData);
      }
    }
  }, [utData, type, resources]);

  useEffect(() => {
    if (resources) {
      setRowData(resources);
      setSelectedData({
        district: resources?.district,
        station: resources?.station,
        state: resources?.state,
        school: resources?.school
      });
      setUpdateData({
        id: resources?.id,
        name: resources?.name,
        firstName: resources?.firstName,
        lastName: resources?.lastName,
        email: resources?.email,
        // phone: resources?.phone,
        parentId: resources?.parentId,
        avatar: resources?.avatar,
        childrenIdList: resources?.childrenIdList,
        status: resources?.status,
        district: resources?.district,
        station: resources?.station,
        state: resources?.state,
        school: resources?.school,
        class: resources?.class,
        imageSize: resources?.imageSize
      });
      if (resources?.station) {
        setStationId(resources?.station);
      } else {
        setStationId(resources?.topology?.station);
      }
    }
  }, [resources]);

  const setUpdateDataInfo = (key, value, rowId) => {
    if (
      key === 'parentId' &&
      ['stationAdmin', 'districtAdmin', 'schoolAdmin'].includes(type)
    ) {
      let selectedStation = utData.find((item) => item.value === value);
      if (type === 'stationAdmin') {
        setUpdateData({
          ...updateData,
          parentId: value,
          station: value,
          state: selectedStation?.topology?.state
            ? selectedStation?.topology?.state
            : updateData?.topology?.state,
          topology: {
            state: selectedStation?.topology?.state
              ? selectedStation?.topology?.state
              : updateData?.topology?.state,
            station: value,
            district: updateData?.topology?.district,
            school: updateData?.topology?.school,
            class: updateData?.topology?.class
          }
        });
      } else if (type === 'districtAdmin') {
        let selectedData = utData.find((item) => item.value === value);

        setUpdateData({
          ...updateData,
          parentId: value,
          district: value,
          state: selectedData?.topology?.state
            ? selectedData?.topology?.state
            : updateData?.topology?.state,
          station: selectedData?.topology?.station
            ? selectedData?.topology?.station
            : updateData?.topology?.station,
          topology: {
            state: selectedData?.topology?.state
              ? selectedData?.topology?.state
              : updateData?.topology?.state,
            station: selectedData?.topology?.station
              ? selectedData?.topology?.station
              : updateData?.topology?.station,
            district: value,
            school: updateData?.topology?.school,
            class: updateData?.topology?.class
          }
        });
      } else if (type === 'schoolAdmin') {
        let selectedData = utData.find((item) => item.value === value);
        setUpdateData({
          ...updateData,
          parentId: value,
          school: value,
          state: selectedData?.topology?.state
            ? selectedData?.topology?.state
            : updateData?.topology?.state,
          station: selectedData?.topology?.station
            ? selectedData?.topology?.station
            : updateData?.topology?.station,
          district: selectedData?.topology?.district
            ? selectedData?.topology?.district
            : updateData?.topology?.district,
          topology: {
            state: selectedData?.topology?.state
              ? selectedData?.topology?.state
              : updateData?.topology?.state,
            station: selectedData?.topology?.station
              ? selectedData?.topology?.station
              : updateData?.topology?.station,
            district: selectedData?.topology?.district
              ? selectedData?.topology?.district
              : updateData?.topology?.district,
            school: value,
            class: updateData?.topology?.class
          }
        });
      }
    } else if (
      key === 'childrenIdList' &&
      ['student', 'educator'].includes(type)
    ) {
      let currentDistrict = utData.find(
        (item) => item.topology?.district === updateData.parentId
      );
      let lastClassId = value?.length > 0 ? value[value?.length - 1] : null;
      let classData;
      if (lastClassId) {
        classData = classLoadedData?.find((item) => item.value === lastClassId);
      }

      let state =
        currentDistrict?.topology?.state &&
        currentDistrict?.topology?.state !== ''
          ? currentDistrict?.topology?.state
          : classData?.topology?.state && classData?.topology?.state !== ''
          ? classData?.topology?.state
          : updateData?.state;
      let station =
        currentDistrict?.topology?.station &&
        currentDistrict?.topology?.station !== ''
          ? currentDistrict?.topology?.station
          : classData?.topology?.station && classData?.topology?.station !== ''
          ? classData?.topology?.station
          : updateData?.station;
      let school = classData?.topology?.school;
      let classId = classData?.value;
      setUpdateData({
        ...updateData,
        childrenIdList: value,
        state,
        station,
        district: updateData?.district,
        school,
        class: classId,
        topology: {
          state,
          station,
          district: updateData?.parentId,
          school,
          class: classId
        }
      });
    } else if (key === 'intRef') {
      if (value === 'no device') {
        setSelectedDevice(null);
        setUpdateData({
          ...updateData,
          device: 'no device'
        });
      } else {
        setSelectedDevice(allDevices?.find((item) => item._id === value));
        setUpdateData({
          ...updateData,
          device: allDevices?.find((item) => item._id === value)
        });
      }
    } else {
      setUpdateData({
        ...updateData,
        [key]: value
      });
    }

    onInputChange(key, value, rowId);
  };

  const handleClose = () => {
    setClosePrompt(true);
    onChange(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChange(e);
    }
  };

  const handleChange = (additionalAction) => {
    if (isAvatarAttached) {
      setAvatarUpload(true);
      setAvatarAttached(false);
      // return;
    }
    onSaveChange('editSave', updateData, avatarS3URL, additionalAction);
  };

  const setGallery = () => {
    setGalleryData((data) => ({ ...data, title: 'Avatar Gallery' }));
    setGalleryChildren(<ImageList schemaType="stockAvatar" />);
  };

  const schoolVariables = {
    schemaType: 'school',
    parentId: selectedData?.district
  };

  const districtVariables = {
    schemaType: 'district',
    state: selectedData?.state
  };

  useEffect(() => {
    // fetchDistrict();
    // setSchoolLoadedData([]);
    setRowData((data) => ({ ...data, school: null, district: null }));
  }, [selectedData?.state]);

  const stateListFromTopology = stationLoadedData
    ?.map((item) => item?.topology?.state)
    ?.filter((item) => item !== null && item?.length > 0);

  const handleOnAvatarChange = (value) => {
    if (value === 'fileAttached') {
      setAvatarAttached(true);
      console.log('avatar attached');
    } else if (value === 'fileRemoved') {
      setAvatarAttached(false);
      setAvatarS3URL();
      setUpdateDataInfo('avatar', '', rowData?.id);
      console.log('avatar dettached');
      setFileRemove(true);
    } else {
      setUpdateDataInfo('avatar', value, rowData?.id);
      setAvatarS3URL(value);
    }
  };

  useEffect(() => {
    if (isFileRemove) {
      handleChange('fileRemoved');
      setFileRemove(false);
    }
  }, [isFileRemove]);

  useEffect(() => {
    if (isAvatarUpload) {
      handleChange();
      setAvatarUpload(false);
    }
  }, [avatarS3URL]);

  const getStatusList = () => {
    if (type === 'educator') {
      return [...[{ value: 'created', label: 'Created' }], ...statusTypeData];
    }

    return statusTypeData;
  };

  useEffect(() => {
    if (!allDevicesError && !allDevicesLoading && allDevicesData) {
      setAllDevices(allDevicesData.grouping);
    }
  }, [allDevicesLoading, allDevicesError, allDevicesData]);

  useEffect(() => {
    if ((allDevices, rowData)) {
      if (rowData?.intRef?._id) {
        setSelectedDevice(
          allDevices?.find((device) => device._id === rowData?.intRef?._id)
        );
      } else {
        setSelectedDevice(null);
      }
    }
  }, [allDevices, rowData]);

  useEffect(() => {
    if (type === 'student' && resources?.station) {
      allDeviceRefetch({
        variables: {
          schemaType: 'device',
          parentId: resources?.station
          // type: 'EDU'
        }
      });
    }
  }, [resources?.station]);

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
          Edit {displayLabel(type)}
        </DialogTitle>
        {!isUserMenu && (
          <Box className={classes.uploadFromContainer}>
            <AvatarUploadForm
              acceptedFiles={['image/png', 'image/jpg', 'image/jpeg']}
              resources={rowData?.avatar}
              title="Drag and Drop an image"
              customAction={() => setGallery()}
              onChange={(value) => handleOnAvatarChange(value)} //onInputChange('avatar', value, rowData?.id)}
              disableGray
              docId={resources?.id}
              doc={resources}
              type={type === 'student' ? 'student' : 'user'}
              stationId={stationId}
              isUpload={isAvatarUpload}
              setUpload={setAvatarUpload}
              setAvatarSize={(value) => {
                setUpdateDataInfo('imageSize', value, rowData?.id);
              }}
            />
          </Box>
        )}

        <DialogContent dividers>
          <TextField
            label={type === 'schoolAdmin' ? 'Email' : 'User name/Email'}
            className={classes.createInput}
            defaultValue={rowData?.name}
            onChange={(e) =>
              setUpdateDataInfo('name', e.target.value, rowData?.id)
            }
            style={{ minWidth: '275px', maxWidth: '400px' }}
            disabled={true}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="First name"
            className={classes.createInput}
            defaultValue={rowData?.firstName}
            onChange={(e) =>
              setUpdateDataInfo('firstName', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="Last name"
            className={classes.createInput}
            defaultValue={rowData?.lastName}
            onChange={(e) =>
              setUpdateDataInfo('lastName', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          {isUserMenu && (
            <TextField
              label="Contact Email"
              className={classes.createInput}
              defaultValue={rowData?.email}
              onChange={(e) =>
                setUpdateDataInfo('email', e.target.value, rowData?.id)
              }
              onKeyDown={(e) => handleKeyPress(e)}
            />
          )}
          {topologyEidt &&
          hasTypeField &&
          !filterUser &&
          type !== 'student' &&
          type !== 'educator' ? (
            <>
              <FormControl
                className={classes.createInput}
                style={{ width: '100%' }}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginBottom: 5 }}
                >
                  {dropDownLabel(type)}
                </InputLabel>
                <Select
                  labelId="demo-mutiple-chip-label"
                  id="user-type-selector"
                  defaultValue={rowData?.parentId}
                  style={{ minWidth: '80px', width: '100%' }}
                  onChange={(e) =>
                    setUpdateDataInfo('parentId', e.target.value, rowData?.id)
                  }
                  onKeyDown={(e) => handleKeyPress(e)}
                >
                  {userTypeData?.map((item, index) => (
                    <MenuItem
                      value={type === 'stationAdmin' ? item['_id'] : item.value}
                      key={index}
                      selected={
                        type === 'stationAdmin'
                          ? resources?.parentId === item['_id']
                          : resources?.parentId === item.value
                      }
                    >
                      {item.name ? item.name : getDisplayName(item.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            []
          )}
          {topologyEidt &&
          hasTypeField &&
          (type === 'student' || type === 'educator') ? (
            <>
              <FormControl style={{ width: '100%' }}>
                <InputLabel
                  id={'demo-simple-select-label'}
                  style={{ marginBottom: 5 }}
                >
                  Classes
                </InputLabel>
                <Select
                  labelId={'demo-mutiple-chip-label-'}
                  id={'demo-mutiple-chip-'}
                  multiple={true}
                  open={selectOpen}
                  onOpen={() => setSelectOpen(true)}
                  onClose={() => setSelectOpen(false)}
                  value={studentClasses[rowData?.id] || []}
                  // value={[]}
                  onChange={(e) => {
                    setUpdateDataInfo(
                      'childrenIdList',
                      e.target.value?.filter((item) => item),
                      rowData?.id
                    );
                    // console.log(e.target.value?.filter(item => item));
                  }}
                  input={<Input id={'demo-mutiple-chip-'} />}
                  renderValue={(selected) => displayStudents(selected)}
                  MenuProps={MenuProps}
                  style={{ maxWidth: '400px' }}
                  onKeyDown={(e) => handleKeyPress(e)}
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
                      schoolData[rowData?.id]
                        ? schoolData[rowData?.id].indexOf(item.value) > -1
                        : false
                    )
                    .map((item, index) => (
                      <MenuItem key={index} value={item.value}>
                        <ListItemText primary={getDisplayName(item.label)} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </>
          ) : (
            []
          )}

          {type === 'educator' ? (
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
                  Status
                </InputLabel>
                <Select
                  id="status-type-selector"
                  defaultValue={rowData.status}
                  style={{ minWidth: '80px', maxWidth: '400px' }}
                  onChange={(e) =>
                    setUpdateDataInfo('status', e.target.value, rowData?.id)
                  }
                  input={<Input id="select-multiple-chip" />}
                >
                  {getStatusList().map((item, index) => (
                    <MenuItem
                      value={item.value}
                      key={index}
                      selected={rowData.status === item.value}
                    >
                      {/* {item.label} */}
                      <ListItemText primary={item.label} />
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
                disabled={allDevices == null || allDevices?.length === 0}
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
                  defaultValue={rowData.intRef?._id}
                  style={{ minWidth: '80px', maxWidth: '400px' }}
                  onChange={(e) =>
                    setUpdateDataInfo('intRef', e.target.value, rowData?.id)
                  }
                  value={selectedDevice?._id}
                  input={<Input id="select-multiple-chip" />}
                >
                  <MenuItem
                    value={'no device'}
                    key={allDevices?.length + 1}
                    // selected={rowData.intRef?._id === item._id}
                  >
                    {'No Device'}
                  </MenuItem>
                  {allDevices?.map((item, index) => (
                    <MenuItem
                      value={item._id}
                      key={index}
                      selected={rowData.intRef?._id === item._id}
                    >
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
          >
            Save
          </Button>
          <Button
            autoFocus
            onClick={() => onChange('close', false)}
            className={classes.dialogAddBtn}
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

export default EditUserDialog;
