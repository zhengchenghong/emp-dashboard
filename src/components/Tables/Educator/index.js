/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Select,
  Typography,
  Paper,
  Table,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  IconButton,
  ListItemText,
  LinearProgress,
  TablePagination,
  Checkbox,
  Input,
  Grid
} from '@material-ui/core';
import { Img } from 'react-image';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@material-ui/icons';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useLazyQuery } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import graphql from '@app/graphql';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import FilterEducator from './Filter';
import UserSearch from './Search';
import useStyles from './style';
import { UsersResource } from './data';
import JSONEditor from '@app/components/JSONEditor';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';
import { uploadFileToS3, getAssetUrlFromS3 } from '@app/utils/aws_s3_bucket';
import AvatarImage from '@app/components/Custom/AvatarImage/AvatarImage';
import { en } from '@app/language';

const getTypeLabel = (value) => {
  if (value === 'stationAdmin') return 'Station';
  if (value === 'districtAdmin' || value === 'educator' || value === 'student')
    return 'District';
  if (value === 'schoolAdmin') return 'School';
  return 'Type';
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const EducatorTable = ({
  file,
  docId,
  type,
  updateValue,
  filterValue,
  canUpload,
  onChange,
  disable,
  hasTypeField,
  userTypeData,
  classLoadedData,
  schoolLoadedData,
  schemaType,
  resources,
  teacherEditRow,
  showUserDialog,
  setShowUserDialog,
  refresh
}) => {
  const classes = useStyles();
  const mainTable = useRef();
  const { notify } = useNotifyContext();
  const [checkbox, setCheckbox] = useState(false);
  const [loadedData, setLoadedData] = useState([]);
  const [elementToBeDeleted, setElementToBeDeleted] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [schoolData, setSchoolData] = useState([]);
  const [studentClasses, setStudentClasses] = useState([{}]);
  const [openDialog, setOpenDialog] = useState(false);
  const [nameRegExp, setNameRegExp] = useState(null);
  const [loadTableData, setLoadTableData] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(0);
  const [currentUser] = useUserContext();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [originData, setOriginData] = useState();
  const [rowData, setRowData] = useState({
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    // phone: null,
    parentId: null,
    avatar: null,
    childrenIdList: [],
    status: null,
    state: null,
    station: null,
    district: null,
    class: null
  });
  const [loadedResource, setLoadedResource] = useState(() => resources);
  const [loadedMaterials, setLoadedMaterials] = useState();
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const displayStudents = (studentList) => {
    const names = [];
    studentList.map((item) =>
      names.push(
        classLoadedData.find((classItem) => classItem['value'] === item)?.label
      )
    );
    return names.join(', ');
  };

  useEffect(() => {
    if (showUserDialog) {
      handleTableChange('add');
      setShowUserDialog(false);
    }
  }, [showUserDialog]);

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);

  const [
    getMaterials,
    { loading: materialLoading, data: materialData, error: materialError }
  ] = useLazyQuery(graphql.queries.MaterialGrouping);

  const [getEducators, { loading, data, error }] = useLazyQuery(
    graphql.queries.userGrouping
  );

  const fetchMaterials = async () => {
    await getMaterials({
      variables: {
        id: null,
        schemaType: 'material',
        offset: null,
        name: null
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  const fetchEducators = async () => {
    await getEducators({
      variables: {
        schemaType: 'educator',
        nameRegExp: nameRegExp
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first'
    });
  };

  useEffect(() => {
    fetchMaterials();
    fetchEducators();
  }, []);

  useEffect(() => {
    if (!materialLoading && !materialError && materialData) {
      const { grouping } = materialData;
      const filteredData = grouping.filter(
        (el) => el.parentIdList && el.parentIdList.includes(docId)
      );
      setLoadedMaterials(filteredData);
    }
  }, [materialLoading, materialError, materialData]);

  const title = UsersResource.find((item) => item['schemaType'] === type)?.name;

  useEffect(() => {
    setLoadedResource(resources);
  }, [resources]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  const paginate = (items, page_size, page_number) => {
    return items.slice(page_number * page_size, (page_number + 1) * page_size);
  };

  useEffect(() => {
    if (!error && !loading && data) {
      const { grouping } = data;

      let filteredData = [];

      filteredData = loadedResource?.authorIdList
        ?.map((el) => {
          return grouping.find((ee) => ee._id === el)
            ? grouping.find((ee) => ee._id === el)
            : undefined;
        })
        .filter((item) => item !== undefined);

      if (!filteredData) {
        filteredData = [];
      }

      setOriginData(filteredData);

      const tmp = !filteredData[0]
        ? []
        : filteredData.map((el) =>
            teacherEditRow?.id === el?._id
              ? {
                  id: teacherEditRow?.id,
                  name: teacherEditRow?.name,
                  firstName: teacherEditRow?.firstName,
                  lastName: teacherEditRow?.lastName,
                  email: teacherEditRow?.email,
                  // phone: teacherEditRow?.phone,
                  parentId: teacherEditRow?.parentId,
                  avatar:
                    teacherEditRow.avatar?.baseUrl +
                    teacherEditRow.avatar?.fileDir +
                    teacherEditRow.avatar?.fileName,
                  status: teacherEditRow?.status,
                  childrenIdList: teacherEditRow?.childrenIdList
                    ? teacherEditRow?.childrenIdList
                    : [],
                  version: teacherEditRow?.version,
                  contact: teacherEditRow?.contact,
                  loginInfo: teacherEditRow.loginInfo,
                  station: teacherEditRow?.topology?.station,
                  state: teacherEditRow?.topology?.state,
                  school: teacherEditRow?.topology?.school,
                  district: teacherEditRow?.topology?.district,
                  disable: false
                }
              : {
                  id: el['_id'],
                  name: el.name,
                  firstName: el?.contact?.firstName,
                  lastName: el?.contact?.lastName,
                  email: el?.contact?.email,
                  // phone: el?.contact?.phone,
                  parentId: el?.parentId,
                  status: el?.status,
                  avatar:
                    el.avatar?.baseUrl +
                    el.avatar?.fileDir +
                    el.avatar?.fileName,
                  childrenIdList: el?.childrenIdList ? el.childrenIdList : [],
                  version: el?.version,
                  contact: el?.contact,
                  loginInfo: el.loginInfo,
                  disable: true,
                  station: el?.topology?.station,
                  state: el?.topology?.state,
                  school: el?.topology?.school,
                  district: el?.topology?.district
                }
          );
      setTotalRow(tmp.length);

      if (filterValue && filterValue !== 'all') {
        setLoadedData(
          paginate(
            tmp.filter((item) => item.parentId === filterValue),
            rowsPerPage,
            page
          )
        );
      } else {
        setLoadedData(paginate(tmp, rowsPerPage, page));
      }
    }
  }, [loading, error, data, filterValue, loadedResource]);

  const handleTableChange = async (method, value) => {
    try {
      if (method === 'edit') {
        let tmp = loadedData.slice();
        const idx = tmp.findIndex((el) => el.id === value);
        tmp[idx] = {
          ...tmp[idx],
          disable: false
        };

        if (filterValue && filterValue !== 'all') {
          setLoadedData(
            paginate(
              tmp.filter((item) => item.parentId === filterValue),
              rowsPerPage,
              page
            )
          );
        } else {
          setLoadedData(paginate(tmp, rowsPerPage, page));
        }
      }

      if (method === 'delete') {
        setCheckbox(false);
        setOpenDelete(true);
        setElementToBeDeleted(value);
      }

      if (method === 'save') {
        const findedData = loadedData.find((el) => el.id === value);
        const response = await updateGrouping({
          variables: {
            id: value,
            name: rowData.name ? rowData.name : findedData.name,
            schemaType: type,
            version: findedData.version,
            trackingAuthorName: currentUser?.name,
            contact: {
              firstName: rowData.firstName
                ? rowData.firstName
                : findedData?.firstName,
              lastName: rowData.lastName
                ? rowData.lastName
                : findedData?.lastName,
              email: rowData.email ? rowData.email : findedData?.email
              // phone: rowData.phone ? rowData.phone : findedData?.phone
            }
          }
        });
        const { data } = response;
        let tmp = loadedData.slice();
        const idx = tmp.findIndex((el) => el.id === value.toString());
        tmp[idx] = {
          ...tmp[idx],
          name: data.updateGrouping.name,
          fistName: data.updateGrouping.contact?.firstName,
          lastName: data.updateGrouping.contact?.lastName,
          email: data.updateGrouping.contact?.email,
          // phone: data.updateGrouping.contact?.phone,
          parentId: data.updateGrouping.parentId,
          childrenIdList: data.updateGrouping.childrenIdList,
          version: data.updateGrouping.version,
          disable: true
        };

        if (filterValue && filterValue !== 'all') {
          setLoadedData(
            paginate(
              tmp.filter((item) => item.parentId === filterValue),
              rowsPerPage,
              page
            )
          );
        } else {
          setLoadedData(paginate(tmp, rowsPerPage, page));
        }
        onChange('');
        const notiOps = getNotificationOpt('educator', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }

      if (method === 'add') {
        setOpenDialog(true);
      }

      if (method === 'info') {
        let selectedOriginData = originData.filter((el) => el._id === value.id);
        if (selectedOriginData && selectedOriginData.length > 0) {
          setSelectedInfo(selectedOriginData[0]);
        } else {
          setSelectedInfo(value);
        }

        setOpenInfo(true);
      }
    } catch (error) {
      console.log(error.messsage);
      const notiOps = getNotificationOpt('backend', 'error', 'create');
      notify(notiOps.message, notiOps.options);
    }
  };

  const handleInputChange = (method, value, id) => {
    const findedData = loadedData.find((el) => el.id === id);
    if (rowData?.id !== id) {
      setRowData({
        [method]: value,
        id: id
      });
      onChange({
        ...findedData,
        [method]: value,
        id: id,
        schemaType: 'educator'
      });
    } else {
      setRowData({
        ...rowData,
        [method]: value,
        id: id
      });
      onChange({
        ...findedData,
        ...rowData,
        [method]: value,
        id: id,
        schemaType: 'educator'
      });
    }

    if (type === 'student' && method === 'childrenIdList' && hasTypeField) {
      setStudentClasses((data) => ({ ...data, [id]: value }));
    }

    if (type === 'student' && method === 'parentId' && hasTypeField) {
      setStudentClasses((data) => ({ ...data, [id]: [] }));
      const district = userTypeData.find(
        (item) => item['value'] === value
      )?.childrenIdList;
      const schools = schoolLoadedData?.filter(
        (item) => district?.indexOf(item['value']) > -1
      );
      let schoolChildrenList = [];
      schools.map(
        (item) =>
          (schoolChildrenList = [...schoolChildrenList, ...item.childrenIdList])
      );
      setSchoolData((data) => ({ ...data, [id]: schoolChildrenList }));
    }
  };

  const handleDeleteDialogChange = async (type, shouldDelete) => {
    try {
      if (!checkbox && shouldDelete) {
        const notiOps = getNotificationOpt('educator', 'warning', 'delete');
        notify(notiOps.message, notiOps.options);
        return;
      }

      const value = elementToBeDeleted;
      if (value && shouldDelete) {
        const tmp = loadedData.find((el) => el['id'] === value);
        if (tmp) {
          const rejectedChildrenIdList = tmp.childrenIdList.filter(
            (el) => el !== docId
          );

          const rejectedAuthorList = loadedResource.authorIdList
            ? loadedResource.authorIdList.filter((el) => el !== tmp['id'])
            : [];

          setLoadedResource((data) => ({
            ...data,
            authorIdList: rejectedAuthorList
          }));
          await updateGrouping({
            variables: {
              id: tmp['id'],
              schemaType: 'educator',
              version: tmp.version,
              trackingAuthorName: currentUser?.name,
              contact: tmp.contact,
              childrenIdList: rejectedChildrenIdList
            }
          });

          let topologyData = {
            state: loadedResource?.topology?.state,
            station: loadedResource?.topology?.station,
            district: loadedResource?.topology?.district,
            school: loadedResource?.topology?.school,
            class: loadedResource?.topology?.class
          };

          await updateGrouping({
            variables: {
              id: loadedResource['_id'],
              schemaType: loadedResource.schemaType,
              version: loadedResource.version,
              trackingAuthorName: currentUser?.name,
              authorIdList: rejectedAuthorList,
              topology: topologyData,
              status: loadedResource.status
            }
          });

          loadedMaterials &&
            loadedMaterials.map(async (el) => {
              await updateGrouping({
                variables: {
                  id: el._id,
                  schemaType: 'material',
                  version: el.version,
                  trackingAuthorName: currentUser?.name,
                  authorIdList: rejectedAuthorList
                }
              });
            });

          refresh(true);

          // const tmp1 = loadedData.filter((el) => el.id !== value);

          // if (filterValue && filterValue !== 'all') {
          //   setLoadedData(
          //     paginate(
          //       tmp1.filter((item) => item.parentId === filterValue),
          //       rowsPerPage,
          //       page
          //     )
          //   );
          // } else {
          //   setLoadedData(paginate(tmp1, rowsPerPage, page));
          // }
          const notiOps = getNotificationOpt('educator', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
        }
      }
      onChange();
      setOpenDelete(false);
    } catch (err) {
      setOpenDelete(false);
      console.log(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
  };

  const handleAdded = (type, value) => {
    if (type === 'added') {
      setOpenDialog(false);
      // onChange();
      refresh(true);
    }
  };

  useEffect(() => {
    setLoadTableData(loadedData);
  }, [loadedData]);

  return (
    <LoadingCard isProgress={true}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Box display="flex" alignItems="center">
          <UserSearch type={title} onChange={(value) => setNameRegExp(value)} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table
          className={classes.table}
          aria-label="custom pagination table"
          ref={mainTable}
        >
          <TableHead>
            <TableRow>
              <TableCell align="left">Avatar</TableCell>
              <TableCell align="left">Username/Email</TableCell>
              <TableCell align="left">First Name</TableCell>
              <TableCell align="left">Last Name</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Last Seen Time</TableCell>
              <TableCell align="left">EULA signed at</TableCell>

              <TableCell align="left">Signed in #</TableCell>
              {hasTypeField ? (
                <TableCell align="left">{getTypeLabel(type)}</TableCell>
              ) : (
                []
              )}
              {hasTypeField && type === 'student' ? (
                <TableCell align="left">Classes</TableCell>
              ) : (
                []
              )}
              {!disable ? <TableCell align="center"># Action</TableCell> : []}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadTableData.length > 0 &&
              loadTableData.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell component="th" align="left">
                    {row.avatar ? (
                      <AvatarImage
                        src={row.avatar}
                        style={{ height: 40, width: 45 }}
                        loader={<LinearProgress />}
                      />
                    ) : (
                      'No Image'
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.name
                    ) : (
                      <TextField
                        defaultValue={row.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value, row.id)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.firstName
                    ) : (
                      <TextField
                        defaultValue={row.firstName}
                        onChange={(e) =>
                          handleInputChange('firstName', e.target.value, row.id)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.lastName
                    ) : (
                      <TextField
                        defaultValue={row.lastName}
                        onChange={(e) =>
                          handleInputChange('lastName', e.target.value, row.id)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      (row.status || '').capitalizeFirstLetter()
                    ) : (
                      <TextField
                        defaultValue={row.status}
                        onChange={(e) =>
                          handleInputChange('status', e.target.value, row.id)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.loginInfo?.lastSeenAt
                    ) : (
                      <TextField
                        defaultValue={row.loginInfo?.lastSeenAt}
                        onChange={(e) =>
                          handleInputChange(
                            'lastSeenAt',
                            e.target.value,
                            row.id
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.loginInfo?.EULAsignedAt
                    ) : (
                      <TextField
                        defaultValue={row.loginInfo?.EULAsignedAt}
                        onChange={(e) =>
                          handleInputChange(
                            'EULAsignedAt',
                            e.target.value,
                            row.id
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" align="left">
                    {row.disable ? (
                      row.loginInfo?.count
                    ) : (
                      <TextField
                        defaultValue={row.loginInfo?.count}
                        onChange={(e) =>
                          handleInputChange(
                            'loginCount',
                            e.target.value,
                            row.id
                          )
                        }
                      />
                    )}
                  </TableCell>
                  {hasTypeField ? (
                    <TableCell component="th" align="left">
                      {row.disable ? (
                        userTypeData.find(
                          (item) =>
                            item.label === row.parentId ||
                            item.value === row.parentId
                        )?.label
                      ) : (
                        <Select
                          id="user-type-selector"
                          defaultValue={row.parentId}
                          style={{ minWidth: '80px' }}
                          onChange={(e) =>
                            handleInputChange(
                              'parentId',
                              e.target.value,
                              row.id
                            )
                          }
                        >
                          {userTypeData.map((item, index) => (
                            <MenuItem
                              value={item.value}
                              key={index}
                              selected={row.parentId === item.value}
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </TableCell>
                  ) : (
                    []
                  )}
                  {hasTypeField && type === 'student' ? (
                    <TableCell component="th" align="left">
                      {row.disable ? (
                        studentClasses[row.id] ? (
                          displayStudents(studentClasses[row.id])
                        ) : (
                          ''
                        )
                      ) : (
                        <Select
                          labelId="demo-mutiple-chip-label"
                          id="demo-mutiple-chip"
                          multiple
                          value={studentClasses[row.id]}
                          onChange={(e) =>
                            handleInputChange(
                              'childrenIdList',
                              e.target.value,
                              row.id
                            )
                          }
                          input={<Input id="select-multiple-chip" />}
                          renderValue={(selected) => displayStudents(selected)}
                          MenuProps={MenuProps}
                          style={{ maxWidth: '400px' }}
                        >
                          {classLoadedData
                            .filter((item) =>
                              schoolData[row.id]
                                ? schoolData[row.id].indexOf(item.value) > -1
                                : false
                            )
                            .map((item, index) => (
                              <MenuItem key={index} value={item.value}>
                                <Checkbox
                                  checked={
                                    studentClasses[row.id]
                                      ? studentClasses[row.id].indexOf(
                                          item.value
                                        ) > -1
                                      : false
                                  }
                                />
                                <ListItemText primary={item.label} />
                              </MenuItem>
                            ))}
                        </Select>
                      )}
                    </TableCell>
                  ) : (
                    []
                  )}
                  {!disable ? (
                    <TableCell component="th" align="center">
                      <Box textAlign="center">
                        <IconButton size="small">
                          {row.disable ? (
                            <EditIcon
                              onClick={() => handleTableChange('edit', row.id)}
                            />
                          ) : (
                            <SaveIcon
                              onClick={() => handleTableChange('save', row.id)}
                            />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleTableChange('delete', row.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        {currentUser.schemaType === 'superAdmin' && (
                          <IconButton
                            size="small"
                            onClick={() => handleTableChange('info', row)}
                          >
                            <FontAwesomeIcon
                              icon={faInfo}
                              size="sm"
                              style={{ cursor: 'pointer' }}
                            />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  ) : (
                    []
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRow}
          page={page}
          rowsPerPageOptions={[5, 10, 15, 20]}
          onChangePage={handleChangePage}
          rowsPerPage={rowsPerPage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableContainer>

      <CustomDialog
        open={openDelete}
        title="Do you want to delete this Educator?"
        mainBtnName="Remove"
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          This action will remove the educator from the selected class.
        </Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label={en['I agree with this action.']}
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>

      <CustomDialog open={openDialog} onChange={() => setOpenDialog(false)}>
        <FilterEducator
          resources={loadedResource}
          setResources={setLoadedResource}
          docId={docId}
          onChange={handleAdded}
          schoolLoadedData={schoolLoadedData}
          loadedMaterials={loadedMaterials}
        />
      </CustomDialog>
      <CustomDialog
        open={openInfo}
        title="Information"
        maxWidth="sm"
        fullWidth={true}
        onChange={handleInfoDialogChange}
      >
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <JSONEditor disable={false} resources={selectedInfo} />
        </Grid>
      </CustomDialog>
    </LoadingCard>
  );
};

export default EducatorTable;
