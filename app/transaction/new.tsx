import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { createTransaction } from "@/src/services/transaction.service";

export default function NewTransactionScreen() {
  const router = useRouter();

  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getLocalDate());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!description.trim()) {
      Alert.alert("Atención", "Ingresa una descripción.");
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Atención", "Ingresa un monto válido.");
      return;
    }

    setLoading(true);

    try {
      await createTransaction({
        type,
        description,
        amount: parsedAmount,
        date,
        notes,
      });

      Alert.alert("Correcto", "Movimiento registrado.", [
        {
          text: "Aceptar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo registrar el movimiento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nuevo movimiento</Text>

        <Text style={styles.label}>Tipo de movimiento</Text>

        <View style={styles.typeContainer}>
          <Pressable
            style={[
              styles.typeButton,
              type === "income" && styles.incomeActive,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[styles.typeText, type === "income" && styles.activeText]}
            >
              Ingreso
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              type === "expense" && styles.expenseActive,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[styles.typeText, type === "expense" && styles.activeText]}
            >
              Salida
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Pago de trabajo"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Monto (S/)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Observaciones..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <Pressable
          style={[styles.saveButton, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Guardando..." : "Guardar movimiento"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#171717",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#404040",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  incomeActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  expenseActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
  },
  typeText: {
    fontWeight: "600",
    color: "#525252",
  },
  activeText: {
    color: "#171717",
  },
  notes: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#171717",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 28,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
