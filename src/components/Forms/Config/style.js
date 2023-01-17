import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  icon: {
    display: 'none'
  },
  select: {
    padding: '6px !important'
  },
  schedule: {
    padding: '16px !important'
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
  configScheduleItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: '0px',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scheduleContainer: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

export default useStyles;
