import { empty, set, get } from "@collectable/red-black-tree";
import { groupBy } from "lodash";
import { Order } from "./orderbook.types";
import { fromPairs } from "@collectable/red-black-tree";

const doThing = (orders: Array<Order>) => {
  // ETH<>USDC and USDC<>ETH will be two separate groupings here
  const orderGroups = groupBy(orders, (o) => `${o.makerToken}-${o.takerToken}`);
  const groups = Object.values(orderGroups);

  groups.map((ordersForPairDirection) => {
    ordersForPairDirection.forEach((order) => {
      // TODO
      order.price = 10000;
      order.amount = 12000000;
    });
    const treeOfSortedBids = fromPairs<string, Order>((a, b) => {
      // TODO
      return 0;
    }, []);
    return treeOfSortedBids;
  });
};
