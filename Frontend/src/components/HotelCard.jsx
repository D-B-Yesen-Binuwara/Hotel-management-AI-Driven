import { MapPin, Star, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link } from "react-router";

function HotelCard(props) {
  // let num = 1;
  //   const handleClick = () => {
  //     console.log("I was clicked")
  //     console.log("Inside handleclick", num)
  //     num = num + 1;
  //   }
  //   console.log("Outside handleclick", num)


  return (
    <div className="group relative">
      <Link to={`/hotels/${props.hotel._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <img
            src={props.hotel.image}
            alt={props.hotel.name}
            className="object-cover w-full h-full absolute transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-3 space-y-2">
        <h3 className="font-semibold text-lg">{props.hotel.name}</h3>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{props.hotel.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">
              {props.hotel?.rating ?? "No rating"}
            </span>
            <span className="text-muted-foreground">
              ({props.hotel.reviews?.length ?? "No"} Reviews)
            </span>
          </div>
          <Button asChild size="sm">
            <Link to={`/hotels/${props.hotel._id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">${props.hotel.price}</span>
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
            <Link to={`/hotels/${props.hotel._id}`}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;
