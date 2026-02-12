import { useState, useMemo, useEffect } from 'react';

const ITEMS_PER_PAGE = 10;

export function usePagination<T>(items: T[], itemsPerPage = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Reset to page 1 when items count changes (e.g. search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const safePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    goToPage,
    totalItems: items.length,
    startIndex: (safePage - 1) * itemsPerPage + 1,
    endIndex: Math.min(safePage * itemsPerPage, items.length),
  };
}
