import type { Order } from "./enums";

export interface FilterExample {
  label: string;
  snippet: string;
}

export interface SortExample {
  label: string;
  snippet: string;
}

export interface Item {
  title: string;
  description?: string;
  filter: {
    field: string;
    examples: FilterExample[];
  };
  sort?: {
    text: string;
    examples: SortExample[];
  };
}

export interface FilterParam {
  param: string;
  example: string;
}

export interface SortParam {
  param: string;
  order: Order;
}
