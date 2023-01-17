/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  error: {
    oneFile: {
      message: `${en[err.oneFile.message]} (error code = ${err.oneFile.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    fileName: {
      message: `${en[err.fileName.message]} (error code = ${
        err.fileName.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    invalildFileName: {
      message: `${en[err.invalildFileName.message]} (error code = ${
        err.invalildFileName.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    email: {
      message: `${en[err.email.message]} (error code = ${err.email.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    name: {
      message: `${en[err.name.message]} (error code = ${err.name.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    cache: {
      message: `${en[err.cache.message]} (error code = ${err.cache.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    lesson: {
      message: `${en[err.lesson.message]} (error code = ${err.lesson.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.other.message]} (error code = ${err.other.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.other.message]} (error code = ${err.other.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    upload: {
      message: `${en[err.other.message]} (error code = ${err.other.code})`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
