// 通用 API 响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
}

// 书籍相关
export interface Book {
  id: string
  title: string
  author: string
  content: string
  summary?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// 论文相关
export interface Paper {
  id: string
  title: string
  authors: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
}

// 金句相关
export interface Quote {
  id: string
  content: string
  author?: string
  category?: string
  userId: string
  createdAt: string
}
