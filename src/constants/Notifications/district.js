/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New district has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    createAdmin: {
      message: en['The district admin has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The school district has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    deleteAdmin: {
      message: en['The district admin has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The school district has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    updateAdmin: {
      message: en['The district admin has been updated Successfully!'],
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
    create: {
      message: en['Email Field is mandatory'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    sameEmail: {
      message: en['A user with this email already exist'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.distCreate.message]} (error code = ${
        err.distCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    createAdmin: {
      message: `${en[err.adminCreate.message]} (error code = ${
        err.adminCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.distDelete.message]} (error code = ${
        err.distDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    deleteAdmin: {
      message: `${en[err.adminDelete.message]} (error code = ${
        err.adminDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.distUpdate.message]} (error code = ${
        err.distUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    updateAdmin: {
      message: `${en[err.adminUpdate.message]} (error code = ${
        err.adminUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
