/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    create: {
      message: en['New station has been created Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    delete: {
      message: en['The station has been removed Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['The station has been updated Successfully!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    }
  },
  info: {},
  warning: {
    selectStation: {
      message: en['Station is not opened! Please open related station first!'],
      options: {
        autoHideDuration: 5000,
        variant: 'warning'
      }
    }
  },
  error: {
    create: {
      message: `${en[err.stationCreate.message]} (error code = ${
        err.stationCreate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    delete: {
      message: `${en[err.stationDelete.message]} (error code = ${
        err.stationDelete.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    update: {
      message: `${en[err.stationUpdate.message]} (error code = ${
        err.stationUpdate.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    },
    avatar: {
      message: `${en[err.stationAvatar.message]} (error code = ${
        err.stationAvatar.code
      })`,
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
