/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New resource has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The resource has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The resource has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    upload: {
      message: en['The Resource file has been uploaded Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    copy: {
      message: en['The Resource copied successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    copyLesson: {
      message: en['The Lesson has been copied successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    }
  },
  info: {},
  warning: {
    needClass: {
      message:
        en[
          'You can not copy this resource because you have no assigned class.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    duplicateCopy: {
      message: en['Resource already present in class.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    copy: {
      message: en['The Resource has not been ready! Please try again later.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.resourceCreate.message]} (error code = ${
        err.resourceCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.resourceDelete.message]} (error code = ${
        err.resourceDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.resourceUpdate.message]} (error code = ${
        err.resourceUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    copy: {
      message: `${en[err.copyResourceToClass]} (error code = ${
        err.copyResourceToClass.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
