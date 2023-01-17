import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  textfield: {
    marginTop: 10,
    width: '100%'
  },
  saveButton: {
    background: theme.palette.blueGrey['500'],
    color: 'white',
    padding: `8px 24px 8px 24px`,
    marginLeft: theme.spacing(2),
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    }
  }
}));

export default useStyles;
