// Global API + domain types for StockNova

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type Role = "Admin" | "Manager" | "Viewer";

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ProductResponse {
  productId: number;
  productName: string;
  supplierId: number | null;
  supplierName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  quantityPerUnit: string | null;
  unitPrice: number | null;
  unitsInStock: number | null;
  unitsOnOrder: number | null;
  reorderLevel: number | null;
  discontinued: boolean;
  createdAt: string;
}

export interface ProductDetailResponse extends ProductResponse {
  categoryPicture: string | null;
  categoryDescription: string | null;
  supplierContactName: string | null;
  supplierPhone: string | null;
  supplierCountry: string | null;
  updatedAt: string | null;
}

export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  minPrice?: number;
  maxPrice?: number;
  discontinued?: boolean;
  sortBy?: "ProductName" | "UnitPrice" | "UnitsInStock" | "CreatedAt";
  sortOrder?: "asc" | "desc";
  id?: number;
}

export interface CreateProductRequest {
  productName: string;
  supplierId: number | null;
  categoryId: number | null;
  quantityPerUnit: string | null;
  unitPrice: number | null;
  unitsInStock: number | null;
  unitsOnOrder: number | null;
  reorderLevel: number | null;
  discontinued: boolean;
}

export type UpdateProductRequest = CreateProductRequest;

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string | null;
  picture: string | null;
  createdAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  description: string | null;
  picture: string | null;
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: string[];
  elapsedMs: number;
}

export interface AuditLogResponse {
  id: number;
  userEmail: string | null;
  action: string;
  entityName: string | null;
  entityId: string | null;
  message: string | null;
  level: "Information" | "Warning" | "Error" | string;
  ipAddress: string | null;
  timestamp: string;
}

export interface AuditLogParams {
  from?: string;
  to?: string;
  action?: string;
  entityName?: string;
  page?: number;
  pageSize?: number;
}
