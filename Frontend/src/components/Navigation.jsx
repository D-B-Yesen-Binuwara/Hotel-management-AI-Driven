import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Globe, Menu, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router";
import { resetQuery } from "@/lib/features/searchSlice";
import ThemeToggle from "./ThemeToggle";

function Navigation() {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { query, isAiSearch } = useSelector((state) => state.search);
  
  const handleClearSearch = () => {
    dispatch(resetQuery());
  };
  //   const menuRef = useRef(null);
    // const buttonRef = useRef(null);

  // Close menu when clicking outside
  //   useEffect(() => {
  //     function handleClickOutside(event) {
  //       if (
  //         isMenuOpen &&
  //         menuRef.current &&
  //         !menuRef.current.contains(event.target) &&
  //         buttonRef.current &&
  //         !buttonRef.current.contains(event.target)
  //       ) {
  //         setIsMenuOpen(false);
  //       }
  //     }

  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, [isMenuOpen]);

  // Close menu when pressing escape key
  //   useEffect(() => {
  //     function handleEscKey(event) {
  //       if (isMenuOpen && event.key === "Escape") {
  //         setIsMenuOpen(false);
  //       }
  //     }

  //     document.addEventListener("keydown", handleEscKey);
  //     return () => {
  //       document.removeEventListener("keydown", handleEscKey);
  //     };
  //   }, [isMenuOpen]);

  // const count = useSelector((state) => state.counter);

  return (
    <nav className="z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700/20 flex items-center justify-between px-6 sm:px-8 text-neutral-800 dark:text-gray-200 py-4 rounded-2xl mx-4 my-4 relative transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 transition-all duration-300">
          PRIME-HAVENS
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link 
            to={`/`} 
            className={`transition-colors text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 ${
              location.pathname === '/' 
                ? 'text-blue-600 after:w-full' 
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 after:w-0 hover:after:w-full'
            }`}
            onClick={query ? handleClearSearch : undefined}
          >
            Home
          </Link>
          <Link 
            to={`/hotels-listing`} 
            className={`transition-colors text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 ${
              location.pathname === '/hotels-listing' 
                ? 'text-blue-600 after:w-full' 
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 after:w-0 hover:after:w-full'
            }`}
          >
            Hotels
          </Link>
          {query && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="flex items-center gap-2 text-xs border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Search
            </Button>
          )}
          {/* <p>{count}</p> */}

          {/* {user?.publicMetadata?.role === "admin" && (
            <a href={`/hotels/create`} className="transition-colors text-sm">
              Create Hotel
            </a>
          )} */}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="flex items-center gap-2 text-xs md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        )}
        <ThemeToggle />
        <Button variant="ghost" size="sm" className="text-xs hidden md:flex text-gray-700 dark:text-gray-300 hover:text-blue-600">
          <Globe className="h-4 w-4 mr-2" />
          EN
        </Button>
        <SignedOut>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs hidden md:flex text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            <Link to="/sign-in">Log In</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-white text-black hover:bg-gray-200 text-xs hidden md:flex"
          >
            <Link to="/sign-up">Sign Up</Link>
          </Button>
        </SignedOut>
        {/* <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs hidden md:flex"
        >
          <Link to="/sign-in">Log In</Link>
        </Button>
        <Button
          size="sm"
          asChild
          className="bg-white text-black hover:bg-gray-200 text-xs hidden md:flex"
        >
          <Link to="/sign-up">Sign Up</Link>
        </Button> */}
        <SignedIn>
          <UserButton />
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-xs hidden md:flex shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Link to="/my-account">My Account</Link>
          </Button>
        </SignedIn>

        {/* Mobile Menu Button */}
        <div className="relative md:hidden">
          <Button
            // ref={buttonRef}
            variant="ghost"
            size="icon"
            className="relative z-20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
          </Button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg py-2 px-3 animate-in fade-in slide-in-from-top-5 duration-200 z-50"
              style={{ top: "calc(100% + 8px)" }}
            >
              <div className="flex flex-col space-y-3 py-2">
                <a
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                {user?.publicMetadata?.role === "admin" && (
                  <a
                    href="/hotels/create"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Hotel
                  </a>
                )}
                <div className="h-px bg-gray-200 my-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start h-8 px-2 text-gray-700"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  EN
                </Button>
                {/* <SignedOut>
                  <a
                    href="/sign-in"
                    className="text-sm font-medium hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </a>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 w-full mt-2"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/sign-up">Sign Up</Link>
                  </Button>
                </SignedOut> */}
                <a
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </a>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full mt-2"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
                {/* <SignedIn>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 w-full mt-2"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/account">My Account</Link>
                  </Button>
                </SignedIn> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
