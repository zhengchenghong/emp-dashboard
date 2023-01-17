import React, { useState, useEffect, useContext, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography
} from '@material-ui/core';
import useStyles from './style';
import clsx from 'clsx';
import { EditPanel } from '@app/components/Panels';
import { useMutation, useApolloClient } from '@apollo/client';
import { useUserContext } from '@app/providers/UserContext';
import {
  CustomInput,
  CustomDialog,
  CustomCheckBox
} from '@app/components/Custom';
import { useNotifyContext } from '@app/providers/NotifyContext';
import graphql from '@app/graphql';
import * as globalStyles from '@app/constants/globalStyles';
import JSONEditor from '@app/components/JSONEditor';
import { en } from '@app/language';
import { Auth } from 'aws-amplify';
import { getDisplayName, getAssetUrl, getUUID } from '@app/utils/functions';
import { deleteMMA } from '@app/utils/ApolloCacheManager';
import { getNotificationOpt } from '@app/constants/Notifications';

const schemaTypeList = [
  'station'
  // 'district',
  // 'school',
  // 'class',
  // 'material',
  // 'stationAdmin',
  // 'districtAdmin',
  // 'schoolAdmin',
  // 'educator',
  // 'student'
];

const ClearContainer = ({ history }) => {
  const classes = globalStyles.globaluseStyles();
  const classes1 = useStyles();
  const [currentUser] = useUserContext();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteDialogSetting, setDeleteDialogSetting] = useState({});
  const [buttonDisable, setButtonDisable] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { notify } = useNotifyContext();

  const [tutorial, setTutorial] = useState();

  const [canUpdate, setCanUpdate] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [isFileRemove, setFileRemove] = useState(false);

  const [state, setState] = useState({
    checkedAll: false
  });
  const [openDelete, setOpenDelete] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const client = useApolloClient();

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const [deleteMMAGrouping] = useMutation(graphql.mutations.deleteMMA, {
    update: deleteMMA
  });

  const getGrouping = (schemaType) => {
    if (schemaType) {
      if (schemaType === 'station') {
        return graphql.queries.StationGrouping;
      } else if (schemaType === 'district') {
        return graphql.queries.DistrictGrouping;
      } else if (schemaType === 'school') {
        return graphql.queries.SchoolGrouping;
      } else if (schemaType === 'class') {
        return graphql.queries.ClassGrouping;
      } else if (schemaType === 'material') {
        return graphql.queries.MaterialGrouping;
      } else {
        return graphql.queries.grouping;
      }
    } else {
      return graphql.queries.grouping;
    }
  };

  const handleEditPanelChange = async (type, additionalAction) => {
    if (type === 'submit') {
      if (state.checkedAll) {
        setOpenDelete(true);
      } else {
        console.log('check item');
      }
    }
  };

  const deleteHandle = async (children) => {
    return Promise.all(
      children.map(async (resource) => {
        try {
          await deleteDocument({
            variables: {
              id: resource['_id'],
              schemaType: resource.schemaType
            }
          });
        } catch (error) {
          console.error(error);
        }
      })
    );
  };

  const deleteMMAHandle = async (children, resource) => {
    return Promise.all(
      children.map(async (value) => {
        try {
          await deleteMMAGrouping({
            variables: {
              docId: resource._id,
              schemaType: resource.schemaType,
              uId: value.uId
            }
          });
        } catch (error) {
          console.error(error);
        }
      })
    );
  };

  const deleteAssetS3 = async (children) => {
    return Promise.all(
      children.map(async (resource) => {
        try {
          if (resource.avatar?.fileName) {
            const avatarURL = `${resource.avatar?.baseUrl}${resource.avatar?.fileDir}${resource.avatar?.fileName}`;
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      })
    );
  };

  const handleConfirmDeleteDialog = async (type, value) => {
    try {
      if (type === 'input') {
        setConfirmPassword(value);
        setDeleteDialogSetting({
          error: false,
          helpText: en['Please input the password. It is required'],
          autoFocus: true
        });
      }

      if (type === 'btnClick') {
        if (value) {
          if (!buttonDisable) {
            setLoading(true);
            await Auth.signIn(currentUser?.name, confirmPassword)
              .then(async (user) => {
                if (user) {
                  let { data } = await client.query({
                    query: getGrouping('station'),
                    variables: {
                      schemaType: 'station'
                    }
                  });
                  console.log(data);
                  if (data.grouping?.length > 0) {
                    for (const station of data.grouping) {
                      await deleteDocument({
                        variables: {
                          id: station._id,
                          schemaType: station.schemaType
                        }
                      });
                    }
                  }
                  const notiOps = getNotificationOpt(
                    'setting',
                    'success',
                    'delete'
                  );
                  notify(notiOps.message, notiOps.options);
                }
                setOpenConfirm(false);
              })
              .catch((e) => {
                console.log('sss', e);
                if (e.message.includes('Incorrect')) {
                  setDeleteDialogSetting({
                    error: true,
                    helpText: en['Incorrect password.'],
                    autoFocus: true
                  });
                }
              });
          }
          setConfirmPassword('');
          setButtonDisable(false);
          setLoading(false);
        } else {
          setOpenConfirm(false);
          setConfirmPassword('');
        }
      }
    } catch (error) {
      console.log(error.message);
      setConfirmPassword('');
      setButtonDisable(false);
      setOpenConfirm(false);
      if (error.message.includes('Name exists')) {
        setDeleteDialogSetting({
          error: true,
          helpText: en['Name exists already. Name must be unique.'],
          autoFocus: true
        });
      }
    }
  };

  const handleDeleteDialogChange = async (type, value) => {
    if (type === 'btnClick') {
      if (!checkbox && value) {
        // const notiOps = getNotificationOpt(
        //   resources.schemaType,
        //   'warning',
        //   'delete'
        // );
        // notify(notiOps.message, notiOps.options);
        return;
      }
      if (checkbox && value) {
        setOpenConfirm(true);
      }

      setCheckbox(false);
      setOpenDelete(false);
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <EditPanel
      title={'Clear'}
      page={'Clear'}
      canUpdate={canUpdate}
      onChange={handleEditPanelChange}
      canSubmit={true}
      canEdit={false}
    >
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        style={{ padding: 8 }}
      >
        <Grid item xs={12} style={{ paddingLeft: 16 }}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.checkedAll}
                  onChange={handleChange}
                  name="checkedAll"
                  color="primary"
                />
              }
              label="All"
            />
          </FormGroup>
        </Grid>
      </Grid>

      <CustomDialog
        open={openDelete}
        title={en['Do you want to delete Everything?']}
        mainBtnName={en['Remove']}
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">{en['remove station']}</Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>

      <CustomDialog
        mainBtnName={en['Remove All']}
        open={openConfirm}
        title={en[`Password Confirmation`]}
        onChange={handleConfirmDeleteDialog}
        buttonDisable={loading}
      >
        <CustomInput
          my={2}
          size="small"
          type="password"
          autoFocus={true}
          label={en[`Enter the password`]}
          value={confirmPassword}
          onChange={(value) => handleConfirmDeleteDialog('input', value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleConfirmDeleteDialog('btnClick', event.target.value);
            }
          }}
          error={deleteDialogSetting.error}
          helperText={deleteDialogSetting.helpText}
          variant="outlined"
          width="300px"
          fullWidth={true}
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
          <JSONEditor disable={false} resources={tutorial} />
        </Grid>
      </CustomDialog>
    </EditPanel>
  );
};

export default withRouter(ClearContainer);
