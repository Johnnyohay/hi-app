import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, useColorScheme } from 'react-native';

import { colorTokens } from '@/constants/tokens';
import { searchCities, type CitySuggestion } from '@/lib/geocoding';

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheme = useColorScheme();
  const colors = colorTokens[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChangeText(text: string) {
    onChangeText(text);
    setOpen(true);

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

  function handleSelect(suggestion: CitySuggestion) {
    onSelectCity(suggestion);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <View>
      <TextInput
        className="text-caption font-sans text-ink dark:text-ink-dark"
        style={{ outlineWidth: 0 }}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize="words"
      />

      {open && (loading || suggestions.length > 0) && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: 4,
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
                <Text className="text-caption font-sans text-ink dark:text-ink-dark">
                  {suggestion.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
