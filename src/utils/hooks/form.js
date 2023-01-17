import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';

const diff = (obj1, obj2) => {
  const result = {};
  if (Object.is(obj1, obj2)) {
    return undefined;
  }
  if (!obj2 || typeof obj2 !== 'object') {
    return obj2;
  }
  Object.keys(obj1 || {})
    .concat(Object.keys(obj2 || {}))
    .forEach((key) => {
      if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
        result[key] = obj2[key];
      }
      if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
        const value = diff(obj1[key], obj2[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      }
    });
  return result;
};

export const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(''),
    bind: {
      value,
      onChange: (event) => {
        setValue(event.target.value);
      }
      // required: true
    }
  };
};

export const useFormChangeValidator = (initialData, lastData) => {
  const [initialValue, setInitialValue] = useState();
  const [lastValue, setLastValue] = useState();
  const [changedValue, setChangedValue] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setInitialValue(initialValue);
  }, [initialData]);

  useEffect(() => {
    const result = diff(initialValue, lastValue);
    // set flag value for triggering the form changes
    if (!result || (result && Object.keys(result).length === 0))
      setIsChanged(false);

    if (result && Object.keys(result).length !== 0) setIsChanged(true);

    // set changed value of form data
    setChangedValue(result);
  }, [lastData]);

  return {
    isChanged,
    changedValue,
    setInitialValue,
    setLastValue
  };
};

export const useFetchDataByVariables = (variables) => {
  let grouping = graphql.queries.nameGrouping;
  if (
    variables?.schemaType === 'sysAdmin' ||
    variables?.schemaType === 'superAdmin'
  ) {
    grouping = graphql.queries.SysAdminGrouping;
  } else if (
    variables?.schemaType === 'stationAdmin' ||
    variables?.schemaType === 'districtAdmin' ||
    variables?.schemaType === 'schoolAdmin'
  ) {
    grouping = graphql.queries.AdminGrouping;
  } else if (variables?.schemaType === 'educator') {
    grouping = graphql.queries.EducatorGrouping;
  } else if (variables?.schemaType === 'student') {
    grouping = graphql.queries.StudentGrouping;
  } else if (variables?.schemaType === 'material') {
    grouping = graphql.queries.MaterialGrouping;
  } else if (variables?.schemaType === 'package') {
    grouping = graphql.queries.PackageGrouping;
  } else if (variables?.schemaType === 'class') {
    grouping = graphql.queries.ClassGrouping;
  } else if (variables?.schemaType === 'school') {
    grouping = graphql.queries.SchoolGrouping;
  } else if (variables?.schemaType === 'schoolTerm') {
    grouping = graphql.queries.SchoolTermGrouping;
  } else if (variables?.schemaType === 'district') {
    grouping = graphql.queries.DistrictGrouping;
  } else if (variables?.schemaType === 'station') {
    grouping = graphql.queries.StationGrouping;
  } else if (variables?.schemaType === 'tutorial') {
    grouping = graphql.queries.TutorialGrouping;
  } else if (variables?.schemaType === 'tagList') {
    grouping = graphql.queries.tagList;
  } else if (variables?.schemaType === 'device') {
    grouping = graphql.queries.DeviceGrouping;
  }
  const { loading, error, data, refetch } = useQuery(grouping, {
    variables
  });

  return {
    loading,
    error,
    data,
    refetch
  };
};

export const getGroupingByVariables = (variables) => {
  let grouping = graphql.queries.nameGrouping;
  if (
    variables?.schemaType === 'sysAdmin' ||
    variables?.schemaType === 'superAdmin'
  ) {
    grouping = graphql.queries.SysAdminGrouping;
  } else if (
    variables?.schemaType === 'stationAdmin' ||
    variables?.schemaType === 'districtAdmin' ||
    variables?.schemaType === 'schoolAdmin'
  ) {
    grouping = graphql.queries.AdminGrouping;
  } else if (variables?.schemaType === 'educator') {
    grouping = graphql.queries.EducatorGrouping;
  } else if (variables?.schemaType === 'student') {
    grouping = graphql.queries.StudentGrouping;
  } else if (variables?.schemaType === 'material') {
    grouping = graphql.queries.MaterialGrouping;
  } else if (variables?.schemaType === 'package') {
    grouping = graphql.queries.PackageGrouping;
  } else if (variables?.schemaType === 'class') {
    grouping = graphql.queries.ClassGrouping;
  } else if (variables?.schemaType === 'school') {
    grouping = graphql.queries.SchoolGrouping;
  } else if (variables?.schemaType === 'schoolTerm') {
    grouping = graphql.queries.SchoolTermGrouping;
  } else if (variables?.schemaType === 'district') {
    grouping = graphql.queries.DistrictGrouping;
  } else if (variables?.schemaType === 'station') {
    grouping = graphql.queries.StationGrouping;
  } else if (variables?.schemaType === 'tutorial') {
    grouping = graphql.queries.TutorialGrouping;
  } else if (variables?.schemaType === 'device') {
    grouping = graphql.queries.DeviceGrouping;
  }

  return grouping;
};

export const useTotalCountFetchQuery = (variables) => {
  let grouping = graphql.queries.totalCount;
  const { loading, error, data, refetch } = useQuery(grouping, {
    variables,
    fetchPolicy: 'network-only'
  });

  return {
    data,
    refetch
  };
};

export const usePackageFetchData = (variables) => {
  let grouping = graphql.queries.PackageGrouping;

  const { loading, error, data, refetch } = useQuery(grouping, {
    variables,
    fetchPolicy: 'network-only'
  });

  return {
    loading,
    error,
    data,
    refetch
  };
};

export const useSDashPackageFetchData = (variables) => {
  let grouping = graphql.queries.SDashPackageGrouping;

  const { loading, error, data, refetch } = useQuery(grouping, {
    variables,
    fetchPolicy: 'network-only'
  });

  return {
    loading,
    error,
    data,
    refetch
  };
};

export const useAnalyticsFetchQuery = (variables) => {
  let grouping = graphql.queries.analyticsGrouping;
  const { loading, error, data, refetch } = useQuery(grouping, {
    variables
  });

  return {
    loading,
    error,
    data,
    refetch
  };
};
