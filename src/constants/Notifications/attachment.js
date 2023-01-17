import { en } from '@app/language';

export default {
  success: {
    drop: {
      message: en['Successfully uploaded!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    },
    update: {
      message: en['Successfully updated!'],
      options: {
        autoHideDuration: 10000,
        variant: 'success'
      }
    }
  },
  warning: {
    drop: {
      message: en['Just one file allowed'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    oversize: {
      message: en['File upload excceed max file size of 240MB.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    deleteConverting: {
      message: en['delete converting file'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    zerosize: {
      message: en["Empty file can't be uploaded! Please select another file."],
      options: {
        autoHideDuration: 10000,
        variant: 'error'
      }
    }
  }
};
