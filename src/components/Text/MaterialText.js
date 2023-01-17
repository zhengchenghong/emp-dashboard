import { Typography, Paper } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const handleDownload = (url) => {
  window.location = url;
};

const MaterialText = ({ heading, name, customStyle, url }) => {
  return (
    <Paper
      style={
        name
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
        {name ? name : ''} :{' '}
        <FontAwesomeIcon
          icon={faDownload}
          size="sm"
          onClick={() => handleDownload(url)}
          style={{ cursor: 'pointer' }}
        />
      </Typography>
    </Paper>
  );
};

export default MaterialText;
