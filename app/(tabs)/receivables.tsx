import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { getReceivables, type Receivable } from '../../src/services/receivable.service';
import { formatMoney } from '../../src/utils/money';
import { Text, View } from '@/components/Themed';
import Button from '@/components/Button';

export default function ReceivablesScreen() {
  const router = useRouter();

  const [items, setItems] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getReceivables();
      setItems(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las cuentas por cobrar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  function openDetails(id: number) {
    router.push({
      pathname: '/receivable/[id]',
      params: { id: String(id) },
    });
  }

  function openNew() {
    router.push('/receivable/new');
  }

  const totalPending = items.reduce((total, item) => total + item.total_pending, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Por cobrar</Text>
          <Text style={styles.subtitle}>Dinero que otras personas deben pagarte</Text>
        </View>

        <Button label="+ Nuevo" onPress={openNew} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total pendiente por cobrar</Text>
        <Text style={styles.summaryAmount}>{formatMoney(totalPending)}</Text>
        <Text style={styles.summaryDescription}>
          {items.length} {items.length === 1 ? 'cuenta activa' : 'cuentas activas'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Personas</Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.personCard} onPress={() => openDetails(item.id)}>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{item.name}</Text>
                <Text style={styles.personDetail}>Cuota mensual: {formatMoney(item.amount)}</Text>
                <Text style={styles.personDetail}>Vence cada día {item.due_day}</Text>
              </View>

              <View style={styles.pendingInfo}>
                <Text style={styles.pendingLabel}>Pendiente</Text>
                <Text style={styles.pendingAmount}>{formatMoney(item.total_pending)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Todavía no tienes cuentas por cobrar</Text>
              <Text style={styles.emptyDescription}>Agrega a una persona para comenzar a controlar sus pagos mensuales.</Text>
              <Button fullWidth size="large" label="Agregar primera cuenta" onPress={openNew} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    gap: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#172554',
    padding: 20,
    borderRadius: 16,
    marginBottom: 26,
  },
  summaryLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '700',
    marginTop: 9,
  },
  summaryDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  list: {
    paddingBottom: 30,
  },
  personCard: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#757575',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 7,
  },
  personDetail: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  pendingInfo: {
    alignItems: 'flex-end',
  },
  pendingLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 5,
  },
  pendingAmount: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
});
