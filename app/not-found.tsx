import type { Metadata } from "next";
import NotFoundContent from "./components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found - Code Guardian Enterprise",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return <NotFoundContent />;
}
