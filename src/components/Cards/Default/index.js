import React from 'react';
import clsx from 'clsx';
import { Card } from '@material-ui/core';
import useStyles from './style';

const DefaultCard = ({
  style,
  children,
  inline,
  disableGray,
  lesson,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx({
        [classes.root]: !lesson && !inline && !disableGray,
        [classes.root_inlineFlex]: !lesson && inline && !disableGray,
        [classes.inlinedisableRoot]: !lesson && inline && disableGray,
        [classes.disableRoot]: !lesson && !inline && disableGray,
        [classes.lessonRoot]: lesson && !inline && !disableGray
      })}
      {...rest}
    >
      <main
        className={clsx({
          [classes.content]: !style,
          [style]: style
        })}
      >
        {children}
      </main>
    </Card>
  );
};

export default DefaultCard;
