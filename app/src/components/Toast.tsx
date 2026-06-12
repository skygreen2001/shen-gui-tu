import Toast from 'react-native-toast-message';

export { Toast };

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) => {
  Toast.show({
    type,
    text1: message,
    position: 'bottom',
    bottomOffset: 80,
    visibilityTime: Math.min(Math.max(message.length * 80, 2500), 4000),
  });
};
