import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { CustomSelectBox } from '@app/components/Custom';
import graphql from '@app/graphql';
import { useNotifyContext } from '@app/providers/NotifyContext';

const UserState = ({ resources, optionType }) => {
  const [userState, setUserState] = useState(() => resources.state);
  const { notify } = useNotifyContext();

  useEffect(() => {
    if (resources) {
      setUserState(resources.state);
    }
  }, [resources]);

  const [updateGroupingState] = useMutation(
    graphql.mutations.updateGroupingState,
    {
      update(cache, { data: { updateGrouping } }) {
        cache.modify({
          id: resources['id'],
          fields: {
            data(cacheData) {
              return { ...cacheData, ...updateGrouping.state };
            }
          }
        });
      }
    }
  );

  const handleUserStateChange = async (selected) => {
    try {
      await updateGroupingState({
        variables: {
          id: resources['_id'],
          collectionName: 'Users',
          state: selected.value
        }
      });
      const notiOps = getNotificationOpt(
        'people',
        'success',
        'update',
        optionType
      );
      notify(notiOps.message, notiOps.options);
      setUserState(selected.value);
    } catch (error) {
      const notiOps = getNotificationOpt(
        'people',
        'error',
        'update',
        optionType
      );
      notify(notiOps.message, notiOps.options);
    }
  };

  const stateOptions = [
    { label: 'Active', value: 'active' },
    { label: 'InActive', value: 'inactive' },
    { label: 'Archived', value: 'archived' },
    { label: 'To Be Deleted', value: 'to-be-deleted' }
  ];

  return (
    <>
      <CustomSelectBox
        id="user-state"
        variant="outlined"
        label="User State"
        value={userState}
        defaultValue={userState}
        resources={stateOptions}
        onChange={handleUserStateChange}
      />
    </>
  );
};

export default UserState;
