import Navigation from "../components/Navigation";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function RootLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
      <Toaster />
    </>
  );
}

export default RootLayout;
