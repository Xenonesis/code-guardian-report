import HomePageWrapper from "./HomePageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomePageWrapper />;
}
