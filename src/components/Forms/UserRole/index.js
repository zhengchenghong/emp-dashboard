import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CustomSelectBox } from '@app/components/Custom';
import graphql from '@app/graphql';
import { CustomDialog } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { en } from '@app/language';

const UserRole = ({ variables, resources, setShowEdit, optionType }) => {
  const [userRole, setUserRole] = useState(() => resources.type);
  const [temSelected, setTemSelected] = useState(resources.type);
  const [showDialog, setShowDialog] = useState(false);
  const { notify } = useNotifyContext();
  useEffect(() => {
    if (resources) {
      setUserRole(resources.type);
    }
  }, [resources]);

  const [updateGroupingType] = useMutation(
    graphql.mutations.updateGroupingType,
    {
      update(cache, { data: { updateGrouping } }) {
        cache.modify({
          id: resources['_id'],
          fields: {
            data(cacheData) {
              return { ...cacheData, ...updateGrouping.type };
            }
          }
        });
        const { grouping } = cache.readQuery({
          query: graphql.queries.grouping,
          variables
        });
        const newData = grouping.filter((el) => el['_id'] != resources['_id']);
        cache.writeQuery({
          query: graphql.queries.grouping,
          variables,
          data: {
            grouping: newData
          }
        });

        const newGrouping = cache.readQuery({
          query: graphql.queries.grouping,
          variables: { ...variables, type: updateGrouping.type }
        });
        if (newGrouping) {
          const newGroupingData = [
            ...newGrouping.grouping,
            { ...updateGrouping, parent: null }
          ];
          cache.writeQuery({
            query: graphql.queries.grouping,
            variables: { ...variables, type: updateGrouping.type },
            data: {
              grouping: newGroupingData
            }
          });
        }
      }
    }
  );

  const handleUserRoleChange = async (selected) => {
    try {
      await updateGroupingType({
        variables: {
          id: resources['_id'],
          collectionName: 'Users',
          type: selected.value,
          parent: null
        }
      });
      const notiOps = getNotificationOpt(
        'people',
        'success',
        'update',
        optionType
      );
      notify(notiOps.message, notiOps.options);
      setShowEdit(false);
      setUserRole(selected.value);
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

  const handleChange = (changeType, decision) => {
    setShowDialog(false);
    if (changeType && decision) {
      handleUserRoleChange(temSelected);
    }
  };

  const handleDialog = (selected) => {
    setTemSelected(selected);
    setShowDialog(true);
  };

  return (
    <>
      <CustomSelectBox
        id="user-role"
        variant="outlined"
        label={en['User Role']}
        value={userRole}
        defaultValue={userRole}
        onChange={handleDialog}
      />
      <CustomDialog
        open={showDialog}
        title={en['Are you sure want to change the role?']}
        mainBtnName="Yes"
        onChange={handleChange}
      />
    </>
  );
};

export default UserRole;
