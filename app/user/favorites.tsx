import React, { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface FavoriteItemProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  inStock: boolean;
  onRemove: () => void;
  onAddToCart: () => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ 
  name, 
  category, 
  price, 
  image,
  inStock,
  onRemove, 
  onAddToCart 
}) => (
  <View style={styles.favoriteItem}>
    <View style={styles.productImage}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
    </View>
    
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productCategory}>{category}</Text>
      <Text style={styles.productPrice}>₺{price.toLocaleString()}</Text>
      <Text style={[styles.stockStatus, { color: inStock ? '#10b981' : '#ef4444' }]}>
        {inStock ? 'Stokta var' : 'Stokta yok'}
      </Text>
    </View>

    <View style={styles.productActions}>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>❤️</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.cartButton, !inStock && styles.cartButtonDisabled]} 
        onPress={onAddToCart}
        disabled={!inStock}
      >
        <Text style={[styles.cartButtonText, !inStock && styles.cartButtonTextDisabled]}>
          Sepete Ekle
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function FavoritesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const favorites = [
    {
      id: '1',
      name: 'Dijital Tansiyon Aleti',
      category: 'Tanı ve Ölçüm',
      price: 299,
      inStock: true,
    },
    {
      id: '2',
      name: 'Stetoskop Classic',
      category: 'Tanı ve Ölçüm',
      price: 450,
      inStock: true,
    },
    {
      id: '3',
      name: 'Ateş Ölçer',
      category: 'Tanı ve Ölçüm',
      price: 75,
      inStock: false,
    },
    {
      id: '4',
      name: 'Diyabet Test Şeridi',
      category: 'Test ve Tahlil',
      price: 120,
      inStock: true,
    },
    {
      id: '5',
      name: 'Ameliyat Eldiveni (100\'lü)',
      category: 'Sarf Malzemeler',
      price: 85,
      inStock: false,
    },
  ];

  const categories = ['all', 'Tanı ve Ölçüm', 'Sarf Malzemeler', 'Test ve Tahlil', 'Ortez ve Protez'];

  const filteredFavorites = selectedCategory === 'all' 
    ? favorites 
    : favorites.filter(f => f.category === selectedCategory);

  const handleRemoveFromFavorites = (productId: string) => {
    console.log('Remove from favorites:', productId);
    // TODO: API call to remove from favorites
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
    // TODO: API call to add to cart
  };

  const handleClearAllFavorites = () => {
    console.log('Clear all favorites');
    // TODO: API call to clear all favorites
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Favorilerim</Text>
          <Text style={styles.subtitle}>{favorites.length} ürün</Text>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAllFavorites}>
            <Text style={styles.clearButtonText}>Tümünü Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>💔</Text>
          <Text style={styles.emptyStateTitle}>Henüz favori ürününüz yok</Text>
          <Text style={styles.emptyStateSubtitle}>
            Beğendiğiniz ürünleri favorilere ekleyerek buradan kolayca ulaşabilirsiniz.
          </Text>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category === 'all' ? 'Tümü' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Favorites List */}
          <ScrollView style={styles.favoritesList}>
            {filteredFavorites.length > 0 ? (
              filteredFavorites.map((favorite) => (
                <FavoriteItem
                  key={favorite.id}
                  id={favorite.id}
                  name={favorite.name}
                  category={favorite.category}
                  price={favorite.price}
                  inStock={favorite.inStock}
                  onRemove={() => handleRemoveFromFavorites(favorite.id)}
                  onAddToCart={() => handleAddToCart(favorite.id)}
                />
              ))
            ) : (
              <View style={styles.categoryEmptyState}>
                <Text style={styles.categoryEmptyText}>Bu kategoride favori ürün bulunamadı</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  favoritesList: {
    flex: 1,
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  productImage: {
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  cartButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cartButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cartButtonTextDisabled: {
    color: '#9ca3af',
  },
  categoryEmptyState: {
    padding: 40,
    alignItems: 'center',
  },
  categoryEmptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
