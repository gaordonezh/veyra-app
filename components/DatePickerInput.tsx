import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';

import { Text, View } from './Themed';
import { useColorScheme } from './useColorScheme';
import { inputStyles } from './Input';

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

function parseDate(value: string): Date {
  if (!value) return new Date();

  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day, 12);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function DatePickerInput({ label, value, onChange, minimumDate, maximumDate }: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  const isDark = useColorScheme() === 'dark';

  function handleChange(_event: DateTimePickerChangeEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }

    if (Platform.OS === 'ios') {
      setShowPicker(false);
    }
  }

  return (
    <View transparent>
      <Text style={inputStyles.label}>{label}</Text>

      <Pressable
        style={[inputStyles.input, styles.dateInput, isDark ? inputStyles.inputDark : inputStyles.inputLight]}
        onPress={() => setShowPicker(true)}>
        <Text style={[styles.dateText, { color: isDark ? '#f2f2f2' : '#000000' }]}>{value || 'Seleccionar fecha'}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          onValueChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    justifyContent: 'center',
    minHeight: 52,
  },
  dateText: {
    fontSize: 16,
  },
});
