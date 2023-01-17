/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New google class has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The google class has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The google class has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    import: {
      message: en['A request has been sent to import Google Class.'],
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
    impossible: {
      message:
        en[
          'We can not send this request. There is no administrator who can import Google Classes.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    impossibleAdmin: {
      message:
        en[
          'We can not send this request. You have no credentials to ingest google class.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    unAssigned: {
      message:
        en[
          "We can not send this request. Adminstrator can't ingest without accepting EULA"
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    allexpired: {
      message:
        en[
          'We can not send this request. All users had been expired for google classroom ingest.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    expiredAdmin: {
      message:
        en[
          'We can not send this request. You are expired to ingest google classroom.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.googleCreate.message]} (error code = ${
        err.googleCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.googleDelete.message]} (error code = ${
        err.googleDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.googleUpdate.message]} (error code = ${
        err.googleUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
