import { useState } from "react";
import { Text, View } from "./Themed";
import Input, { inputStyles } from "./Input";
import Button from "./Button";
import { ReceivableObligation } from "@/src/services/receivable.service";
import { PayableObligation } from "@/src/services/payable.service";
import { StyleSheet } from "react-native";
import { formatMoney } from "@/src/utils/money";

interface PaymentCardProps {
  record: ReceivableObligation | PayableObligation;
  loading: boolean;
  onCancel: VoidFunction;
  onOk: (value: string) => void;
}

function formatPeriod(period: string) {
  const date = new Date(`${period}-01T00:00:00`);

  return date.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });
}

const PaymentCard = ({ record, loading, onCancel, onOk }: PaymentCardProps) => {
  const [paymentAmount, setPaymentAmount] = useState((record.amount_pending / 100).toFixed(2));

  return (
    <View style={styles.paymentCard}>
      <Text style={styles.paymentTitle}>Registrar abono</Text>
      <Text style={styles.paymentSubtitle}>{formatPeriod(record.period)}</Text>

      <Text style={inputStyles.label}>Importe pendiente</Text>
      <Text style={styles.paymentPending}>{formatMoney(record.amount_pending)}</Text>

      <Input label="Importe recibido (S/)" value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" placeholder="0.00" />

      <View style={styles.paymentActions}>
        <Button fullWidth label="Cancelar" variant="outlined" color="error" onPress={onCancel} disabled={loading} />
        <Button
          fullWidth
          label={loading ? "Guardando..." : "Confirmar abono"}
          variant="contained"
          color="primary"
          onPress={() => onOk(paymentAmount)}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default PaymentCard;

const styles = StyleSheet.create({
  paymentCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 22,
  },
  paymentTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  paymentSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
    textTransform: "capitalize",
  },
  paymentPending: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "700",
  },
  paymentActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});
