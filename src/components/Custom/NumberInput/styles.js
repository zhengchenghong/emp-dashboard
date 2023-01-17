import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  fullWidth: {
    width: '100%'
  },
  label: {
    background: theme.palette.common.white
  }
}));

export default useStyles;
