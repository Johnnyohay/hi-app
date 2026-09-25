import { Text, View } from 'react-native';

/** Slim persistent brand header shown at the top of every signed-in tab. */
export function BrandHeader() {
  return (
    <View className="px-lg pt-md pb-sm flex-row items-baseline gap-sm">
      <Text className="text-label font-serif-semibold text-ink dark:text-ink-dark">Hi</Text>
      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
        True connections, fast and easy
      </Text>
    </View>
  );
}
