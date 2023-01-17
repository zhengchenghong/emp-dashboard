/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import 'react-sortable-tree/style.css';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import { getDisplayName } from '@app/utils/functions';
import SortableTree from 'react-sortable-tree';
import FileExplorerTheme from './theme';
import StyledTreeItem from './StyledTreeItem';
import { useTreeListContext } from '@app/providers/TreeListContext';
import { useLazyQuery, useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import { useUserContext } from '@app/providers/UserContext';
import { moveToNewParent as update } from '@app/utils/ApolloCacheManager';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';

let clicks = [];
let timeout;
const DraggableTreeView = ({
  resources: materials,
  setMaterials,
  selectedTreeItem,
  onClick,
  rootTitle,
  onChange,
  expanded,
  classLoadedData,
  stationLoadedData,
  districtLoadedData,
  schoolLoadedData,
  materialLoadedData,
  role,
  loadedclassId,
  searchResults,
  isTopology,
  isResource,
  userInfo,
  updateGrouping,
  isDevices,
  expandedIds,
  setExpandedIds
}) => {
  // const [expandedKeys, setExpandedKeys] = useState([]);
  const [treeData, setTreeData] = useState();
  const [canDrag, setCanDrag] = useState();
  const { isUpdate, setUpdate, setSelectedNode } = useTreeListContext();
  const [currentUser] = useUserContext();
  const [resources, setResources] = useState(materials);
  const { notify } = useNotifyContext();
  const [moveToNewParent] = useMutation(graphql.mutations.MoveToNewParent, {
    update: update
  });

  const canDrop = (data) => {
    const { node, prevParent, nextParent } = data;
    if (node.schemaType === 'class') {
      if (nextParent) {
        return false;
      }
    } else {
      if (
        nextParent &&
        nextParent.childrenIdList &&
        prevParent?.topology?.class === nextParent?.topology?.class
      ) {
        const childNames = nextParent.children?.filter(
          (item) => item.name === node.name
        );
        if (childNames && childNames.length > 1) {
          return false;
        }
        if (prevParent?._id !== nextParent?._id && node.childrenIdList) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
    return true;
  };

  const handleSelect = async (event, nodeIds) => {
    event?.preventDefault();
    clicks.push(new Date().getTime());
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      if (
        clicks.length > 1 &&
        clicks[clicks.length - 1] - clicks[clicks.length - 2] < 250
      ) {
        if (clicks.length > 10) {
          clicks = [];
        }
        onChange && onChange('rename');
      }
    }, 250);

    let selectedItem = resources?.find((e) => e._id === nodeIds);
    if (!selectedItem)
      selectedItem = stationLoadedData?.find((e) => e._id === nodeIds);
    if (!selectedItem)
      selectedItem = districtLoadedData?.find((e) => e._id === nodeIds);
    if (!selectedItem)
      selectedItem = schoolLoadedData?.find((e) => e._id === nodeIds);
    if (!selectedItem)
      selectedItem = classLoadedData?.find((e) => e._id === nodeIds);
    if (materialLoadedData) {
      if (!selectedItem)
        selectedItem = materialLoadedData?.find((e) => e._id === nodeIds);
    }

    if (nodeIds !== 'root') {
      onClick('single', selectedItem);
    }
    if (selectedItem?._id) {
      if (expandedIds.includes(selectedItem._id)) {
      } else {
        if (expandedIds && setExpandedIds)
          setExpandedIds([...expandedIds, selectedItem._id]);
      }
    }
  };

  const childrenTreeItems = (list, parentID, nodeIndex) => {
    let data = list?.filter((e) => e.parentId === parentID);
    const result = data?.map((el, index) => {
      return {
        key: el._id,
        title: el.name,
        expanded: expandedIds.includes(el._id),
        children: childrenTreeItems(list, el._id, index + 2),
        ...el
      };
    });
    return result;
  };

  const topologyChildrenTreeItems = (parentID, nodeIndex, parentType) => {
    let data = [];
    if (parentType === 'root') {
      data = stationLoadedData;
    }
    if (parentType === 'station')
      data = districtLoadedData.filter((e) => e.parentId === parentID);
    if (parentType === 'district')
      data = schoolLoadedData.filter((e) => e.parentId === parentID);
    if (parentType === 'school')
      data = classLoadedData.filter((e) => e.parentId === parentID);
    if (materialLoadedData) {
      if (parentType === 'googleClass') {
        data = materialLoadedData.filter((e) => e.parentId === parentID);
      }
    }

    if (parentID === 'resource') {
      const result = resources
        ?.filter((item) => !item?.parentId)
        ?.map((el, index) => ({
          key: el._id,
          title: el.name,
          expanded: expandedIds.includes(el._id),
          children: childrenTreeItems(resources, el._id, index + 2),
          ...el
        }));
      return result;
    }

    const result = data?.map((el, index) => {
      return {
        key: el._id,
        title: el.name,
        expanded: expandedIds.includes(el._id),
        children: childrenTreeItems(resources, el._id, index + 2),
        ...el
      };
    });
    return result;
  };

  const isChildren = (data) => {
    return data.find((e) => e.parentId === loadedclassId) ? true : false;
  };

  const getTreeItems = () => {
    if (searchResults) {
      if (searchResults === 'No Results') {
        return { key: 0, title: 'No Results' };
      } else {
        let data = searchResults.map((el, index) => {
          if (searchResults.childrenIdList) {
            return { key: 0, title: 'No Results', ...el };
          } else {
            return {
              key: el._id,
              title: getDisplayName(el.name),
              expanded: expandedIds.includes(el._id),
              ...el
            };
          }
        });
        return data;
      }
    } else {
      if (role === 'educator') {
        const title = rootTitle ? rootTitle : 'root';
        let children = [];
        if (isChildren) {
          children = childrenTreeItems(resources, loadedclassId, 2);
        }
        let data = {
          key: loadedclassId,
          title,
          expanded: expandedIds.includes(loadedclassId),
          ...selectedTreeItem,
          children
        };
        return data;
      } else {
        if (isTopology) {
          if (userInfo?.schemaType === 'districtAdmin') {
            const data = districtLoadedData?.map((el, index) => {
              return {
                key: el._id,
                title: el.name,
                expanded: expandedIds.includes(el._id),
                children: topologyChildrenTreeItems(
                  el._id,
                  index + 2,
                  el.schemaType
                ),
                ...el
              };
            });
            return data;
          } else {
            return {
              key: 'root',
              title: rootTitle ? rootTitle : 'root',
              expanded: expandedIds.includes('root'),
              children: topologyChildrenTreeItems('root', 'root', 'root'),
              ...selectedTreeItem
            };
          }
        } else {
          if (!isResource && classLoadedData) {
            const data = classLoadedData?.map((el, index) => {
              return {
                key: el._id,
                title: getDisplayName(el.name),
                expanded: expandedIds.includes(el._id),
                children: childrenTreeItems(resources, el._id, index + 2),
                ...el
              };
            });
            return data;
          } else {
            return {
              key: 'root',
              title: rootTitle ? rootTitle : 'root',
              expanded: expandedIds.includes('root'),
              children: topologyChildrenTreeItems('resource', 'root', 'root'),
              ...selectedTreeItem
            };
          }
        }
      }
    }
  };

  const updateOrder = async (data) => {
    const { treeData, node, path, nextParentNode } = data;

    const { prevNode: uperNode, nextNode: underNode } = getPrevNextNodes(
      node,
      path,
      treeData
    );
    try {
      let tmp = [...resources];
      const timestamp = new Date().valueOf() / 1000;
      let newRank = node.rank;
      if (uperNode && underNode) {
        if (uperNode.parentId !== underNode.parentId) {
          // moved to top or bottom
          if (underNode.parentId === uperNode._id) {
            //moved top
            if (underNode.rank) {
              newRank = underNode.rank - 300;
            } else {
              newRank = timestamp;
            }
          } else {
            //moved bottom
            if (uperNode.rank) {
              newRank = uperNode.rank + 300;
            } else {
              newRank = timestamp;
            }
          }
        } else {
          // dropped between 2 items
          if (uperNode.rank && underNode.rank)
            newRank = (uperNode.rank + underNode.rank) / 2;
          else {
            if (uperNode.rank) {
              newRank = uperNode.rank + 300;
            } else if (underNode.rank) {
              newRank = underNode.rank - 300;
            } else {
              newRank = node.rank && node.rank !== 0 ? node.rank : timestamp;
            }
          }
        }
      } else {
        if (!uperNode && !underNode) {
          newRank = timestamp;
        } else {
          if (uperNode?.rank) {
            newRank = uperNode.rank + 300; // remove 300 second
          } else if (underNode?.rank) {
            newRank = underNode.rank - 300;
          } else {
            newRank = node.rank && node.rank !== 0 ? node.rank : timestamp;
          }
        }
      }
      const rank = Math.round(newRank);

      if (nextParentNode && node.parentId !== nextParentNode._id) {
        const parent = getNodeByKey(node.parentId, treeData);
        const variables = {
          parentId: parent._id,
          parentSchemaType: parent.schemaType,
          newParentId: nextParentNode._id,
          newParentSchemaType: nextParentNode.schemaType,
          _id: node._id
        };

        const { data } = await moveToNewParent({ variables });
        console.log('parent move:', data.movetoNewParent);
        const { doc, newParent, oldParent } = data.movetoNewParent;
        let docIndex = resources.findIndex((item) => item._id === doc?._id);
        if (docIndex >= 0) {
          tmp[docIndex] = doc;
        }
        let newParentIndex = resources.findIndex(
          (item) => item._id === newParent?._id
        );
        if (newParentIndex >= 0) {
          tmp[newParentIndex] = newParent;
        }
        let oldParentIndex = resources.findIndex(
          (item) => item._id === oldParent?._id
        );
        if (oldParentIndex >= 0) {
          tmp[oldParentIndex] = oldParent;
        }
        //setMaterials(tmp.sort((a, b) => a.rank - b.rank));
      }

      const variables = {
        id: node['_id'],
        schemaType: node.schemaType,
        version: node.version,
        trackingAuthorName: currentUser?.name,
        rank: rank
      };

      const { data } = await updateGrouping({
        variables: variables
      });

      console.log('rank', data.updateGrouping);
      let itemIndex = resources.findIndex(
        (item) => item._id === data?.updateGrouping?._id
      );
      if (itemIndex >= 0) {
        tmp[itemIndex] = data?.updateGrouping;
        setMaterials(tmp.sort((a, b) => a.rank - b.rank));
      }
    } catch (err) {
      console.log('update rank error: ', err);
    }
  };

  const getPrevNextNodes = (node, path, tree) => {
    let prevNode = null;
    let nextNode = null;
    if (path.length === 1) {
      // moved classes
      tree.forEach((element, index) => {
        if (element.key === node.key) {
          if (index !== 0) {
            prevNode = tree[index - 1];
          }
          if (index !== tree.length - 1) {
            nextNode = tree[index + 1];
          }
        }
      });
    } else {
      // moved 1 level child
      let parentNode = tree.find((item) => item.key === path[0]);
      if (parentNode)
        parentNode.children?.forEach((element, index) => {
          if (element.key === node.key) {
            if (index !== 0) {
              prevNode = parentNode.children[index - 1];
            }
            if (index !== parentNode.children.length - 1) {
              nextNode = parentNode.children[index + 1];
            }
          }
          if (element.children) {
            // move 2 level child
            element.children.forEach((childElement, index) => {
              if (childElement.key === node.key) {
                if (index !== 0) {
                  prevNode = element.children[index - 1];
                }
                if (index !== element.children.length - 1) {
                  nextNode = element.children[index + 1];
                }
              }
              if (childElement.children) {
                // move 3 level child
                childElement.children.forEach((childChildElement, index) => {
                  if (childChildElement.key === node.key) {
                    if (index !== 0) {
                      prevNode = childElement.children[index - 1];
                    }
                    if (index !== childElement.children.length - 1) {
                      nextNode = childElement.children[index + 1];
                    }
                  }
                });
              }
            });
          }
        });
    }
    return { prevNode, nextNode };
  };

  const getNodeByKey = (key, tree) => {
    if (tree == null || tree.length === 0) return;
    for (const item of tree) {
      if (item._id === key) {
        return item;
      }
      if (item.children) {
        for (const subItem of item.children) {
          if (subItem._id === key) {
            return subItem;
          }
          if (subItem.children) {
            for (const subSubItem of subItem.children) {
              if (subSubItem._id === key) {
                return subSubItem;
              }
              for (const lastSubItem of subSubItem.children) {
                if (lastSubItem._id === key) {
                  return lastSubItem;
                }
              }
            }
          }
        }
      }
    }
  };

  const changeChildPublishStatus = async (node, status) => {
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
    const { data } = await updateGrouping({
      variables
    });
    return data.updateGrouping;
  };

  const unPublish = async (data) => {
    const unpublishedItems = [];
    const result = await changeChildPublishStatus(data, 'unpublished'); // top level
    unpublishedItems.push(result);
    if (data.children && data.children.length > 0) {
      for (const item of data.children) {
        const unPublishedChild = await changeChildPublishStatus(
          item,
          'unpublished'
        ); // 2 level child
        unpublishedItems.push(unPublishedChild);
        if (item.children?.length > 0) {
          for (const child of item.children) {
            const unPublishedChildChild = await changeChildPublishStatus(
              child,
              'unpublished'
            ); // 3 level child
            unpublishedItems.push(unPublishedChildChild);
          }
        }
      }
    }

    let tmp = [...resources];
    for (const published of unpublishedItems) {
      let itemIndex = resources.findIndex((item) => item._id === published._id);
      if (itemIndex >= 0) {
        tmp[itemIndex] = published;
      }
    }
    setMaterials(tmp.sort((a, b) => a.rank - b.rank));
    const notiOps = getNotificationOpt('material', 'success', 'unpublish');
    notify(notiOps.message, notiOps.options);
  };

  useEffect(() => {
    setResources(materials);
  }, [materials]);

  useEffect(() => {
    const data = getTreeItems();
    setTreeData(data);
  }, [
    classLoadedData,
    resources,
    stationLoadedData,
    districtLoadedData,
    materialLoadedData,
    schoolLoadedData,
    expandedIds,
    selectedTreeItem
  ]);

  useEffect(() => {
    if (selectedTreeItem != null) {
      const expands = selectedTreeItem?.parentIdList
        ? [...selectedTreeItem.parentIdList, selectedTreeItem._id]
        : [selectedTreeItem._id, selectedTreeItem.parentId];
      if (setExpandedIds) setExpandedIds(expands);
    }
  }, []);

  useEffect(() => {
    if (isUpdate) {
      const data = getTreeItems();
      setTreeData(data);
      setUpdate(false);
    }
  }, [isUpdate]);

  useEffect(() => {
    if (selectedTreeItem?.schemaType === 'class') {
      setCanDrag(false);
    } else {
      setCanDrag(true);
    }
  }, [selectedTreeItem]);

  useEffect(() => {
    if (expanded) {
      if (!expandedIds.includes(expanded)) {
        if (setExpandedIds) setExpandedIds([...expandedIds, expanded]);
      }
    }
  }, [expanded]);

  useEffect(() => {
    if (selectedTreeItem?._id && treeData) {
      const node = getNodeByKey(selectedTreeItem?._id, treeData);
      setSelectedNode(node);
    }
  }, [selectedTreeItem]);

  return (
    <div className="draggable-container">
      {treeData && (
        <SortableTree
          treeData={treeData}
          onChange={(newTree) => {
            setTreeData(newTree);
          }}
          isVirtualized={false}
          generateNodeProps={({ node, path }) => ({
            title: (
              <StyledTreeItem
                key={node?._id}
                nodeId={node?._id}
                labelText={`${
                  node?.schemaType === 'class'
                    ? node?.source?.classSource?.name
                      ? `${node?.source?.classSource?.name} - `
                      : ''
                    : ''
                }${getDisplayName(node?.name)}`}
                labelIcon={
                  node?.schemaType === 'material' && !node?.childrenIdList
                    ? DescriptionIcon
                    : FolderIcon
                }
                type={node?.schemaType}
                state={node?.status}
                allData={node}
                isChildren={
                  isDevices
                    ? false
                    : node?.childrenIdList?.length > 0
                    ? true
                    : false
                }
                onClick={(event, id) => {
                  handleSelect(event, id);
                  // select(node);
                }}
                isclasses={isDevices ? true : node.schemaType === 'class'}
                selectedTreeItem={selectedTreeItem}
                updateGrouping={updateGrouping}
                unPublish={unPublish}
              />
            )
          })}
          theme={FileExplorerTheme}
          onDragStateChanged={(data) => {
            // console.log(data);
          }}
          onMoveNode={(data) => {
            updateOrder(data);
          }}
          maxDepth={4}
          getNodeKey={(node) => node.node?._id}
          onVisibilityToggle={({ treeData, node, expanded, path }) => {
            if (expanded) {
              if (setExpandedIds) setExpandedIds([...expandedIds, node._id]);
              handleSelect(null, node._id);
            } else {
              var filtered = expandedIds.filter((val) => val !== node._id);
              if (setExpandedIds) setExpandedIds(filtered);
            }
          }}
          canDrop={canDrop}
          canDrag={canDrag}
        />
      )}
    </div>
  );
};

export { DraggableTreeView as default };
