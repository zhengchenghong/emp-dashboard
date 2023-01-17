import { createTheme } from '@material-ui/core';

const theme = createTheme({
  palette: {
    blueGrey: {
      50: '#eceff1',
      100: '#cfd8dc',
      200: '#b0bec5',
      300: '#90a4ae',
      400: '#78909c',
      500: '#607d8b',
      600: '#546e7a',
      700: '#455a64',
      800: '#37474f',
      900: '#263238'
    },
    lightGrey: {
      basic: '#d3d3d3',
      20: '#d3d3d333',
      40: '#d3d3d366',
      60: '#d3d3d399',
      80: '#d3d3d3cc'
    }
  },
  typography: {
    fontSize: 14
  },
  spacing: [0, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104]
});

export default theme;
