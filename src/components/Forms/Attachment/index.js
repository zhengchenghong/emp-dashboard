/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, createRef } from 'react';
import clsx from 'clsx';
import { Box, Typography, IconButton, Divider, Grid } from '@material-ui/core';
import {
  faPaperclip,
  faImage,
  faFilm,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { CloudUpload, Delete, GetApp } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingCard } from '@app/components/Cards';
import { CustomInput, CustomDialog } from '@app/components/Custom';
import { getNotificationOpt } from '@app/constants/Notifications';
import { hasFileExtension } from '@app/utils/file-manager';
import AttachmentPreview from './Preview';
import useStyles from './style';
import arrayMove from 'array-move';
import { DropzoneArea } from 'material-ui-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAssetContext } from '@app/providers/AssetContext';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { validateFileName } from '@app/utils/validate';
import { en } from '@app/language';

const getIcon = (type) => {
  if (
    type === 'video/x-msvideo' ||
    type === 'video/mpeg' ||
    type === 'video/mp4'
  )
    return faFilm;
  if (type === 'image/png' || type === 'image/jpeg') return faImage;
  if (type === 'application/pdf') return faFilePdf;

  return faPaperclip;
};

const getFileName = (name) => {
  let newName = name.substring(0, name.lastIndexOf('.')) || name;
  newName = newName?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return newName;
};

const AttachmentForm = ({ disable, docId, stationId, resources, onChange }) => {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const refUpload = createRef(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const [isDropping, setIsDropping] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [selected, setSelected] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [fileInfo, setFileInfo] = useState({
    type: null,
    name: '',
    url: '',
    altText: ''
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [isDroped, setIsDroped] = useState(false);
  const { upload } = useAssetContext();

  useEffect(() => {
    setLoadedData(resources || []);
  }, [resources]);

  useEffect(() => {
    if (isDroped) {
      let tempData = [];
      loadedData.forEach((el) => {
        tempData.push({
          altText: el.altText,
          iconUrl: el.iconUrl,
          mimeType: el.mimeType,
          name: el.name,
          type: el.type,
          url: el.url
        });
      });
      onChange('upload', tempData);
      setIsDroped(false);
    }
  }, [loadedData]);

  const handleElClick = (type, value, index) => {
    if (type === 'doubleClick') setOpenPreview(true);

    setSelected(index);
    setCanDelete(true);
    setFileInfo({
      ...fileInfo,
      name: value.name,
      type: value.type,
      url: value.url,
      altText: value.altText
    });
  };

  const handleInputChange = (type, field, value) => {
    if (type === 'upload') {
      if (value.target.files.length === 1) {
        if (!hasFileExtension(value.target.files[0].name)) {
          notify(
            en['Uploaded file must contain extension'] +
              ' type in its name. Ex: .png , .jpg , .csv , .docx',
            { variant: 'warning' }
          );
          return;
        }

        setFile(value.target.files[0]);
        const fileName = value.target.files[0].name;
        // console.log('vailate:', validateFileName(fileName));
        setOpenCreate(true);
        setFileInfo({
          name: getFileName(fileName),
          url: '',
          type: '',
          altText: ''
        });
      }
    }

    if (type === 'drop' && value.length > 0) {
      if (!hasFileExtension(value[0].name)) {
        notify(
          en['Uploaded file must contain extension'] +
            +' ' +
            en['type in its name.'] +
            ' Ex: .png , .jpg , .csv , .docx',
          { variant: 'warning' }
        );
        return;
      }
      setFile(value[0]);
      const fileName = value[0].name;
      setOpenCreate(true);
      setFileInfo({
        name: fileName,
        url: '',
        type: '',
        altText: ''
      });
    }

    if (type === 'createDialog') {
      setFileInfo({
        ...fileInfo,
        [field]: field === 'name' ? getFileName(value) : value
      });
    }

    if (type === 'previewDialog') {
      setFileInfo({
        ...fileInfo,
        [field]: value
      });
    }
  };

  const handleDrag = (type, event) => {
    // if (event.dataTransfer.files.length == 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (type === 'leave') setIsDropping(false);
    if (type === 'over') setIsDropping(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropping(false);
    if (event.dataTransfer.files.length !== 1) {
      const notiOps = getNotificationOpt('attachment', 'warning', 'drop');
      notify(notiOps.message, notiOps.options);
      return;
    }

    if (!hasFileExtension(event.dataTransfer.files[0].name)) {
      notify(
        en['Uploaded file is missing extension'] +
          ' ' +
          en['type in its name.'] +
          '  Ex: .png , .jpg , .csv , .docx',
        { variant: 'warning' }
      );
      return;
    }

    setFile(event.dataTransfer.files[0]);
    const fileName = event.dataTransfer.files[0].name;
    setOpenCreate(true);
    setFileInfo({
      name: fileName,
      url: '',
      type: '',
      altText: ''
    });
  };

  const handleFormAction = async (type) => {
    try {
      if (type === 'upload') {
        refUpload.current.click();
        setFileInfo({
          name: '',
          url: '',
          type: '',
          altText: ''
        });
      }

      if (type === 'download') {
        const elDom = document.createElement('a');
        elDom.setAttribute('href', fileInfo.url);
        elDom.setAttribute('download', '');
        elDom.setAttribute('rel', 'noopener noreferrer');
        elDom.click();
      }
      if (type === 'delete') {
        onChange('delete', loadedData[selected]);
        const tmpData = loadedData.filter((e, idx) => idx !== selected);
        setLoadedData(tmpData);
        setSelected();
        setFileInfo({
          name: '',
          url: '',
          type: '',
          altText: ''
        });
      }
    } catch (error) {
      const notiOps = getNotificationOpt('backend', 'error', 'wrong');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handlePreviewDialogChange = (type, value) => {
    if (type === 'btnClick') {
      if (value) {
        if (!disable) onChange('update', fileInfo);
        setSelected();
        setFileInfo({
          name: '',
          url: '',
          type: '',
          altText: ''
        });
      }
      setOpenPreview(false);
    }
  };

  const handleCreateDialogChange = async (type, value) => {
    try {
      if (value) {
        if (!fileInfo.name) {
          const notiOps = getNotificationOpt('extra', 'error', 'fileName');
          notify(notiOps.message, notiOps.options);
          return;
        }

        if (validateFileName(fileInfo.name)) {
          const notiOps = getNotificationOpt(
            'extra',
            'error',
            'invalildFileName'
          );
          notify(notiOps.message, notiOps.options);
          return;
        }

        if (file) {
          setLoading(true);
          upload([file], stationId, docId, type)
            .then((url) => {
              let tmpData = [];
              for (let obj of loadedData) {
                tmpData.push({
                  altText: obj.altText,
                  iconUrl: obj.iconUrl,
                  mimeType: obj.mimeType,
                  name: obj.name,
                  type: obj.type,
                  url: obj.url
                });
              }
              tmpData = [
                ...tmpData,
                {
                  ...fileInfo,
                  type: file.type,
                  url: url
                }
              ];
              setLoadedData(tmpData);
              onChange('upload', tmpData);
              setLoading(false);
              const notiOps = getNotificationOpt(
                'attachment',
                'success',
                'drop'
              );
              notify(notiOps.message, notiOps.options);
              console.log(url);
            })
            .catch((error) => {
              setLoading(false);
              console.log(error);
              const notiOps = getNotificationOpt('backend', 'error', 'upload');
              notify(`${error}`, notiOps.options);
            });
        }
      }
      setOpenCreate(false);
      setFile();
      setSelected();
      setFileInfo({
        name: '',
        url: '',
        type: '',
        altText: ''
      });
    } catch (error) {
      if ('Network Error' === error?.message) {
        const notiOps = getNotificationOpt('backend', 'error', 'network');
        notify(notiOps.message, notiOps.options);
      } else {
        const notiOps = getNotificationOpt('backend', 'error', 'wrong');
        notify(notiOps.message, notiOps.options);
      }
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: 8,
    margin: `0 0 0px 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'none',

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? 'lightblue' : 'none',
    padding: 8
  });

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    console.log('result:', result);
    const items = reorder(
      loadedData,
      result.source.index,
      result.destination.index
    );

    setIsDroped(true);
    setLoadedData(items);
    setSelected(result.destination.index);
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">
          <FontAwesomeIcon icon={faPaperclip} className={classes.icon} />
          {en['Attachments']}
        </Typography>
        {isDropping || (
          <Box>
            <IconButton
              className={classes.actionButton}
              size="small"
              onClick={() => handleFormAction('upload')}
              disabled={disable}
            >
              <CloudUpload />
            </IconButton>
            <IconButton
              className={classes.actionButton}
              size="small"
              onClick={() => handleFormAction('download')}
              disabled={!canDelete}
            >
              <GetApp />
            </IconButton>
            <IconButton
              className={classes.actionButton}
              size="small"
              onClick={() => handleFormAction('delete')}
              disabled={!canDelete || disable}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>
      <Divider className={classes.separator} />
      <input
        type="file"
        id="file"
        ref={refUpload}
        onChange={(e) => handleInputChange('upload', 'file', e)}
        style={{ display: 'none' }}
      />
      <main
        className={clsx(classes.content, {
          [classes.content]: !isDropping,
          [classes.contendDroping]: isDropping
        })}
      >
        {isDropping ? (
          <FontAwesomeIcon icon={faPaperclip} size="6x" />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {loadedData &&
                    loadedData.map((item, index) => (
                      <Draggable
                        key={`${item.name}-${index}`}
                        draggableId={`${item.name}-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            onClick={() =>
                              handleElClick('singleClick', item, index)
                            }
                            onDoubleClick={() =>
                              handleElClick('doubleClick', item, index)
                            }
                            className={clsx(classes.listItems, {
                              [classes.listItem]: selected !== index,
                              [classes.listItemSelected]: selected === index
                            })}
                          >
                            <Grid container spacing={1}>
                              <Grid item xs={10}>
                                <Typography variant="subtitle1">
                                  <FontAwesomeIcon icon={getIcon(item.type)} />
                                  &nbsp; {item.name}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <Typography variant="subtitle1">
                                  {en['status']}
                                </Typography>
                              </Grid>
                            </Grid>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <LoadingCard
          loading={loading}
          style={classes.listItem}
          onDragOver={(e) => disable || handleDrag('over', e)}
          onDragLeave={(e) => disable || handleDrag('leave', e)}
          onDrop={handleDrop}
        ></LoadingCard>
      </main>
      <div style={{ padding: '10px', background: '#fff' }}>
        <DropzoneArea
          dropzoneText={en['Drag and Drop an Attachment']}
          dropzoneClass={classes.dropzoneClass}
          dropzoneParagraphClass={classes.dropzoneParagraph}
          showPreviewsInDropzone={false}
          showPreviews={false}
          filesLimit={1}
          maxFileSize={1024 * 1024 * 200} //240M max file size
          onChange={(files) => handleInputChange('drop', 'file', files)}
        />
      </div>
      <CustomDialog
        mainBtnName={disable ? null : 'Update'}
        open={openPreview}
        title={en['Preview']}
        onChange={handlePreviewDialogChange}
      >
        <CustomInput
          label={en['File Name']}
          variant="outlined"
          size="small"
          type="text"
          resources={fileInfo.name}
          style={classes.inputArea}
          disabled={disable}
          onChange={(value) =>
            handleInputChange('previewDialog', 'name', value)
          }
        />
        <CustomInput
          label={en['Alt Text']}
          variant="outlined"
          size="small"
          type="text"
          resources={fileInfo.altText}
          style={classes.inputArea}
          disabled={disable}
          onChange={(value) =>
            handleInputChange('previewDialog', 'altText', value)
          }
        />
        <CustomInput
          label={en['File URL']}
          variant="outlined"
          size="small"
          type="text"
          resources={fileInfo.url}
          style={classes.inputArea}
          disabled={true}
          onChange={(value) => handleInputChange('previewDialog', 'url', value)}
        />
        <AttachmentPreview resources={fileInfo} />
      </CustomDialog>
      <CustomDialog
        open={openCreate}
        title={en['Input the attachment name']}
        mainBtnName="Submit"
        onChange={handleCreateDialogChange}
      >
        <CustomInput
          label={en['File Name']}
          variant="outlined"
          size="small"
          helperText={en['Minimum length is six characters.']}
          autoFocus={true}
          style={classes.inputArea}
          resources={getFileName(fileInfo.name)}
          onChange={(value) => handleInputChange('createDialog', 'name', value)}
        />
        <CustomInput
          label={en['Alt Text']}
          variant="outlined"
          size="small"
          helperText=""
          style={classes.inputArea}
          resources={fileInfo?.altText}
          onChange={(value) =>
            handleInputChange('createDialog', 'altText', value)
          }
        />
      </CustomDialog>
    </>
  );
};

export default AttachmentForm;
