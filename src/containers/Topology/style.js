import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  rootVertical: {
    display: 'flex',
    flexDirection: 'column'
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
    background: theme.palette.blueGrey['200']
  },
  listItemText: {
    color: theme.palette.blueGrey['700']
  },
  listSelectedItemText: {
    fontWeight: 700,
    color: theme.palette.blueGrey['700']
  },
  docId: {
    color: theme.palette.blueGrey['700'],
    marginBottom: theme.spacing(1)
  },
  state: {
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 13px',
    borderRadius: 15,
    margin: 0,
    backgroundColor: '#21ff00'
  },
  labelClass: {
    marginTop: 20
  },
  gradesRoot: {
    flex: 1,
    // padding: theme.spacing(1),
    // margin: '20px 15px 0px 15px',
    backgroundColor: theme.palette.blueGrey['50'],
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(12),
    boxShadow:
      '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    borderRadius: '4px',
    '& .MuiSelect-outlined.MuiSelect-outlined': {
      paddingRight: '24px'
    },
    '.MuiFormControl-root': {
      width: '100%'
    }
  },
  gradesSelect: {
    width: '100%',
    background: 'white',
    paddingLeft: 10,
    borderRadius: 4,
    borderColor: 'gray',
    marginTop: '6px',
    lineHeight: 'unset',
    fontSize: '14px',
    '& .MuiSelect-select:focus': {
      backgroundColor: theme.palette.common.white,
      borderRadius: '4px',
      border: '2px solid #335ab5',
      marginLeft: '-10px'
    },
    '& .MuiSelect-select:hover': {
      backgroundColor: theme.palette.common.white
    }
  },
  gradesSelectInputRoot: {
    background: 'white !important'
  }
}));

export default useStyles;
