import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

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
          className="rounded-sm border border-hairline dark:border-hairline-dark bg-background dark:bg-background-dark mt-xs"
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20 }}>
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
