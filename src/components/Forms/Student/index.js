import React, { useState } from 'react';
import { Grid, Box, Typography, Divider, IconButton } from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { DefaultCard } from '@app/components/Cards';
import { CustomInput, CustomSelectBox } from '@app/components/Custom';
import useStyles from './style';

const StudentForm = ({ resources, onChange }) => {
  const classes = useStyles();
  const [info, setInfo] = useState([
    {
      id: 0,
      firstName: '',
      lastName: '',
      gender: '',
      address: '',
      // phone: '',
      sms: ''
    }
  ]);

  const handleInputChange = (type, value, index) => {
    const tmp = info;
    tmp[index] = {
      ...info[index],
      [type]: value
    };
    setInfo(tmp);
    onChange(tmp);
  };

  const handleRemoveInfo = (index) => {
    const data = info.filter((el) => el.id !== index);
    setInfo(data);
  };

  const handleAddInfo = () => {
    const idx = info.length;
    const data = [
      ...info,
      {
        id: idx,
        firstName: '',
        lastName: '',
        gender: '',
        address: '',
        // phone: '',
        sms: ''
      }
    ];
    setInfo(data);
  };

  return (
    <DefaultCard style={classes.root}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" className={classes.title}>
          Student Detail
        </Typography>
        <IconButton onClick={handleAddInfo} size="small">
          <Add />
        </IconButton>
      </Box>
      <Divider className={classes.separator} />
      <main className={classes.main}>
        {info.map((el) => (
          <Grid
            key={el.id}
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" className={classes.subtitle}>
                  Info #{el.id + 1}
                </Typography>
                <IconButton
                  onClick={() => handleRemoveInfo(el.id)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
              <Divider />
            </Grid>
            <Grid item lg={6} md={12} sm={12} xs={12}>
              <CustomInput
                style={classes.inputArea}
                label="First Name"
                type="text"
                variant="outlined"
                size="small"
                onChange={(value) =>
                  handleInputChange('firstName', value, el.id)
                }
              />
              <CustomInput
                style={classes.inputArea}
                label="Last Name"
                type="text"
                variant="outlined"
                size="small"
                onChange={(value) =>
                  handleInputChange('lastName', value, el.id)
                }
              />
              <CustomSelectBox
                id="class-types"
                defaultValue=""
                label="Gender"
                variant="outlined"
                resources={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' }
                ]}
                style={classes.selectBox}
                onChange={(value) => handleInputChange('gender', value, el.id)}
              />
            </Grid>
            <Grid item lg={6} md={12} sm={12} xs={12}>
              <CustomInput
                style={classes.inputArea}
                label="Address"
                type="address"
                variant="outlined"
                size="small"
                onChange={(value) => handleInputChange('address', value, el.id)}
              />
              {/* <CustomInput
                style={classes.inputArea}
                label="Phone Number"
                type="tel"
                variant="outlined"
                size="small"
                onChange={(value) => handleInputChange('phone', value, el.id)}
              /> */}
              <CustomInput
                style={classes.inputArea}
                label="SMS Number"
                type="tel"
                variant="outlined"
                size="small"
                onChange={(value) => handleInputChange('sms', value, el.id)}
              />
            </Grid>
          </Grid>
        ))}
      </main>
    </DefaultCard>
  );
};

export default StudentForm;
