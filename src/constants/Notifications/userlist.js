import { en } from '@app/language';
import err from './errorMessages';

export default {
  success: {
    create: {
      message: en['The user has been added Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The user has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    removeClass: {
      message: en['The class has been removed from the user Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The user has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    upload: {
      message: en['The user has been uploaded Successfully!'],
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
    reAuthGoogle: {
      message: en['This schoolAdmin is already authorized.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.classCreate.message]} (error code = ${
        err.classCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.classDelete.message]} (error code = ${
        err.classDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.classUpdate.message]} (error code = ${
        err.classUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    phone: {
      message: `${en[err.userListphone.message]} (error code = ${
        err.userListphone.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    phoneRequired: {
      message: `${en[err.userListphoneRequired.message]} (error code = ${
        err.userListphoneRequired.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    email: {
      message: `${en[err.userListemail.message]} (error code = ${
        err.userListemail.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    emailRequired: {
      message: `${en[err.userListemailRequired.message]} (error code = ${
        err.userListemailRequired.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    duplicateEmail: {
      message: `${en[err.userListduplicateEmail.message]} (error code = ${
        err.userListduplicateEmail.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    selectDistrict: {
      message: `${en[err.userListselectDistrict.message]} (error code = ${
        err.userListselectDistrict.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    district: {
      message: `${en[err.userListdDistrict.message]} (error code = ${
        err.userListdDistrict.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    validAccessConfig: {
      message: `${en['Invalid configuration!']}`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
