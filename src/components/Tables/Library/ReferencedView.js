/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import useStyles from './style';
import { Tooltip } from '@material-ui/core';
// import Tooltip from '@mui/material/Tooltip';
import Expand from 'react-expand-animated';

const ReferencedView = ({ references }) => {
  const classes = useStyles();
  const [showReferences, setShowReferences] = useState();

  return references?.length ? (
    <div
      style={{
        color: '#1890ff',
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 16,
        fontSize: 15
      }}
      onClick={() => setShowReferences(!showReferences)}
    >
      <div style={{ cursor: 'pointer' }}>
        {showReferences ? 'Hide Referenced Videos' : 'Show Referenced Videos'}
      </div>
      <br />
      <Expand open={showReferences}>
        <div>
          {references?.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  color: 'black',
                  background: 'white'
                }}
              >
                <Tooltip
                  placement="bottom-start"
                  title={
                    item?.class?.label +
                    (item?.tier1Material
                      ? ' -> ' + item?.tier1Material?.name
                      : '') +
                    (item?.tier2Material
                      ? ' -> ' + item?.tier2Material?.name
                      : '') +
                    (item?.tier3Material
                      ? ' -> ' + item?.tier3Material?.name
                      : '')
                  }
                  classes={{ tooltip: classes.referenceToolTip }}
                >
                  <div style={{ fontSize: 14 }}>
                    {item?.class?.label +
                      (item?.tier1Material
                        ? ' -> ' + item?.tier1Material?.name
                        : '') +
                      (item?.tier2Material
                        ? ' -> ' + item?.tier2Material?.name
                        : '') +
                      (item?.tier3Material
                        ? ' -> ' + item?.tier3Material?.name
                        : '')}
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </Expand>
    </div>
  ) : (
    <></>
  );
};

export default ReferencedView;
