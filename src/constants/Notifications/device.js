/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New device has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The device has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The device has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    rename: {
      message: en['The device name has been changed Successfully!'],
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
      message: `${en[err.deviceCreate.message]} (error code = ${
        err.deviceCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.deviceDelete.message]} (error code = ${
        err.deviceDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.deviceUpdate.message]} (error code = ${
        err.deviceUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    invalidSerialNumber: {
      message: en[err.deviceInvalidSerialNumber.message],
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    duplicatedSerialNumber: {
      message: en[err.deviceDuplicatedSerialNumber.message],
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
