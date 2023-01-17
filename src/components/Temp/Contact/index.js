import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Box,
  Divider,
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import { Add, Delete, Save } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { DefaultCard } from '@app/components/Cards';
import { getNotificationOpt } from '@app/constants/Notifications';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './style';
import { useNotifyContext } from '@app/providers/NotifyContext';

const ContactForm = ({ resources, onChange, onDelete }) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const [formData, setFormData] = useState(() => resources);
  const [, updateComponent] = useState();
  const forceUpdateComponent = useCallback(() => updateComponent({}), []);

  useEffect(() => {
    setFormData(resources);
  }, [resources]);

  const handleInputChange = (type, event, index) => {
    const changeData = [...formData];
    const selectedItem = { ...changeData[index], [type]: event.target.value };
    changeData[index] = selectedItem;
    setFormData(changeData);
    forceUpdateComponent();
  };

  const handleAddContact = () => {
    setFormData([
      ...formData,
      {
        role: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        phone: '',
        sms: ''
      }
    ]);
  };
  const handleSave = (index) => {
    if (formData[index]['email']) {
      const email = formData[index]['email'];
      const sameEmailQuantity = formData.filter((item) => item.email === email);
      if (sameEmailQuantity.length > 1) {
        const notiOps = getNotificationOpt('district', 'warning', 'sameEmail');
        notify(notiOps.message, notiOps.options);
      } else {
        onChange(formData[index]);
      }
    } else {
      const notiOps = getNotificationOpt('district', 'warning', 'create');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleDelete = (value) => {
    if (formData[value]['id']) {
      onDelete(formData[value]);
    }
    const tmp = formData.filter((el, index) => index !== value);
    setFormData(tmp);
  };

  return (
    <DefaultCard className={classes.root}>
      <Box
        className={classes.header}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6">
          <FontAwesomeIcon icon={faIdCard} className={classes.icon} />
          Contact Information
        </Typography>
      </Box>
      <Divider className={classes.separator} />
      <main className={classes.content}>
        {formData &&
          formData.map((el, index) => {
            return (
              <div key={index} className={classes.elContactInfo}>
                <Grid container spacing={2} direction="row">
                  <Grid item xs={12} className={classes.toolbar}>
                    Contact Info #{index + 1}
                    <div>
                      <Button size="small" onClick={() => handleSave(index)}>
                        <Save />
                      </Button>
                      <Button size="small" onClick={() => handleDelete(index)}>
                        <CloseIcon />
                      </Button>
                    </div>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                >
                  <Grid item xs={6}>
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.role}
                      onChange={(e) => handleInputChange('role', e, index)}
                      label="Role"
                      variant="outlined"
                      size="small"
                    />
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.firstName}
                      onChange={(e) => handleInputChange('firstName', e, index)}
                      label="First Name"
                      variant="outlined"
                      size="small"
                    />
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.lastName}
                      onChange={(e) => handleInputChange('lastName', e, index)}
                      label="Last Name"
                      variant="outlined"
                      size="small"
                    />
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.address}
                      onChange={(e) => handleInputChange('address', e, index)}
                      label="Address"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.email}
                      required
                      onChange={(e) => handleInputChange('email', e, index)}
                      label="Email"
                      variant="outlined"
                      size="small"
                    />
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.phone}
                      onChange={(e) => handleInputChange('phone', e, index)}
                      label="Phone"
                      variant="outlined"
                      size="small"
                    />
                    <Box
                      className={classes.inputArea}
                      component={TextField}
                      value={el.sms}
                      onChange={(e) => handleInputChange('sms', e, index)}
                      label="SMS"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </div>
            );
          })}
      </main>
      <Box display="flex" justifyContent="center">
        <Button
          variant="contained"
          className={classes.btnAdd}
          color="primary"
          onClick={handleAddContact}
        >
          <Add />
          Add Another Contact
        </Button>
      </Box>
    </DefaultCard>
  );
};

export default ContactForm;
