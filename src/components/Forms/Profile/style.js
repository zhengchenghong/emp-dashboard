import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  textfield: {
    marginTop: 10,
    width: '100%',
    background: 'white'
  },
  editMode: {
    background: theme.palette.blueGrey['50'],
    padding: `8px 20px 16px 20px`
  }
}));

export default useStyles;
