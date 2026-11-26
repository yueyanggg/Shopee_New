import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  Scale,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { CartItem, Category, Product, ScreenView } from '../types/marketplace';
import { ProductVisual } from './ProductVisual';

interface HeaderProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  searchQuery: string;
  activeCategoryIds: string[];
  categories: Category[];
  onSearchSubmit: (query: string, compatibilityTag?: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onQuickFilter: (type: 'mall' | 'flash' | 'freeShipping' | 'all') => void;
  cartItems: CartItem[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  ordersCount: number;
  compareCount: number;
  onOpenCompare: () => void;
}

const SEARCH_STARTERS = [
  { label: 'iPhone 17 case', query: 'iPhone 17 case', compat: 'iPhone 17' },
  { label: 'Noise cancelling', query: 'Sony WH-1000XM5' },
  { label: 'Mechanical keyboard', query: 'Mechanical Keyboard' },
  { label: 'Vitamin C serum', query: 'Vitamin C' },
  { label: 'Espresso machine', query: 'Espresso' },
];

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  searchQuery,
  activeCategoryIds,
  categories,
  onSearchSubmit,
  onSelectCategory,
  onQuickFilter,
  cartItems,
  products,
  onSelectProduct,
  ordersCount,
  compareCount,
  onOpenCompare,
}) => {
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const totalCartUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const trimmedDraft = draftQuery.trim().toLowerCase();
  const liveMatches = trimmedDraft
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(trimmedDraft) ||
            p.categoryName.toLowerCase().includes(trimmedDraft) ||
            p.shopName.toLowerCase().includes(trimmedDraft) ||
            (p.compatibility ?? []).some((c) => c.toLowerCase().includes(trimmedDraft))
        )
        .slice(0, 5)
    : [];

  const detectedCompatibility = trimmedDraft
    ? Array.from(
        new Set(
          products
            .filter(
              (p) =>
                p.title.toLowerCase().includes(trimmedDraft) ||
                (p.compatibility ?? []).some((c) => c.toLowerCase().includes(trimmedDraft))
            )
            .flatMap((p) => p.compatibility ?? [])
        )
      ).slice(0, 4)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    onSearchSubmit(draftQuery.trim());
  };

  return (
    <header
      className="sticky top-0 z-40 w-full text-white"
      style={{
        background: 'linear-gradient(180deg, #F53D2D 0%, #EE4D2D 100%)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Top Priority Row: Brand + Dominant Search Starting Point + Key Shopping Actions */}
      <div className="max-w-[1200px] mx-auto px-4 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 shrink-0 cursor-pointer group focus-visible:outline-none whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-[4px] bg-white text-[#EE4D2D] flex items-center justify-center shadow-xs group-hover:scale-[1.02] transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.25]" />
            </div>
            <span className="font-display text-[24px] sm:text-[26px] font-bold tracking-[-0.02em] leading-none text-white">
              Shopee
            </span>
          </button>

          {/* Clearest Starting Point: Prominent Search Bar + Live Compatibility & Product Preview */}
          <div ref={searchContainerRef} className="flex-1 max-w-[700px] relative">
            <form
              onSubmit={handleSubmit}
              className={`flex items-center bg-white rounded-[3px] p-[3px] h-[44px] shadow-sm transition-shadow ${
                searchFocused ? 'ring-2 ring-[#FFE97A]' : ''
              }`}
            >
              <input
                type="text"
                value={draftQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setDraftQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="What are you looking for? Try 'iPhone 17 case', 'Sony XM5', 'espresso'..."
                aria-label="Search marketplace products"
                className="flex-1 h-full px-3.5 text-[14px] text-[#222222] placeholder:text-[#757575] focus:outline-none bg-transparent min-w-0"
              />
              {draftQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setDraftQuery('');
                    setSearchFocused(true);
                  }}
                  className="p-1.5 text-[#757575] hover:text-[#222222] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="h-[38px] px-4 sm:px-5 bg-[#EE4D2D] hover:bg-[#D73211] transition-colors text-white rounded-[2px] flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Quick Intent Search Starters */}
            <div className="hidden md:flex items-center gap-3 mt-1.5 text-[11px] text-white/95 overflow-hidden">
              <span className="text-white/75 shrink-0">Popular:</span>
              {SEARCH_STARTERS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setDraftQuery(item.query);
                    setSearchFocused(false);
                    onSearchSubmit(item.query, item.compat);
                  }}
                  className="hover:text-[#FFE97A] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Live Instant Search + Compatibility Refinement Dropdown */}
            {searchFocused && trimmedDraft.length >= 2 && (
              <div
                className="absolute left-0 right-0 top-[48px] bg-white text-[#222222] border border-[#E0E0E0] rounded-[3px] z-50 overflow-hidden"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
              >
                {detectedCompatibility.length > 0 && (
                  <div className="px-3.5 py-2 bg-[#FFFBF8] border-b border-[#F2E2DC] flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="text-[#555555] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#EE4D2D]" />
                      Refine exact compatibility:
                    </span>
                    {detectedCompatibility.map((compat) => (
                      <button
                        key={compat}
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          onSearchSubmit(draftQuery.trim(), compat);
                        }}
                        className="px-2 py-0.5 bg-white border border-[#EE4D2D] text-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white rounded-[2px] font-medium transition-colors cursor-pointer"
                      >
                        {compat}
                      </button>
                    ))}
                  </div>
                )}

                {liveMatches.length === 0 ? (
                  <div className="px-4 py-4 text-[13px] text-[#757575]">
                    Press Enter to search all products for &ldquo;{draftQuery.trim()}&rdquo;.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F5F5F5]">
                    {liveMatches.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          onSelectProduct(product);
                        }}
                        className="w-full px-3.5 py-2.5 hover:bg-[#FFF5F1] transition-colors flex items-center gap-3 text-left cursor-pointer"
                      >
                        <div className="w-10 h-10 border border-[#EBEBEB] rounded-[2px] overflow-hidden shrink-0">
                          <ProductVisual kind={product.visual} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-[#222222] font-medium truncate">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-[#757575] flex items-center gap-1.5 truncate">
                            <span>{product.categoryName}</span>
                            <span>·</span>
                            <span>{product.offerCondition}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display font-bold text-[14px] text-[#EE4D2D] tabular-nums">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-[#757575]">{product.deliveryEta}</div>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        onSearchSubmit(draftQuery.trim());
                      }}
                      className="w-full px-3.5 py-2 bg-[#FAFAFA] hover:bg-[#FFF5F1] text-[12px] font-semibold text-[#EE4D2D] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>See all results for &ldquo;{draftQuery.trim()}&rdquo;</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prioritized Key Shopping Actions: Shortlist/Compare + Orders + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenCompare}
              className="h-[38px] px-2.5 sm:px-3 bg-white/12 hover:bg-white/20 rounded-[2px] inline-flex items-center gap-1.5 text-[12px] font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
              title="Compare shortlisted items"
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Compare</span>
              <span className="tabular-nums font-bold">({compareCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className={`h-[38px] px-2.5 sm:px-3 rounded-[2px] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'orders'
                  ? 'bg-white text-[#EE4D2D] font-semibold'
                  : 'bg-white/12 hover:bg-white/20 text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Orders</span>
              <span className="tabular-nums font-bold">({ordersCount})</span>
            </button>

            {/* Cart Button & Hover Flyout */}
            <div
              className="relative"
              onMouseEnter={() => setCartPreviewOpen(true)}
              onMouseLeave={() => setCartPreviewOpen(false)}
            >
              <button
                type="button"
                onClick={() => onNavigate('cart')}
                aria-label={`Shopping cart with ${totalCartUnits} items`}
                className={`relative h-[38px] px-3 rounded-[2px] inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  currentScreen === 'cart' || currentScreen === 'checkout'
                    ? 'bg-white text-[#EE4D2D]'
                    : 'bg-white text-[#EE4D2D] hover:bg-[#FFF5F1]'
                }`}
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                <span className="hidden sm:inline">Cart</span>
                <span className="tabular-nums">({totalCartUnits})</span>
              </button>

              {cartPreviewOpen && (
                <div
                  className="hidden lg:block absolute right-0 top-full mt-1 w-[380px] bg-white text-[#222222] rounded-[2px] border border-[#E0E0E0] z-50"
                  style={{ boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)' }}
                >
                  <div className="px-3.5 py-2.5 border-b border-[#EBEBEB] text-[13px] font-medium text-[#555555]">
                    Shopping Cart ({totalCartUnits} items)
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="py-10 px-4 text-center text-[13px] text-[#757575]">
                      Your shopping cart is empty.
                    </div>
                  ) : (
                    <div className="max-h-[260px] overflow-y-auto divide-y divide-[#F5F5F5]">
                      {cartItems.slice(0, 5).map((item) => {
                        const product = products.find((p) => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <button
                            key={`${item.productId}-${item.variant}`}
                            type="button"
                            onClick={() => {
                              setCartPreviewOpen(false);
                              onSelectProduct(product);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#FAFAFA] transition-colors text-left cursor-pointer"
                          >
                            <div className="w-11 h-11 rounded-[2px] border border-[#EBEBEB] overflow-hidden shrink-0">
                              <ProductVisual kind={product.visual} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] text-[#222222] truncate font-medium">
                                {product.title}
                              </div>
                              <div className="text-[11px] text-[#757575] mt-0.5 truncate">
                                {item.variant} · Qty {item.quantity}
                              </div>
                            </div>
                            <div className="font-display font-bold text-[14px] text-[#EE4D2D] tabular-nums shrink-0">
                              ${(product.price * item.quantity).toFixed(2)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="px-3.5 py-2.5 bg-[#FAFAFA] border-t border-[#EBEBEB] flex items-center justify-between">
                    <span className="text-[11px] text-[#757575]">
                      Best eligible voucher auto-applied in cart
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCartPreviewOpen(false);
                        onNavigate('cart');
                      }}
                      className="h-[34px] px-4 bg-[#EE4D2D] hover:bg-[#D73211] text-white text-[13px] font-semibold rounded-[2px] transition-colors cursor-pointer"
                    >
                      Open Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Category Navigation Strip (Visible Across All Screens) */}
      <nav
        aria-label="Persistent category navigation"
        className="bg-white text-[#222222] border-t border-b border-[#EBEBEB]"
      >
        <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar h-[38px]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-2.5 h-full text-[12px] font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              currentScreen === 'home'
                ? 'border-[#EE4D2D] text-[#EE4D2D] font-semibold'
                : 'border-transparent text-[#555555] hover:text-[#EE4D2D]'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => onQuickFilter('all')}
            className={`px-2.5 h-full text-[12px] font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              currentScreen === 'catalog' && activeCategoryIds.length === 0
                ? 'border-[#EE4D2D] text-[#EE4D2D] font-semibold'
                : 'border-transparent text-[#555555] hover:text-[#EE4D2D]'
            }`}
          >
            All Categories
          </button>

          <span className="text-[#E0E0E0] px-0.5 shrink-0">|</span>

          {categories.slice(0, 10).map((cat) => {
            const isActive =
              currentScreen === 'catalog' && activeCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 h-full text-[12px] whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#EE4D2D] text-[#EE4D2D] font-semibold'
                    : 'border-transparent text-[#444444] hover:text-[#EE4D2D]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          <span className="text-[#E0E0E0] px-0.5 shrink-0">|</span>

          <button
            type="button"
            onClick={() => onQuickFilter('flash')}
            className="px-2.5 h-full text-[12px] font-semibold text-[#EE4D2D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Flash Deals
          </button>

          <button
            type="button"
            onClick={() => onQuickFilter('mall')}
            className="px-2.5 h-full text-[12px] font-semibold text-[#D0011B] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Shopee Mall
          </button>
        </div>
      </nav>
    </header>
  );
};
