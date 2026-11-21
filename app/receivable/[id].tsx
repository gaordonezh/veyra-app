import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import {
  getReceivableDetails,
  registerReceivablePayment,
  type ReceivableDetails,
  type ReceivableObligation,
} from "../../src/services/receivable.service";
import { formatMoney } from "../../src/utils/money";

function formatPeriod(period: string) {
  const date = new Date(`${period}-01T00:00:00`);

  return date.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: ReceivableObligation["status"]) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "partial":
      return "Pago parcial";
    case "paid":
      return "Pagada";
    case "overpaid":
      return "Pago excedido";
  }
}

export default function ReceivableDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [details, setDetails] = useState<ReceivableDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedObligation, setSelectedObligation] =
    useState<ReceivableObligation | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
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

  function startPayment(obligation: ReceivableObligation) {
    setSelectedObligation(obligation);
    setPaymentAmount((obligation.amount_pending / 100).toFixed(2));
  }

  function cancelPayment() {
    setSelectedObligation(null);
    setPaymentAmount("");
  }

  function openEdit() {
    router.push({
      pathname: "/receivable/edit/[id]",
      params: { id: String(details?.id ?? id) },
    });
  }

  async function handlePayment() {
    if (!selectedObligation) return;

    try {
      setSaving(true);

      await registerReceivablePayment(
        selectedObligation.id,
        Number(paymentAmount),
      );

      setSelectedObligation(null);
      setPaymentAmount("");

      await loadDetails();

      Alert.alert(
        "Pago registrado",
        "El abono se registró como un ingreso y actualizó la cuenta.",
      );
    } catch (error) {
      Alert.alert(
        "No se pudo registrar el pago",
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

  if (!details) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>No se encontró esta cuenta.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const totalPending = details.obligations.reduce(
    (total, item) => total + item.amount_pending,
    0,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{details.name}</Text>
          <Text style={styles.subtitle}>Cuenta recurrente por cobrar</Text>
        </View>

        <Pressable style={styles.editButton} onPress={openEdit}>
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total pendiente</Text>
        <Text style={styles.summaryAmount}>{formatMoney(totalPending)}</Text>
        <View style={styles.summaryDivider} />
        <Text style={styles.summaryDetail}>
          Cuota mensual: {formatMoney(details.amount)}
        </Text>
        <Text style={styles.summaryDetail}>
          Vencimiento: día {details.due_day} de cada mes
        </Text>
      </View>

      {details.notes ? (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notas</Text>
          <Text style={styles.notesText}>{details.notes}</Text>
        </View>
      ) : null}

      {selectedObligation && (
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Registrar abono</Text>
          <Text style={styles.paymentSubtitle}>
            {formatPeriod(selectedObligation.period)}
          </Text>

          <Text style={styles.paymentLabel}>Importe pendiente</Text>
          <Text style={styles.paymentPending}>
            {formatMoney(selectedObligation.amount_pending)}
          </Text>

          <Text style={styles.paymentLabel}>Importe recibido (S/)</Text>
          <TextInput
            style={styles.input}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          <View style={styles.paymentActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={cancelPayment}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.confirmButton, saving && styles.disabledButton]}
              onPress={handlePayment}
              disabled={saving}
            >
              <Text style={styles.confirmButtonText}>
                {saving ? "Guardando..." : "Confirmar abono"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Cuotas mensuales</Text>

      {details.obligations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Todavía no hay cuotas generadas.</Text>
        </View>
      ) : (
        details.obligations.map((obligation) => {
          const isPaid =
            obligation.status === "paid" || obligation.status === "overpaid";

          return (
            <View key={obligation.id} style={styles.obligationCard}>
              <View style={styles.obligationHeader}>
                <View style={styles.obligationInfo}>
                  <Text style={styles.obligationPeriod}>
                    {formatPeriod(obligation.period)}
                  </Text>
                  <Text style={styles.obligationDate}>
                    Vencimiento: {formatDate(obligation.due_date)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isPaid
                      ? styles.paidBadge
                      : obligation.status === "partial"
                        ? styles.partialBadge
                        : styles.pendingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isPaid
                        ? styles.paidText
                        : obligation.status === "partial"
                          ? styles.partialText
                          : styles.pendingText,
                    ]}
                  >
                    {getStatusLabel(obligation.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.amountsRow}>
                <View>
                  <Text style={styles.amountLabel}>Cuota</Text>
                  <Text style={styles.amountValue}>
                    {formatMoney(obligation.amount_due)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.amountLabel}>Abonado</Text>
                  <Text style={styles.amountValue}>
                    {formatMoney(obligation.amount_paid)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.amountLabel}>Pendiente</Text>
                  <Text style={styles.pendingValue}>
                    {formatMoney(obligation.amount_pending)}
                  </Text>
                </View>
              </View>

              {!isPaid && (
                <Pressable
                  style={styles.payButton}
                  onPress={() => startPayment(obligation)}
                >
                  <Text style={styles.payButtonText}>Registrar abono</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  headerInfo: {
    flex: 1,
  },
  editButton: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
  },
  editButtonText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FA",
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 22,
  },
  summaryCard: {
    backgroundColor: "#172554",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  summaryLabel: {
    color: "#CBD5E1",
    fontSize: 13,
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
  },
  summaryDetail: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 5,
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  notesTitle: {
    color: "#0F172A",
    fontWeight: "700",
    marginBottom: 6,
  },
  notesText: {
    color: "#64748B",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 14,
  },
  obligationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
  },
  obligationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  obligationInfo: {
    flex: 1,
  },
  obligationPeriod: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  obligationDate: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 5,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingBadge: {
    backgroundColor: "#FEF2F2",
  },
  partialBadge: {
    backgroundColor: "#FFF7ED",
  },
  paidBadge: {
    backgroundColor: "#F0FDF4",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pendingText: {
    color: "#DC2626",
  },
  partialText: {
    color: "#C2410C",
  },
  paidText: {
    color: "#15803D",
  },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 8,
  },
  amountLabel: {
    color: "#64748B",
    fontSize: 11,
    marginBottom: 5,
  },
  amountValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600",
  },
  pendingValue: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
  },
  payButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 18,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 22,
  },
  paymentTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },
  paymentSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
    textTransform: "capitalize",
  },
  paymentLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 7,
  },
  paymentPending: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 13,
    color: "#0F172A",
    fontSize: 16,
  },
  paymentActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    padding: 13,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    padding: 13,
    borderRadius: 9,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
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
  backLink: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
