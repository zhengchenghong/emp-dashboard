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
  TablePagination,
  Checkbox,
  LinearProgress,
  Input,
  Grid
} from '@material-ui/core';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@material-ui/icons';
import { Img } from 'react-image';
import { AvatarUploadForm } from '@app/components/Forms';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, useMutation } from '@apollo/client';
import { getNotificationOpt } from '@app/constants/Notifications';
import { LoadingCard } from '@app/components/Cards';
import graphql from '@app/graphql';
import { CustomDialog, CustomCheckBox } from '@app/components/Custom';
import FilterStudent from './Filter';
import UserSearch from './Search';
import useStyles from './style';
import { UsersResource } from './data';
import JSONEditor from '@app/components/JSONEditor';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { useUserContext } from '@app/providers/UserContext';
import AvatarImage from '@app/components/Custom/AvatarImage/AvatarImage';

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

const StudentTable = ({
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
  studentEditRow,
  showUserDialog,
  setShowUserDialog,
  refresh
}) => {
  const classes = useStyles();
  const mainTable = useRef();
  const { notify } = useNotifyContext();
  const [checkbox, setCheckbox] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [elementToBeDeleted, setElementToBeDeleted] = useState();
  const [loadedData, setLoadedData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [studentClasses, setStudentClasses] = useState([{}]);
  const [openDialog, setOpenDialog] = useState(false);
  const [nameRegExp, setNameRegExp] = useState(null);
  const [loadTableData, setLoadTableData] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowData, setRowData] = useState({
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    // phone: null,
    avatar: null,
    parentId: null,
    childrenIdList: []
  });
  const [loadedResource, setLoadedResource] = useState(() => resources);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isSuperAdmin, setSuperAdmin] = useState(false);
  const [currentUser] = useUserContext();

  const displayStudents = (studentList) => {
    const names = [];
    studentList.map((item) =>
      names.push(
        classLoadedData.find((classItem) => classItem['value'] === item)?.label
      )
    );
    return names.join(', ');
  };

  const [updateGrouping] = useMutation(graphql.mutations.updateGrouping);

  useEffect(() => {
    if (showUserDialog) {
      handleTableChange('add');
      setShowUserDialog(false);
    }
  }, [showUserDialog]);

  useEffect(() => {
    setSuperAdmin(currentUser.schemaType === 'superAdmin');
  }, [currentUser]);

  useEffect(() => {
    if (mainTable && mainTable?.current) {
      mainTable.current.parentNode.scrollTop = 0;
    }
  }, [page]);

  const { loading, error, data } = useQuery(graphql.queries.userGrouping, {
    variables: {
      schemaType: 'student',
      nameRegExp: nameRegExp
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const title = UsersResource.find((item) => item['schemaType'] === type)?.name;

  useEffect(() => {
    setOpenDialog(false);
    setLoadedResource(resources);
  }, [resources]);

  const paginate = (items, page_size, page_number) => {
    return items.slice(page_number * page_size, (page_number + 1) * page_size);
  };

  useEffect(() => {
    if (!error && !loading && data) {
      console.log('loadedRes', loadedResource);
      const { grouping } = data;
      let filteredData = [];
      filteredData = loadedResource?.assigneeIdList
        ?.map((el) => {
          return grouping.find((ee) => ee._id === el)
            ? grouping.find((ee) => ee._id === el)
            : undefined;
        })
        .filter((item) => item !== undefined);
      if (!filteredData) {
        filteredData = [];
      } else {
        filteredData = filteredData.filter(
          (el) => el.parentId === loadedResource.topology.district
        );
      }

      console.log('filter:', filteredData);

      setFilteredData(filteredData);

      const tmp = filteredData.map((el) =>
        studentEditRow?.id === el?._id
          ? {
              id: studentEditRow?.id,
              name: studentEditRow?.name,
              firstName: studentEditRow?.firstName,
              lastName: studentEditRow?.lastName,
              email: studentEditRow?.email,
              parentId: studentEditRow?.parentId,
              status: studentEditRow?.status,
              avatar:
                studentEditRow.avatar?.baseUrl +
                studentEditRow.avatar?.fileDir +
                studentEditRow.avatar?.fileName,
              childrenIdList: studentEditRow?.childrenIdList
                ? studentEditRow?.childrenIdList
                : [],
              version: studentEditRow?.version,
              contact: studentEditRow?.contact,
              topology: studentEditRow?.topology,
              disable: false
            }
          : {
              id: el?._id,
              name: el.name,
              firstName: el?.contact?.firstName,
              lastName: el?.contact?.lastName,
              email: el?.contact?.email,
              parentId: el?.parentId,
              avatar:
                el.avatar?.baseUrl + el.avatar?.fileDir + el.avatar?.fileName,
              status: el?.status,
              childrenIdList: el?.childrenIdList ? el?.childrenIdList : [],
              version: el?.version,
              contact: el?.contact,
              topology: el?.topology,
              disable: true
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
            name: rowData?.name ? rowData?.name : findedData?.name,
            schemaType: type,
            version: findedData?.version,
            trackingAuthorName: currentUser?.name,
            topology: {
              state: findedData?.topology?.state,
              station: findedData?.topology?.station,
              district: findedData?.topology?.district,
              school: findedData?.topology?.school,
              class: findedData?.topology?.class
            },
            avatar: {
              uId: findedData?.avatar?.uId,
              altText: findedData?.avatar?.altText,
              baseUrl: findedData?.avatar?.baseUrl,
              fileDir: findedData?.avatar?.fileDir,
              fileName: findedData?.avatar?.fileName,
              thumbnail: findedData?.avatar?.thumbnail,
              type: findedData?.avatar?.type,
              mimeType: findedData?.avatar?.mimeType,
              status: 'ready',
              data: findedData?.avatar?.data
            },
            childrenIdList: findedData?.childrenIdList,
            parentId: findedData?.parentId,
            contact: {
              firstName: rowData?.firstName
                ? rowData?.firstName
                : findedData?.firstName,
              lastName: rowData?.lastName
                ? rowData?.lastName
                : findedData?.lastName,
              email: rowData?.email ? rowData?.email : findedData?.email
            },
            status: findedData?.status
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
          parentId: data.updateGrouping.parentId,
          avatar: data.updateGrouping.avatar,
          status: data.updateGrouping?.status,
          childrenIdList: data.updateGrouping.childrenIdList,
          version: data.updateGrouping.version,
          topology: data.updateGrouping.topology,
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
        const notiOps = getNotificationOpt('student', 'success', 'update');
        notify(notiOps.message, notiOps.options);
      }

      if (method === 'add') {
        setOpenDialog(true);
      }

      if (method === 'info') {
        setSelectedInfo(filteredData.find((item) => item._id === value.id));
        setOpenInfo(true);
      }
    } catch (error) {
      console.log(error);
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
        schemaType: 'student'
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
        schemaType: 'student'
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
        const notiOps = getNotificationOpt('student', 'warning', 'delete');
        notify(notiOps.message, notiOps.options);
        return;
      }

      const value = elementToBeDeleted;
      if (value && shouldDelete) {
        setOpenDelete(true);
        setElementToBeDeleted(value);
        const tmp = loadedData.find((el) => el['id'] === value);
        if (tmp) {
          const rejectedChildrenIdList = tmp.childrenIdList.filter(
            (el) => el !== docId
          );

          const rejectedAssignList = loadedResource.assigneeIdList
            ? loadedResource.assigneeIdList.filter((el) => el !== tmp['id'])
            : [];

          setLoadedResource((data) => ({
            ...data,
            assigneeIdList: rejectedAssignList
          }));

          await updateGrouping({
            variables: {
              id: tmp.id,
              schemaType: 'student',
              version: tmp.version,
              trackingAuthorName: currentUser?.name,
              contact: tmp.contact,
              topology: null,
              childrenIdList: rejectedChildrenIdList
            }
          });

          let topologyData = {
            state: resources?.topology?.state,
            station: resources?.topology?.station,
            district: resources?.topology?.district,
            school: resources?.topology?.school,
            class: resources?.topology?.class
          };

          await updateGrouping({
            variables: {
              id: resources['_id'],
              schemaType: resources.schemaType,
              version: resources.version,
              trackingAuthorName: currentUser?.name,
              assigneeIdList: rejectedAssignList,
              topology: topologyData,
              status: resources.status
            }
          });

          refresh(true);
          const notiOps = getNotificationOpt('student', 'success', 'delete');
          notify(notiOps.message, notiOps.options);
        }
      }
      setOpenDelete(false);
    } catch (err) {
      console.log(err);
      setOpenDelete(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdded = (type, value) => {
    if (type === 'added') {
      setOpenDialog(false);
      refresh(true);
    }
  };

  const handleInfoDialogChange = async (type, value) => {
    setOpenInfo(false);
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
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Status</TableCell>
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
              loadTableData.map(
                (row, index) =>
                  row && (
                    <TableRow key={row.id}>
                      <TableCell component="th" align="left">
                        {row && row?.disable ? (
                          row.avatar ? (
                            <AvatarImage
                              src={row.avatar}
                              style={{ height: 40, width: 45 }}
                              loader={<LinearProgress />}
                            />
                          ) : (
                            'No Image'
                          )
                        ) : (
                          <AvatarUploadForm
                            acceptedFiles={[
                              'image/png',
                              'image/jpg',
                              'image/jpeg'
                            ]}
                            resources={
                              row &&
                              row.avatar &&
                              row.avatar?.baseUrl &&
                              row.avatar?.fileDir &&
                              row.avatar?.fileName
                                ? row.avatar?.baseUrl +
                                  row.avatar?.fileDir +
                                  row.avatar?.fileName
                                : null
                            }
                            hideArrow={true}
                            onChange={(value) =>
                              handleInputChange('avatar', value, row.id)
                            }
                            buttonCustomize={{ top: '0px', right: '0px' }}
                            disable
                          />
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
                              handleInputChange(
                                'firstName',
                                e.target.value,
                                row.id
                              )
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
                              handleInputChange(
                                'lastName',
                                e.target.value,
                                row.id
                              )
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell component="th" align="left">
                        {row.disable ? (
                          row.email
                        ) : (
                          <TextField
                            defaultValue={row.email}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value, row.id)
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell component="th" align="left">
                        {row?.status && row?.status === 'published'
                          ? (row.status || '').capitalizeFirstLetter()
                          : 'Not Published'}
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
                              renderValue={(selected) =>
                                displayStudents(selected)
                              }
                              MenuProps={MenuProps}
                              style={{ maxWidth: '400px' }}
                            >
                              {classLoadedData
                                .filter((item) =>
                                  schoolData[row.id]
                                    ? schoolData[row.id].indexOf(item.value) >
                                      -1
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
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTableChange(
                                  row.disable ? 'edit' : 'save',
                                  row.id
                                )
                              }
                            >
                              {row.disable ? <EditIcon /> : <SaveIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTableChange('delete', row.id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                            {isSuperAdmin && (
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
                  )
              )}
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
        title="Do you want to delete this Student?"
        mainBtnName="Remove"
        onChange={handleDeleteDialogChange}
      >
        <Typography variant="subtitle1">
          This action will remove the student from the selected class.
        </Typography>
        <CustomCheckBox
          color="primary"
          value={checkbox}
          label="I agree with this action."
          onChange={(value) => setCheckbox(!value)}
        />
      </CustomDialog>

      <CustomDialog open={openDialog} onChange={() => setOpenDialog(false)}>
        <FilterStudent
          resources={loadedResource}
          setResources={setLoadedResource}
          docId={docId}
          onChange={handleAdded}
          schoolLoadedData={schoolLoadedData}
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

export default StudentTable;
