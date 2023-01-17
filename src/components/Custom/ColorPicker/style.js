import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  colorTrigger: {
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    border: '1px solid black',
    borderRadius: '3px',
    padding: 2
  }
}));

export default useStyles;
