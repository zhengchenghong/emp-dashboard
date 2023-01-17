const useStyles = (theme) => ({
  root: {
    display: 'flex',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: `linear-gradient(0, #455a64 30%, #90a4ae 90%)`,
    '& > *': {
      maxWidth: 500,
      margin: `${theme.spacing(10)}px auto`,
      padding: theme.spacing(2),
      height: 'fit-content'
    },
    overflowY: 'scroll'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  rememberme: {
    margin: '15px 0 0 0',
    textAlign: 'top'
  },
  title: {
    fontSize: '22px',
    fontWeight: 800
  },
  card: {
    width: '500px',
    margin: '100px auto',
    padding: '40px'
  },
  textfield: {
    margin: '10px 0'
  },
  link: {
    margin: `${theme.spacing(2)}px 0`,
    textAlign: 'right',
    textDecoration: 'none'
  },
  linktextleft: {
    margin: `${theme.spacing(3)}px 0`,
    textAlign: 'left',
    textDecoration: 'none',
    color: '#37474f'
  },
  mr20: {
    marginRight: 20
  },
  googleLogin: {
    marginTop: theme.spacing(1),
    textTransform: 'none',
    background: 'white',
    fontWeight: '500',
    fontSize: '14px',
    color: '#37474fc0'
  },
  poweredbyContainer: {
    margin: '0',
    textAlign: 'right',
    fontStyle: 'italic',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  poweredBy: {
    display: 'flex',
    alignItems: 'center'
  },
  topLogo: {
    width: '200px',
    height: '60px',
    margin: '0 auto'
  },
  bottomlogo: {
    width: '110px',
    height: '40px'
  },
  loginButton: {
    backgroundColor: '#607d8b',
    color: theme.palette.common.white
  },
  privacyPolicy: {
    fontStyle: 'normal'
  }
});

export default useStyles;
