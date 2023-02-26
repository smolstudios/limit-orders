import { ofetch } from "ofetch";
import qs from "query-string";
import type { OrderbookPaginatedFetchFilterParams, OrderbookPaginatedFetchResult } from "./orderbook.types";

const fetchOrderbookOrders = (
  rootUrl: string = `https://api.0x.org`,
  params?: Partial<OrderbookPaginatedFetchFilterParams>
) => {
  const defaultParams: Partial<OrderbookPaginatedFetchFilterParams> = {
    perPage: '1000',
    page: '1',
  };
  const filterParams = {
    ...defaultParams,
    ...params,
  };
  const queryStringParams = qs.stringify(filterParams);
  const url = `${rootUrl}/orderbook/v1/orders?${queryStringParams}`;
  const res = ofetch<OrderbookPaginatedFetchResult>(url)
  return res
};

export {
    fetchOrderbookOrders,
}