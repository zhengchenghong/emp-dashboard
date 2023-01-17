import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  mainRoot: {
    flex: 1,
    padding: 0
  },
  label: {
    fontWeight: 'inherit',
    color: 'inherit'
  },
  iconContainer: {
    opacity: '0'
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0)
  },
  labelIcon: {
    marginRight: theme.spacing(2),
    color: 'inherit'
  },
  labelIconActive: {
    marginRight: theme.spacing(2),
    color: '#21ff00'
  },
  labelIconInactive: {
    marginRight: theme.spacing(2),
    color: 'yellow'
  },
  labelIconExpired: {
    marginRight: theme.spacing(2),
    color: 'black'
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
    fontSize: 14
  },
  publishstate: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 15,
    marginLeft: '10px',
    backgroundColor: '#21ff00',
    right: '0px',
    position: 'sticky'
  },
  packagestate: {
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: 'green'
  },
  scheduleStatus: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    marginLeft: 6,
    backgroundColor: 'lightGray'
    // backgroundColor: '#21ff00'
  },
  scheduleStatusInactive: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    marginLeft: 6,
    backgroundColor: 'yellow'
  },
  scheduleStatusExpired: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    marginLeft: 6,
    backgroundColor: 'black',
    color: 'lightGray'
  },
  draggableContainer: {
    margin: '10px 30px',
    width: '200px',
    height: '200px',
    overflow: 'auto',
    border: '1px solid #ccc'
  },
  reactTreeItemDropped: {
    animation: 'blink 0.6s linear infinite'
  },
  labelRootSelected: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    backgroundColor: '#3f51b514'
  },
  tooltip: {
    fontSize: '14px'
  }
}));

export default useStyles;
