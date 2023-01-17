import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    // padding: theme.spacing(2),
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
    height: '100%',
    maxHeight: '335px',
    minHeight: 250,
    // maxHeight: 450,
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
    // borderRadius: '5px',
    border: '1px solid lightgray'
    // boxShadow: '0px 4px 4px rgb(36 45 60 / 25%)'
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
  inputMultiArea: {
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
    // background: theme.palette.blueGrey['50'],
    flex: 1,
    height: '150px'
  },
  dropzoneParagraph: {
    fontSize: 16,
    color: theme.palette.blueGrey['700']
  },
  fileNameInputBox: {
    paddingRight: '0px',
    display: 'flex'
  },
  extension: {
    paddingTop: '10px'
  }
}));

export default useStyles;
