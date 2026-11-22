import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CreatePayableData, getPayableDetails, updatePayable } from "../../../src/services/payable.service";
import PayableForm from "@/components/PayableForm";
import PreviousLoading from "@/components/PreviousLoading";

export default function EditPayableScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recoveredfields, setRecoveredFields] = useState<CreatePayableData>();

  useEffect(() => {
    async function loadPayable() {
      try {
        const details = await getPayableDetails(Number(id));

        if (!details) {
          Alert.alert("Error", "No se encontró el pago fijo.", [{ text: "Aceptar", onPress: () => router.back() }]);
          return;
        }

        setRecoveredFields({
          name: details.name,
          amount: Number((details.amount / 100).toFixed(2)),
          startDate: details.start_date,
          dueDay: details.due_day,
          notes: details.notes ?? "",
        });
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "No se pudo cargar el pago fijo.");
      } finally {
        setLoading(false);
      }
    }

    loadPayable();
  }, [id, router]);

  async function handleSave(fields: CreatePayableData) {
    try {
      setSaving(true);

      await updatePayable({
        ...fields,
        id: Number(id),
      });

      Alert.alert("Cambios guardados", "El pago fijo se actualizó correctamente.");
      router.back();
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !recoveredfields) {
    return <PreviousLoading />;
  }

  return (
    <PayableForm
      handleSave={handleSave}
      loading={saving}
      record={recoveredfields}
      header={{ title: "Editar pago fijo", subtitle: "Modifica los datos de esta obligación mensual." }}
    />
  );
}
