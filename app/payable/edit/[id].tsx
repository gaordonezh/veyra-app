import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getPayableDetails,
  updatePayable,
} from "../../../src/services/payable.service";

export default function EditPayableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPayable() {
      try {
        const details = await getPayableDetails(Number(id));

        if (!details) {
          Alert.alert("Error", "No se encontró el pago fijo.", [
            { text: "Aceptar", onPress: () => router.back() },
          ]);
          return;
        }

        setName(details.name);
        setAmount((details.amount / 100).toFixed(2));
        setStartDate(details.start_date);
        setDueDay(String(details.due_day));
        setNotes(details.notes ?? "");
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudo cargar el pago fijo.",
        );
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

      Alert.alert(
        "Cambios guardados",
        "El pago fijo se actualizó correctamente.",
      );
      router.back();
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Ocurrió un error.",
      );
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Editar pago fijo</Text>
        <Text style={styles.subtitle}>
          Modifica los datos de esta obligación mensual.
        </Text>

        <Text style={styles.label}>Nombre del pago</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Alquiler, internet, préstamo..."
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Importe mensual (S/)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 500"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Fecha de inicio</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Text style={styles.label}>Día de vencimiento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 15"
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Información adicional..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 26,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0F172A",
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
