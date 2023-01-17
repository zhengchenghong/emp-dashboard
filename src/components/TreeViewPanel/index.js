/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import { Typography, Box } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import useStyles from './style';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import graphql from '@app/graphql';
import { useMutation } from '@apollo/client';
import {
  faTowerCell,
  faSchool,
  faStoreAlt,
  faChalkboardTeacher,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDisplayName } from '@app/utils/functions';
import { useUserContext } from '@app/providers/UserContext';

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`
    }
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool
};

function StyledTreeItem(props) {
  const classes = useStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    color,
    bgColor,
    selected,
    setupUnpublish,
    selectedTreeItem,
    state,
    isChildren,
    isclasses,
    type,
    allData,
    ...other
  } = props;
  const [isUnpublished, setIsUnPublished] = useState(false);
  const [currentUser] = useUserContext();

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);
  const getItemIcon = (value) => {
    if (value === 'station') return faTowerCell;
    if (value === 'district') return faSchool;
    if (value === 'school') return faStoreAlt;
    if (value === 'class') return faChalkboardTeacher;
    if (value === 'googleClass') return faChalkboardTeacher;
    if (value === 'googleMaterial') return faFileAlt;
  };

  useEffect(() => {
    setIsUnPublished(false);
  }, [labelText]);

  const unPublish = async () => {
    const copyStr = JSON.stringify(allData?.lifecycle);
    let newLifeCycle = JSON.parse(copyStr);
    if (newLifeCycle) {
      delete newLifeCycle['__typename'];
    }
    try {
      const result = await updateGrouping({
        variables: {
          id: allData?._id,
          schemaType: allData?.schemaType,
          version: allData?.version,
          trackingAuthorName: currentUser?.name,
          status: 'unpublished',
          lifecycle: {
            ...newLifeCycle,
            publishedOn: null,
            unpublishedOn: null
          }
        }
      });
      if (result) {
        setIsUnPublished(true);
        setupUnpublish(result?.data?.updateGrouping);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isSelected = () => {
    if (selectedTreeItem && selectedTreeItem._id === allData._id) {
      return true;
    }
    return false;
  };

  return (
    <TreeItem
      label={
        <div
          onClick={(event) => {
            // if you want after click do expand/collapse comment this two line
            // event.stopPropagation();
            event.preventDefault();
          }}
          className={classes.labelRoot} //{isSelected() ? classes.labelRootSelected : classes.labelRoot}
        >
          {isclasses ? (
            type !== 'googleMaterial' ? (
              type && (
                <FontAwesomeIcon
                  className={classes.labelIcon}
                  icon={getItemIcon(type)}
                />
              )
            ) : (
              <DescriptionIcon />
            )
          ) : (
            <LabelIcon color="inherit" className={classes.labelIcon} />
          )}
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          {state === 'published' && type === 'material' && !isUnpublished && (
            <Box
              className={classes.publishstate}
              component={Typography}
              onClick={unPublish}
            >
              Published
            </Box>
          )}
          {state === 'packaged' && (
            <Box className={classes.packagestate} component={Typography}>
              Packaged
            </Box>
          )}
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        iconContainer: isChildren ? '' : classes.iconContainer,
        label: classes.label
      }}
      TransitionComponent={TransitionComponent}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelText: PropTypes.string.isRequired
};

let clicks = [];
let timeout;
const CustomTreeView = ({
  resources,
  setupUnpublish,
  selectedTreeItem,
  setSelectedTreeItem,
  onClick,
  rootTitle,
  onChange,
  setSelected,
  selected,
  setExpanded,
  expanded,
  classLoadedData,
  stationLoadedData,
  districtLoadedData,
  schoolLoadedData,
  materialLoadedData,
  role,
  loadedclassId,
  searchResults,
  openSearch,
  isTopology,
  isResource,
  isArchive,
  userInfo
}) => {
  const classes = useStyles();

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = async (event, nodeIds) => {
    event.preventDefault();
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
        onChange('rename');
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

    // setSelectedTreeItem(selectedItem);
    if (nodeIds !== 'root') {
      onClick('single', selectedItem);
    } else {
      onClick('root');
    }
    console.log(nodeIds);
    // setSelected(nodeIds);
  };

  const childrenTreeItems = (resources, parentID, nodeIndex) => {
    let data = resources.filter((e) => e.parentId === parentID);
    return (
      data &&
      data?.map((el, index) => (
        <StyledTreeItem
          key={el._id}
          nodeId={el._id}
          labelText={getDisplayName(el.name)}
          labelIcon={
            el.schemaType === 'googleMaterial' && !el?.childrenIdList?.length
              ? DescriptionIcon
              : FolderIcon
          }
          type={el.schemaType}
          state={el.status}
          setupUnpublish={setupUnpublish}
          allData={el}
          isChildren={el?.childrenIdList?.length > 0 ? true : false}
          selectedTreeItem={selectedTreeItem}
        >
          {childrenTreeItems(resources, el._id, index + 2)}
        </StyledTreeItem>
      ))
    );
  };

  const topologyChildrenTreeItems = (parentID, nodeIndex, parentType) => {
    let data = [];
    if (parentType === 'root') {
      data = stationLoadedData;
    }
    if (parentType === 'station')
      data = districtLoadedData?.filter((e) => e.parentId === parentID);
    if (parentType === 'district')
      data = schoolLoadedData?.filter((e) => e.parentId === parentID);
    if (parentType === 'school')
      data = classLoadedData?.filter((e) => e.parentId === parentID);
    if (materialLoadedData) {
      if (
        parentType === 'googleClass' ||
        parentType === 'class' ||
        parentType === 'material'
      ) {
        data = materialLoadedData?.filter((e) => e.parentId === parentID);
      }
    }

    if (parentType === 'resource') {
      return resources
        ?.filter((item) => !item?.parentId)
        ?.map((el, index) => (
          <StyledTreeItem
            key={el._id}
            nodeId={el._id}
            labelText={`${
              el?.schemaType === 'class'
                ? el?.source?.classSource?.name
                  ? `${el?.source?.classSource?.name} - `
                  : ''
                : ''
            }${getDisplayName(el?.name)}`}
            labelIcon={FolderIcon}
            state={el.status}
            type={el.schemaType}
            allData={el}
            setupUnpublish={setupUnpublish}
            selectedTreeItem={selectedTreeItem}
            isChildren={el?.childrenIdList?.length > 0 ? true : false}
            isclasses
          >
            {childrenTreeItems(resources, el._id, index + 2)}
          </StyledTreeItem>
        ));
    }

    const isChildren = (el) => {
      if (isArchive) {
        if (el?.schemaType === 'school') {
          const children = classLoadedData.filter(
            (item) => item.parentId === el._id
          );
          // if (children.length > 0) return true;
          return children.length > 0 ? true : false;
        }
        return el?.childrenIdList?.length > 0 ? true : false;
      } else {
        return el?.childrenIdList?.length > 0 && el.schemaType !== 'class'
          ? true
          : false;
      }
      // return el?.childrenIdList?.length > 0 && el.schemaType !== 'class'
      //   ? true
      //   : false;
    };

    return (
      data &&
      data?.map((el, index) => (
        <StyledTreeItem
          key={el._id}
          nodeId={el._id}
          labelText={`${
            el?.schemaType === 'class'
              ? el?.source?.classSource?.name
                ? `${el?.source?.classSource?.name} - `
                : ''
              : ''
          }${getDisplayName(el?.name)}`}
          labelIcon={
            el.schemaType === 'material' && !el?.childrenIdList
              ? DescriptionIcon
              : FolderIcon
          }
          type={el.schemaType}
          setupUnpublish={setupUnpublish}
          state={el.status}
          allData={el}
          isChildren={isChildren(el)}
          isclasses={el.schemaType !== 'material' ? true : false}
          selectedTreeItem={selectedTreeItem}
        >
          {topologyChildrenTreeItems(el._id, index + 2, el.schemaType)}
        </StyledTreeItem>
      ))
    );
  };

  return (
    <TreeView
      className={classes.mainRoot}
      // defaultExpanded={['root']}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<PlusSquare />}
      expanded={expanded}
      selected={selected}
      onNodeToggle={handleToggle}
      onNodeSelect={handleSelect}
    >
      {searchResults ? (
        searchResults !== 'No Results' ? (
          searchResults?.map((el, index) =>
            searchResults.childrenIdList == null ? (
              <StyledTreeItem
                key={el._id}
                nodeId={el._id}
                allData={el}
                setupUnpublish={setupUnpublish}
                labelText={getDisplayName(el.name)}
                labelIcon={DescriptionIcon}
                state={el.status}
                type={el.schemaType}
                selectedTreeItem={selectedTreeItem}
              />
            ) : (
              'No Results'
            )
          )
        ) : (
          'No Results'
        )
      ) : role === 'educator' ? (
        <StyledTreeItem
          key={loadedclassId}
          nodeId={loadedclassId}
          labelText={rootTitle ? rootTitle : 'root'}
          labelIcon={FolderIcon}
          allData={selectedTreeItem}
          state=""
          setupUnpublish={setupUnpublish}
          selectedTreeItem={selectedTreeItem}
          isChildren={
            resources.find((e) => e.parentId === loadedclassId) ? true : false
          }
          isclasses
        >
          {childrenTreeItems(resources, loadedclassId, 2)}
        </StyledTreeItem>
      ) : isTopology ? (
        userInfo?.schemaType === 'schoolAdmin' ? (
          schoolLoadedData &&
          schoolLoadedData?.map((el, index) => (
            <StyledTreeItem
              key={el._id}
              nodeId={el._id}
              setupUnpublish={setupUnpublish}
              labelText={getDisplayName(el.name)}
              labelIcon={
                el.schemaType === 'googleMaterial' &&
                !el?.childrenIdList?.length
                  ? DescriptionIcon
                  : FolderIcon
              }
              type={el.schemaType}
              state={el.status}
              allData={el}
              selectedTreeItem={selectedTreeItem}
              isChildren={el?.childrenIdList?.length > 0 ? true : false}
              isclasses
            >
              {topologyChildrenTreeItems(el._id, index + 2, el.schemaType)}
            </StyledTreeItem>
          ))
        ) : userInfo?.schemaType === 'districtAdmin' ? (
          districtLoadedData &&
          districtLoadedData?.map((el, index) => (
            <StyledTreeItem
              key={el._id}
              nodeId={el._id}
              setupUnpublish={setupUnpublish}
              labelText={getDisplayName(el.name)}
              labelIcon={
                el.schemaType === 'googleMaterial' &&
                !el?.childrenIdList?.length
                  ? DescriptionIcon
                  : FolderIcon
              }
              type={el.schemaType}
              state={el.status}
              allData={el}
              selectedTreeItem={selectedTreeItem}
              isChildren={el?.childrenIdList?.length > 0 ? true : false}
              isclasses
            >
              {topologyChildrenTreeItems(el._id, index + 2, el.schemaType)}
            </StyledTreeItem>
          ))
        ) : userInfo?.schemaType === 'schoolAdmin' ? (
          schoolLoadedData &&
          schoolLoadedData?.map((el, index) => (
            <StyledTreeItem
              key={el._id}
              nodeId={el._id}
              setupUnpublish={setupUnpublish}
              labelText={getDisplayName(el.name)}
              labelIcon={
                el.schemaType === 'googleMaterial' &&
                !el?.childrenIdList?.length
                  ? DescriptionIcon
                  : FolderIcon
              }
              type={el.schemaType}
              state={el.status}
              allData={el}
              selectedTreeItem={selectedTreeItem}
              isChildren={el?.childrenIdList?.length > 0 ? true : false}
              isclasses
            >
              {topologyChildrenTreeItems(el._id, index + 2, el.schemaType)}
            </StyledTreeItem>
          ))
        ) : userInfo?.schemaType === 'stationAdmin' ? (
          stationLoadedData?.length > 0 && (
            <StyledTreeItem
              key={stationLoadedData[0]._id}
              nodeId={stationLoadedData[0]._id}
              setupUnpublish={setupUnpublish}
              labelText={getDisplayName(stationLoadedData[0].name)}
              labelIcon={
                stationLoadedData[0].schemaType === 'googleMaterial' &&
                !stationLoadedData[0]?.childrenIdList?.length
                  ? DescriptionIcon
                  : FolderIcon
              }
              type={stationLoadedData[0].schemaType}
              state={stationLoadedData[0].status}
              allData={stationLoadedData[0]}
              selectedTreeItem={selectedTreeItem}
              isChildren={
                stationLoadedData[0]?.childrenIdList?.length > 0 ? true : false
              }
              isclasses
            >
              {topologyChildrenTreeItems(
                stationLoadedData[0]._id,
                0,
                stationLoadedData[0].schemaType
              )}
            </StyledTreeItem>
          )
        ) : (
          <StyledTreeItem
            key="root"
            nodeId="root"
            labelText={rootTitle ? rootTitle : 'root'}
            selectedTreeItem={selectedTreeItem}
            allData={selectedTreeItem}
            setupUnpublish={setupUnpublish}
            labelIcon={FolderIcon}
            state=""
            isChildren={stationLoadedData?.length > 0 ? true : false}
            isclasses
          >
            {topologyChildrenTreeItems('root', 'root', 'root')}
          </StyledTreeItem>
        )
      ) : !isResource ? (
        classLoadedData &&
        classLoadedData?.map((el, index) => (
          <StyledTreeItem
            key={el._id}
            nodeId={el._id}
            allData={el}
            setupUnpublish={setupUnpublish}
            labelText={getDisplayName(el.name)}
            labelIcon={FolderIcon}
            selectedTreeItem={selectedTreeItem}
            state={el.status}
            type={el.schemaType}
            isChildren={el?.childrenIdList?.length > 0 ? true : false}
            isclasses
          >
            {childrenTreeItems(resources, el._id, index + 2)}
          </StyledTreeItem>
        ))
      ) : (
        <>
          <StyledTreeItem
            key="root"
            nodeId="root"
            setupUnpublish={setupUnpublish}
            labelText={rootTitle ? rootTitle : 'root'}
            selectedTreeItem={selectedTreeItem}
            labelIcon={FolderIcon}
            state=""
            allData={selectedTreeItem}
            isChildren={stationLoadedData ? true : false}
            isclasses
          >
            {topologyChildrenTreeItems('resource', 'root', 'root')}
          </StyledTreeItem>
        </>
      )}
    </TreeView>
  );
};

export default CustomTreeView;
