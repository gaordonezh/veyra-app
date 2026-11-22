import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { createReceivable, CreateReceivableData } from "../../src/services/receivable.service";
import PayableForm from "@/components/PayableForm";

export default function NewReceivableScreen() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  async function handleSave(fields: CreateReceivableData) {
    try {
      setSaving(true);

      await createReceivable(fields);

      Alert.alert("Registrado", "La persona se agregó a Por cobrar.");
      router.back();
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PayableForm
      handleSave={handleSave}
      loading={saving}
      header={{ title: "Nueva cuenta por cobrar", subtitle: "Registra a una persona que debe pagarte mensualmente." }}
    />
  );
}
