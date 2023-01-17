/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  error: {
    create: {
      message: `${en[err.backendCreate.message]} (error code = ${
        err.backendCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.backendDelete.message]} (error code = ${
        err.backendDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.backendUpdate.message]} (error code = ${
        err.backendUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    upload: {
      message: `${en[err.backendUpload.message]} (error code = ${
        err.backendUpload.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    wrong: {
      message: `${en[err.backendWrong.message]} (error code = ${
        err.backendWrong.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    unAuth: {
      message: `${en[err.auth.message]} (error code = ${err.auth.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    network: {
      message: `${en[err.backendNetwork.message]} (error code = ${
        err.backendNetwork.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    attach: {
      message: `${en[err.attachOver.message]} (error code = ${
        err.attachOver.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
