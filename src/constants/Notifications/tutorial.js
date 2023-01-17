import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New tutorial card has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The tutorial card has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The tutorial card has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    publish: {
      message: en['The tutorial card has been published Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    unpublish: {
      message: en['The tutorial card has been unpublished Successfully!'],
      options: {
        autoHideDuration: 3000,
        variant: 'success'
      }
    },
    rename: {
      message: en['tutorial card name has been changed Successfully!'],
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
      message: en['This tutorial card is already published!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    published: {
      message: en['This tutorial card is already published!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },

    emptyName: {
      message: en['Please input card  name.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    // create: {
    //   message: `${err.materialCreate.message} (error code = ${err.materialCreate.code})`,
    //   options: {
    //     autoHideDuration: 10000,
    //     variant: 'error'
    //   }
    // },
    // delete: {
    //   message: `${err.materialDelete.message} (error code = ${err.materialDelete.code})`,
    //   options: {
    //     autoHideDuration: 10000,
    //     variant: 'error'
    //   }
    // },
    update: {
      message: en['Name exists already. Name must be unique.'],
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
