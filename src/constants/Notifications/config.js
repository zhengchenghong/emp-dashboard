/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New configuration has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The configuration has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The configuration has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    }
  },
  info: {},
  warning: {
    delete: {
      message:
        en['We cant take this action for now. Please check the checkbox!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.configCreate.message]} (error code = ${
        err.configCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.configDelete.message]} (error code = ${
        err.configDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.configUpdate.message]} (error code = ${
        err.configUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
