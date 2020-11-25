import { theme as defaultTheme } from '@chakra-ui/react';

export const theme: typeof defaultTheme =  {
  ...defaultTheme,
  fonts: {
    ...defaultTheme.fonts,
  }
}
