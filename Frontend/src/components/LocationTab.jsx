function LocationTab(props) {
  const handleClick = () => {
    props.onClick(props.location);
  };

  if (props.location._id === props.selectedLocation) {
    return (
      <div
        className="text-base bg-blue-600 text-white border border-blue-600 rounded-full px-2 py-1 cursor-pointer"
        onClick={handleClick}
      >
        {props.location.name}
      </div>
    );
  }

  return (
    <div
      className="text-base text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={handleClick}
    >
      {props.location.name}
    </div>
  );
}

export default LocationTab;
