import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import {
  getReceivableDetails,
  registerReceivablePayment,
  type ReceivableDetails,
  type ReceivableObligation,
} from "../../src/services/receivable.service";
import { formatMoney } from "../../src/utils/money";
import { Text, View } from "@/components/Themed";
import Button from "@/components/Button";
import RecurrentCard from "@/components/RecurrentCard";
import ResumeCard from "@/components/ResumeCard";
import PaymentCard from "@/components/PaymentCard";
import PreviousLoading from "@/components/PreviousLoading";

export default function ReceivableDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [details, setDetails] = useState<ReceivableDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedObligation, setSelectedObligation] = useState<ReceivableObligation | null>(null);
  const [saving, setSaving] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const data = await getReceivableDetails(Number(id));
      setDetails(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar la cuenta.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails]),
  );

  function openEdit() {
    router.push({
      pathname: "/receivable/edit/[id]",
      params: { id: String(details?.id ?? id) },
    });
  }

  async function handlePayment(amount: string) {
    if (!selectedObligation) return;

    try {
      setSaving(true);

      await registerReceivablePayment(selectedObligation.id, Number(amount));

      setSelectedObligation(null);

      await loadDetails();

      Alert.alert("Pago registrado", "El abono se registró como un ingreso y actualizó la cuenta.");
    } catch (error) {
      Alert.alert("No se pudo registrar el pago", error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PreviousLoading />;
  }

  if (!details) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>No se encontró esta cuenta.</Text>

        <Button size="small" label="Volver" onPress={() => router.back()} variant="text" />
      </View>
    );
  }

  const totalPending = details.obligations.reduce((total, item) => total + item.amount_pending, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View transparent style={styles.header}>
        <View transparent style={styles.headerInfo}>
          <Text style={styles.title}>{details.name}</Text>
          <Text style={styles.subtitle}>Cuenta recurrente por cobrar</Text>
        </View>

        <Button label="Editar" variant="outlined" onPress={openEdit} />
      </View>

      <ResumeCard
        helper="Total pendiente"
        title={formatMoney(totalPending)}
        divider
        details={[`Cuota mensual: ${formatMoney(details.amount)}`, `Vencimiento: día ${details.due_day} de cada mes`]}
      />

      {details.notes ? <ResumeCard helper="Notas" title="" divider={false} details={[details.notes ?? ""]} /> : null}

      {selectedObligation ? (
        <PaymentCard record={selectedObligation} loading={saving} onCancel={() => setSelectedObligation(null)} onOk={handlePayment} />
      ) : null}

      <Text style={styles.sectionTitle}>Cuotas mensuales</Text>

      {details.obligations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Todavía no hay cuotas generadas.</Text>
        </View>
      ) : (
        details.obligations.map((obligation, index) => (
          <RecurrentCard key={index + 1} obligation={obligation} startPayment={() => setSelectedObligation(obligation)} />
        ))
      )}
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  headerInfo: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
  },
  emptyText: {
    color: "#64748B",
  },
  notFound: {
    color: "#0F172A",
    fontSize: 16,
    marginBottom: 14,
  },
});
