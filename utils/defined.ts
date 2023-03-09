import { GraphQLClient } from 'graphql-request';
import { getUnixTime } from 'date-fns';

export type GetPriceInput = {
  address: string;
  networkId: number;
  timestamp?: number;
};

export type Price = {
  address: string;
  networkId: number;
  priceUsd: number;
  timestamp: number;
};

export type TokenPricesSWRDataType = {
  getTokenPrices: Price[];
};

const DEFINED_API_KEY = 'XPiTXg3rQo2XZSEEALnhNaK23rPmaA7C9oGNL5fX';
const DEFINED_API_ROOT_URI = 'https://api.defined.fi';

export const definedGraphQLClient = new GraphQLClient(DEFINED_API_ROOT_URI, {
  headers: {
    'x-api-key': DEFINED_API_KEY,
  },
});

export type DefinedApiUsdPriceResponse = Price[];

export const definedTokenPricesGql = `
query GetTokenPrices($inputs: [GetPriceInput!]) {
  getTokenPrices(inputs: $inputs) {
    address
    networkId
    priceUsd
    timestamp
  }
}`;

/** useUSDPrices fetcher */
export const fetchUsdPrices = (
  inputs: GetPriceInput[],
): Promise<TokenPricesSWRDataType> => {
  return definedGraphQLClient.request(definedTokenPricesGql, {
    inputs,
  });
};

const definedTimeSeriesGql = `
query GetBars($from: Int!, $resolution: String!, $symbol: String!, $to: Int!, $removeLeadingNullValues: Boolean) {
  getBars(from: $from, resolution: $resolution, symbol: $symbol, to: $to, removeLeadingNullValues: $removeLeadingNullValues) {
    c
    h
    l
    o
    s
    t
    volume
  }
}`;

/**
 * Calculates Start Date
 * TODO - Update function to take in an end date for when graph becomes interactive via drag.
 * @param range Number of Minutes elapsed from Date.now()
 * @returns Date Object
 */
const getStartDate = (range: number): Date => {
  const now = Date.now();
  const MS_PER_MINUTE = 60000;
  const startDate = new Date(now - range * MS_PER_MINUTE);
  return startDate;
};

export const fetchTimeSeries = (
  address: string,
  chainId: string,
  chartRangeInMinutes: number,
  resolution: string,
  currencyCode: string,
  removeLeadingNullValues: boolean,
) => {
  const now = Date.now();
  const startDate = getStartDate(chartRangeInMinutes);
  const to = getUnixTime(now);
  const from = getUnixTime(startDate);
  const symbol = `${address}:${chainId}`;

  return definedGraphQLClient.request(definedTimeSeriesGql, {
    to,
    from,
    symbol,
    resolution,
    currencyCode,
    removeLeadingNullValues,
  });
};
