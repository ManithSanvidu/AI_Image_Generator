import { auth } from "@clerk/nextjs/server";
import {HomeHeroSection} from "@/components/HomeHeroSection";
import { GalleryShowcaseSection } from "@/components/GalleryShowcaseSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import Testimonials from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";

export default async function Home() {
  await auth();

  return (
    <main className="min-h-screen bg-background p-3 sm:p-4 lg:p-5">
      <HomeHeroSection/>
      <GalleryShowcaseSection/>
      <HowItWorksSection/>
      <PricingSection/>
      <Testimonials />
      <Footer/>
    </main>
  );
}
