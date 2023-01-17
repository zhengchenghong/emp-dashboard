import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
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
    backgroundColor: '#21ff00'
  }
}));

export default useStyles;
