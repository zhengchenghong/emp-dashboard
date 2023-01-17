import { useWindowSize } from '@app/utils/hooks/window';
import { useMediaQuery } from 'react-responsive';

const useSmallScreen = () => {
  const windowSize = useWindowSize();

  // return windowSize?.width < 688 ? true : false;
  return useMediaQuery({ query: `(max-width: 688px)` });
};

export default useSmallScreen;
