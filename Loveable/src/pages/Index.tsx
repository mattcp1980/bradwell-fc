import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import News from "@/components/sections/News";
import About from "@/components/sections/About";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <News />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
