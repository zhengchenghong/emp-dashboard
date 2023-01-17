import React from 'react';
import { withRouter } from 'react-router-dom';
import TutorialEdit from './Edit';

const TutorialContainer = ({ history }) => {
  return <TutorialEdit />;
};

export default withRouter(TutorialContainer);
