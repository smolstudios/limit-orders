"use client";
import { ZeroExV4OrderbookRepository } from "@/utils/orderbook/repository";
import { useQuery } from "@tanstack/react-query"
import { first } from "lodash";
import { useEffect } from "react";

const OrderbookPageClient = () => {

    const limitOrdersQuery = useQuery({
        queryKey: [],
        queryHash: 'orders-all',
        queryFn: async () => {
            const ordersRepository = new ZeroExV4OrderbookRepository()

            const orders = await ordersRepository.fetchOrdersFromRemoteOrderbookAllOrdersShortcut({
          
            })
          
            const firstbatch = first(orders)
          
            if (firstbatch) {
              ordersRepository.ingestOrders(firstbatch.records, {
                invalidatePreviousOrdersFromPair: true,
          
              })
            }
          
            console.log('orders', orders[0].total)
            console.log('orders.length', orders.length)

            console.log('ordersRepo', ordersRepository)
            return orders;
        },
    })

    return (
        <>
        </>
    )
}

export {
    OrderbookPageClient,
}