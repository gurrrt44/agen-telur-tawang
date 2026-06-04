"use client";

import { useState } from "react";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Pricing } from "@/components/sections/pricing";
import { Catalog } from "@/components/sections/catalog";
import { GalleryMarquee } from "@/components/sections/gallery-marquee";
import { OrderForm } from "@/components/sections/order-form";
import { Location } from "@/components/sections/location";
import { Footer } from "@/components/sections/footer";
import { FloatingContact } from "@/components/ui/floating-contact";

export default function HomePage() {
  const [selectedBundle, setSelectedBundle] = useState("");

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header />
      <Hero />
      <About />
      <Pricing />
      <Catalog onSelectBundle={setSelectedBundle} />
      <GalleryMarquee />
      <OrderForm selectedBundle={selectedBundle} onBundleChange={setSelectedBundle} />
      <Location />
      <Footer />
      <FloatingContact />
    </div>
  );
}
