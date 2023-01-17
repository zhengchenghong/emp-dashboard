import React, { useEffect } from 'react';
import { Box, TextField } from '@material-ui/core';
import { useInput } from '@app/utils/hooks/form';
import useStyles from './style';
import { DefaultCard } from '@app/components/Cards';
import { LongText, EditHelperText } from '@app/components/Text';

const ProfileForm = ({ disable, resources, helperText, onChange }) => {
  const classes = useStyles();
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

  useEffect(() => {
    if (resources) {
      setName(resources.name);
      setFirstName(resources.contact?.firstName);
      setLastName(resources.contact?.lastName);
      // setPhone(resources.contact?.phone);
      setEmail(resources.contact?.email);
    }
  }, [resources]);

  useEffect(() => {
    onChange({ name, firstName, lastName, email });
  }, [name, firstName, lastName, email]);

  return (
    <DefaultCard style={classes.editMode}>
      {disable ? (
        <React.Fragment>
          <div>
            <LongText heading="" value={name} />
            <LongText heading="" value={firstName} />
            <LongText heading="" value={lastName} />
            <LongText heading="" value={email} />
            {/* <LongText heading="" value={phone} /> */}
          </div>
          {helperText && <EditHelperText />}
        </React.Fragment>
      ) : (
        <Box>
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
          {/* <TextField
            className={classes.textfield}
            label="Phone number"
            {...bindPhone}
            type="text"
            variant="outlined"
            size="small"
          /> */}
          <TextField
            className={classes.textfield}
            label="Email"
            {...bindEmail}
            type="email"
            variant="outlined"
            size="small"
          />
        </Box>
      )}
    </DefaultCard>
  );
};

export default ProfileForm;
