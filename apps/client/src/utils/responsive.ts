import { Platform, useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  return {
    isWeb,
    isDesktop,
    isTablet,
    isMobile,
    width,
  };
};

export const getMaxWidth = (width: number) => {
  if (width >= 1200) return 1200;
  if (width >= 768) return 800;
  return '100%';
};

