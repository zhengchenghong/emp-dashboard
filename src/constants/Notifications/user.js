/* eslint-disable max-len */
import { en } from '@app/language';
import err from './errorMessages';

export default {
  success: {
    passwordChange: {
      message: en['Password is changed succesfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    sentCode: {
      message: en['Sent Email Already'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    }
  },
  warning: {
    unAuthenticated: {
      message:
        en['User does not have appropriate permissions for this dashboard.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    email: {
      message: `${en[err.userEmail.message]} (error code = ${
        err.userEmail.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    password: {
      message: `${en[err.userPassword.message]} (error code = ${
        err.userPassword.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    emailPass: {
      message: `${en[err.userEmailPass.message]} (error code = ${
        err.userEmailPass.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    name: {
      message: `${en[err.userName.message]} (error code = ${
        err.userName.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    unAuthenticated: {
      message: `User doesn't exist`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
