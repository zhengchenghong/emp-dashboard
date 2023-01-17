import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  content: {
    color: theme.palette.blueGrey['900']
  }
}));

export default useStyles;
