import Hero from "../components/Hero";
import HotelsView from "../components/HotelsView";

function HomePage() {
  return (
    <main>
      <div className="relative">
        <Hero />
      </div>

      <HotelsView />
    </main>
  );
}

export default HomePage;
