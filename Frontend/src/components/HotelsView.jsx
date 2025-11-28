import { useSelector } from "react-redux";
import HotelSearchResults from "./HotelSearchResults";
import HotelListings from "./HotelListings";

export default function HotelsView() {
  const query = useSelector((state) => state.search.query);

  if (query !== "") {
    return <HotelSearchResults />;
  } else {
    return <HotelListings />;
  }
}
