import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemsPerPage?: number;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  totalItems
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 3) {
        adjustedEnd = 4;
      }
      if (currentPage >= totalPages - 2) {
        adjustedStart = totalPages - 3;
      }

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-6 mt-4 ${className}`}>
      {/* Mobile view buttons */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          Trước
        </button>
        <span className="text-xs text-slate-500 font-semibold self-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          Sau
        </button>
      </div>

      {/* Desktop view navigation */}
      <div className="hidden sm:flex sm:flex-grow sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-xs text-slate-500 font-semibold">
            Hiển thị trang <span className="font-extrabold text-slate-800">{currentPage}</span> / <span className="font-extrabold text-slate-800">{totalPages}</span>
            {totalItems !== undefined && (
              <span className="ml-1 text-slate-400 font-normal">({totalItems} kết quả)</span>
            )}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
              aria-label="Trang trước"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {pages.map((p, i) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${i}`}
                    className="relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 bg-white"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`relative inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-extrabold cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
              aria-label="Trang sau"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
