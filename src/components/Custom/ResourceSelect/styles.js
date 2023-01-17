import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    // alignItems: 'center',
    padding: 3,
    '& .MuiSelect-outlined.MuiSelect-outlined': {
      paddingRight: '24px'
    }
  },
  fullWidth: {
    width: '100%'
  },
  noPadding: {
    padding: 0
  },
  label: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    background: theme.palette.common.white,
    fontSize: 14
  },
  stateSelect: {
    fontSize: '14px',
    background: theme.palette.common.white,
    '& .MuiSelect-select:focus': {
      backgroundColor: theme.palette.common.white,
      borderRadius: '4px',
      border: '2px solid #335ab5'
    },
    '& .MuiSelect-select:hover': {
      backgroundColor: theme.palette.common.white
    }
  },
  menuList: {
    paddingTop: 0,
    paddingBottom: 0,
    width: '100%',
    minWidth: 150
  },
  limitedMenuList: {
    paddingTop: 0,
    paddingBottom: 0,
    maxWidth: 270,
    minWidth: 150
  },
  selectInput: {
    paddingTop: 10,
    paddingBottom: 10
  },
  menuItem: {
    fontSize: 14
  }
}));

export default useStyles;
