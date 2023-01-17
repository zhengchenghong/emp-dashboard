import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    minHeight: 200
  },
  icon: {
    marginRight: theme.spacing(2)
  },
  separator: {
    height: 2
  },
  content: {
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: '42.1vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: '#fff'
  },
  contendDroping: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    filter: 'blur(1px)',
    background: '#fff'
  },
  dragItems: {
    marginTop: '5px',
    marginBottom: '5px',
    border: '1px solid lightgray'
  },
  listItems: {
    cursor: 'pointer',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0)
  },
  listItem: {
    color: theme.palette.blueGrey['900'],
    fontWeight: 700
  },
  listItemSelected: {
    color: theme.palette.common.black,
    fontWeight: 700,
    background: `${theme.palette.blueGrey['200']} !important`
  },
  listItemText: {
    color: theme.palette.blueGrey['700']
  },
  inputArea: {
    width: '100%',
    marginBottom: 10
  },
  listSecondaryAction: {
    cursor: 'default',
    paddingLeft: theme.spacing(2),
    position: 'relative',
    right: '0px',
    transform: 'none'
  },
  listSecondaryActionSelected: {
    cursor: 'default',
    paddingLeft: theme.spacing(2),
    position: 'relative',
    right: '0px',
    transform: 'none',
    background: theme.palette.blueGrey['200']
  },
  dropzoneClass: {
    width: '100%',
    minHeight: '97px !important',
    outline: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropzoneCard: {
    flex: 1,
    height: '200px'
  },
  dropzoneParagraph: {
    fontSize: 16,
    color: theme.palette.blueGrey['700']
  }
}));

export default useStyles;
