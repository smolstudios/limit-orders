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
import mainnetTokenlist from "../../config/tokenlists/1.json";
import { formatUnits } from "viem";
import Decimal from "decimal.js-light";

const getDecimalsForToken = (
  tokenAddress: string,
  chainID: number | string
) => {
  const tokenlist = mainnetTokenlist as Record<string, { decimals: number }>;
  return tokenlist[tokenAddress]?.decimals ?? undefined;
};

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
  private _decimalCache: LRUCache<string, number>;
  private _fetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>;

  constructor() {
    this._cache = new LRUCache({
      maxSize: 2000,
    });
    this._decimalCache = new LRUCache({
      maxSize: 5000,
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
    makerTokenContractAddress: string,
    takerTokenContractAddress: string,
    chainId: string | number
  ) => {
    return `${chainId.toString(
      10
    )}-${makerTokenContractAddress.toLowerCase()}-${takerTokenContractAddress.toLowerCase()}`;
  };

  getDecimalCacheKey = (
    tokenContractAddress: string,
    chainId: string | number
  ) => {
    return `${chainId.toString(10)}-${tokenContractAddress.toLowerCase()}`;
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
    const shouldInvalidatePair = options.invalidatePreviousOrdersFromPair;

    // ETH<>USDC and USDC<>ETH will be two separate groupings here
    const orderGroups = groupBy(
      orderRecords,
      (o) => `${o.order.chainId}-${o.order.makerToken}-${o.order.takerToken}`
    );

    const groups = Object.values(orderGroups);

    // hydrate orders by grouping (easier to munge when we group by pair)
    groups.forEach((ordersForPairDirection) => {
      ordersForPairDirection.forEach((orderData) => {
        const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase();

        let isUSDCWETH = false;
        if (orderData.order.makerToken.toLowerCase() === usdc) {
          if (orderData.order.takerToken.toLowerCase() === weth) {
            isUSDCWETH = true;
          }
        }
        const makerTokenDecimals = getDecimalsForToken(
          orderData.order.makerToken,
          orderData.order.chainId
        );
        const takerTokenDecimals = getDecimalsForToken(
          orderData.order.takerToken,
          orderData.order.chainId
        );

        if (isUSDCWETH) {
          console.log("makerTokenDecimals", makerTokenDecimals);
          console.log("takerTokenDecimals", takerTokenDecimals);
        }

        if (!makerTokenDecimals || !takerTokenDecimals) {
          (orderData as any).skip = true;
          return;
        }

        try {
          const makerAmountDecimals = formatUnits(
            BigInt(orderData.order.makerAmount),
            makerTokenDecimals
          );
          const takerAmountDecimals = formatUnits(
            BigInt(orderData.order.takerAmount),
            takerTokenDecimals
          );

          const makerAmountDecimalsBN = new Decimal(makerAmountDecimals);
          const takerAmountDecimalsBN = new Decimal(takerAmountDecimals);

          const price = makerAmountDecimalsBN
            .div(takerAmountDecimalsBN)
            .toNumber();
          const amount = makerAmountDecimalsBN.toNumber();

          (orderData as OrderRecord<OrderExtendedAsNode>).order.price = price;
          (orderData as OrderRecord<OrderExtendedAsNode>).order.amount = amount;
          if (isUSDCWETH) {
            console.log("price", price.toString());
            console.log("amount", amount.toString());
            console.log("orderData", orderData);
          }
        } catch (e) {
          console.log(
            e,
            "orderDAta",
            orderData,
            makerTokenDecimals,
            takerTokenDecimals
          );
          throw e;
        }

        // TODO
      });
      const ordersForPairDirectionHydrated = ordersForPairDirection as Array<
        OrderRecord<OrderExtendedAsNode>
      >;
      // now use them hydrated..
    });

    // console.log('groups', groups)

    groups.forEach((ordersForPairDirection) => {
      const ordersForPairDirectionTyped = ordersForPairDirection as Array<
        OrderRecord<OrderExtendedAsNode>
      >;
      const orderTree = new OrderTree(ordersForPairDirectionTyped);
      const sample = first(ordersForPairDirection);
      const cacheKey = this.getOrderCacheKey(
        sample!.order.makerToken,
        sample!.order.takerToken,
        sample!.order.chainId.toString(10)
      );
      this._cache.set(cacheKey, orderTree);
    });
  }

  getOrdersFromCacheKey = (cacheKey: string) => {
    return this._cache.get(cacheKey);
  };

  get() {}

  set() {}

  has() {}
}

export { ZeroExV4OrderbookRepository };
