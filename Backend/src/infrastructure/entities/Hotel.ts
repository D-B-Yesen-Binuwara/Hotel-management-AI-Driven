import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Review",
    default: [],
  },
  embedding: {
    type: [Number],
    default: [],
  },
  stripePriceId: {
    type: String,
  },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
