import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  selectBox: {
    background: theme.palette.common.white
  },
  labelItem: {
    marginBottom: '0 !important'
  },
  labelColorpicker: {
    display: 'flex',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
    width: '230px',
    paddingLeft: '20px',
    paddingTop: '7px',
    paddingBottom: '7px',
    alignItems: 'center',
    background: 'white',
    border: '1px solid rgb(0 0 0 / 24%)',
    borderRadius: '5px'
  },
  label: {
    transform: 'translateY(-2px)',
    width: '150px'
  }
}));

export default useStyles;
