import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia
} from '@material-ui/core';
import * as globalStyles from '@app/constants/globalStyles';

const DescriptionCard = ({ children, title, avatarS3URL }) => {
  const classes = globalStyles.globaluseStyles();
  return (
    <Card className={classes.descCard}>
      <CardActionArea>
        {avatarS3URL ? (
          <CardMedia
            className={classes.media}
            title={title}
            image={avatarS3URL}
          />
        ) : (
          []
        )}
        <CardContent>{children}</CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DescriptionCard;
