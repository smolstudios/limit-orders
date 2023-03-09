"use client";
import { monkeyPatchNativeTokenWithWrappedTokenIfNativeToken } from "@/config/constants";
import { ZeroExV4OrderbookRepository } from "@/utils/orderbook/repository";
import { useQuery } from "@tanstack/react-query";
import { first } from "lodash";
import { useEffect, useMemo } from "react";
import { mainnet } from "wagmi";

const OrderbookPageClient = () => {
  const chain = mainnet;

  const outputTokenAddress = "0x";
  const outputTokenPriceLookupQueryKey = useMemo(
    () => ({
      address: monkeyPatchNativeTokenWithWrappedTokenIfNativeToken(
        outputTokenAddress,
        chain?.id
      )!,
      networkId: chain?.id!,
    }),
    [chain?.id, outputTokenAddress]
  );
  //   const outputTokenUsdPriceQuery = useQuery({
  //     queryKey: [
  //       "token-usd-price",
  //       { address: outputToken?.address, chainId: chain?.id },
  //     ],
  //     queryFn: () => fetchUsdPrices([outputTokenPriceLookupQueryKey]),
  //     enabled: !!outputToken && !!chain,
  //   });

  //   const inputTokenUsdPrice = first(
  //     inputTokenUsdPriceQuery.data?.getTokenPrices
  //   )?.priceUsd;
  //   const outputTokenUsdPrice = first(
  //     outputTokenUsdPriceQuery.data?.getTokenPrices
  //   )?.priceUsd;

  const limitOrdersQuery = useQuery({
    queryKey: [],
    queryHash: "orders-all",
    queryFn: async () => {
      const ordersRepository = new ZeroExV4OrderbookRepository();

      const orders =
        await ordersRepository.fetchOrdersFromRemoteOrderbookAllOrdersShortcut(
          {}
        );

      const firstbatch = first(orders);

      if (firstbatch) {
        ordersRepository.ingestOrders(firstbatch.records, {
          invalidatePreviousOrdersFromPair: true,
        });
      }

      console.log("orders", orders[0].total);
      console.log("orders.length", orders.length);

      console.log("ordersRepo", ordersRepository);

      const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase()
      const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()

      const cacheKeyUsdcWeth = ordersRepository.getOrderCacheKey(usdc, weth, 1)
            const cacheKeyWethUsdc = ordersRepository.getOrderCacheKey(weth, usdc, 1)

      console.log('cacheKey', cacheKeyUsdcWeth)
    //   Only one way, need to do the opposite 
      const orderTreeUsdcWeth = ordersRepository.getOrdersFromCacheKey(cacheKeyUsdcWeth)
      const orderTreeWethUsdc = ordersRepository.getOrdersFromCacheKey(cacheKeyWethUsdc)

      console.log('orderTreeUsdcWeth', orderTreeUsdcWeth)
            console.log('orderTreeWethUsdc', orderTreeWethUsdc)

      return orders;
    },
  });

  return <></>;
};

export { OrderbookPageClient };
