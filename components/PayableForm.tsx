import { PropsWithChildren, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import Input, { inputStyles } from "@/components/Input";
import Button from "@/components/Button";
import DatePickerInput from "@/components/DatePickerInput";
import { getToday } from "@/src/utils/money";
import { CreatePayableData } from "@/src/services/payable.service";

interface PayableFormProps {
  record?: CreatePayableData;
  loading: boolean;
  header: {
    title: string;
    subtitle: string;
  };
  handleSave: (record: CreatePayableData) => void;
}

const PayableForm = ({ handleSave, loading, record, header, children }: PropsWithChildren<PayableFormProps>) => {
  const [fields, setFields] = useState<CreatePayableData>({
    amount: (record?.amount ?? "") as number,
    dueDay: record?.dueDay ?? 1,
    name: record?.name ?? "",
    startDate: record?.startDate ?? getToday(),
    notes: record?.notes ?? "",
    frequency: record?.frequency ?? "monthly",
  });

  const isOnce = fields.frequency === "once";

  const onSubmit = () => {
    handleSave(fields);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{header.title}</Text>
        <Text style={styles.subtitle}>{header.subtitle}</Text>

        {children}

        {!record && (
          <>
            <Text style={inputStyles.label}>Tipo de registro</Text>

            <View transparent style={styles.frequencyContainer}>
              <Button
                fullWidth
                size="normal"
                color="success"
                variant={!isOnce ? "contained" : "outlined"}
                label="Mensual"
                onPress={() => setFields((prev) => ({ ...prev, frequency: "monthly" }))}
              />
              <Button
                fullWidth
                size="normal"
                color="success"
                variant={isOnce ? "contained" : "outlined"}
                label="Una sola vez"
                onPress={() => setFields((prev) => ({ ...prev, frequency: "once" }))}
              />
            </View>
          </>
        )}

        <Input
          label="Descripción"
          placeholder="Ej. Alquiler, Internet, Préstamo a Juan..."
          value={fields.name}
          onChangeText={(name) => setFields((prev) => ({ ...prev, name }))}
        />

        <Input
          label={isOnce ? "Importe (S/)" : "Importe mensual (S/)"}
          placeholder="Ej. 500"
          value={String(fields.amount)}
          onChangeText={(amount) => setFields((prev) => ({ ...prev, amount: (Number(amount) || "") as number }))}
          keyboardType="decimal-pad"
        />

        <DatePickerInput label="Fecha de inicio" value={fields.startDate} onChange={(startDate) => setFields((prev) => ({ ...prev, startDate }))} />

        {!isOnce && (
          <Input
            label="Día de vencimiento"
            placeholder="Ej. 15"
            value={String(fields.dueDay)}
            onChangeText={(dueDay) => setFields((prev) => ({ ...prev, dueDay: (Number(dueDay) || "") as number }))}
            keyboardType="number-pad"
          />
        )}

        <Input
          label="Notas (opcional)"
          placeholder="Información adicional..."
          value={fields.notes}
          onChangeText={(notes) => setFields((prev) => ({ ...prev, notes }))}
          multiline
        />

        <Button size="large" label={`Guardar${record ? " cambios" : ""}`} onPress={onSubmit} disabled={loading} style={{ marginTop: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PayableForm;

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
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 26,
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
});
