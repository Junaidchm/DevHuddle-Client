import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false }: PaginationProps) => {
  if (totalPages < 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
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

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-8 select-none">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="w-10 h-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:text-primary transition-all duration-300"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex items-center gap-1.5 px-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4 opacity-50" />
              </div>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300",
                isActive 
                  ? "shadow-lg shadow-primary/25 scale-110" 
                  : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              )}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="w-10 h-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:text-primary transition-all duration-300"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Pagination;
