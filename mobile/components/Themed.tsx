import * as React from 'react';
import { Text as DefaultText, View as DefaultView, TouchableOpacityProps } from 'react-native';

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import useColorScheme from '../hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import GlobalStyles from '../constants/GlobalStyles';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText 
    style={[{ 
      color, 
      fontSize: GlobalStyles.consts.primaryFontSize,
      fontFamily: GlobalStyles.consts.primaryFontFamily
    }, style]} 
    {...otherProps} 
  />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps}/>;
}
export function GradientView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
  <DefaultView style={[{ backgroundColor }, style]} {...otherProps}>
    <LinearGradient
      colors={['#AB4356', '#630E97']}
      style={{
        height: Layout.window.height,
        width: Layout.window.width,
        position: 'absolute',
        zIndex: -1,
      }}
    />
    {props.children}
  </DefaultView>
  );
}

export function ContainedButton(props: TouchableOpacityProps & { text: string }) {
  return (<TouchableOpacity {...props} style={[{
      backgroundColor: Colors.light.lightGray,
      padding: 10,
      alignItems: 'center',
      borderRadius: GlobalStyles.consts.borderRadius,
    }, 
    props.style
  ]}>
    <Text style={{
      fontFamily: GlobalStyles.consts.headerFontFamily,
      fontSize: GlobalStyles.consts.primaryFontSize,
      textTransform: 'uppercase',
      color: '#000000',
      letterSpacing: 1.25,
    }}>
      {props.text}
    </Text>
  </TouchableOpacity>)
}

export function OutlinedButton(props: TouchableOpacityProps & { text: string }) {
  return (<TouchableOpacity {...props} style={[{
      backgroundColor: 'transparent',
      borderColor: Colors.light.lightGray,
      borderStyle: 'solid',
      borderWidth: 1,
      padding: 10,
      alignItems: 'center',
      borderRadius: GlobalStyles.consts.borderRadius,
    }, 
    props.style
  ]}>
    <Text style={{
      fontFamily: GlobalStyles.consts.headerFontFamily,
      fontSize: GlobalStyles.consts.primaryFontSize,
      textTransform: 'uppercase',
      color: Colors.light.lightGray,
      letterSpacing: 1.25,
    }}>
      {props.text}
    </Text>
  </TouchableOpacity>)
}