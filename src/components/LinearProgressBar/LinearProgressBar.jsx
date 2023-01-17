import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import { useStyles } from './style';

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center" style={{ paddingLeft: '10px' }}>
      <Box marginRight={1}>
        <Typography variant="body2" color="textSecondary">
          {props.name}
        </Typography>
      </Box>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
      <Box>
        <IconButton onClick={props.close}>
          <Close style={{ fontSize: '0.8rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator
   * for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired
};

export default function LinearWithValueLabel(props) {
  const classes = useStyles();
  const { value, name, close } = props;
  return (
    <div className={classes.root}>
      <LinearProgressWithLabel value={value} name={name} close={close} />
    </div>
  );
}
