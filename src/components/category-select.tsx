import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Pressable, Text, View, useColorScheme } from 'react-native';

import { askCategories, type AskCategoryId } from '@/constants/mock-network';
import { colorTokens } from '@/constants/tokens';

type Rect = { top: number; left: number; width: number };

/**
 * The same fixed categories the Ask flow matches against — so picking what
 * you offer lines up with what someone searching for help can find, instead
 * of a free-text field that never matches the keywords askers pick from.
 */
export function CategorySelect({
  value,
  onChange,
  placeholder = 'Pick a category',
}: {
  value: AskCategoryId | null;
  onChange: (value: AskCategoryId) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const containerRef = useRef<View>(null);
  const scheme = useColorScheme();
  const colors = colorTokens[scheme === 'dark' ? 'dark' : 'light'];

  const selected = askCategories.find((entry) => entry.id === value);

  function measure() {
    if (Platform.OS !== 'web') return;
    const node = containerRef.current as unknown as HTMLElement | null;
    if (node?.getBoundingClientRect) {
      const domRect = node.getBoundingClientRect();
      setRect({ top: domRect.bottom + window.scrollY, left: domRect.left + window.scrollX, width: domRect.width });
    }
  }

  function toggleOpen() {
    measure();
    setOpen((current) => !current);
  }

  function handleSelect(id: AskCategoryId) {
    onChange(id);
    setOpen(false);
  }

  const dropdown = open ? (
    <View
      style={{
        position: 'absolute',
        top: Platform.OS === 'web' && rect ? rect.top : '100%',
        left: Platform.OS === 'web' && rect ? rect.left : 0,
        right: Platform.OS === 'web' && rect ? undefined : 0,
        width: Platform.OS === 'web' && rect ? rect.width : undefined,
        zIndex: 1000,
        marginTop: Platform.OS === 'web' ? 0 : 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      }}>
      {askCategories.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => handleSelect(category.id)}
          className="px-md py-sm active:opacity-60">
          <Text className="text-caption font-sans text-ink dark:text-ink-dark">{category.label}</Text>
        </Pressable>
      ))}
    </View>
  ) : null;

  return (
    <View ref={containerRef}>
      <Pressable
        onPress={toggleOpen}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex-row items-center justify-between rounded-sm border border-hairline dark:border-hairline-dark px-md"
        style={{ minHeight: 40 }}>
        <Text
          className={`text-body font-sans ${
            selected ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-muted-dark'
          }`}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {open ? '▴' : '▾'}
        </Text>
      </Pressable>

      {Platform.OS === 'web' ? (typeof document !== 'undefined' && dropdown ? createPortal(dropdown, document.body) : null) : dropdown}
    </View>
  );
}
