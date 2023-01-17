import React, { useState, useContext, useEffect } from 'react';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import { update } from '@app/utils/ApolloCacheManager';
import { useUserContext } from '@app/providers/UserContext';

const TreeListContext = React.createContext(null);
TreeListContext.displayName = 'SelectionContext';

const TreeListContextProvider = ({ ...props }) => {
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    update: update
  });
  // const [updateGrouping, setUpdateGrouping] = useState();
  const [upsertTracking] = useMutation(graphql.mutations.upsertTracking);
  const [selectedNode, setSelectedNode] = useState();
  const [isUpdate, setUpdate] = useState(false);
  const [isEdited, setEdited] = useState(false);
  const [isUnpublish, setUnpublish] = useState(false);
  const [currentUser] = useUserContext();

  const unPublish = async (node) => {
    try {
      if (node?.status === 'unpublished') return;
      if (isEdited) {
        // save before unpublish
        setUnpublish(true);
        return;
      }

      const result = await changeChildPublishStatus(
        node?.key ? node : selectedNode,
        'unpublished'
      );
      if (result) {
        setUpdate(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const publish = async (unpublishDocId) => {
    try {
      console.log('publish', selectedNode);
      if (selectedNode.status === 'published') return;

      const result = await changeChildPublishStatus(
        selectedNode,
        'published',
        unpublishDocId
      );
      if (result) {
        setUpdate(true);
      }
    } catch (err) {
      console.log(err);
      new Error(err);
    }
  };

  const changeChildPublishStatus = async (node, status, unpublishDocId) => {
    let result;
    let variables = {
      id: node?._id,
      schemaType: node?.schemaType,
      version: node?.version,
      trackingAuthorName: currentUser?.name,
      status: status,
      data: {
        ...node?.data,
        processDate: {
          ...node?.data?.processDate,
          publishedDate: status === 'published' ? new Date() : ''
        }
      }
    };

    if (status === 'unpublished') {
      const copyStr = JSON.stringify(node?.lifecycle);
      let newLifeCycle = JSON.parse(copyStr);
      if (newLifeCycle) {
        delete newLifeCycle['__typename'];
      }
      variables = {
        ...variables,
        lifecycle: {
          ...newLifeCycle,
          publishedOn: null,
          unpublishedOn: null
        }
      };
    }

    if (unpublishDocId !== node?._id) {
      result = await updateGrouping({
        variables
      });
    } else {
      result = node;
    }

    if (node.children && node.children.length > 0) {
      for (const item of node.children) {
        changeChildPublishStatus(item, status);
      }
    }

    return result;
  };

  useEffect(() => {
    if (!isEdited && isUnpublish) {
      setUnpublish(false);
      unPublish();
      console.log('unpublished called');
    }
  }, [isEdited, isUnpublish]);

  const value = {
    publish,
    unPublish,
    setSelectedNode,
    isUpdate,
    setUpdate,
    selectedNode,
    isEdited,
    setEdited,
    isUnpublish,
    setUnpublish,
    changeChildPublishStatus
    // setUpdateGrouping
  };

  return <TreeListContext.Provider value={value} {...props} />;
};

const useTreeListContext = () => {
  return useContext(TreeListContext);
};

export { TreeListContextProvider, useTreeListContext };
