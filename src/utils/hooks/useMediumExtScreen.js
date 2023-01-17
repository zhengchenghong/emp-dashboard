import { useWindowSize } from '@app/utils/hooks/window';
import { useMediaQuery } from 'react-responsive';

const useMediumExtScreen = () => {
  const windowSize = useWindowSize();

  // return windowSize?.width < 1461 ? true : false;
  return useMediaQuery({ query: `(max-width: 1460px)` });
};

export default useMediumExtScreen;
