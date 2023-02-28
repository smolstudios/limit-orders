// import { get, has, fromPairs, RedBlackTree } from "@collectable/red-black-tree";
import {
  empty,
  fromPairs,
  fromPairsWithNumericKeys,
  RedBlackTreeStructure,
} from "@collectable/red-black-tree";
import groupBy from "lodash/groupBy";
import { Order, OrderExtendedAsNode, OrderRecord } from "./types";

class OrderTree {
  priceTree: RedBlackTreeStructure<bigint, Order>;
  priceMap: Map<bigint, Order[]>;
  orderMap: Map<string, Order>;
  depth0: bigint;
  depth1: bigint;
  volume: bigint;
  nOrders: number;

  constructor(initialOrders?: OrderRecord<OrderExtendedAsNode>[]) {
    this.priceTree = empty((a, b) => {
      return Number(a - b);
    });
    this.priceMap = new Map();
    this.orderMap = new Map();
    this.depth0 = 0n;
    this.depth1 = 0n;
    this.volume = 0n;
    this.nOrders = 0;

    if (initialOrders) {
      this.loadOrders(initialOrders);
    }
  }

  loadOrders = (initialOrders: OrderRecord<OrderExtendedAsNode>[]) => {
    // Create pricee tree
    const tuples = initialOrders.map((o) => {
      return [o.order.price, o.order] as [bigint, Order];
    });
    this.priceTree = fromPairs((a, b) => {
      return Number(a - b);
    }, tuples);

    // Create price map
    this.priceMap = new Map();
    initialOrders.forEach((o) => {
      const price = o.order.price;
      //   If a price level exists already (e.g. an order at the same price as the current order), add on current order
      if (this.priceMap.has(price)) {
        const priceList = this.priceMap.get(price);
        // Is this ok? (or does it need to be updatedPriceList = [...priceList, o.order])
        priceList?.push(o.order);
      } else {
        // First time seeing this price level, add order.
        this.priceMap.set(price, [o.order]);
      }
    });

    // Create order map
    this.orderMap = new Map();
    initialOrders.forEach((o) => {
      // Destructive, I think that's fine since these should be 100% unique
      this.orderMap.set(o.metaData.orderHash, o.order);
    });

    // Calculate any aggregate metrics for fast-access
    let depthMaker = 0n;
    let depthTaker = 0n;
    initialOrders.forEach((o) => {
      const makerAmount = BigInt(o.order.makerAmount);
      const takerAmount = BigInt(o.order.takerAmount);
      depthMaker += makerAmount;
      depthTaker += takerAmount;
    });
    this.depth0 = depthMaker;
    this.depth1 = depthTaker;
  };
}

class OrderBook {
  bids: OrderTree;
  asks: OrderTree;

  /**
   *
   */ 
  constructor(bids: OrderTree, asks: OrderTree) {
    this.bids = new OrderTree();
    this.asks = new OrderTree();
  }

  addOrders = (orders: OrderRecord<OrderExtendedAsNode>[]) => {
    const { ask: maybeAsks, bid: maybeBids } = groupBy(orders, (a) =>
      this.classifyOrder(a.order)
    );

    if (maybeAsks) {
      this.asks = new OrderTree(maybeAsks);
    } else {
      this.asks = new OrderTree([]);
    }

    if (maybeBids) {
      this.bids = new OrderTree(maybeBids);
    } else {
      this.bids = new OrderTree([]);
    }
  };

  classifyOrder = (order: Order): "bid" | "ask" => {
    // Deterministically determine bid or ask from an arbitrary 0x order
    if (order.makerToken > order.takerToken) {
      return "bid";
    } else {
      return "ask";
    }
  };
}

export {
  OrderBook,
  OrderTree,
}