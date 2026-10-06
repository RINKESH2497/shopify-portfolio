import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ArrowRight, Tag } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ImageWithFallback, ImageCategory } from '../common/ImageWithFallback';
import { useSearch } from '../../engine/SearchContext';
import { useStore } from '../../engine/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface SearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen: explicitIsOpen,
  onClose: explicitOnClose,
}) => {
  const {
    isOpen: contextIsOpen,
    closeSearch: contextCloseSearch,
    query,
    setQuery,
    clearQuery,
    results,
    hasSearched,
    recentQueries,
    recordQuery,
    removeRecentQuery,
    clearRecentQueries,
    suggestedQueries,
  } = useSearch();

  const { storeId, storeConfig } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = explicitIsOpen !== undefined ? explicitIsOpen : contextIsOpen;
  const onClose = explicitOnClose || contextCloseSearch;

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSelectQuery = (selectedQuery: string) => {
    setQuery(selectedQuery);
    recordQuery(selectedQuery);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      recordQuery(query);
    }
  };

  const handleProductClick = () => {
    if (query.trim()) {
      recordQuery(query);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]">
          <SearchIcon className="w-5 h-5 text-[var(--color-text-muted,#6b7280)] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${storeConfig?.name || 'catalog'}...`}
            aria-label="Search products"
            className="flex-1 bg-transparent border-none text-[var(--color-text,#111827)] placeholder-[var(--color-text-muted,#9ca3af)] text-base font-medium focus:outline-none focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear search input"
              className="p-1 rounded-full text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-mono text-[var(--color-text-muted,#9ca3af)] border border-[var(--color-border,#e5e7eb)] px-1.5 py-0.5 rounded">
              ESC
            </span>
          )}
        </div>

        {/* Search Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick suggestions & Recent Queries when query is empty */}
          {!hasSearched ? (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentQueries && recentQueries.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentQueries}
                      className="text-xs text-[var(--color-text-muted,#6b7280)] hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentQueries.map((rq) => (
                      <span
                        key={rq}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface,#f4f4f5)] text-[var(--color-text,#18181b)] border border-[var(--color-border,#e4e4e7)] hover:border-[var(--color-primary,#111827)] transition-all cursor-pointer group"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectQuery(rq)}
                          className="hover:underline"
                        >
                          {rq}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentQuery(rq);
                          }}
                          aria-label={`Remove recent search ${rq}`}
                          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories / Suggestions */}
              {suggestedQueries && suggestedQueries.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] flex items-center gap-1.5 mb-2.5">
                    <Tag className="w-3.5 h-3.5" />
                    Suggested Topics
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((sq) => (
                      <button
                        key={sq}
                        type="button"
                        onClick={() => handleSelectQuery(sq)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface,#f4f4f5)] text-[var(--color-text,#18181b)] border border-[var(--color-border,#e4e4e7)] hover:bg-[var(--color-primary,#111827)] hover:text-[var(--color-surface,#ffffff)] transition-colors"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Results List */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted,#6b7280)]">
                <span>
                  Showing {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;
                  <span className="font-semibold text-[var(--color-text,#111827)]">{query}</span>
                  &rdquo;
                </span>
                {results.length > 0 && (
                  <Link
                    to={`/${storeId}/collections/all`}
                    onClick={handleProductClick}
                    className="text-[var(--color-primary,#111827)] hover:underline font-medium flex items-center gap-1"
                  >
                    View All Products
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      to={`/${storeId}/products/${product.handle}`}
                      onClick={handleProductClick}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl border border-[var(--color-border,#e5e7eb)] hover:border-[var(--color-primary,#111827)] hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                        <ImageWithFallback
                          src={product.images?.[0]?.url}
                          alt={product.images?.[0]?.altText || product.title}
                          aspectRatio="square"
                          fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] truncate block">
                          {product.category}
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--color-text,#111827)] truncate group-hover:text-[var(--color-primary,#111827)] transition-colors">
                          {product.title}
                        </h4>
                        <span className="text-xs font-bold text-[var(--color-text,#111827)] mt-0.5 block">
                          {formatCurrency(product.price, storeConfig?.currency || 'USD')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* No Results Empty State */
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[var(--color-text-muted,#6b7280)]">
                    <SearchIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-text,#111827)]">
                    No products found for &ldquo;{query}&rdquo;
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted,#6b7280)] max-w-sm">
                    Check for spelling errors, try broader keywords, or browse through all categories.
                  </p>
                  <Link
                    to={`/${storeId}/collections/all`}
                    onClick={onClose}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] hover:opacity-90 transition-opacity"
                  >
                    Browse Full Catalog
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
