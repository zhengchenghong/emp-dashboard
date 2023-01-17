import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1
  },
  listItems: {
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0)
  },
  listItemText: {
    color: theme.palette.blueGrey['900'],
    fontWeight: 700
  },
  listItemTextSelected: {
    color: theme.palette.common.black,
    fontWeight: 700,
    background: theme.palette.blueGrey['300']
  }
}));

export default useStyles;
