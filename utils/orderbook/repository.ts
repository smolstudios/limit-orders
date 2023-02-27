import { DEFAULT_CACHE_TIME_FOR_ORDERS_IN_SECONDS } from "@/config/constants";
import { range } from "lodash";
import { LRUCache } from "typescript-lru-cache";
import { buildOrderbookOrdersGetUrl } from "./api";
import type { OrderbookPaginatedFetchResult, OrderRecord } from "./types";

interface IOrderbookRepository {}

interface FetchOrdersFromRemoteOrderbookOptions {
  // Either fetch all
  paginateAndFetchAllMatching: boolean;
  // Or specify page and/or perPage
  page: string;
  perPage: string;
  // Common filters
  makerToken: string;
  takerToken: string;
  chainId: string;
  maker: string;
  taker: string;
}

const handleFetchOrdersWithRSCSupport = async (url: string, _fetch = fetch) => {
  const res = await _fetch(url, {
    next: { revalidate: DEFAULT_CACHE_TIME_FOR_ORDERS_IN_SECONDS,  },
  });
  const json: OrderbookPaginatedFetchResult = await res.json()
  return json
};

class ZeroExV4OrderbookRepository implements IOrderbookRepository {
  private _cache: LRUCache<string, string>;
  private _fetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>;

  constructor() {
    this._cache = new LRUCache({
      maxSize: 2000,
    });
    this._fetch = fetch; // .bind(this) ?
  }

  fetchOrdersFromRemoteOrderbook = async (
    options?: Partial<FetchOrdersFromRemoteOrderbookOptions>
  ) => {
    let autopaginate = options?.paginateAndFetchAllMatching === true;

    const rootUrl = `https://api.0x.org`; //getRootUrlFromChain(options.chainId)

    // First request
    const url = buildOrderbookOrdersGetUrl(rootUrl, options);
    const orders = handleFetchOrdersWithRSCSupport(url, this._fetch)

    return orders;
  };

  fetchOrdersFromRemoteOrderbookAllOrdersShortcut = async (
    options?: Partial<FetchOrdersFromRemoteOrderbookOptions>
  ) => {
    let autopaginate = options?.paginateAndFetchAllMatching === true;

    const rootUrl = `https://api.0x.org`; //getRootUrlFromChain(options.chainId)

    const totalOrders = 5999;
    const totalPerPage = 500;
    const numPagesToFetch = Math.ceil(totalOrders / totalPerPage)
    const pagesToFetch = range(1, numPagesToFetch + 1) // (inclusive, exclusive) 
    const pageFetchPromises = pagesToFetch.map(pageNum => {
      const url = buildOrderbookOrdersGetUrl(rootUrl, {
        page: pageNum.toString(10),
        perPage: totalPerPage.toString(),
      });
      const orders = handleFetchOrdersWithRSCSupport(url, this._fetch)
      return orders;
    })

    const allPages = await Promise.all(pageFetchPromises)
    return allPages;
  };

  async ingestOrders(
    orderRecords: OrderRecord[],
    options: { invalidatePreviousOrdersFromPair: boolean } = {
      invalidatePreviousOrdersFromPair: true,
    }
  ) {
    const invalidatePair = options.invalidatePreviousOrdersFromPair;
  }

  get() {}

  set() {}

  has() {}
}

export { ZeroExV4OrderbookRepository };
