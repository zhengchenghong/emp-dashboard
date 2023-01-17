/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New lesson has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The lesson has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The lesson has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    publish: {
      message: en['The lesson has been published Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    unpublish: {
      message: en['The lesson has been unpublished Successfully!'],
      options: {
        autoHideDuration: 3000,
        variant: 'success'
      }
    },
    rename: {
      message: en['Lesson name has been changed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    createRef: {
      message: en['Shared lesson reference has been created Successfully!'],
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
      message: en['This material is already published!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    published: {
      message: en['This material is already published!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    publish: {
      message:
        en[
          'All files require to be converted before the lesson can be published.'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    unpublish: {
      message:
        en[
          'The video is being uploaded and not ready to be published. Please try again later!'
        ],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    schedule: {
      message: en['EndAt must not be before StartAt'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    lifeCycle: {
      message: en['The unpublished date has been recalculated.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.materialCreate.message]} (error code = ${
        err.materialCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.materialDelete.message]} (error code = ${
        err.materialDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.materialUpdate.message]} (error code = ${
        err.materialUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
