import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Save } from '@material-ui/icons';

const SaveHelperText = () => {
  return (
    <Typography
      gutterBottom
      variant="subtitle1"
      component="h2"
      style={{
        marginTop: 5,
        marginLeft: 5,
        display: 'inline-flex',
        VerticalAlign: 'text-bottom',
        BoxSizing: 'inherit',
        alignItems: 'center'
      }}
    >
      Press{'  '}
      <Save
        fontSize="small"
        style={{
          marginRight: 2,
          marginLeft: 2
        }}
      />
      {'  '}
      to save above info
    </Typography>
  );
};

export default SaveHelperText;
