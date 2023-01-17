import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      top: '40vh',
      left: '50vw',
      zIndex: 1000
    },
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      top: '40vh',
      left: '50vw',
      zIndex: 1000
    },
    [theme.breakpoints.up('lg')]: {
      position: 'fixed',
      top: '40vh',
      left: '50vw',
      zIndex: 1000
    }
  }
}));

export default useStyles;
