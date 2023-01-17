import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { css } from '@emotion/react';
import { HashLoader } from 'react-spinners';
import useStyles from './style';

const override = css`
  box-shadow: rgba(0, 0, 0, 0.25) 0 0 0 9999px;
  background-color: rgba(0, 0, 0, 0.25);
`;

const LoadingSpinner = ({ loading }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.root}>
      <HashLoader
        css={override}
        color={theme.palette.blueGrey['50']}
        loading={loading}
      />
    </div>
  );
};

export default LoadingSpinner;
