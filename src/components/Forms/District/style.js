import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  selectBox: {
    background: theme.palette.common.white
  }
}));

export default useStyles;
