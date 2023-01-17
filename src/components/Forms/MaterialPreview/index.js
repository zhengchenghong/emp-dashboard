import React from 'react';
import clsx from 'clsx';
import { Box, Grid, Card, CardContent, Typography } from '@material-ui/core';
import PDFReader from '@app/components/PDFReader';
import { DescriptionCard } from '@app/components/Cards';
import { TitleText, MaterialText, LongText } from '@app/components/Text';
import * as globalStyles from '@app/constants/globalStyles';

const MaterialPreviewCard = ({ style, resources }) => {
  const classes = globalStyles.globaluseStyles();
  if (!resources?.length) {
    return <></>;
  }
  return (
    <Card style={{ marginTop: '25px' }}>
      <Typography variant="h6">Attachments: </Typography>
      <Card className={classes.descCard}>
        <CardContent>
          {resources.map((item, index) => {
            return (
              <div style={{ marginTop: 10 }}>
                <MaterialText heading="" url={item?.url} name={item?.name} />
                {/* <LongText
                heading="Url"
                value={item?.url}
              /> */}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </Card>
  );
};

export default MaterialPreviewCard;
