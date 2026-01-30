// Common types used across the application

export interface BaseComponent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: any;
}

// UI Component Props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface ButtonProps extends BaseProps {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Navigation types
export type NavigationSection =
  | "home"
  | "about"
  | "privacy"
  | "terms"
  | "history"
  | "help";

export interface NavigationState {
  currentSection: NavigationSection;
  currentTab: string;
  isSidebarCollapsed: boolean;
}
