import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResponse {
  results: {
    address_components: GeocodeAddressComponent[];
  }[];
}

export const geocodeApi = createApi({
  reducerPath: "geocodeApi",

  baseQuery: fetchBaseQuery({ baseUrl: "/api", validateStatus: () => true }),
  endpoints: (builder) => ({
    reverseGeocode: builder.query<
      GeocodeResponse,
      { lat: number; lng: number }
    >({
      query: ({ lat, lng }) => `/geocode?lat=${lat}&lng=${lng}`,
    }),
  }),
});

export const { useLazyReverseGeocodeQuery } = geocodeApi;
