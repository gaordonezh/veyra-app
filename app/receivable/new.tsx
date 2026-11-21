import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { createReceivable } from '../../src/services/receivable.service';
import { Text } from '@/components/Themed';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DatePickerInput from '@/components/DatePickerInput';

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function NewReceivableScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(getToday());
  const [dueDay, setDueDay] = useState('1');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      await createReceivable({
        name,
        amount: Number(amount),
        startDate,
        dueDay: Number(dueDay),
        notes,
      });

      Alert.alert('Registrado', 'La persona se agregó a Por cobrar.');
      router.back();
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Ocurrió un error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nueva cuenta por cobrar</Text>
        <Text style={styles.subtitle}>Registra a una persona que debe pagarte mensualmente.</Text>

        <Input label="Nombre de la persona" placeholder="Ej. Juan Pérez" value={name} onChangeText={setName} />

        <Input label="Importe mensual (S/)" placeholder="Ej. 500" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <DatePickerInput label="Fecha de inicio" value={startDate} onChange={setStartDate} />

        <Input label="Día de vencimiento" placeholder="Ej. 15" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" />

        <Input label="Notas (opcional)" placeholder="Información adicional..." value={notes} onChangeText={setNotes} multiline />

        <Button label={saving ? 'Guardando...' : 'Guardar cuenta'} disabled={saving} size="large" onPress={handleSave} style={{ marginTop: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 26,
  },
});
