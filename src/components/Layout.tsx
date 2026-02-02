import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BottomNavbar from "./BottomNavbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Layout;
