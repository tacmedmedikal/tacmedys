import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItemProps {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  items: string[];
  onViewDetails: () => void;
  onTrack?: () => void;
  onReorder?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  id,
  date, 
  status, 
  total, 
  itemCount,
  items,
  onViewDetails, 
  onTrack,
  onReorder
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>Sipariş #{id}</Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderContent}>
        <Text style={styles.itemsTitle}>{itemCount} ürün:</Text>
        {items.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.itemName}>• {item}</Text>
        ))}
        {items.length > 2 && (
          <Text style={styles.moreItems}>ve {items.length - 2} ürün daha...</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₺{total.toLocaleString()}</Text>
        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>Detaylar</Text>
          </TouchableOpacity>
          {status === 'shipped' && onTrack && (
            <TouchableOpacity style={styles.trackButton} onPress={onTrack}>
              <Text style={styles.trackButtonText}>Takip Et</Text>
            </TouchableOpacity>
          )}
          {status === 'delivered' && onReorder && (
            <TouchableOpacity style={styles.reorderButton} onPress={onReorder}>
              <Text style={styles.reorderButtonText}>Tekrar Sipariş</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const orders = [
    {
      id: 'ORD001',
      date: '15.06.2025',
      status: 'shipped' as const,
      total: 1250,
      itemCount: 3,
      items: ['Dijital Tansiyon Aleti', 'Stetoskop Classic', 'Ateş Ölçer'],
    },
    {
      id: 'ORD002',
      date: '10.06.2025',
      status: 'delivered' as const,
      total: 890,
      itemCount: 2,
      items: ['Diyabet Test Şeridi', 'Ameliyat Eldiveni (100\'lü)'],
    },
    {
      id: 'ORD003',
      date: '05.06.2025',
      status: 'processing' as const,
      total: 450,
      itemCount: 1,
      items: ['Stetoskop Classic'],
    },
    {
      id: 'ORD004',
      date: '28.05.2025',
      status: 'delivered' as const,
      total: 2100,
      itemCount: 5,
      items: ['Dijital Tansiyon Aleti', 'Ateş Ölçer', 'Diyabet Test Şeridi', 'Ameliyat Eldiveni', 'Stetoskop'],
    },
  ];

  const statusOptions = [
    { key: 'all', label: 'Tümü' },
    { key: 'pending', label: 'Bekliyor' },
    { key: 'processing', label: 'Hazırlanıyor' },
    { key: 'shipped', label: 'Kargoda' },
    { key: 'delivered', label: 'Teslim Edildi' },
    { key: 'cancelled', label: 'İptal Edildi' },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedStatus);

  const handleViewDetails = (orderId: string) => {
    console.log('View order details:', orderId);
  };

  const handleTrackOrder = (orderId: string) => {
    console.log('Track order:', orderId);
  };

  const handleReorder = (orderId: string) => {
    console.log('Reorder:', orderId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Siparişlerim</Text>
        <Text style={styles.subtitle}>Toplam {orders.length} sipariş</Text>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              selectedStatus === option.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === option.key && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderItem
              key={order.id}
              id={order.id}
              date={order.date}
              status={order.status}
              total={order.total}
              itemCount={order.itemCount}
              items={order.items}
              onViewDetails={() => handleViewDetails(order.id)}
              onTrack={order.status === 'shipped' ? () => handleTrackOrder(order.id) : undefined}
              onReorder={order.status === 'delivered' ? () => handleReorder(order.id) : undefined}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Bu kategoride sipariş bulunamadı</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reorderButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
