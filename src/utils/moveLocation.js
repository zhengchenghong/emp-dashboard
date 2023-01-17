import { useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import { useStateContext } from '@app/providers/StateContext';
import { useUserContext } from '@app/providers/UserContext';
import { groupingList } from '@app/utils/ApolloCacheManager';

export const MoveLocation = async (item, targetParent) => {
  const [stateContext, setStateContext] = useStateContext();
  const [currentUser] = useUserContext();
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping, {
    onCompleted(data) {}
  });
  const [updateGroupingList] = useMutation(
    graphql.mutations.UpdateGroupingList,
    {
      update: groupingList
    }
  );

  // Update currently moved item
  await updateGroupingList({
    variables: {
      id: item._id,
      schemaType: 'material',
      item: targetParent._id,
      fieldName: 'parentIdList',
      type: 'add',
      trackingAuthorName: currentUser?.name
    }
  });

  await updateGroupingList({
    variables: {
      id: targetParent._id,
      schemaType: targetParent.schemaType,
      item: item._id,
      fieldName: 'childrenIdList',
      type: 'add',
      trackingAuthorName: currentUser?.name
    }
  });

  // All chiled list update if selected I tem is collection
  const { material } = stateContext;
  const childs = material.filter((value) => value.parentId === item._id);
  if (childs && childs.length > 0) {
    for (const child of childs) {
      await updateGrouping({
        variables: {
          version: child.version,
          id: child._id,
          schemaType: 'material',
          trackingAuthorName: currentUser?.name,
          topology: targetParent.topology
        }
      });
      await updateGroupingList({
        variables: {
          id: child._id,
          schemaType: 'material',
          item: item._id,
          fieldName: 'parentIdList',
          type: 'add',
          trackingAuthorName: currentUser?.name
        }
      });
      await updateGroupingList({
        variables: {
          id: child._id,
          schemaType: 'material',
          item: targetParent._id,
          fieldName: 'parentIdList',
          type: 'add',
          trackingAuthorName: currentUser?.name
        }
      });
    }
  }
};

export const Reorder = async (item, before, after) => {
  const [currentUser] = useUserContext();
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  let rank = (before.rank + after.rank) / 2;

  console.log('Reorder - selected', item._id);
  console.log('Reorder - moving', ` between ${before._id} and ${after._id}`);
  await updateGrouping({
    variables: {
      version: item.version,
      id: item._id,
      schemaType: 'material',
      trackingAuthorName: currentUser?.name,
      rank
    }
  });
};
