import { makeStyles } from '@material-ui/core/styles';

const useStylesSearch = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 280
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: '0.9rem',
    padding: '0px !important',
    '& .MuiInputBase-input': {
      padding: 0
    }
  },
  iconButton: {
    padding: 0
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

export default useStylesSearch;
