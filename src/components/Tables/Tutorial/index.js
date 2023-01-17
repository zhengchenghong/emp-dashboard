/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Pagination from '@material-ui/lab/Pagination';
import { useMutation } from '@apollo/client';
import { useLazyQuery } from '@apollo/client';
import graphql from '@app/graphql';
import { getNotificationOpt } from '@app/constants/Notifications';
import { useNotifyContext } from '@app/providers/NotifyContext';
import { Grid } from '@material-ui/core';
import useStyles from './style';
import { CustomDialog } from '@app/components/Custom';
import { usePageCountContext } from '@app/providers/PageCountContext';
import { en } from '@app/language';
import TutorialCard from '@app/components/Custom/TutorialCard';
import { remove } from '@app/utils/ApolloCacheManager';
import { CustomCheckBox } from '@app/components/Custom';
import { getAssetUrl } from '@app/utils/functions';
import JSONEditor from '@app/components/JSONEditor';

export default function TutorialTable({
  searchValue,
  handleClickMore,
  setEditTutorial,
  tablePage,
  setTablePage
}) {
  const classes = useStyles();
  const { notify } = useNotifyContext();
  const [page, setPage] = useState(tablePage);
  const [openInfo, setOpenInfo] = useState();
  const [tutorial, setTutorial] = useState();
  const { pageCount } = usePageCountContext();
  const [totalPage, setTotalPage] = useState(0);
  const [totalRow, setTotalRow] = useState(0);
  const [nameRegExp, setNameRegExp] = useState('');
  const [loadedData, setLoadedData] = useState([]);
  const [checkbox, setCheckbox] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentRowId, setCurrentRowId] = useState();

  const [deleteDocument] = useMutation(graphql.mutations.deleteDocument, {
    update: (cache, { data: { deleteDocument } }) =>
      remove(cache, { data: { deleteDocument } }, currentRowId)
  });
  const [deleteAssetS3Grouping] = useMutation(
    graphql.mutations.deleteAssetS3Grouping
  );

  const [getTutorials, { loading, error, data }] = useLazyQuery(
    graphql.queries.TutorialGrouping,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const [getTotalCount, { data: totalPageCount }] = useLazyQuery(
    graphql.queries.totalCount,
    {
      fetchPolicy: 'no-cache'
    }
  );

  const fetchTutorials = async () => {
    getTotalCount({
      variables: {
        schemaType: 'tutorial',
        nameRegExp: nameRegExp,
        type: 'EDU'
      }
    });
    getTutorials({
      variables: {
        schemaType: 'tutorial',
        nameRegExp: nameRegExp,
        offset: pageCount * (page - 1),
        limit: pageCount,
        type: 'EDU'
      }
    });
  };

  useEffect(() => {
    if (!loading && !error && data) {
      const { grouping } = data;
      setLoadedData(grouping);
    }
  }, [loading, error, data]);

  useEffect(() => {
    setTotalRow(totalPageCount?.totalCount);
  }, [totalPageCount]);

  useEffect(() => {
    if (searchValue != null) {
      setTotalRow(0);
      setNameRegExp(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    setPage(tablePage);
  }, [tablePage]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
  }, [totalRow]);

  useEffect(() => {
    if (nameRegExp != null) {
      setTotalPage(Math.ceil(totalRow / pageCount));
      getTotalCount({
        variables: {
          schemaType: 'tutorial',
          nameRegExp: nameRegExp,
          type: 'EDU'
        }
      });
      if (page === 1) {
        getTutorials({
          variables: {
            schemaType: 'tutorial',
            nameRegExp: nameRegExp,
            offset: pageCount * (page - 1),
            limit: pageCount,
            type: 'EDU'
          }
        });
      }
      setPage(1);
    }
  }, [nameRegExp]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    getTutorials({
      variables: {
        schemaType: 'tutorial',
        nameRegExp: nameRegExp,
        offset: pageCount * (page - 1),
        limit: pageCount,
        type: 'EDU'
      }
    });
    setTablePage(page);
  }, [page]);

  useEffect(() => {
    setTotalPage(Math.ceil(totalRow / pageCount));
    if (page === 1) {
      getTutorials({
        variables: {
          schemaType: 'tutorial',
          nameRegExp: nameRegExp,
          offset: pageCount * (page - 1),
          limit: pageCount,
          type: 'EDU'
        }
      });
    }
    setPage(1);
  }, [pageCount]);

  useEffect(() => {
    if (totalPage && totalPage !== 0) {
      if (page > totalPage) {
        if (totalPage > 0) {
          setPage(totalPage);
        } else {
          setPage(1);
        }
      }
    }
  }, [totalPage]);

  useEffect(() => {
    if (!error && !loading && data) {
      const { grouping } = data;
      if (grouping) {
        setLoadedData(grouping);
      }
    }
  }, [error, loading, data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleUpdateChange = async (type, value) => {
    if (type === 'edit') {
      setCurrentRowId(value);
      let currentTutorial = loadedData.filter((el) => el._id === value);
      if (currentTutorial.length > 0) {
        setEditTutorial(currentTutorial[0]);
      }
    }

    if (type === 'delete') {
      setCurrentRowId(value);
      setOpenDeleteDialog(true);
    }

    if (type === 'info') {
      let currentTutorial = loadedData.filter((el) => el._id === value);
      if (currentTutorial.length > 0) {
        setTutorial(currentTutorial[0]);
        setOpenInfo(true);
      }
    }
  };

  const deleteData = async (changeType, decision) => {
    if (changeType && decision && !checkbox) {
      const notiOps = getNotificationOpt('tutorial', 'warning', 'delete');
      notify(notiOps.message, notiOps.options);
      return;
    }
    if (changeType && decision && checkbox) {
      try {
        await deleteDocument({
          variables: {
            schemaType: 'tutorial',
            id: currentRowId,
            type: 'EDU'
          }
        });

        const currentRow = loadedData.find((el) => el._id === currentRowId);
        if (currentRow?.avatar?.fileDir?.includes(currentRow?._id)) {
          if (
            currentRow?.avatar &&
            currentRow?.avatar?.baseUrl &&
            currentRow?.avatar?.fileDir &&
            currentRow?.avatar?.fileName
          ) {
            let avatarURL =
              currentRow?.avatar?.baseUrl +
              currentRow?.avatar?.fileDir +
              currentRow?.avatar?.fileName;
            const assetUrl = getAssetUrl(avatarURL).split('/')[3];
            const key = avatarURL.split(assetUrl)[1].slice(1);
            await deleteAssetS3Grouping({
              variables: {
                bucket: assetUrl,
                key: key
              }
            });
          }
        }
        fetchTutorials();
        const notiOps = getNotificationOpt('tutorial', 'success', 'delete');
        notify(notiOps.message, notiOps.options);
      } catch {
        console.log(error.message);
        notify(error.message, { variant: 'error' });

        setOpenDeleteDialog(false);
        setCheckbox(false);
        setCurrentRowId();
        return;
      }
    }
    setOpenDeleteDialog(false);
    setCheckbox(false);
    setCurrentRowId();
  };

  const handleInfoDialogChange = () => {
    setOpenInfo(false);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} style={{ marginBottom: 0 }}>
        <TableContainer>
          <Grid
            container
            style={{ overflow: 'auto', justifyContent: 'center' }}
          >
            {loadedData.map((row, index) => (
              <TutorialCard
                docId={row._id}
                key={index}
                name={row.desc?.title?.length > 0 ? row.desc.title : row.name}
                title={row.desc?.title?.length > 0 ? row.desc.title : null}
                avatar_link={
                  row?.avatar && row?.avatar?.baseUrl && row?.avatar?.fileDir
                    ? row?.avatar?.baseUrl +
                      row?.avatar?.fileDir +
                      row?.avatar?.fileName
                    : null
                }
                shortDescription={row.desc ? row.desc.short : null}
                longDescription={row.desc ? row.desc.long : null}
                onUpdate={handleUpdateChange}
                onClickMore={() => handleClickMore(row)}
              />
            ))}
          </Grid>

          {loadedData?.length > 0 && (
            <Pagination
              count={totalPage}
              size="small"
              page={page}
              siblingCount={0}
              showFirstButton
              showLastButton
              onChange={handleChangePage}
              className={classes.pagination}
            />
          )}
        </TableContainer>

        <CustomDialog
          open={openDeleteDialog}
          title={en[`Do you want to delete this card?`]}
          mainBtnName={en['Delete']}
          onChange={deleteData}
        >
          {en['Are you sure want to delete this data?']}
          <br />
          <CustomCheckBox
            color="primary"
            value={checkbox}
            label={en['I agree with this action.']}
            onChange={(value) => setCheckbox(!value)}
          />
        </CustomDialog>
        <CustomDialog
          open={openInfo}
          title={en['Information']}
          maxWidth="sm"
          fullWidth={true}
          customClass={classes.infoDialogContent}
          onChange={handleInfoDialogChange}
        >
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <JSONEditor disable={false} resources={tutorial} />
          </Grid>
        </CustomDialog>
      </Paper>
    </div>
  );
}
