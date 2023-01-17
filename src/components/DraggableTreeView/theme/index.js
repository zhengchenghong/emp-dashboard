// Can override the following:
//
// style: PropTypes.shape({}),
// innerStyle: PropTypes.shape({}),
// reactVirtualizedListProps: PropTypes.shape({}),
// scaffoldBlockPxWidth: PropTypes.number,
// slideRegionSize: PropTypes.number,
// rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
// treeNodeRenderer: PropTypes.func,
// nodeContentRenderer: PropTypes.func,
// placeholderRenderer: PropTypes.func,

import FileThemeNodeContentRenderer from './node-content-renderer';
import FileThemeTreeNodeRenderer from './tree-node-renderer';

export default {
  nodeContentRenderer: FileThemeNodeContentRenderer,
  treeNodeRenderer: FileThemeTreeNodeRenderer,
  scaffoldBlockPxWidth: 25,
  rowHeight: 25,
  slideRegionSize: 50
};
