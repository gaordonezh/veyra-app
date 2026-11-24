import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { Transaction } from "@/src/types";
import { deleteTransaction, getTransactions } from "@/src/services/transaction.service";
import { formatMoney } from "@/src/utils/money";
import { Text, View } from "@/components/Themed";
import Button from "@/components/Button";

export default function TransactionsScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los movimientos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  function openTransaction(item: Transaction) {
    if (item.obligation_id !== null) {
      Alert.alert("Movimiento vinculado", "Este movimiento corresponde a un pago de una cuota. No se puede editar desde Movimientos.");
      return;
    }

    router.push({
      pathname: "/transaction/new",
      params: { id: String(item.id) },
    });
  }

  function confirmDelete(item: Transaction) {
    if (item.obligation_id !== null) {
      Alert.alert("Movimiento vinculado", "Este movimiento corresponde a un pago de una cuota. No se puede eliminar desde Movimientos.");
      return;
    }

    Alert.alert("Eliminar movimiento", "¿Estás seguro de que deseas eliminar este movimiento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(item.id);
            await loadTransactions();
          } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "No se pudo eliminar el movimiento.");
          }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Transaction }) {
    const isIncome = item.type === "income";

    return (
      <Pressable style={styles.item} onPress={() => openTransaction(item)} onLongPress={() => confirmDelete(item)}>
        <View style={styles.itemInfo}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? "+" : "-"}
          {formatMoney(item.amount)}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>

        <Button label="+ Nuevo" size="normal" onPress={() => router.push("/transaction/new")} />
      </View>

      {loading ? (
        <Text style={styles.empty}>Cargando...</Text>
      ) : (
        <FlatList
          data={transactions}
          style={{ backgroundColor: "#ffffff" }}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Todavía no tienes movimientos registrados.</Text>}
        />
      )}

      <Text style={styles.hint}>Toca un movimiento para editarlo o mantenlo presionado para eliminarlo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 17,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    borderTopColor: "#E2E8F0",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 5,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  income: {
    color: "#16A34A",
  },
  expense: {
    color: "#DC2626",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    color: "#757575",
  },
  hint: {
    fontSize: 11,
    color: "#A3A3A3",
    textAlign: "center",
    paddingVertical: 8,
  },
});
