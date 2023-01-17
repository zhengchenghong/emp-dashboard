import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';

const EditHelperText = () => {
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
      <Edit
        fontSize="small"
        style={{
          marginRight: 3,
          marginLeft: 3
        }}
      />
      {'  '}
      Button to edit above info
    </Typography>
  );
};

export default EditHelperText;
