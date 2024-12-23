// core/models/api-response.model.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
  first: boolean;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: Date;
  path: string;
  error: string;
}
