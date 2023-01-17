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
  CircularProgress,
  FormControl,
  ListItemText,
  Input
} from '@material-ui/core';
import { useStyles } from './style';
import { en } from '@app/language';

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
  onChange,
  onSaveChange,
  isUserCreating
}) => {
  const classes = useStyles();
  const nameRef = useRef();
  const [rowData, setRowData] = useState({});
  const [updateData, setUpdateData] = useState({
    name: null,
    desc: null
  });
  const [modelMake, setModelMake] = useState();
  const [modelNumber, setModelNumber] = useState();

  useEffect(() => {
    if (resources) {
      setRowData(resources);
      setUpdateData({
        ...resources,
        desc: {
          title: resources.desc?.title,
          short: resources.desc?.short,
          long: resources.desc?.long
        }
      });
      let modelInfo = resources.desc?.title;
      if (modelInfo?.split(':')?.length > 1) {
        let modelNumber =
          modelInfo?.split(':')[modelInfo?.split(':')?.length - 1];
        setModelNumber(modelNumber);
        setModelMake(modelInfo?.replace(':' + modelNumber, ''));
      } else if (modelInfo && modelInfo?.split(':')?.length === 1) {
        setModelNumber('');
        setModelMake(modelInfo);
      } else {
        setModelNumber('');
        setModelMake('');
      }
    }
  }, [resources]);

  const setUpdateDataInfo = (key, value, rowId) => {
    if (key === 'name') {
      setUpdateData({
        ...updateData,
        desc: {
          ...updateData?.desc,
          short: value
        }
      });
    }
    if (key === 'modelMake') {
      setUpdateData({
        ...updateData,
        desc: {
          ...updateData?.desc,
          title: value + ':' + modelNumber
        }
      });
      setModelMake(value);
    }
    if (key === 'modelNumber') {
      setUpdateData({
        ...updateData,
        desc: {
          ...updateData?.desc,
          title: modelMake + ':' + value
        }
      });
      setModelNumber(value);
    }
    if (key === 'serialNumber') {
      setUpdateData({
        ...updateData,
        name: value
      });
    }
    if (key === 'wifiPassword') {
      setUpdateData({
        ...updateData,
        desc: {
          ...updateData?.desc,
          long: value
        }
      });
    }
  };

  const handleClose = () => {
    onChange(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChange(e);
    }
  };

  const handleChange = () => {
    onSaveChange('editSave', updateData);
  };

  const getStatusList = () => {
    if (type === 'educator') {
      return [...[{ value: 'created', label: 'Created' }], ...statusTypeData];
    }
    return statusTypeData;
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
          Edit Device
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label={en['Manufacturer']}
            className={classes.createInput}
            defaultValue={rowData?.desc?.short}
            onChange={(e) =>
              setUpdateDataInfo('name', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="Make"
            className={classes.createInput}
            defaultValue={modelMake}
            value={modelMake}
            onChange={(e) =>
              setUpdateDataInfo('modelMake', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label={en['Model']}
            className={classes.createInput}
            defaultValue={modelNumber}
            value={modelNumber}
            onChange={(e) =>
              setUpdateDataInfo('modelNumber', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="Serial Number"
            className={classes.createInput}
            defaultValue={rowData?.name}
            onChange={(e) =>
              setUpdateDataInfo('serialNumber', e.target.value, rowData?.id)
            }
            style={{ minWidth: '275px', maxWidth: '400px' }}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <TextField
            label="WiFi Password"
            className={classes.createInput}
            defaultValue={rowData?.desc?.long}
            onChange={(e) =>
              setUpdateDataInfo('wifiPassword', e.target.value, rowData?.id)
            }
            onKeyDown={(e) => handleKeyPress(e)}
          />

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
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            []
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
            onClick={() => onChange('close', false)}
            className={classes.dialogAddBtn}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditUserDialog;
