export interface Signature {
    signatureType: number;
    r: string;
    s: string;
    v: number;
}

export interface Order {
    signature: Signature;
    sender: string;
    maker: string;
    taker: string;
    takerTokenFeeAmount: string;
    makerAmount: string;
    takerAmount: string;
    makerToken: string;
    takerToken: string;
    salt: string;
    verifyingContract: string;
    feeRecipient: string;
    expiry: string;
    chainId: number;
    pool: string;
}

export interface OrderExtendedAsNode extends Order {
    amount: number;
    price: number;
}

export interface MetaData {
    orderHash: string;
    remainingFillableTakerAmount: string;
    createdAt: Date;
}

export interface OrderRecord<T = Order> {
    order: T;
    metaData: MetaData;
}

export interface OrderbookPaginatedFetchResult {
    total: number;
    page: number;
    perPage: number;
    records: OrderRecord[];
}

export interface OrderbookPaginatedFetchFilterParams {
    // (Optional, defaults to "1") The page index (1-indexed) requested in the collection.
    page: string;
    perPage: string;
    
    maker: string;
    taker: string;
    makerToken: string;
    takerToken: string;
}
