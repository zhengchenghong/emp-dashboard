import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  rootDatePicker: {
    position: 'relative',
    width: '100%'
  },
  display: {
    position: 'absolute',
    top: 2,
    left: 0,
    bottom: 2,
    background: 'white',
    pointerEvents: 'none',
    right: 50,
    display: 'flex',
    alignItems: 'center'
  },
  input: {},
  textfield: {
    marginTop: 10,
    width: '100%'
  },

  createInput: {
    width: '100%',
    maxWidth: '400px',
    marginBottom: theme.spacing(1)
  }
}));
