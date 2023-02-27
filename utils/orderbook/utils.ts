import { fromPairs } from "@collectable/red-black-tree";
import first from "lodash/first";
import groupBy from "lodash/groupBy";
import type { OrderRecord } from "./types";

/**
 * Creates a new sorted red black tree from a list of orders.
 * Assumes orders are the same pair
 * @param orders 0x orders
 */
const ordersListToRedBlackTree = (ordersRecords: OrderRecord[]) => {
  // Guard to ensure that all orders are the same direction and pair
  const sample = first(ordersRecords);
  if (!sample) {
    return undefined;
  }
  if (
    !ordersRecords.every((or) => {
      or.order.makerToken === sample.order.makerToken &&
        or.order.takerToken === sample.order.takerToken;
    })
  ) {
    throw new Error(
      "Every order needs to be the same pair and trade direction"
    );
  }
  const mapped: [string, OrderRecord][] = ordersRecords.map((o) => {
    return [o.metaData.orderHash, o];
  });
  const treeOfSortedBids = fromPairs<string, OrderRecord>((a, b) => {
    // TODO(johnrjj) - Compute 'price' and 'amount' in terms of pair decimals
    return 0;
  }, mapped);
};

// const convertAllOrdersIntoRedBlackTrees = (
//   ordersRecords: Array<OrderRecord>
// ) => {
//   // ETH<>USDC and USDC<>ETH will be two separate groupings here
//   const orderGroups = groupBy(
//     ordersRecords,
//     (o) => `${o.order.chainId}-${o.order.makerToken}-${o.order.takerToken}`
//   );
//   const groups = Object.values(orderGroups);

//   groups.map((ordersForPairDirection) => {
//     ordersForPairDirection.forEach((order) => {
//       // TODO
//       order.price = 10000;
//       order.amount = 12000000;
//     });

//     return ordersListToRedBlackTree(ordersForPairDirection);
//   });
// };

export { ordersListToRedBlackTree };
