import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    position: 'relative',
    '& div': {
      overflowX: 'hidden'
    },
    '& thead': {
      '& tr': {
        '& th': {
          color: theme.palette.blueGrey['700'],
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
      '& td': {
        color: theme.palette.blueGrey['700'],
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
    // background: theme.palette.blueGrey['500'],
    backgroundColor: '#37474f !important',
    color: 'white',
    '&:hover': {
      //you want this to be the same as the backgroundColor above
      backgroundColor: theme.palette.blueGrey['500']
    }
  },
  textfield: {
    marginTop: 10,
    width: '100%'
  },
  editRow: {
    overflowX: 'hidden'
  },
  selectBox: {
    background: theme.palette.common.white,
    width: 110
  }
}));

export default useStyles;
