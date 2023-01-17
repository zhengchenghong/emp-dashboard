import React, { useRef, useEffect, useState } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import { DefaultCard } from '@app/components/Cards';
import 'brace/mode/json';
import 'brace/theme/github';
import useStyles from './style';
import { useUserContext } from '@app/providers/UserContext';
import { Grid, Tab, Tabs, Paper, Button } from '@material-ui/core';
import { getConfigParams } from '@app/utils/functions';
import {
  getAssetUrlFromS3,
  accessToAWSwithCoginto,
  getBaseUrlforBackend,
  getBucketName,
  isFileExistS3
} from '@app/utils/aws_s3_bucket';
import { useSmallScreen } from '@app/utils/hooks';

const JSONEditor = ({ disable, resources, onChange, secondObj }) => {
  const classes = useStyles();
  const editorRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);
  const [showTabs, setShowTabs] = useState(false);
  const [jsonFileInfo, setJsonFileInfo] = useState();
  const [packageLink, setPackageLink] = useState();
  const [currentUser] = useUserContext();
  const isSmallScreen = useSmallScreen();

  useEffect(() => {
    async function fetchData() {
      // You can await here
      if (editorRef?.current !== null && resources) {
        editorRef.current.update(resources ? resources : {});
        const { assetBucketName, packageBucketName } = await getConfigParams();
        setPackageLink(
          's3://' +
            packageBucketName +
            '/' +
            resources?.topology?.station +
            '/' +
            resources?._id +
            '.zip'
        );
        let jsonFileUrl =
          's3://' +
          assetBucketName +
          '/' +
          resources?.topology?.station +
          '/' +
          resources?._id +
          '/' +
          resources?._id +
          '.json';
        let res = await getAssetUrlFromS3(jsonFileUrl, 0);
        if (!(await isFileExistS3(res?.split('?')[0]))) {
          getData(res);
        }
      }
      // ...
    }
    fetchData();
  }, [resources]);

  const getData = (jsonFileLink) => {
    if (jsonFileLink == null) return;
    try {
      fetch(jsonFileLink)
        .then(function (response) {
          console.log(response);
          return response.json();
        })
        .then(function (fileJson) {
          setShowTabs(true);
          setJsonFileInfo(fileJson);
          console.log(fileJson);
        });
    } catch (error) {}
  };

  const handlTapChange = async (value) => {
    if (value === 2) {
      let res = await getAssetUrlFromS3(packageLink, 2);
      let elDom = document.createElement('a');
      elDom.setAttribute('href', res);
      elDom.setAttribute('download', '');
      elDom.setAttribute('target', '_blank');
      elDom.setAttribute('rel', 'noopener noreferrer');
      elDom.click();
    } else {
      if (value === 0) {
        editorRef.current.update(resources);
      } else {
        editorRef.current.update(jsonFileInfo);
      }
      setTabValue(value);
    }
  };

  const setRef = (instance) => {
    if (instance) {
      editorRef.current = instance.jsonEditor;
    } else {
      editorRef.current = null;
    }
  };
  return (
    <div>
      {showTabs && currentUser?.schemaType === 'superAdmin' && (
        <div
          className={classes.sliderMenuArea}
          style={{ marginLeft: 'calc(50% - 165px)' }}
        >
          <Paper
            elevation={0}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              backgroundColor: 'transparent'
            }}
            className={classes.sliderMenu}
          >
            <Tabs
              value={tabValue}
              onChange={(event, value) => {
                handlTapChange(value);
              }}
              classes={{
                indicator: classes.indicator
              }}
            >
              <Tab label={'Database'} className={classes.tab} />
              <Tab label={'JSON file'} className={classes.tab} />
              <Tab label={'Package'} className={classes.tab} />
            </Tabs>
          </Paper>
        </div>
      )}

      <DefaultCard className={classes.root} style={{ overflow: 'auto' }}>
        <Editor
          ref={setRef}
          value={tabValue === 0 ? resources : jsonFileInfo}
          mode={'code'}
          onChange={onChange}
          ace={ace}
          theme="ace/theme/github"
          // style={{ height: isSmallScreen ? '100%' : 'calc(100vh - 230px)' }}
        />
        {secondObj && (
          <div>
            Copied Data Info
            <Editor
              value={tabValue === 0 ? secondObj : jsonFileInfo}
              mode={'code'}
              onChange={onChange}
              ace={ace}
              theme="ace/theme/github"
            />
          </div>
        )}
      </DefaultCard>
    </div>
  );
};

export default JSONEditor;
