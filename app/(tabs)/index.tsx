import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { getDashboardSummary, type DashboardSummary } from '../../src/services/dashboard.service';
import { formatMoney } from '../../src/utils/money';
import { Text, View } from '@/components/Themed';
import Button from '@/components/Button';

const initialSummary: DashboardSummary = {
  balance: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  recentTransactions: [],
};

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const router = useRouter();

  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error al cargar el resumen:', error);
      Alert.alert('Error', 'No se pudo cargar el resumen financiero.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary]),
  );

  function handleNewTransaction() {
    router.push('/transaction/new');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View transparent style={styles.header}>
        <Text style={styles.greeting}>Tu dinero, bajo control</Text>
        <Text style={styles.title}>Resumen financiero</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance disponible</Text>

        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.balanceAmount}>{formatMoney(summary.balance)}</Text>}

        <Text style={styles.balanceDescription}>Dinero realmente recibido menos dinero realmente pagado</Text>
      </View>

      <Text style={styles.sectionTitle}>Este mes</Text>

      <View transparent style={styles.monthlyCards}>
        <View style={styles.monthlyCard}>
          <Text style={styles.cardLabel}>Ingresos</Text>
          <Text style={styles.incomeAmount}>{loading ? '...' : formatMoney(summary.monthlyIncome)}</Text>
        </View>

        <View style={styles.monthlyCard}>
          <Text style={styles.cardLabel}>Gastos</Text>
          <Text style={styles.expenseAmount}>{loading ? '...' : formatMoney(summary.monthlyExpense)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>

      <Button label="+ Registrar movimiento" onPress={handleNewTransaction} />

      <View transparent style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Movimientos recientes</Text>

        <Button label="Ver todos" color="primary" size="small" variant="text" onPress={() => router.push('/transactions')} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : summary.recentTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Todavía no tienes movimientos</Text>
          <Text style={styles.emptyDescription}>Registra tu primer ingreso o gasto para comenzar a controlar tus finanzas.</Text>
        </View>
      ) : (
        <View style={styles.transactionsCard}>
          {summary.recentTransactions.map((transaction, index) => {
            const isIncome = transaction.type === 'income';

            return (
              <View key={transaction.id} style={[styles.transactionRow, index !== summary.recentTransactions.length - 1 && styles.transactionBorder]}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                </View>

                <Text style={[styles.transactionAmount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                  {isIncome ? '+' : '-'}
                  {formatMoney(transaction.amount)}
                </Text>
              </View>
            );
          })}
        </View>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: '#172554',
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
  },
  balanceLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
  },
  balanceDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  monthlyCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  monthlyCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLabel: {
    color: '#757575',
    fontSize: 13,
    marginBottom: 10,
  },
  incomeAmount: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '700',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  seeAll: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  transactionsCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },
  loader: {
    marginVertical: 24,
  },
});
