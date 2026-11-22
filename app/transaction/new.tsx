import { useEffect, useState } from "react";
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { createTransaction, getTransaction, updateTransaction } from "@/src/services/transaction.service";
import { Text, View } from "@/components/Themed";
import Input, { inputStyles } from "@/components/Input";
import Button from "@/components/Button";
import DatePickerInput from "@/components/DatePickerInput";
import { getToday } from "@/src/utils/money";

export default function NewTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const transactionId = Array.isArray(id) ? id[0] : id;
  const isEditing = Boolean(transactionId);

  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (!transactionId) return;

    async function loadTransaction() {
      try {
        const parsedId = Number(transactionId);

        if (!Number.isInteger(parsedId) || parsedId <= 0) {
          throw new Error("El identificador del movimiento no es válido.");
        }

        const transaction = await getTransaction(parsedId);

        if (!transaction) {
          throw new Error("El movimiento no existe.");
        }

        if (transaction.obligation_id !== null) {
          throw new Error("Este movimiento pertenece a un pago de una cuota y no puede editarse aquí.");
        }

        setType(transaction.type);
        setDescription(transaction.description);
        setAmount((transaction.amount / 100).toFixed(2));
        setDate(transaction.date);
        setNotes(transaction.notes ?? "");
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "No se pudo cargar el movimiento.", [
          { text: "Aceptar", onPress: () => router.back() },
        ]);
      } finally {
        setLoadingData(false);
      }
    }

    loadTransaction();
  }, [transactionId, router]);

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
      const data = {
        type,
        description,
        amount: parsedAmount,
        date,
        notes,
      };

      if (isEditing) {
        await updateTransaction(Number(transactionId), data);
      } else {
        await createTransaction(data);
      }

      Alert.alert("Correcto", isEditing ? "Movimiento actualizado." : "Movimiento registrado.", [
        {
          text: "Aceptar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "No se pudo guardar el movimiento.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando movimiento...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{isEditing ? "Editar movimiento" : "Nuevo movimiento"}</Text>

        <Text style={inputStyles.label}>Tipo de movimiento</Text>

        <View transparent style={styles.typeContainer}>
          <Button
            fullWidth
            size="normal"
            color="success"
            variant={type === "income" ? "contained" : "outlined"}
            label="Ingreso"
            onPress={() => setType("income")}
          />
          <Button
            fullWidth
            size="normal"
            color="error"
            variant={type === "expense" ? "contained" : "outlined"}
            label="Salida"
            onPress={() => setType("expense")}
          />
        </View>

        <Input label="Descripción" value={description} onChangeText={setDescription} />

        <Input label="Monto (S/)" value={amount} onChangeText={setAmount} />

        <DatePickerInput label="Fecha" value={date} onChange={setDate} />

        <Input label="Notas (opcional)" placeholder="Observaciones..." multiline value={notes} onChangeText={setNotes} style={{ marginBottom: 32 }} />

        <Button
          disabled={loading}
          label={loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar movimiento"}
          size="large"
          onPress={handleSave}
        />
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
    fontWeight: "700",
    marginBottom: 24,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 30,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
