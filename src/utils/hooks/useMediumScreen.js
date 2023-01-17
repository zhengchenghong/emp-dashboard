import { useWindowSize } from '@app/utils/hooks/window';
import { useMediaQuery } from 'react-responsive';

const useMediumScreen = () => {
  const windowSize = useWindowSize();

  // return windowSize?.width < 1281 ? true : false;
  return useMediaQuery({ query: `(max-width: 1280px)` });
};

export default useMediumScreen;
