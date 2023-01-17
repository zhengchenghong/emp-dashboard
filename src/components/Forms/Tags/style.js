import { makeStyles } from '@material-ui/core/styles';
import theme from '@app/styles/theme';

const useStyles = makeStyles((theme) => ({
  root: {
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
    borderRadius: '4px'
  },
  disableRoot: {
    flex: 1,
    // height: theme.spacing(10),
    paddingBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    paddingLeft: '10px',
    width: '150px'
  }
}));

const colourStyles = {
  container: (styles) => ({
    ...styles,
    width: '100%'
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: 'white',
    border: 'none'
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,

      backgroundColor: isDisabled
        ? null
        : isSelected
        ? theme.palette.blueGrey['900']
        : isFocused
        ? theme.palette.lightGrey['40']
        : null,
      color: isDisabled
        ? '#fff'
        : isSelected
        ? theme.palette.lightGrey['50']
          ? 'white'
          : theme.palette.lightGrey['20']
        : theme.palette.blueGrey['900'],
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor:
          !isDisabled &&
          (isSelected
            ? theme.palette.lightGrey['50']
            : theme.palette.lightGrey['20'])
      }
    };
  },
  multiValue: (styles) => {
    return {
      ...styles,
      backgroundColor: theme.palette.lightGrey['20'],
      border: 'none',
      borderRadius: '25px',
      fontSize: '14px'
    };
  },
  multiValueLabel: (styles) => ({
    ...styles,
    color: theme.palette.blueGrey['900']
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: theme.palette.blueGrey['900'],
    ':hover': {
      backgroundColor: theme.palette.blueGrey['900'],
      color: 'white'
    }
  })
};

export { colourStyles };

export default useStyles;
