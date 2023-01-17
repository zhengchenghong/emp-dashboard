import React from 'react';
import ReactDOM from 'react-dom';
import AppWithAuth from '@app/AppWithAuth';
import reportWebVitals from '@app/reportWebVitals';
import '@app/styles/global.style.css';
import { inactivityTime, tabsManager, idleHandler } from '@app/utils/functions';

ReactDOM.render(<AppWithAuth />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// tabsManager();
// inactivityTime();
idleHandler();

String.prototype.capitalizeFirstLetter = function () {
  const string = this;
  return string.charAt(0).toUpperCase() + string.slice(1);
};
