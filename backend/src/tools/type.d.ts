declare global {
  type Nullable<T> = T | null;

  type Maybe<T> = T | undefined;

  type TPagination<T> = {
    records: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export {};
