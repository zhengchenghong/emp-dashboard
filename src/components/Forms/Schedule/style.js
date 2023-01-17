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
    alignItems: 'center'
  },
  label: {
    transform: 'translateY(-2px)',
    width: '100px'
  },
  scheduleTextField: {
    width: '100%',
    margin: '0px',
    background: 'white',
    border: '1px solid rgb(0 0 0 / 24%)',
    paddingRight: '10px',
    paddingLeft: '10px',
    borderRadius: '5px'
  },
  selectFilter: {
    minHeight: 50,
    background: theme.palette.common.white,
    width: '100%'
  }
}));

export default useStyles;
