import { api } from "./client";
import type {
  ApiResponse,
  AuthResponse,
  CategoryResponse,
  CreateCategoryRequest,
  CreateProductRequest,
  ImportResult,
  LoginRequest,
  PagedResult,
  ProductDetailResponse,
  ProductFilterParams,
  ProductResponse,
  RegisterRequest,
  UpdateProductRequest,
  AuditLogParams,
  AuditLogResponse,
} from "@/core/types/api";

// --- Auth ---
export const authApi = {
  login: (body: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", body),
  register: (body: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", body),
};

// --- Products ---
export const productsApi = {
  list: (params: ProductFilterParams = {}) =>
    api.get<ApiResponse<PagedResult<ProductResponse>>>("/products", params as Record<string, string | number | boolean | undefined>),
  get: (id: number) =>
    api.get<ApiResponse<ProductDetailResponse>>(`/products/${id}`),
  create: (body: CreateProductRequest) =>
    api.post<ApiResponse<ProductResponse>>("/products", body),
  update: (id: number, body: UpdateProductRequest) =>
    api.put<ApiResponse<ProductResponse>>(`/products/${id}`, body),
  remove: (id: number) =>
    api.delete<ApiResponse<unknown>>(`/products/${id}`),
  importCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<ApiResponse<ImportResult>>("/products/import", form);
  },
};

// --- Categories ---
export const categoriesApi = {
  list: () =>
    api.get<ApiResponse<CategoryResponse[] | PagedResult<CategoryResponse>>>("/categories"),
  get: (id: number) =>
    api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`),
  create: (body: CreateCategoryRequest) =>
    api.post<ApiResponse<CategoryResponse>>("/categories", body),
};

// --- Audit logs ---
export const auditApi = {
  list: (params: AuditLogParams = {}) =>
    api.get<ApiResponse<PagedResult<AuditLogResponse> | AuditLogResponse[]>>("/auditlogs", params as Record<string, string | number | boolean | undefined>),
};
