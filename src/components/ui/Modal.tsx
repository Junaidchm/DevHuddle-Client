"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string | React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  preventScroll?: boolean;
}

/**
 * Production-ready Modal component using React Portal
 * 
 * Features:
 * - Renders outside DOM hierarchy using Portal (avoids z-index/overflow issues)
 * - Body scroll lock when open
 * - Proper backdrop handling
 * - Keyboard escape support
 * - Focus trap (optional, can be added)
 * - High z-index (9999) to ensure it's above everything
 * - Smooth animations
 * 
 * Usage:
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} title="My Modal">
 *   <div>Modal content</div>
 * </Modal>
 * ```
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnBackdropClick = true,
  maxWidth = "md",
  className = "",
  preventScroll = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  // Ensure we're in the browser before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

    // Store original styles
    const originalStyle = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.paddingRight = originalStyle.paddingRight;
    };
  }, [isOpen, preventScroll]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === backdropRef.current) {
      onClose();
    }
  };

  // Prevent modal content clicks from closing
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const modalContent = (
    <div
      ref={backdropRef}
      className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        // Ensure it covers entire viewport
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Prevent any parent overflow from affecting this
        overflow: "auto",
      }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-2xl w-full ${maxWidthClasses[maxWidth]} mx-auto my-auto flex flex-col ${className.includes("h-") ? "" : "max-h-[90vh]"}`}
        onClick={handleModalClick}
        style={{
          // Ensure modal is above backdrop
          position: "relative",
          zIndex: 10000,
          // Prevent clipping - let className handle height
          overflow: "hidden",
          // Smooth animation
          animation: "modalFadeIn 0.2s ease-out",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-white z-10 rounded-t-lg">
            {title && (
              typeof title === "string" ? (
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              ) : (
                <div id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </div>
              )
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close modal"
                type="button"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={className?.includes("flex flex-col") ? "flex flex-col flex-1 min-h-0" : "p-4"}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render to document.body using Portal to escape parent containers
  return createPortal(modalContent, document.body);
}

