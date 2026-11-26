/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  CATEGORIES,
  PRODUCTS,
  VOUCHERS,
  getBestVoucherForSubtotal,
} from './data/marketplaceData';
import {
  CartItem,
  FilterState,
  OrderRecord,
  Product,
  ScreenView,
  ShoppingIntent,
} from './types/marketplace';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CompareBar, CompareModal } from './components/CompareModal';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CartAndCheckoutScreen } from './screens/CartAndCheckoutScreen';

const INITIAL_FILTERS: FilterState = {
  query: '',
  categoryIds: [],
  compatibilityTag: '',
  mallOnly: false,
  freeShippingOnly: false,
  flashSaleOnly: false,
  cashbackOnly: false,
  minPrice: '',
  maxPrice: '',
  minRating: 0,
  sortBy: 'relevance',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [shoppingIntent, setShoppingIntent] = useState<ShoppingIntent>('all');
  const [recentInterestLabel, setRecentInterestLabel] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 'p-01', variant: 'Midnight Black', quantity: 1, selected: true },
    { productId: 'p-25', variant: 'iPhone 17 · Frost Clear', quantity: 1, selected: true },
  ]);

  const [claimedVoucherIds, setClaimedVoucherIds] = useState<string[]>(['v-ship', 'v-mall15']);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>('v-mall15');
  const [manualVoucherOverride, setManualVoucherOverride] = useState(false);

  const [compareIds, setCompareIds] = useState<string[]>(['p-25', 'p-26']);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen, selectedProduct.id]);

  // Auto-apply the best eligible voucher whenever cart selection/subtotal changes
  const cartSubtotal = useMemo(() => {
    return cartItems
      .filter((i) => i.selected)
      .reduce((sum, ci) => {
        const p = PRODUCTS.find((prod) => prod.id === ci.productId);
        return sum + (p ? p.price * ci.quantity : 0);
      }, 0);
  }, [cartItems]);

  const cartBaseShipping = useMemo(() => {
    const selected = cartItems.filter((i) => i.selected);
    if (selected.length === 0) return 0;
    const allFree = selected.every((ci) => PRODUCTS.find((p) => p.id === ci.productId)?.freeShipping);
    return allFree || cartSubtotal >= 15 ? 0 : 4.5;
  }, [cartItems, cartSubtotal]);

  useEffect(() => {
    if (manualVoucherOverride) return;
    const { voucher } = getBestVoucherForSubtotal(VOUCHERS, cartSubtotal, cartBaseShipping);
    if (voucher) {
      setSelectedVoucherId(voucher.id);
      setClaimedVoucherIds((prev) => (prev.includes(voucher.id) ? prev : [...prev, voucher.id]));
    } else {
      setSelectedVoucherId(null);
    }
  }, [cartSubtotal, cartBaseShipping, manualVoucherOverride]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  const handleNavigate = (nextScreen: ScreenView) => {
    setScreen(nextScreen);
  };

  const handleSearchSubmit = (query: string, compatibilityTag = '') => {
    setFilters({ ...INITIAL_FILTERS, query, compatibilityTag });
    if (query) {
      setRecentInterestLabel(query);
    }
    setScreen('catalog');
  };

  const handleSelectCategory = (categoryId: string) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (cat) setRecentInterestLabel(cat.name);
    setFilters({ ...INITIAL_FILTERS, categoryIds: [categoryId] });
    setScreen('catalog');
  };

  const handleQuickFilter = (type: 'mall' | 'flash' | 'freeShipping' | 'all') => {
    setFilters({
      ...INITIAL_FILTERS,
      mallOnly: type === 'mall',
      flashSaleOnly: type === 'flash',
      freeShippingOnly: type === 'freeShipping',
    });
    setScreen('catalog');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setScreen('product');
  };

  const handleToggleCompare = (product: Product) => {
    setCompareIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 4) {
        showToast('Comparison shortlist supports up to 4 items.');
        return prev;
      }
      showToast(`Added to shortlist (${prev.length + 1}/4)`);
      return [...prev, product.id];
    });
  };

  const handleAddToCart = (product: Product, variant: string, quantity: number) => {
    setManualVoucherOverride(false);
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.productId === product.id && item.variant === variant
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(product.stock, next[idx].quantity + quantity),
          selected: true,
        };
        return next;
      }
      return [...prev, { productId: product.id, variant, quantity, selected: true }];
    });
    showToast(`Added ${quantity}x ${product.title.slice(0, 28)}... — best voucher applied`);
  };

  const handleQuickAdd = (product: Product) => {
    const preferred = filters.compatibilityTag
      ? product.variants.options.find((opt) =>
          opt.toLowerCase().includes(filters.compatibilityTag.toLowerCase())
        )
      : undefined;
    handleAddToCart(product, preferred ?? product.variants.options[0], 1);
  };

  const handleBuyNow = (product: Product, variant: string, quantity: number) => {
    handleAddToCart(product, variant, quantity);
    setScreen('cart');
  };

  const handleClaimVoucher = (voucherId: string) => {
    if (!claimedVoucherIds.includes(voucherId)) {
      setClaimedVoucherIds((prev) => [...prev, voucherId]);
      const v = VOUCHERS.find((x) => x.id === voucherId);
      if (v) showToast(`Claimed ${v.title} voucher (${v.code})`);
    }
  };

  const handleSelectVoucher = (voucherId: string | null, isManual = false) => {
    if (isManual) setManualVoucherOverride(true);
    setSelectedVoucherId(voucherId);
  };

  const handleToggleSelect = (productId: string, variant: string) => {
    setManualVoucherOverride(false);
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variant === variant
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const handleToggleSelectAll = (selected: boolean) => {
    setManualVoucherOverride(false);
    setCartItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const handleUpdateQty = (productId: string, variant: string, delta: number) => {
    setManualVoucherOverride(false);
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || item.variant !== variant) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return { ...item, quantity: nextQty };
        })
        .filter((x): x is CartItem => x !== null)
    );
  };

  const handleRemoveItem = (productId: string, variant: string) => {
    setManualVoucherOverride(false);
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variant === variant))
    );
  };

  const handlePlaceOrder = (payload: {
    recipientName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    voucherDiscount: number;
    total: number;
  }) => {
    const selectedCartItems = cartItems.filter((i) => i.selected);
    const orderId = `SHP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Preparing Shipment',
      items: selectedCartItems.map((ci) => {
        const p = PRODUCTS.find((prod) => prod.id === ci.productId)!;
        return {
          productId: p.id,
          title: p.title,
          variant: ci.variant,
          quantity: ci.quantity,
          unitPrice: p.price,
          visual: p.visual,
          shopName: p.shopName,
        };
      }),
      subtotal: payload.subtotal,
      shippingFee: payload.shippingFee,
      voucherDiscount: payload.voucherDiscount,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      recipientName: payload.recipientName,
      address: payload.address,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrderId(orderId);
    setCartItems((prev) => prev.filter((item) => !item.selected));
    setManualVoucherOverride(false);
    setSelectedVoucherId(null);
    setScreen('orders');
    showToast(`Order #${orderId} placed successfully!`);
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextStatus: OrderRecord['status'] =
          o.status === 'Preparing Shipment' ? 'In Transit' : 'Delivered';
        return { ...o, status: nextStatus };
      })
    );
  };

  const comparedProducts = useMemo(
    () =>
      compareIds
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined),
    [compareIds]
  );

  const relatedProducts = PRODUCTS.filter((p) => p.id !== selectedProduct.id).sort((a, b) =>
    a.categoryId === selectedProduct.categoryId && b.categoryId !== selectedProduct.categoryId
      ? -1
      : 1
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-[#222222]">
      <Header
        currentScreen={screen}
        onNavigate={handleNavigate}
        searchQuery={filters.query}
        activeCategoryIds={filters.categoryIds}
        categories={CATEGORIES}
        onSearchSubmit={handleSearchSubmit}
        onSelectCategory={handleSelectCategory}
        onQuickFilter={handleQuickFilter}
        cartItems={cartItems}
        products={PRODUCTS}
        onSelectProduct={handleSelectProduct}
        ordersCount={orders.length}
        compareCount={compareIds.length}
        onOpenCompare={() => setCompareModalOpen(true)}
      />

      <main className="flex-1">
        {screen === 'home' && (
          <HomeScreen
            products={PRODUCTS}
            vouchers={VOUCHERS}
            claimedVoucherIds={claimedVoucherIds}
            shoppingIntent={shoppingIntent}
            recentInterestLabel={recentInterestLabel}
            compareIds={compareIds}
            onChangeIntent={setShoppingIntent}
            onClaimVoucher={handleClaimVoucher}
            onSearchSubmit={handleSearchSubmit}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={handleQuickAdd}
            onToggleCompare={handleToggleCompare}
            onQuickFilter={handleQuickFilter}
          />
        )}

        {screen === 'catalog' && (
          <CatalogScreen
            categories={CATEGORIES}
            products={PRODUCTS}
            filters={filters}
            compareIds={compareIds}
            onUpdateFilters={setFilters}
            onClearFilters={() => setFilters(INITIAL_FILTERS)}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={handleQuickAdd}
            onToggleCompare={handleToggleCompare}
            onOpenCompare={() => setCompareModalOpen(true)}
            onBackHome={() => setScreen('home')}
          />
        )}

        {screen === 'product' && (
          <ProductDetailScreen
            key={selectedProduct.id}
            product={selectedProduct}
            relatedProducts={relatedProducts}
            vouchers={VOUCHERS}
            claimedVoucherIds={claimedVoucherIds}
            compareIds={compareIds}
            preferredCompatibility={filters.compatibilityTag}
            onClaimVoucher={handleClaimVoucher}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleCompare={handleToggleCompare}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onBackHome={() => setScreen('home')}
          />
        )}

        {(screen === 'cart' || screen === 'checkout' || screen === 'orders') && (
          <CartAndCheckoutScreen
            mode={screen}
            cartItems={cartItems}
            products={PRODUCTS}
            vouchers={VOUCHERS}
            claimedVoucherIds={claimedVoucherIds}
            selectedVoucherId={selectedVoucherId}
            orders={orders}
            latestOrderId={latestOrderId}
            onClaimVoucher={handleClaimVoucher}
            onSelectVoucher={handleSelectVoucher}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onProceedCheckout={() => setScreen('checkout')}
            onBackToCart={() => setScreen('cart')}
            onPlaceOrder={handlePlaceOrder}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onSelectProduct={handleSelectProduct}
            onContinueShopping={() => setScreen('home')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} onQuickFilter={handleQuickFilter} />

      {/* Sticky Shortlist & Compare Bar (visible outside cart/checkout when items are shortlisted) */}
      {screen !== 'cart' && screen !== 'checkout' && (
        <CompareBar
          comparedProducts={comparedProducts}
          onRemoveCompare={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onClearCompare={() => setCompareIds([])}
          onOpenModal={() => setCompareModalOpen(true)}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        open={compareModalOpen}
        comparedProducts={comparedProducts}
        vouchers={VOUCHERS}
        onClose={() => setCompareModalOpen(false)}
        onRemoveCompare={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Crisp Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#222222]/95 text-white px-5 py-3 rounded-[2px] shadow-lg flex items-center gap-2 text-[13px] font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FFCE3D] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
