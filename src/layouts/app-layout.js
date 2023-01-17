import React from 'react';
import PropTypes from 'prop-types';
import { Fab, Container, CssBaseline } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ScrollTop } from '@app/components/ScrollButton';
import Navbar from '@app/components/Navbar';

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  window: PropTypes.func
};

const AppLayout = (props) => {
  return (
    <React.Fragment>
      <CssBaseline />
      <Navbar layout="app" />
      <Container>{props.children}</Container>
      <ScrollTop {...props}>
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <FontAwesomeIcon icon={faArrowUp} />
        </Fab>
      </ScrollTop>
    </React.Fragment>
  );
};

export default AppLayout;
