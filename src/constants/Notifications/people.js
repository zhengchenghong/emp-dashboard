/* eslint-disable max-len */
import err from './errorMessages';
import { en } from '@app/language';

export default {
  success: {
    school: {
      create: {
        message: en['New school admin has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current school admin has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current school admin has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    station: {
      create: {
        message: en['New station admin has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current station admin has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current station admin has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    super: {
      create: {
        message: en['New super admin has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current super admin has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current super admin has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    system: {
      create: {
        message: en['New system admin has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current system admin has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current system admin has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    district: {
      create: {
        message: en['New district admin has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current district admin has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current district admin has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    student: {
      create: {
        message: en['New student has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current student has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current student has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    },
    educator: {
      create: {
        message: en['New educator has been created Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      delete: {
        message: en['Current educator has been removed Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      },
      update: {
        message: en['Current educator has been updated Successfully!'],
        options: {
          autoHideDuration: 10000,
          variant: 'success'
        }
      }
    }
  },
  info: {},
  warning: {
    mandatory: {
      message: en['All the mandatory fields must be filled before save.'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    },
    delete: {
      message:
        en['We cant take this action for now. Please check the checkbox!'],
      options: {
        autoHideDuration: 10000,
        variant: 'warning'
      }
    }
  },
  error: {
    school: {
      create: {
        message: `${en[err.peopleSchoolCreate.message]} (error code = ${
          err.peopleSchoolCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleSchoolDelete.message]} (error code = ${
          err.peopleSchoolDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleSchoolUpdate.message]} (error code = ${
          err.peopleSchoolUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    station: {
      create: {
        message: `${en[err.peopleStationCreate.message]} (error code = ${
          err.peopleStationCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleStationDelete.message]} (error code = ${
          err.peopleStationDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleStationUpdate.message]} (error code = ${
          err.peopleStationUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    super: {
      create: {
        message: `${en[err.peopleSuperCreate.message]} (error code = ${
          err.peopleSuperCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleSuperDelete.message]} (error code = ${
          err.peopleSuperDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleSuperUpdate.message]} (error code = ${
          err.peopleSuperUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    system: {
      create: {
        message: `${en[err.peopleSystemCreate.message]} (error code = ${
          err.peopleSystemCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleSystemDelete.message]} (error code = ${
          err.peopleSystemDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleSystemUpdate.message]} (error code = ${
          err.peopleSystemUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    district: {
      create: {
        message: `${en[err.peopleDistCreate.message]} (error code = ${
          err.peopleDistCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleDistDelete.message]} (error code = ${
          err.peopleDistDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleDistUpdate.message]} (error code = ${
          err.peopleDistUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    student: {
      create: {
        message: `${en[err.peopleStudentCreate.message]} (error code = ${
          err.peopleStudentCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleStudentDelete.message]} (error code = ${
          err.peopleStudentDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleStudentUpdate.message]} (error code = ${
          err.peopleStudentUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    },
    educator: {
      create: {
        message: `${en[err.peopleEducatorCreate.message]} (error code = ${
          err.peopleEducatorCreate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      delete: {
        message: `${en[err.peopleEducatorDelete.message]} (error code = ${
          err.peopleEducatorDelete.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      },
      update: {
        message: `${en[err.peopleEducatorUpdate.message]} (error code = ${
          err.peopleEducatorUpdate.code
        })`,
        options: {
          autoHideDuration: 10000,
          variant: 'error'
        }
      }
    }
  }
};
