
/**
 * PostgREST Client
 */

export interface options {
  protocol: string;
  hostname: string;
  port: number;
  pathname: string;
  method: string;
  headers: Record<string, string>;
  search: Record<string, string>;
  body: Record<string, any> | string;
  token: string;
}

export interface response {
  status: number;
  headers: Headers;
  body: any;
}

export type request = (partial_options: Partial<options>) => Promise<response>;
