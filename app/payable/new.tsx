import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { createPayable, CreatePayableData } from "../../src/services/payable.service";
import PayableForm from "@/components/PayableForm";

export default function NewPayableScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSave(fields: CreatePayableData) {
    try {
      setSaving(true);

      await createPayable(fields);

      Alert.alert("Registrado", "El pago fijo se agregó a Por pagar.");
      router.back();
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PayableForm
      loading={saving}
      handleSave={handleSave}
      header={{ title: "Nuevo pago fijo", subtitle: "Registra un gasto que debes pagar mensualmente." }}
    />
  );
}
