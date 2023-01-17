import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './node-content-renderer.scss';
import SvgIcon from '@material-ui/core/SvgIcon';

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

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      (child) => child === younger || isDescendant(child, younger)
    )
  );
}

// eslint-disable-next-line react/prefer-stateless-function
class FileThemeNodeContentRenderer extends Component {
  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      icons,
      buttons,
      className,
      style,
      didDrop,
      lowerSiblingCounts,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      treeId, // Not needed, but preserved for other renderers
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      ...otherProps
    } = this.props;
    const nodeTitle = title || node.title;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, i) => {
      scaffold.push(
        <div
          key={`pre_${1 + i}`}
          style={{ width: scaffoldBlockPxWidth }}
          className={'lineBlock'}
        />
      );

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = '';

        if (listIndex === swapFrom + swapLength - 1) {
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = 'highlightBottomLeftCorner';
        } else if (treeIndex === swapFrom) {
          // This block is on the top (source) line
          highlightLineClass = 'highlightTopLeftCorner';
        } else {
          // This block is between the bottom and top
          highlightLineClass = 'highlightLineVertical';
        }

        scaffold.push(
          <div
            key={`highlight_${1 + i}`}
            style={{
              width: scaffoldBlockPxWidth,
              left: scaffoldBlockPxWidth * i
            }}
            className={`${'absoluteLineBlock'} ${highlightLineClass}`}
          />
        );
      }
    });

    const nodeContent = (
      <div style={{ height: '100%' }} {...otherProps}>
        {toggleChildrenVisibility &&
          // node.children &&
          // node.children.length > 0 && (
          node.childrenIdList?.length > 0 && (
            <div
              type="button"
              aria-label={node.expanded ? 'Collapse' : 'Expand'}
              className={
                'expandDiv'
                // node.expanded ? 'collapseButton' : 'expandButton'
              }
              style={{
                left: (lowerSiblingCounts.length - 0.7) * scaffoldBlockPxWidth
              }}
              onClick={() =>
                toggleChildrenVisibility({
                  node,
                  path,
                  treeIndex
                })
              }
            >
              {node.expanded ? <MinusSquare /> : <PlusSquare />}
            </div>
          )}

        <div
          className={
            'rowWrapper' + (!canDrag ? ` ${'rowWrapperDragDisabled'}` : '')
          }
        >
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div style={{ display: 'flex' }}>
              {scaffold}
              <div
                className={
                  'row' +
                  (isLandingPadActive ? ` ${'rowLandingPad'}` : '') +
                  (isLandingPadActive && !canDrop ? ` ${'rowCancelPad'}` : '') +
                  (isSearchMatch ? ` ${'rowSearchMatch'}` : '') +
                  (isSearchFocus ? ` ${'rowSearchFocus'}` : '') +
                  (className ? ` ${className}` : '')
                }
                style={{
                  opacity: isDraggedDescendant ? 0.5 : 1,
                  ...style
                }}
              >
                <div
                  className={
                    'rowContents' +
                    (!canDrag ? ` ${'rowContentsDragDisabled'}` : '')
                  }
                >
                  <div className={'rowToolbar'}>
                    {icons.map((icon, index) => (
                      <div
                        key={index} // eslint-disable-line react/no-array-index-key
                        className={'toolbarButton'}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                  <div className={'rowLabel'}>
                    <span className={'rowTitle'}>
                      {typeof nodeTitle === 'function'
                        ? nodeTitle({
                            node,
                            path,
                            treeIndex
                          })
                        : nodeTitle}
                    </span>
                  </div>

                  <div className={'rowToolbar'}>
                    {buttons.map((btn, index) => (
                      <div
                        key={index} // eslint-disable-line react/no-array-index-key
                        className={'toolbarButton'}
                      >
                        {btn}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: 'copy' })
      : nodeContent;
  }
}

FileThemeNodeContentRenderer.defaultProps = {
  buttons: [],
  canDrag: false,
  canDrop: false,
  className: '',
  draggedNode: null,
  icons: [],
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: null,
  style: {},
  swapDepth: null,
  swapFrom: null,
  swapLength: null,
  title: null,
  toggleChildrenVisibility: null
};

FileThemeNodeContentRenderer.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.node),
  canDrag: PropTypes.bool,
  className: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isSearchFocus: PropTypes.bool,
  isSearchMatch: PropTypes.bool,
  listIndex: PropTypes.number.isRequired,
  lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  style: PropTypes.shape({}),
  swapDepth: PropTypes.number,
  swapFrom: PropTypes.number,
  swapLength: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  toggleChildrenVisibility: PropTypes.func,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,
  rowDirection: PropTypes.string.isRequired,

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  isDragging: PropTypes.bool.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  // Drop target
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool.isRequired
};

export default FileThemeNodeContentRenderer;
