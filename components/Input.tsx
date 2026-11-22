import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Text, View } from './Themed';
import { useColorScheme } from './useColorScheme';

interface InputProps extends TextInputProps {
  label: string;
}

const Input = ({ label, style, ...rest }: InputProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View transparent>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[inputStyles.input, isDark ? inputStyles.inputDark : inputStyles.inputLight, rest.multiline ? inputStyles.notes : undefined, style]}
        placeholder="Ej. Pago de trabajo"
        placeholderTextColor={isDark ? '#2f2f2f' : '#bfbfbf'}
        {...rest}
      />
    </View>
  );
};

export default Input;

export const inputStyles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#000000',
    color: '#fcfcfc',
  },
  inputLight: {
    backgroundColor: '#fcfcfc',
    color: '#000000',
  },
  notes: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
