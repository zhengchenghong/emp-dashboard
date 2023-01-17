import { Typography, Paper } from '@material-ui/core';

const ShortText = ({ heading, value, customStyle }) => {
  return (
    <Paper
      style={
        value
          ? { padding: 10, marginTop: 10, ...customStyle }
          : { padding: 10, marginTop: 10, minHeight: '45px', ...customStyle }
      }
    >
      <Typography variant="body2" component="p" color="textSecondary">
        {heading}
      </Typography>
      <Typography variant="h5" component="h2">
        {value ? value : ''}
      </Typography>
    </Paper>
  );
};

export default ShortText;
