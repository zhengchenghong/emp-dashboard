import { Typography, Paper } from '@material-ui/core';

const LongText = ({ heading, value, customStyle }) => {
  return (
    <Paper
      style={
        value
          ? { padding: 10, marginTop: 10, ...customStyle }
          : { padding: 10, marginTop: 10, minHeight: '43px', ...customStyle }
      }
    >
      <Typography variant="body2" color="textSecondary" component="p">
        {heading}
      </Typography>
      <Typography
        variant="body1"
        component="p"
        style={{ marginTop: 5, maxWidth: 500 }}
      >
        {value ? value : ''}
      </Typography>
    </Paper>
  );
};

export default LongText;
