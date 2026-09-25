import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, View, useColorScheme } from 'react-native';

import { colorTokens } from '@/constants/tokens';
import { searchCities, type CitySuggestion } from '@/lib/geocoding';

type Rect = { top: number; left: number; width: number };

export function CityTypeahead({
  value,
  onChangeText,
  onSelectCity,
  placeholder,
  placeholderTextColor,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSelectCity: (suggestion: CitySuggestion) => void;
  placeholder?: string;
  placeholderTextColor?: string;
}) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<View>(null);
  const scheme = useColorScheme();
  const colors = colorTokens[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // On web, the dropdown is portaled straight onto <body> (see below) so it
  // can't be trapped or painted over by an ancestor's stacking context —
  // which meant it needed measured screen coordinates instead of relying on
  // a parent position: relative to anchor it.
  function measure() {
    if (Platform.OS !== 'web') return;
    const node = containerRef.current as unknown as HTMLElement | null;
    if (node?.getBoundingClientRect) {
      const domRect = node.getBoundingClientRect();
      setRect({ top: domRect.bottom + window.scrollY, left: domRect.left + window.scrollX, width: domRect.width });
    }
  }

  function handleChangeText(text: string) {
    onChangeText(text);
    setOpen(true);
    measure();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setSuggestions(await searchCities(text));
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleFocus() {
    setOpen(true);
    measure();
  }

  function handleSelect(suggestion: CitySuggestion) {
    onSelectCity(suggestion);
    setSuggestions([]);
    setOpen(false);
  }

  const showDropdown = open && (loading || suggestions.length > 0);

  const dropdown = showDropdown ? (
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
      {loading ? (
        <View className="px-md py-sm">
          <ActivityIndicator size="small" />
        </View>
      ) : (
        suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => handleSelect(suggestion)}
            className="px-md py-sm active:opacity-60">
            <Text className="text-caption font-sans text-ink dark:text-ink-dark">{suggestion.label}</Text>
          </Pressable>
        ))
      )}
    </View>
  ) : null;

  return (
    <View ref={containerRef}>
      <TextInput
        className="text-caption font-sans text-ink dark:text-ink-dark"
        style={{ outlineWidth: 0 }}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize="words"
      />

      {Platform.OS === 'web' ? (typeof document !== 'undefined' && dropdown ? createPortal(dropdown, document.body) : null) : dropdown}
    </View>
  );
}
