import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Ticket,
  Check,
  Search,
  Scale,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Product, ShoppingIntent, Voucher } from '../types/marketplace';
import { ProductCard } from '../components/ProductCard';
import { ProductVisual } from '../components/ProductVisual';

interface HomeScreenProps {
  products: Product[];
  vouchers: Voucher[];
  claimedVoucherIds: string[];
  shoppingIntent: ShoppingIntent;
  recentInterestLabel: string | null;
  compareIds: string[];
  onChangeIntent: (intent: ShoppingIntent) => void;
  onClaimVoucher: (voucherId: string) => void;
  onSearchSubmit: (query: string, compatibilityTag?: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  onQuickFilter: (type: 'mall' | 'flash' | 'freeShipping' | 'all') => void;
}

const INTENT_OPTIONS: {
  id: ShoppingIntent;
  label: string;
  headline: string;
  subline: string;
  quickLinks: { label: string; query: string; compat?: string }[];
}[] = [
  {
    id: 'all',
    label: 'For You',
    headline: 'Find the right product faster, without banner clutter',
    subline:
      'Compare verified prices with offer conditions upfront, filter exact device compatibility, and auto-apply your best voucher in cart.',
    quickLinks: [
      { label: 'iPhone 17 exact cases', query: 'iPhone 17 case', compat: 'iPhone 17' },
      { label: 'Flagship headphones', query: 'Sony WH-1000XM5' },
      { label: 'Under $40 daily buys', query: 'Vitamin C' },
    ],
  },
  {
    id: 'tech',
    label: 'Tech & Phone Gear',
    headline: 'Tech, desk setups & exact-fit device accessories',
    subline:
      'Filter by exact phone model, USB-C power delivery, or OS compatibility before opening a listing.',
    quickLinks: [
      { label: 'iPhone 17 (6.3") cases', query: 'iPhone 17 case', compat: 'iPhone 17' },
      { label: 'iPhone 17 Pro Max cases', query: 'iPhone 17', compat: 'iPhone 17 Pro Max' },
      { label: 'macOS & Windows keyboards', query: 'Mechanical Keyboard', compat: 'macOS' },
    ],
  },
  {
    id: 'essentials',
    label: 'Daily Essentials',
    headline: 'Skincare, pantry staples & everyday home upgrades',
    subline:
      'Restock trusted Shopee Mall skincare, organic canvas carryalls, and home fragrances with clear free-shipping thresholds.',
    quickLinks: [
      { label: 'Vitamin C & Hydration', query: 'Serum' },
      { label: 'Kyoto Matcha', query: 'Matcha' },
      { label: 'Home Scents', query: 'Diffuser' },
    ],
  },
  {
    id: 'kitchen',
    label: 'Home Barista',
    headline: 'Espresso machines, pour-over kettles & blenders',
    subline:
      'All local 220V SG 3-pin appliances paired with transparent Mall warranty and cashback terms.',
    quickLinks: [
      { label: 'Espresso machines', query: 'Espresso' },
      { label: 'Gooseneck kettles', query: 'Kettle' },
      { label: 'Portable blenders', query: 'Blender' },
    ],
  },
  {
    id: 'active',
    label: 'Travel & Active',
    headline: 'Sneakers, cabin luggage, smartwatches & carry gear',
    subline:
      'Compare weight, waterproof ratings, and next-day delivery ETAs side by side.',
    quickLinks: [
      { label: 'Running sneakers', query: 'Sneakers' },
      { label: 'Cabin luggage', query: 'Luggage' },
      { label: 'GPS smartwatches', query: 'Smartwatch' },
    ],
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  vouchers,
  claimedVoucherIds,
  shoppingIntent,
  recentInterestLabel,
  compareIds,
  onChangeIntent,
  onClaimVoucher,
  onSearchSubmit,
  onSelectCategory,
  onSelectProduct,
  onQuickAdd,
  onToggleCompare,
  onQuickFilter,
}) => {
  const [flashOffset, setFlashOffset] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(2 * 3600 + 18 * 60 + 44);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 2 * 3600 + 59 * 60 + 59));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsRemaining / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsRemaining % 60).padStart(2, '0');

  const activeIntentConfig =
    INTENT_OPTIONS.find((opt) => opt.id === shoppingIntent) ?? INTENT_OPTIONS[0];

  const intentProducts =
    shoppingIntent === 'all'
      ? products
      : products.filter((p) => p.intentTags.includes(shoppingIntent));

  const spotlightProducts = intentProducts.slice(0, 2);

  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  const visibleFlashCount = 6;
  const maxFlashOffset = Math.max(0, flashSaleProducts.length - visibleFlashCount);
  const visibleFlashProducts = flashSaleProducts.slice(
    flashOffset,
    flashOffset + visibleFlashCount
  );

  return (
    <div className="w-full pb-14">
      {/* Intent-Led Focal Workspace (Replaces Noisy Multi-Banner Clutter) */}
      <section className="bg-white border-b border-[#EBEBEB] py-5">
        <div className="max-w-[1200px] mx-auto px-4 space-y-4">
          {/* Shopping Intent Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-[#555555] inline-flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Shopping Intent:</span>
              </span>
              {INTENT_OPTIONS.map((opt) => {
                const active = shoppingIntent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeIntent(opt.id);
                      setFlashOffset(0);
                    }}
                    className={`h-[30px] px-3 rounded-[2px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#EE4D2D] text-white font-semibold'
                        : 'bg-[#F5F5F5] text-[#444444] hover:bg-[#FFF5F1] hover:text-[#EE4D2D]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {recentInterestLabel && (
              <button
                type="button"
                onClick={() => onSearchSubmit(recentInterestLabel)}
                className="text-[12px] text-[#555555] hover:text-[#EE4D2D] cursor-pointer"
              >
                Pick up recent: <span className="font-semibold text-[#EE4D2D] underline">{recentInterestLabel}</span>
              </button>
            )}
          </div>

          {/* 12-Col Intent-Led Split Hero: Clear Action Starting Point + 2 Comparable Spotlight Deals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left 7 Cols: Intent Headline & Direct Action Pathways */}
            <div className="lg:col-span-7 bg-[#FFFBF8] border border-[#F3DDD6] rounded-[3px] p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#EE4D2D]">
                  Personalised for {activeIntentConfig.label}
                </div>
                <h1
                  className="font-display text-[24px] sm:text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#222222] mt-1.5"
                  style={{ textWrap: 'balance' }}
                >
                  {activeIntentConfig.headline}
                </h1>
                <p className="mt-2 text-[13px] leading-[19px] text-[#555555] max-w-[58ch]">
                  {activeIntentConfig.subline}
                </p>
              </div>

              {/* Prioritized Quick Entry Points */}
              <div className="mt-5 pt-4 border-t border-[#F2E2DC] flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-[#757575] mr-1">
                  Quick start:
                </span>
                {activeIntentConfig.quickLinks.map((ql) => (
                  <button
                    key={ql.label}
                    type="button"
                    onClick={() => onSearchSubmit(ql.query, ql.compat)}
                    className="h-[32px] px-3 bg-white border border-[#DCDCDC] hover:border-[#EE4D2D] hover:text-[#EE4D2D] text-[#222222] text-[12px] font-medium rounded-[2px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3 h-3 text-[#EE4D2D]" />
                    <span>{ql.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onQuickFilter('all')}
                  className="h-[32px] px-3 bg-[#EE4D2D] hover:bg-[#D73211] text-white text-[12px] font-semibold rounded-[2px] inline-flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <span>Browse All {products.length}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 5 Cols: 2 Top Intent Spotlight Deals (Prominent Price + Offer Condition) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {spotlightProducts.map((item) => {
                const isCompared = compareIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectProduct(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectProduct(item);
                      }
                    }}
                    className="bg-white border border-[#EBEBEB] hover:border-[#EE4D2D] rounded-[3px] p-3 flex items-center gap-3.5 cursor-pointer transition-colors group"
                  >
                    <div className="w-[88px] h-[88px] rounded-[2px] border border-[#EBEBEB] overflow-hidden shrink-0 bg-[#FAFAFA]">
                      <ProductVisual kind={item.visual} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#757575]">
                        <span className="font-semibold text-[#D0011B]">
                          {item.isMall ? 'Shopee Mall' : 'Preferred'}
                        </span>
                        <span>{item.deliveryEta}</span>
                      </div>
                      <div className="text-[13px] font-medium text-[#222222] group-hover:text-[#EE4D2D] truncate mt-0.5">
                        {item.title}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                        <span className="font-display text-[20px] font-extrabold text-[#EE4D2D] leading-none tabular-nums">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#888888] line-through tabular-nums">
                          ${item.originalPrice.toFixed(0)}
                        </span>
                        <span className="text-[11px] font-semibold text-[#B93815] truncate">
                          · {item.offerCondition}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[#555555] truncate">
                          {item.keyHighlight}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(item);
                          }}
                          className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0 ${
                            isCompared
                              ? 'bg-[#222222] text-white'
                              : 'bg-[#F5F5F5] text-[#444444] hover:text-[#EE4D2D]'
                          }`}
                        >
                          <Scale className="w-2.5 h-2.5" />
                          <span>{isCompared ? 'Shortlisted' : 'Compare'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 space-y-5 mt-5">
        {/* FLASH DEALS — EASY TO COMPARE */}
        <section className="bg-white border border-[#EBEBEB] rounded-[2px] relative">
          <div className="px-5 py-3.5 border-b border-[#EBEBEB] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#EE4D2D]">
                <Zap className="w-5 h-5 fill-[#EE4D2D]" />
                <h2 className="font-display text-[19px] font-extrabold tracking-[-0.02em] uppercase">
                  Flash Deals
                </h2>
              </div>

              <div className="flex items-center gap-1" aria-label="Flash sale countdown timer">
                <span className="bg-[#000000] text-white font-display text-[14px] font-bold leading-[18px] px-1.5 py-0.5 rounded-[2px] tabular-nums">
                  {hours}
                </span>
                <span className="text-[#222222] font-bold text-[13px]">:</span>
                <span className="bg-[#000000] text-white font-display text-[14px] font-bold leading-[18px] px-1.5 py-0.5 rounded-[2px] tabular-nums">
                  {minutes}
                </span>
                <span className="text-[#222222] font-bold text-[13px]">:</span>
                <span className="bg-[#000000] text-white font-display text-[14px] font-bold leading-[18px] px-1.5 py-0.5 rounded-[2px] tabular-nums">
                  {seconds}
                </span>
              </div>

              <span className="hidden md:inline text-[12px] text-[#757575]">
                · Offer conditions shown next to every price
              </span>
            </div>

            <button
              type="button"
              onClick={() => onQuickFilter('flash')}
              className="text-[13px] font-medium text-[#EE4D2D] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Compare All Flash Deals</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative p-3">
            {flashOffset > 0 && (
              <button
                type="button"
                aria-label="Previous flash sale items"
                onClick={() => setFlashOffset((prev) => Math.max(0, prev - 1))}
                className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#EBEBEB] shadow-md items-center justify-center text-[#555555] hover:text-[#EE4D2D] hover:scale-110 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {flashOffset < maxFlashOffset && (
              <button
                type="button"
                aria-label="Next flash sale items"
                onClick={() => setFlashOffset((prev) => Math.min(maxFlashOffset, prev + 1))}
                className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#EBEBEB] shadow-md items-center justify-center text-[#555555] hover:text-[#EE4D2D] hover:scale-110 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[10px]">
              {visibleFlashProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                  isCompared={compareIds.includes(product.id)}
                  onToggleCompare={onToggleCompare}
                  flashSaleMode
                />
              ))}
            </div>
          </div>
        </section>

        {/* TRANSPARENT VOUCHERS STRIP */}
        <section id="voucher-strip" className="bg-white border border-[#EBEBEB] rounded-[2px] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#EE4D2D]" />
              <h2 className="font-display text-[15px] font-semibold text-[#222222] uppercase tracking-[0.01em]">
                Eligible Vouchers — Auto-Applied Best Savings in Cart
              </h2>
            </div>
            <span className="text-[12px] text-[#757575] tabular-nums">
              {claimedVoucherIds.length} of {vouchers.length} claimed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vouchers.map((voucher) => {
              const isClaimed = claimedVoucherIds.includes(voucher.id);
              return (
                <div
                  key={voucher.id}
                  className="voucher-ticket border border-[#F3D2C9] rounded-[2px] flex items-stretch overflow-hidden"
                >
                  <div className="w-[84px] shrink-0 bg-[#FFF5F1] border-r border-dashed border-[#EE4D2D]/40 p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-[#EE4D2D] uppercase leading-tight">
                      {voucher.badge}
                    </span>
                    <span className="mt-1 font-mono text-[10px] text-[#757575] font-semibold">
                      {voucher.code}
                    </span>
                  </div>

                  <div className="flex-1 p-2.5 pl-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display text-[16px] font-bold text-[#EE4D2D] leading-tight">
                        {voucher.title}
                      </div>
                      <div className="text-[11px] text-[#222222] mt-0.5 truncate">
                        {voucher.subtitle}
                      </div>
                      <div className="text-[10px] text-[#757575] mt-1">{voucher.expiresIn}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onClaimVoucher(voucher.id)}
                      className={`h-[28px] px-3 rounded-[2px] text-[11px] font-semibold shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        isClaimed
                          ? 'bg-[#FFF5F1] text-[#EE4D2D] border border-[#EE4D2D]'
                          : 'bg-[#EE4D2D] hover:bg-[#D73211] text-white'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Claimed</span>
                        </>
                      ) : (
                        <span>Claim</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PERSONALISED INTENT DISCOVER GRID */}
        <section>
          <div className="bg-white border border-[#EBEBEB] rounded-t-[2px] px-5 h-[48px] flex items-center justify-between mb-3">
            <div className="h-full flex items-center border-b-4 border-[#EE4D2D] px-1">
              <h2 className="font-display text-[16px] font-bold text-[#EE4D2D] uppercase tracking-[0.02em]">
                {shoppingIntent === 'all'
                  ? 'Daily Discover'
                  : `Curated for ${activeIntentConfig.label}`}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {shoppingIntent !== 'all' && (
                <button
                  type="button"
                  onClick={() => onChangeIntent('all')}
                  className="text-[12px] text-[#757575] hover:text-[#EE4D2D] cursor-pointer"
                >
                  Show All ({products.length})
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  shoppingIntent === 'tech'
                    ? onSelectCategory('mobile')
                    : onQuickFilter('all')
                }
                className="text-[13px] text-[#555555] hover:text-[#EE4D2D] font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Refine &amp; Compare Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[10px]">
            {intentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isCompared={compareIds.includes(product.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => onQuickFilter('all')}
              className="h-[40px] px-10 bg-white border border-[#EBEBEB] hover:border-[#EE4D2D] hover:bg-[#FFF5F1] text-[#555555] hover:text-[#EE4D2D] text-[14px] font-medium rounded-[2px] transition-colors cursor-pointer"
            >
              Open Full Catalog &amp; Compatibility Filters
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
