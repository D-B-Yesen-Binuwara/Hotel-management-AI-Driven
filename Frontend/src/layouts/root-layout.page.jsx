import Navigation from "../components/Navigation";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetQuery } from "@/lib/features/searchSlice";

function RootLayout() {
  const dispatch = useDispatch();
  const { query } = useSelector((state) => state.search);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && query) {
        dispatch(resetQuery());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [query, dispatch]);

  return (
    <>
      <Navigation />
      <Outlet />
      <Toaster />
    </>
  );
}

export default RootLayout;
