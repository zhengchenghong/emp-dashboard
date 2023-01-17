import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    // padding: theme.spacing(1),
    // margin: '20px 15px 0px 15px',
    backgroundColor: theme.palette.blueGrey['50'],
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px'
  },
  header: {
    paddingX: `${theme.spacing(1)}px`
  },
  icon: {
    marginRight: theme.spacing(2)
  },
  separator: {
    height: 2,
    marginX: `${theme.spacing(1)}px`
  },
  content: {
    padding: theme.spacing(1),
    // minHeight: 50,
    // maxHeight: `calc(100vh - 280px)`,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  toolbar: {
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  elCategoryInfo: {
    display: 'flex',
    padding: theme.spacing(1)
  },
  inputArea: {
    width: '100%',
    marginTop: `${theme.spacing(1)}px`,
    marginBottom: `${theme.spacing(1)}px`,
    marginRight: `${theme.spacing(1)}px`,
    backgroundColor: theme.palette.background.paper,
    fontSize: 14,
    fontWeight: 100
  },
  btnAdd: {
    // background: theme.palette.blueGrey['500'],
    background: '#37474f !important',
    '&:hover': {
      background: theme.palette.blueGrey['500'],
      color: theme.palette.blueGrey['50']
    },
    width: '300px'
  }
}));

export default useStyles;
