import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    position: 'relative',
    '&.MuiPaper-elevation1': {
      border: '1px solid rgb(0 0 0 / 14%)',
      boxShadow: 'none'
    },
    '& thead': {
      '& tr': {
        '& th': {
          color: theme.palette.blueGrey['700'],
          fontWeight: 500,
          fontSize: 14,
          '& button': {
            color: 'white',
            backgroundColor: theme.palette.blueGrey['500'],
            '&:hover': {
              //you want this to be the same as the backgroundColor above
              color: theme.palette.blueGrey['50'],
              backgroundColor: theme.palette.blueGrey['500']
            }
          }
        }
      }
    },
    '& tbody': {
      '& td:not(:first-child)': {
        verticalAlign: 'top'
      },
      '& td:nth-child(2), td:nth-child(3)': {
        fontWeight: 700
      },
      '& td': {
        color: theme.palette.blueGrey['700'],
        fontSize: 14,
        '& big': {
          transform: 'none'
        },
        '& button': {
          color: theme.palette.blueGrey['700'],
          padding: `4px 8px 4px 8px`,
          '&:hover': {
            //you want this to be the same as the backgroundColor above
            color: theme.palette.blueGrey['50'],
            backgroundColor: theme.palette.blueGrey['500']
          }
        }
      }
    }
  },
  addBtn: {
    position: 'absolute',
    top: 13,
    left: 20,
    width: 110,
    padding: `4px 8px 4px 8px`,
    background: theme.palette.blueGrey['500'],
    '&:hover': {
      //you want this to be the same as the backgroundColor above
      backgroundColor: theme.palette.blueGrey['500']
    }
  },
  textfield: {
    width: '100%'
  }
}));

export default useStyles;
