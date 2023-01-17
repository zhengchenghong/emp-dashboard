/* eslint-disable max-len */
import { en } from '@app/language';
import errorMessage from './errorMessages';

export default {
  success: {
    create: {
      message: en['New admin user has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The admin user has been removed Succssfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The admin user has been updated Succssfully!'],
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
    username: {
      message: `${en[errorMessage.username.message]} (error code = ${
        errorMessage.username.cdoe
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    phone: {
      message: `${en[errorMessage.phone.message]} (error code = ${
        errorMessage.phone.cdoe
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    create: {
      message: `${en[errorMessage.adminCreate.message]} (error code = ${
        errorMessage.adminCreate.cdoe
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[errorMessage.adminDelete.message]} (error code = ${
        errorMessage.adminDelete.cdoe
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[errorMessage.adminUpdate.message]} (error code = ${
        errorMessage.adminUpdate.cdoe
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
