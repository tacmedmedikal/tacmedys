import { Platform } from 'react-native';

// Utility function for consistent shadow styles across the app
export const createShadowStyle = (
  shadowConfig = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }
) => {
  return Platform.select({
    web: {
      boxShadow: `0 ${shadowConfig.shadowOffset.height}px ${shadowConfig.shadowRadius}px rgba(0, 0, 0, ${shadowConfig.shadowOpacity})`,
    },
    default: {
      shadowColor: shadowConfig.shadowColor,
      shadowOffset: shadowConfig.shadowOffset,
      shadowOpacity: shadowConfig.shadowOpacity,
      shadowRadius: shadowConfig.shadowRadius,
      elevation: shadowConfig.elevation,
    },
  });
};

// Pre-defined shadow styles
export const shadowStyles = {
  small: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }),
  
  medium: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  }),
  
  large: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  }),
};
