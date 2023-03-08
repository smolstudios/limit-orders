import { DEFAULT_CACHE_TIME_FOR_ORDERS_IN_SECONDS } from "@/config/constants";
import { first, groupBy, range } from "lodash";
import { LRUCache } from "typescript-lru-cache";
import { buildOrderbookOrdersGetUrl } from "./api";
import { OrderTree } from "./order-tree";
import type {
  Order,
  OrderbookPaginatedFetchResult,
  OrderExtendedAsNode,
  OrderRecord,
} from "./types";

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
    next: { revalidate: DEFAULT_CACHE_TIME_FOR_ORDERS_IN_SECONDS },
  });
  const json: OrderbookPaginatedFetchResult = await res.json();
  return json;
};

const hashOrder = async (order: Order) => {
  return `${order.chainId}-${order.makerToken}-${order.takerToken}`;
};

class ZeroExV4OrderbookRepository implements IOrderbookRepository {
  private _cache: LRUCache<string, OrderTree>;
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
    const orders = handleFetchOrdersWithRSCSupport(url, this._fetch);

    return orders;
  };

  fetchOrdersFromRemoteOrderbookAllOrdersShortcut = async (
    options?: Partial<FetchOrdersFromRemoteOrderbookOptions>
  ) => {
    let autopaginate = options?.paginateAndFetchAllMatching === true;

    const rootUrl = `https://api.0x.org`; //getRootUrlFromChain(options.chainId)

    const totalOrders = 5999;
    const totalPerPage = 1000;
    const numPagesToFetch = Math.ceil(totalOrders / totalPerPage);
    const pagesToFetch = range(1, numPagesToFetch + 1); // (inclusive, exclusive)
    const pageFetchPromises = pagesToFetch.map((pageNum) => {
      const url = buildOrderbookOrdersGetUrl(rootUrl, {
        page: pageNum.toString(10),
        perPage: totalPerPage.toString(),
      });
      const orders = handleFetchOrdersWithRSCSupport(url, this._fetch);
      return orders;
    });

    const allPages = await Promise.all(pageFetchPromises);
    return allPages;
  };

  getOrderCacheKey = (
    makerToken: string,
    takerToken: string,
    chainId: string
  ) => {
    return `${chainId}-${makerToken}-${takerToken}`;
  };

  // getRBTreeForPairDirection = (makerToken: string, takerToken: string, chainId: string) => {
  //   const hash = this.getOrderCacheKey(makerToken, takerToken, chainId)
  //   const maybeRBTree = this._cache.get(hash)
  //   return maybeRBTree;
  // }

  async ingestOrders(
    orderRecords: OrderRecord[],
    options: { invalidatePreviousOrdersFromPair: boolean } = {
      invalidatePreviousOrdersFromPair: true,
    }
  ) {
    const invalidatePair = options.invalidatePreviousOrdersFromPair;

    // ETH<>USDC and USDC<>ETH will be two separate groupings here
    const orderGroups = groupBy(
      orderRecords,
      (o) => `${o.order.chainId}-${o.order.makerToken}-${o.order.takerToken}`
    );

    const groups = Object.values(orderGroups);

    // hydrate orders by grouping (easier to munge when we group by pair)
    groups.forEach((ordersForPairDirection) => {
      ordersForPairDirection.forEach((order) => {
        // TODO
        (order as any).price = 10000;
        (order as any).amount = 12000000;
      });
      const ordersForPairDirectionHydrated = ordersForPairDirection as Array<
        OrderRecord<OrderExtendedAsNode>
      >;
      // now use them hydrated..
    });

    groups.forEach((ordersForPairDirection) => {
      const orders = ordersForPairDirection as Array<
        OrderRecord<OrderExtendedAsNode>
      >;
      const orderTree = new OrderTree(orders);
      const sample = first(ordersForPairDirection);
      const cacheKey = this.getOrderCacheKey(
        sample!.order.makerToken,
        sample!.order.takerToken,
        sample!.order.chainId.toString(10)
      );
      this._cache.set(cacheKey, orderTree);
    });
  }

  get() {}

  set() {}

  has() {}
}

export { ZeroExV4OrderbookRepository };
