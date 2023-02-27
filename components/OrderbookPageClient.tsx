"use client";
import { useQuery } from "@tanstack/react-query"

const OrderbookPageClient = () => {
    const limitOrdersQuery = useQuery({
        queryKey: [],
        queryHash: '',
        queryFn: () => {

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