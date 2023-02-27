import qs from "query-string";
import type {
  OrderbookPaginatedFetchFilterParams,
  OrderbookPaginatedFetchResult,
} from "./types";

const buildOrderbookOrdersGetUrl = (
  rootUrl: string = `https://api.0x.org`,
  params?: Partial<OrderbookPaginatedFetchFilterParams>
) => {
  const defaultParams: Partial<OrderbookPaginatedFetchFilterParams> = {
    perPage: "1000",
    page: "1",
  };
  const filterParams = {
    ...defaultParams,
    ...params,
  };
  const queryStringParams = qs.stringify(filterParams);
  const url = `${rootUrl}/orderbook/v1/orders?${queryStringParams}`;
  return url;
};

// Reference fetch
const fetchOrderbookOrders = async (
  rootUrl: string = `https://api.0x.org`,
  params?: Partial<OrderbookPaginatedFetchFilterParams>,
  _fetch = fetch
): Promise<OrderbookPaginatedFetchResult> => {
  const url = buildOrderbookOrdersGetUrl(rootUrl, params);
  const res = await _fetch(url);
  const json: OrderbookPaginatedFetchResult = await res.json();
  return json;
};



export { fetchOrderbookOrders, buildOrderbookOrdersGetUrl };
