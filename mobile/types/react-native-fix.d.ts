/**
 * React Native 0.81 ships component classes whose multiple-inheritance chain
 * (Constructor<NativeMethods> & typeof XxxComponent) does not satisfy
 * @types/react's Component interface, causing TS2607/TS2786 on every RN element.
 *
 * This patch re-declares the affected classes as functional-component-compatible
 * so TypeScript accepts them in JSX without changing runtime behaviour.
 */
import React from 'react';
import type {
  ViewProps,
  TextProps,
  TextInputProps,
  ScrollViewProps,
  FlatListProps,
  ActivityIndicatorProps,
  KeyboardAvoidingViewProps,
  TouchableOpacityProps,
  ImageProps,
} from 'react-native';

declare module 'react-native' {
  class View extends React.Component<ViewProps> {}
  class Text extends React.Component<TextProps> {}
  class TextInput extends React.Component<TextInputProps> {}
  class ScrollView extends React.Component<ScrollViewProps> {}
  class ActivityIndicator extends React.Component<ActivityIndicatorProps> {}
  class KeyboardAvoidingView extends React.Component<KeyboardAvoidingViewProps> {}
  class TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  class Image extends React.Component<ImageProps> {}
}

// Stubs for internal React Native / Expo modules that ship without type declarations
declare module 'react-native/Libraries/Image/AssetSourceResolver' {
  const AssetSourceResolver: unknown;
  export default AssetSourceResolver;
}
declare module 'react-native/Libraries/Image/resolveAssetSource' {
  const resolveAssetSource: (source: unknown) => unknown;
  export default resolveAssetSource;
}
declare module '@react-native/assets-registry/registry' {
  export function getAssetByID(id: number): unknown;
  export interface PackagerAsset { [key: string]: unknown }
}
declare module 'invariant' {
  function invariant(condition: unknown, message: string, ...args: unknown[]): asserts condition;
  export default invariant;
}

// expo-router v6 ships .d.ts files that reference non-existent src/ paths.
// This stub provides the types we actually use.
declare module 'expo-router' {
  export { Stack, Tabs } from 'expo-router/build/index';
  export const router: {
    back(): void;
    push(href: string): void;
    replace(href: string): void;
    navigate(href: string): void;
  };
  export function useRouter(): typeof router;
  export function usePathname(): string;
  export function useSegments(): string[];
  export type Href = string;
  export const Link: React.ComponentType<{ href: string; style?: unknown; children?: React.ReactNode; [key: string]: unknown }>;
  export const Redirect: React.ComponentType<{ href: string }>;
}