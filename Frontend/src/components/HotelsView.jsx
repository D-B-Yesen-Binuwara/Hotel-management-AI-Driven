import { useSelector } from "react-redux";
import HotelSearchResults from "./HotelSearchResults";
import AISearchResults from "./AISearchResults";
import HotelListings from "./HotelListings";

export default function HotelsView() {
  const { query, isAiSearch } = useSelector((state) => state.search);

  if (query !== "") {
    if (isAiSearch) {
      return <AISearchResults />;
    } else {
      return <HotelSearchResults />;
    }
  } else {
    return <HotelListings />;
  }
}
