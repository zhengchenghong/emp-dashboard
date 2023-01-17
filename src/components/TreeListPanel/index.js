import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFolderOpen,
  faTrashAlt,
  faPencilAlt,
  faFileAlt,
  faArchive,
  faCalendar,
  faCaretRight
} from '@fortawesome/free-solid-svg-icons';

import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel
} from 'react-accessible-accordion';
import { Box, Typography, Tooltip } from '@material-ui/core';
import { useTreeListContext } from '@app/providers/TreeListContext';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { usePaginationContext } from '@app/providers/Pagination';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import './styles.scss';
import useStyles from './style';
import { en } from '@app/language';

const TreeListPanel = ({
  loadedData,
  selectedTreeItem,
  selectedClassItem,
  setSubType,
  setNewElName,
  onClick,
  onChange
  // expandedIds,
  // setExpandedIds
}) => {
  const iconStyle = { minWidth: 20, minHeight: 20 };
  const openIconStyle = {
    minWidth: 20,
    minHeight: 20,
    marginLeft: 'auto',
    marginRight: -20
  };
  const [filteredLoadedData, setFilteredLoadedData] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [selected, setSelected] = useState();
  const [showFolderDoc, setShowFolderDoc] = useState({});
  const [addNewText, setAddNewText] = useState({});

  const { unPublish } = useTreeListContext();
  const { notify } = useNotifyContext();
  const { isUpdate, setUpdate, setSelectedNode } = useTreeListContext();
  const { pageCount } = usePageCountContext();
  const [, , , , pageNumber] = usePaginationContext();

  const classes = useStyles();

  const handleAlignment = (event, newAlignment, id) => {
    setShowFolderDoc({
      ...showFolderDoc,
      [id]: newAlignment
    });
  };

  useEffect(() => {
    if (selectedTreeItem) {
      setSelected(selectedTreeItem?._id);
      const expands = selectedTreeItem?.parentIdList
        ? [...selectedTreeItem.parentIdList, selectedTreeItem._id]
        : [selectedTreeItem._id, selectedTreeItem.parentId];
      setExpandedIds(expands);
    }
  }, []);

  useEffect(() => {
    if (selectedClassItem?.schemaType === 'class') {
      let tmp = loadedData?.filter(
        (el) => el.parentId === selectedClassItem?._id
      );
      const filteredData = tmp.filter(
        (item, index) =>
          pageCount * (pageNumber - 1) <= index &&
          index < pageCount * (pageNumber - 1) + pageCount
      );
      setFilteredLoadedData(tmp);
    }
  }, [selectedClassItem]);

  useEffect(() => {
    if (selectedClassItem?.schemaType === 'class') {
      let tmp = loadedData?.filter(
        (el) => el.parentId === selectedClassItem?._id
      );
      const filteredData = tmp.filter(
        (item, index) =>
          pageCount * (pageNumber - 1) <= index &&
          index < pageCount * (pageNumber - 1) + pageCount
      );
      setFilteredLoadedData(filteredData);
    }
  }, [loadedData, pageNumber, pageCount]);

  // useEffect(() => {
  //   setSubType(showFolderDoc ? 'folder' : 'document');
  // }, [showFolderDoc]);
  let temp;
  const getChildNode = (key, tree) => {
    let childItems = tree.filter((el) => el.parentId === key);
    return childItems;
  };

  const getNodeByKey = (key, tree) => {
    if (tree == null || tree.length === 0) return;
    let tmp = tree.find((el) => el._id === key);
    tmp = { ...tmp, children: getChildNode(key, tree) };
    tmp = {
      ...tmp,
      children: tmp?.children?.map((el) => {
        let temp = el;
        temp = { ...temp, children: getChildNode(el._id, tree) };
        return temp;
      })
    };
    return tmp;
  };

  useEffect(() => {
    if (selected && loadedData) {
      const node = getNodeByKey(selected, loadedData);
      setSelectedNode(node);
    }
  }, [selected]);

  const handleSelect = (item, index) => {
    console.log('id:', index);
    setSelected(item._id);
    onClick('single', item);
  };

  const handleChange = (event) => {
    console.log('event:', event);
    setExpandedIds(event);
  };

  const handleInputChange = ({ target: { name, value } }) => {
    setAddNewText({
      ...addNewText,
      [name]: value
    });
  };

  const handleIconClick = (id) => {
    setShowFolderDoc({
      ...showFolderDoc,
      [id]: showFolderDoc[id] === 'collection' ? 'lesson' : 'collection'
    });
  };

  const onAdd = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      let tmp = loadedData?.find((el) => el._id === e.target.name);
      if (addNewText[e.target.name] === '') {
        return;
      }
      onChange(
        'cardView',
        e.target.id === 'class' ? selectedClassItem : tmp,
        addNewText[e.target.name],
        showFolderDoc[e.target.name] || 'collection'
      );
      setAddNewText('');
    }
  };

  const handleUnpublish = async (item) => {
    let tmp = { ...item, key: item._id };
    await unPublish(tmp);
    const notiOps = getNotificationOpt('material', 'success', 'unpublish');
    notify(notiOps.message, notiOps.options);
  };

  const drawChildrenData = (parentItem) => {
    let childrenList = loadedData?.filter(
      (el) => el.parentId === parentItem?._id
    );
    return (
      <>
        {childrenList.length > 0 &&
          childrenList?.map((row, index) => {
            return (
              <AccordionItem key={`accordion_${index}`} uuid={row?._id}>
                <AccordionItemHeading
                  className={
                    expandedIds?.includes(row._id)
                      ? 'accordion__heading_open'
                      : 'accordion__heading'
                  }
                  onClick={() => handleSelect(row, index)}
                  style={{ border: 'none' }}
                >
                  <AccordionItemButton
                    style={{
                      marginLeft:
                        row.parentIdList.length === 2
                          ? row.parentIdList.length * 10
                          : 20,
                      marginRight:
                        row.parentIdList.length === 2
                          ? row.parentIdList.length * 10
                          : 20,
                      borderBottom: `${
                        3 - row.parentIdList.length / 2
                      }px solid`,
                      borderLeft: `${4 - row.parentIdList.length / 2}px solid`
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        row?.childrenIdList === null
                          ? faFileAlt
                          : expandedIds?.includes(row._id)
                          ? faFolderOpen
                          : faFolder
                      }
                      style={iconStyle}
                    />
                    <span
                      class={
                        selected === row._id
                          ? 'menu-item-text-selected'
                          : 'menu-item-text'
                      }
                    >
                      {row.name}
                    </span>
                    {row.status === 'published' && (
                      <Box
                        className={classes.publishstate}
                        component={Typography}
                        onClick={() => handleUnpublish(row)}
                      >
                        Published
                      </Box>
                    )}
                    {selected === row._id && (
                      <FontAwesomeIcon
                        icon={faCaretRight}
                        style={openIconStyle}
                      />
                    )}
                  </AccordionItemButton>
                </AccordionItemHeading>
                {row?.childrenIdList && (
                  <AccordionItemPanel
                    style={{
                      marginLeft:
                        row.parentIdList.length === 2
                          ? row.parentIdList.length * 10
                          : 20,
                      marginRight:
                        row.parentIdList.length === 2
                          ? row.parentIdList.length * 10
                          : 20,
                      borderBottom: `${
                        3 - row.parentIdList.length / 2
                      }px solid`,
                      borderLeft: `${4 - row.parentIdList.length / 2}px solid`
                    }}
                  >
                    {drawChildrenData(row)}
                  </AccordionItemPanel>
                )}
              </AccordionItem>
            );
          })}
        {parentItem?.childrenIdList !== null && (
          <div className="add_new_inputItem">
            <div
              className="oe-addnew-form-item"
              style={{
                fontSize: '1rem',
                marginLeft:
                  parentItem.parentIdList.length === 1
                    ? (parentItem.parentIdList.length + 1) * 10
                    : 20,
                paddingLeft: (parentItem.parentIdList.length + 1) * 3,
                // paddingRight: 10,
                marginRight:
                  parentItem.parentIdList.length === 1
                    ? (parentItem.parentIdList.length + 1) * 10
                    : 20,
                paddingTop: 10,
                paddingBottom: 10,
                // borderBottom: `${3-parentItem.parentIdList.length/2}px solid`,
                borderLeft: `${
                  3.5 - parentItem.parentIdList.length / 2
                }px solid`
              }}
            >
              <ToggleButtonGroup
                value={showFolderDoc[parentItem._id] || 'collection'}
                exclusive
                onChange={(event, newAlignment) =>
                  handleAlignment(event, newAlignment, parentItem._id)
                }
                aria-label="text alignment"
                style={{ height: '30px' }}
              >
                <ToggleButton value="collection" aria-label="left aligned">
                  <Tooltip title="Collections">
                    <span>
                      <FontAwesomeIcon
                        icon={faFolder}
                        size="lg"
                        className="toggle-collection"
                      />
                    </span>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="lesson" aria-label="centered">
                  <Tooltip title={en['Lessons']}>
                    <span>
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        size="lg"
                        className="toggle-lesson"
                      />
                    </span>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <span className="oe-addnew-form-item-text">
                <input
                  type="text"
                  placeholder={
                    showFolderDoc[parentItem._id] === 'lesson'
                      ? '+ Add a new lesson here'
                      : '+ Add a new collection here'
                  }
                  key={parentItem}
                  name={parentItem._id}
                  value={addNewText[parentItem._id] || ''}
                  onChange={handleInputChange}
                  onKeyDown={(e) => onAdd(e)}
                />
              </span>
              {/* <div className="addnew-form-item-helpertext">
                <label>Click to choose between collection and lessson</label>
              </div> */}
            </div>
          </div>
        )}
      </>
    );
  };
  console.log('res:', loadedData);
  return (
    <div className="accordion-container">
      <Accordion
        allowZeroExpanded={true}
        allowMultipleExpanded={true}
        preExpanded={
          selectedTreeItem?.parentIdList
            ? [...selectedTreeItem.parentIdList, selectedTreeItem._id]
            : selectedTreeItem
            ? [selectedTreeItem._id, selectedTreeItem.parentId]
            : []
        }
        onChange={(event) => handleChange(event)}
        style={{ fontSize: '16px', fontWeight: 500 }}
      >
        {filteredLoadedData?.map((item, index) => {
          return (
            <AccordionItem
              key={`accordion_${index}`}
              uuid={item?._id}
              className={
                expandedIds?.includes(item._id) ? 'accordion__heading_open' : ''
              }
            >
              <AccordionItemHeading
                className={
                  expandedIds?.includes(item._id)
                    ? index === 0
                      ? 'accordion__heading_open_first'
                      : 'accordion__heading_open'
                    : index === 0
                    ? ''
                    : 'accordion__heading_open'
                }
                style={{ borderBottom: '2px solid' }}
                onClick={() => handleSelect(item, index)}
              >
                <AccordionItemButton>
                  <FontAwesomeIcon
                    icon={
                      item?.childrenIdList === null
                        ? faFileAlt
                        : expandedIds?.includes(item._id)
                        ? faFolderOpen
                        : faFolder
                    }
                    style={iconStyle}
                  />
                  <span
                    class={
                      selected === item._id
                        ? 'menu-item-text-selected'
                        : 'menu-item-text'
                    }
                  >
                    {item.name}
                  </span>
                  {item.status === 'published' && (
                    <Box
                      className={classes.publishstate}
                      component={Typography}
                      onClick={() => handleUnpublish(item)}
                    >
                      Published
                    </Box>
                  )}
                  {selected === item._id && (
                    <FontAwesomeIcon
                      icon={faCaretRight}
                      style={{ ...openIconStyle, marginRight: 0 }}
                    />
                  )}
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className="accordion__panel">
                {drawChildrenData(item)}
              </AccordionItemPanel>
            </AccordionItem>
          );
        })}
        <div
          className="add_new_inputItem"
          style={{
            marginRight: '0px',
            marginTop: '8px',
            backgroundColor: 'transparent'
          }}
        >
          <div className="oe-addnew-form-item" style={{ fontSize: '1rem' }}>
            <ToggleButtonGroup
              value={showFolderDoc[selectedClassItem._id] || 'collection'}
              exclusive
              onChange={(event, newAlignment) =>
                handleAlignment(event, newAlignment, selectedClassItem._id)
              }
              aria-label="text alignment"
              style={{ height: '30px' }}
            >
              <ToggleButton value="collection" aria-label="left aligned">
                <Tooltip title="Collection">
                  <span>
                    <FontAwesomeIcon
                      icon={faFolder}
                      size="lg"
                      className="toggle-collection"
                    />
                  </span>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="lesson" aria-label="centered">
                <Tooltip title="Lesson">
                  <span>
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      size="lg"
                      className="toggle-lesson"
                    />
                  </span>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <span className="oe-addnew-form-item-text" style={{ width: '70%' }}>
              <input
                type="text"
                placeholder={
                  showFolderDoc[selectedClassItem._id] === 'lesson'
                    ? '+ Add a new lesson here'
                    : '+ Add a new collection here'
                }
                id="class"
                name={selectedClassItem._id}
                value={addNewText[selectedClassItem._id] || ''}
                onChange={handleInputChange}
                onKeyDown={(e) => onAdd(e)}
              />
            </span>
            {/* <div className="addnew-form-item-helpertext">
              <label>Click to choose between collection and lessson</label>
            </div> */}
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default TreeListPanel;
