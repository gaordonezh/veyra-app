import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { Text } from './Themed';

interface ButtonProps extends PressableProps {
  label: string;
  fullWidth?: boolean;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  variant?: 'outlined' | 'contained' | 'text';
}

const sizes = {
  small: {
    container: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    text: {
      fontSize: 12,
    },
  },
  normal: {
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
    },
    text: {
      fontSize: 14,
    },
  },
  large: {
    container: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    text: {
      fontSize: 16,
    },
  },
};

const colors = {
  primary: {
    text: {
      content: {},
      text: { color: '#2563EB' },
    },
    outlined: {
      content: {
        borderWidth: 1,
        borderColor: '#2563EB',
        // backgroundColor: '#afc3ed',
      },
      text: { color: '#2563EB' },
    },
    contained: {
      content: { backgroundColor: '#2563EB' },
      text: { color: '#ffffff' },
    },
  },
  success: {
    text: {
      content: {},
      text: { color: '#16A34A' },
    },
    outlined: {
      content: {
        borderWidth: 1,
        borderColor: '#16A34A',
        // backgroundColor: '#DCFCE7',
      },
      text: { color: '#16A34A' },
    },
    contained: {
      content: { backgroundColor: '#16A34A' },
      text: { color: '#ffffff' },
    },
  },
  error: {
    text: {
      content: {},
      text: { color: '#DC2626' },
    },
    outlined: {
      content: {
        borderWidth: 1,
        borderColor: '#DC2626',
        // backgroundColor: '#fed6d6',
      },
      text: { color: '#DC2626' },
    },
    contained: {
      content: { backgroundColor: '#DC2626' },
      text: { color: '#ffffff' },
    },
  },
};

const Button = ({ label, size = 'normal', color = 'primary', variant = 'contained', fullWidth, style, ...rest }: ButtonProps) => {
  const variantStyles = colors[color][variant];

  return (
    <Pressable
      style={[
        styles.newTransactionButton,
        sizes[size].container,
        variantStyles.content,
        rest.disabled ? { opacity: 0.25 } : {},
        fullWidth ? { flex: 1 } : {},
        { ...style },
      ]}
      {...rest}>
      <Text style={[styles.newTransactionButtonText, sizes[size].text, variantStyles.text]}>{label}</Text>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  newTransactionButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  newTransactionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
