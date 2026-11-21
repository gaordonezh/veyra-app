import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getReceivableDetails, updateReceivable } from '../../../src/services/receivable.service';
import { Text, View } from '@/components/Themed';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DatePickerInput from '@/components/DatePickerInput';

export default function EditReceivableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadReceivable() {
      try {
        const details = await getReceivableDetails(Number(id));

        if (!details) {
          Alert.alert('Error', 'No se encontró esta cuenta.', [{ text: 'Volver', onPress: () => router.back() }]);
          return;
        }

        setName(details.name);
        setAmount((details.amount / 100).toFixed(2));
        setStartDate(details.start_date);
        setDueDay(String(details.due_day));
        setNotes(details.notes ?? '');
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar la cuenta.');
      } finally {
        setLoading(false);
      }
    }

    loadReceivable();
  }, [id, router]);

  async function handleSave() {
    try {
      setSaving(true);

      await updateReceivable({
        id: Number(id),
        name,
        amount: Number(amount),
        startDate,
        dueDay: Number(dueDay),
        notes,
      });

      Alert.alert('Cambios guardados', 'La cuenta por cobrar se actualizó correctamente.', [{ text: 'Aceptar', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('No se pudo actualizar', error instanceof Error ? error.message : 'Ocurrió un error.');
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
        <Text style={styles.title}>Editar cuenta</Text>

        <Text style={styles.subtitle}>Modifica los datos de esta cuenta por cobrar.</Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Los cambios no modificarán las cuotas anteriores ni los pagos registrados. Se aplicarán a las cuotas que se generen posteriormente.
          </Text>
        </View>

        <Input label="Nombre de la persona" placeholder="Ej. Juan Pérez" value={name} onChangeText={setName} />

        <Input label="Importe mensual (S/)" placeholder="Ej. 500" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <DatePickerInput label="Fecha de inicio" value={startDate} onChange={setStartDate} />

        <Input label="Día de vencimiento" placeholder="Ej. 15" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" />

        <Input label="Notas (opcional)" placeholder="Información adicional..." value={notes} onChangeText={setNotes} multiline />

        <Button
          label={saving ? 'Guardando...' : 'Guardar cambios'}
          size="large"
          disabled={saving}
          onPress={handleSave}
          style={{ marginVertical: 24 }}
        />

        <Button label="Cancelar" size="large" variant="outlined" color="error" disabled={saving} onPress={() => router.back()} />
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
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
  },
  warningText: {
    color: '#1E40AF',
    fontSize: 12,
    lineHeight: 19,
  },
});
