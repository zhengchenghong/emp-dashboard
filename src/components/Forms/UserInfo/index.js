import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton
} from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { useInput } from '@app/utils/hooks/form';
import { LoadingCard } from '@app/components/Cards';
import { getNotificationOpt } from '@app/constants/Notifications';
import graphql from '@app/graphql';
import useStyles from './style';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';

const UserInfoForm = ({ resources, onChange }) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const [loading, setLoading] = useState(false);
  const { value: name, setValue: setName, bind: bindName } = useInput('');
  const {
    value: firstName,
    setValue: setFirstName,
    bind: bindFirstName
  } = useInput('');
  const {
    value: lastName,
    setValue: setLastName,
    bind: bindLastName
  } = useInput('');
  // const { value: phone, setValue: setPhone, bind: bindPhone } = useInput('');
  const { value: email, setValue: setEmail, bind: bindEmail } = useInput('');
  const [currentUser] = useUserContext();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument);

  useEffect(() => {
    if (resources) {
      setName(resources.name);
      setFirstName(resources.contact?.firstName);
      setLastName(resources.contact?.lastName);
      // setPhone(resources.contact?.phone);
      setEmail(resources.contact?.email);
    }
  }, [resources]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateGrouping({
        variables: {
          id: resources['_id'],
          version: resources.version ? resources.version : 1,
          schemaType: resources.schemaType,
          name: name,
          trackingAuthorName: currentUser?.name,
          contact: { firstName, lastName, email }
        }
      });
      const notiOps = getNotificationOpt('userinfo', 'success', 'update');
      notify(notiOps.message, notiOps.options);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.message);
      const notiOps = getNotificationOpt('backend', 'error', 'update');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDocument({
        variables: {
          id: resources['_id'],
          schemaType: resources.schemaType
        }
      });
      const notiOps = getNotificationOpt('userinfo', 'success', 'delete');
      notify(notiOps.message, notiOps.options);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.message);
      const notiOps = getNotificationOpt('backend', 'error', 'delete');
      notify(notiOps.message, notiOps.options);
    }
  };

  return (
    <LoadingCard loading={loading} style={classes.root}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">User Information</Typography>
        <IconButton onClick={() => onChange('delete')}>
          <ClearIcon />
        </IconButton>
      </Box>

      <TextField
        className={classes.textfield}
        label="name"
        {...bindName}
        type="text"
        variant="outlined"
        size="small"
      />
      <TextField
        className={classes.textfield}
        label="First Name"
        {...bindFirstName}
        type="text"
        variant="outlined"
        size="small"
      />
      <TextField
        className={classes.textfield}
        label="Last Name"
        {...bindLastName}
        type="text"
        variant="outlined"
        size="small"
      />
      <TextField
        className={classes.textfield}
        label="Email"
        {...bindEmail}
        type="email"
        variant="outlined"
        size="small"
      />
      <Box padding={2} textAlign="right">
        <Button variant="outlined" color="secondary" onClick={handleDelete}>
          Delete
        </Button>

        <Button
          variant="contained"
          className={classes.saveButton}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </LoadingCard>
  );
};

export default UserInfoForm;
