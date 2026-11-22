import { useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CreateReceivableData, getReceivableDetails, updateReceivable } from "../../../src/services/receivable.service";
import { Text, View } from "@/components/Themed";
import PayableForm from "@/components/PayableForm";
import PreviousLoading from "@/components/PreviousLoading";

export default function EditReceivableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<CreateReceivableData>();

  useEffect(() => {
    async function loadReceivable() {
      try {
        const details = await getReceivableDetails(Number(id));

        if (!details) {
          Alert.alert("Error", "No se encontró esta cuenta.", [{ text: "Volver", onPress: () => router.back() }]);
          return;
        }

        setFields({
          name: details.name,
          amount: Number((details.amount / 100).toFixed(2)),
          startDate: details.start_date,
          dueDay: details.due_day,
          notes: details.notes ?? "",
        });
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "No se pudo cargar la cuenta.");
      } finally {
        setLoading(false);
      }
    }

    loadReceivable();
  }, [id, router]);

  async function handleSave(fields: CreateReceivableData) {
    try {
      setSaving(true);

      await updateReceivable({
        id: Number(id),
        ...fields,
      });

      Alert.alert("Cambios guardados", "La cuenta por cobrar se actualizó correctamente.", [{ text: "Aceptar", onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert("No se pudo actualizar", error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !fields) {
    return <PreviousLoading />;
  }

  return (
    <PayableForm
      handleSave={handleSave}
      loading={saving}
      header={{ title: "Editar cuenta por cobrar", subtitle: "Modifica los datos de esta cuenta por cobrar." }}
      record={fields}
    >
      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          Los cambios no modificarán las cuotas anteriores ni los pagos registrados. Se aplicarán a las cuotas que se generen posteriormente.
        </Text>
      </View>
    </PayableForm>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
  },
  warningText: {
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 19,
  },
});
