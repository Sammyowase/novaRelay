import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type Props = TouchableOpacityProps & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async () => {
        if (process.env.EXPO_OS !== 'web') {
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
