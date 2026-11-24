import { StyleSheet } from "react-native";
import { Text, View } from "./Themed";
import { ReceivableObligation } from "@/src/services/receivable.service";
import Button from "./Button";
import { formatMoney } from "@/src/utils/money";

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

interface RecurrentCardProps {
  obligation: ReceivableObligation;
  startPayment: VoidFunction;
}

const RecurrentCard = ({ obligation, startPayment }: RecurrentCardProps) => {
  const isPaid = obligation.status === "paid" || obligation.status === "overpaid";

  return (
    <View style={styles.obligationCard}>
      <View style={styles.obligationHeader}>
        <View style={styles.obligationInfo}>
          <Text style={styles.obligationPeriod}>{formatPeriod(obligation.period)}</Text>
          <Text style={styles.obligationDate}>Vencimiento: {formatDate(obligation.due_date)}</Text>
        </View>

        <View style={[styles.statusBadge, isPaid ? styles.paidBadge : obligation.status === "partial" ? styles.partialBadge : styles.pendingBadge]}>
          <Text style={[styles.statusText, isPaid ? styles.paidText : obligation.status === "partial" ? styles.partialText : styles.pendingText]}>
            {getStatusLabel(obligation.status)}
          </Text>
        </View>
      </View>

      <View style={styles.amountsRow}>
        <View>
          <Text style={styles.amountLabel}>Cuota</Text>
          <Text style={styles.amountValue}>{formatMoney(obligation.amount_due)}</Text>
        </View>

        <View>
          <Text style={styles.amountLabel}>Abonado</Text>
          <Text style={styles.amountValue}>{formatMoney(obligation.amount_paid)}</Text>
        </View>

        <View>
          <Text style={styles.amountLabel}>Pendiente</Text>
          <Text style={styles.pendingValue}>{formatMoney(obligation.amount_pending)}</Text>
        </View>
      </View>

      {!isPaid && <Button fullWidth label="Registrar abono" onPress={startPayment} />}
    </View>
  );
};

export default RecurrentCard;

const styles = StyleSheet.create({
  obligationCard: {
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
    marginVertical: 20,
    gap: 8,
  },
  amountLabel: {
    color: "#64748B",
    fontSize: 11,
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  pendingValue: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
  },
});
