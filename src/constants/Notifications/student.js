/* eslint-disable max-len */
import { en } from '@app/language';
import err from './errorMessages';

export default {
  success: {
    create: {
      message: en['New student has been added Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The student has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The student has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    upload: {
      message: en['The student has been uploaded Successfully!'],
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
      message: `${en[err.stutentCreate.message]} (error code = ${
        err.stutentCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.stutentDelete.message]} (error code = ${
        err.stutentDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.stutentUpdate.message]} (error code = ${
        err.stutentUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    upload: {
      message: `${en[err.bulkUploadStudent.message]} (error code = ${
        err.bulkUploadStudent.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
