/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New package has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The package has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The package has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    packaged: {
      message:
        en[
          'Triggering packaging process has been called successfully. Please refresh the screen after a few minutes'
        ],
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
    },
    packaged: {
      message: en['This item is already published!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.packageCreate.message]} (error code = ${
        err.packageCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.packageDelete.message]} (error code = ${
        err.packageDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.packageUpdate.message]} (error code = ${
        err.packageUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    nameRequired: {
      message: `${en[err.packageNameRequired.message]} (error code = ${
        err.packageNameRequired.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
