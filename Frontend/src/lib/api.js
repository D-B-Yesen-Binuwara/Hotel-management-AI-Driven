import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export { getAllHotels, getAllLocations };

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5080/api/",
    prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
  endpoints: (build) => ({
    getAllHotels: build.query({
      query: () => "hotels",
      providesTags: (result, error, id) => [{ type: "Hotels", id: "LIST" }],
    }),
    getHotelsBySearch: build.query({
      query: (search) => `hotels/search?query=${search}`,
      providesTags: (result, error, id) => [{ type: "Hotels", search }],
    }),
    getHotelById: build.query({
      query: (id) => `hotels/${id}`,
      providesTags: (result, error, id) => [{ type: "Hotels", id }],
    }),
    createHotel: build.mutation({
      query: (hotel) => ({
        url: "hotels",
        method: "POST",
        body: hotel,
      }),
      invalidatesTags: (result, error, id) => [{ type: "Hotels", id: "LIST" }],
    }),
    getAllLocations: build.query({
      query: () => "locations",
      providesTags: (result, error, id) => [{ type: "Locations", id: "LIST" }],
    }),
    addLocation: build.mutation({
      query: (location) => ({
        url: "locations",
        method: "POST",
        body: {
          name: location.name,
        },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Locations", id: "LIST" },
      ],
    }),
    addReview: build.mutation({
      query: (review) => ({
        url: "reviews",
        method: "POST",
        body: review,
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Hotels", id: review.hotelId },
      ],
    }),
    createBooking: build.mutation({
      query: (booking) => ({
        url: "bookings",
        method: "POST",
        body: booking,
      }),
      invalidatesTags: ["Bookings"],
    }),
    getUserBookings: build.query({
      query: () => "bookings/user",
      providesTags: ["Bookings"],
    }),
    createCheckoutSession: build.mutation({
      query: (data) => ({
        url: "payments/create-checkout-session",
        method: "POST",
        body: data,
      }),
    }),
    getCheckoutSessionStatus: build.query({
      query: (sessionId) => `payments/session-status?session_id=${sessionId}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAllHotelsQuery,
  useGetHotelByIdQuery,
  useGetHotelsBySearchQuery,
  useCreateHotelMutation,
  useAddLocationMutation,
  useGetAllLocationsQuery,
  useAddReviewMutation,
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useCreateCheckoutSessionMutation,
  useGetCheckoutSessionStatusQuery,
} = api;
