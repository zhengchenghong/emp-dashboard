import { Typography, Paper } from '@material-ui/core';

const TitleText = ({ heading, value, customStyle }) => {
  return (
    <Paper
      style={
        value
          ? { padding: '2px 10px', ...customStyle }
          : { padding: '2px 10px', minHeight: '35px', ...customStyle }
      }
    >
      <Typography variant="body2" color="textSecondary" component="p">
        {heading}
      </Typography>
      <Typography
        gutterBottom
        variant="h3"
        component="h2"
        style={{ fontSize: '1.303rem', ...customStyle }}
      >
        {value ? value : ''}
      </Typography>
    </Paper>
  );
};

export default TitleText;
