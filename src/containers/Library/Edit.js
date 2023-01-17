import React, { useState, useEffect, useContext } from 'react';
import { Grid } from '@material-ui/core';
import { EditPanel } from '@app/components/Panels';
import { CustomDialog } from '@app/components/Custom';
import * as globalStyles from '@app/constants/globalStyles';
import { LibraryUploadForm } from '@app/components/Forms';
import { LibraryFilesForm } from '@app/components/Forms';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useAssetContext } from '@app/providers/AssetContext';
import { LibraryTable } from '@app/components/Tables';
import { getFileExtension } from '@app/utils/file-manager';
import { useMutation } from '@apollo/client';
import graphql from '@app/graphql';
import { en } from '@app/language';
import AppContext from '@app/AppContext';
import { useUserContext } from '@app/providers/UserContext';

const LibraryEdit = ({
  resources,
  selectedDocId,
  handleMainChange,
  loadedData
}) => {
  const { notify } = useNotifyContext();
  const [title, setTitle] = useState('');
  const [uploadDialogTitle, setUploadDialogTitle] = useState('');
  const [openUpload, setOpenUpload] = useState(false);
  const [loadedFile, setLoadedFile] = useState();
  const [isTabReset, setIsTabReset] = useState(false);
  const [tabStatus, setTabStatus] = useState({});
  const [isCreated, setIsCreated] = useState(false);
  const [context, setContext] = useContext(AppContext);
  const { uploadbulkFile } = useAssetContext();
  const [currentUser] = useUserContext();
  const [isRefresh, setRefresh] = useState();

  const [createGrouping] = useMutation(graphql.mutations.createGrouping);
  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    onCompleted(data) {
      setContext({
        ...context,
        documentDelete: null
      });
    }
  });

  useEffect(() => {
    if (resources) {
      setTitle(resources.name);
      setIsTabReset(true);
      setTabStatus({
        data: true,
        files: false
      });
    }
  }, [resources]);

  const uploadFile = async (file) => {
    try {
      const fileExt = getFileExtension(file.name);
      const fileName = Math.random().toString(36).substring(3, 8) + 'library';

      const response = await createGrouping({
        variables: {
          schemaType: 'bulkFile',
          version: 1,
          name: fileName + '.' + fileExt,
          trackingAuthorName: currentUser?.name,
          type: resources?.type,
          status: 'uploading'
        }
      });
      const { data } = response;
      const doc = data.createGrouping;
      /********* Origin Code Using the SignedUrl
      const { signedUrl } = await generateSignedUrl(
        `PBS/${docId}`,
        `${fileName}.${fileExt}`
      );

      await axios({
        method: 'put',
        url: `${signedUrl}`,
        data: file,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      ********/
      const docId = doc._id;
      uploadbulkFile(file, docId, doc, resources?.type)
        .then(async (url) => {
          await updateGrouping({
            variables: {
              id: data.createGrouping['_id'],
              schemaType: 'bulkFile',
              version: data.createGrouping['version'],
              trackingAuthorName: currentUser?.name,
              avatar: {
                baseUrl:
                  resources?.type === 'PBS'
                    ? url.split('PBS')[0]
                    : url.split('OER')[0],
                fileDir: resources?.type === 'PBS' ? `PBS/XML` : `OER/CSV`,
                fileName: fileName + '.' + fileExt
              },
              status: 'uploaded',
              updatedAt: resources?.updatedAt
            }
          });
          setIsCreated(true);
          const notiOps = getNotificationOpt('library', 'success', 'upload');
          notify(notiOps.message, notiOps.options);
        })
        .catch((error) => {
          const notiOps = getNotificationOpt('backend', 'error', 'upload');
          notify(`${error?.message}`, notiOps.options);
        });
    } catch (error) {
      console.log(error);
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'upload');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const handleEditPanelChange = async (type) => {
    try {
      if (type === 'upload') {
        setOpenUpload(true);
        setUploadDialogTitle(resources?.name);
      }

      if (type === 'refresh') {
        setRefresh(!isRefresh);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (!value) {
        setOpenUpload(false);
        return;
      }

      uploadFile(loadedFile);
      setOpenUpload(false);
    }
  };

  const handleFormChange = (type, value) => {
    if (type === 'fileUpload') {
      if (value === 'clear') {
        return;
      }

      setLoadedFile(value);
    }
  };

  const handleShowPanel = async (value) => {
    setIsTabReset(false);
    if (value === 0) {
      setTabStatus({
        data: true,
        files: false
      });

      setContext({
        ...context,
        libraries: null
      });
    }

    if (value === 1) {
      setTabStatus({
        data: false,
        files: true
      });
    }
  };

  return (
    <EditPanel
      title={title}
      page={'Libraries'}
      hideAction={true}
      canUpload={tabStatus.files ? true : false}
      canEdit={true}
      isTabReset={isTabReset}
      tabSetting={
        resources.schemaType !== 'sharedLesson' && { data: true, files: true }
      }
      onChange={handleEditPanelChange}
      onTabChange={handleShowPanel}
      canRefresh={tabStatus.data}
      hideTitleOnMobile={true}
    >
      {tabStatus.data && (
        <Grid
          spacing={globalStyles.GridSpacingStyles}
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Grid item xs={12} sm={12} md={12} lg={12} container spacing={3}>
            <LibraryTable
              library={resources}
              isRefresh={isRefresh}
              isLibrary
              deleteDocument
            />
          </Grid>
        </Grid>
      )}
      {tabStatus.files && (
        <Grid
          spacing={globalStyles.GridSpacingStyles}
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <LibraryFilesForm
            isCreated={isCreated}
            type={resources?.type}
            setIsCreated={setIsCreated}
          />
        </Grid>
      )}
      <CustomDialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="lg"
        open={openUpload}
        title={uploadDialogTitle}
        mainBtnName={en['Upload']}
        onChange={handleUploadDialogChange}
      >
        <LibraryUploadForm
          onChange={(value) => handleFormChange('fileUpload', value)}
          schemaType={resources?.schemaType}
        />
      </CustomDialog>
    </EditPanel>
  );
};

export default LibraryEdit;
