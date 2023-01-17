import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((thtme) => ({
  root: {
    flex: 1,
    overflowX: 'hidden'
  },
  content: {
    maxWidth: 500,
    maxHeight: 'calc(100vh - 400px)'
  }
}));

export default useStyles;
