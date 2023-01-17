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
    marginRight: theme.spacing(2)
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
    fontSize: 14
  },
  publishstate: {
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: '#21ff00'
  },
  packagestate: {
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: 'green'
  },
  labelRootSelected: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    backgroundColor: '#3f51b514'
  }
}));

export default useStyles;
