import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  rootVertical: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

export default useStyles;
