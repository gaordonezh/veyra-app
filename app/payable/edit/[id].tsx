import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getPayableDetails, updatePayable } from '../../../src/services/payable.service';
import { Text, View } from '@/components/Themed';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DatePickerInput from '@/components/DatePickerInput';

export default function EditPayableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPayable() {
      try {
        const details = await getPayableDetails(Number(id));

        if (!details) {
          Alert.alert('Error', 'No se encontró el pago fijo.', [{ text: 'Aceptar', onPress: () => router.back() }]);
          return;
        }

        setName(details.name);
        setAmount((details.amount / 100).toFixed(2));
        setStartDate(details.start_date);
        setDueDay(String(details.due_day));
        setNotes(details.notes ?? '');
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar el pago fijo.');
      } finally {
        setLoading(false);
      }
    }

    loadPayable();
  }, [id, router]);

  async function handleSave() {
    try {
      setSaving(true);

      await updatePayable({
        id: Number(id),
        name,
        amount: Number(amount),
        startDate,
        dueDay: Number(dueDay),
        notes,
      });

      Alert.alert('Cambios guardados', 'El pago fijo se actualizó correctamente.');
      router.back();
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Ocurrió un error.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Editar pago fijo</Text>
        <Text style={styles.subtitle}>Modifica los datos de esta obligación mensual.</Text>

        <Input label="Nombre del pago" placeholder="Ej. Alquiler, internet, préstamo..." value={name} onChangeText={setName} />

        <Input label="Importe mensual (S/)" placeholder="Ej. 500" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <DatePickerInput label="Fecha de inicio" value={startDate} onChange={setStartDate} />

        <Input label="Día de vencimiento" placeholder="Ej. 15" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" />

        <Input label="Notas (opcional)" placeholder="Información adicional..." value={notes} onChangeText={setNotes} multiline />

        <Button size="large" label={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} style={{ marginTop: 32 }} />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
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
