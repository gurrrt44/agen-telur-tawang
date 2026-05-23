"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Pricing } from "@/components/sections/pricing";
import { Catalog } from "@/components/sections/catalog";
import { OrderForm } from "@/components/sections/order-form";
import { Location } from "@/components/sections/location";
import { Footer } from "@/components/sections/footer";

import { FloatingContact } from "@/components/ui/floating-contact";

export default function HomePage() {
  // Shared cart state between Catalog and OrderForm
  const [qty, setQty] = useState<Record<string, number>>({});
  const [livePrice, setLivePrice] = useState<number>(24000);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <Header />
      <Hero />
      <About />
      <Pricing onPriceChange={setLivePrice} />
      <Catalog qty={qty} setQty={setQty} livePrice={livePrice} />
      <OrderForm qty={qty} setQty={setQty} livePrice={livePrice} />
      <Location />
      <Footer />
      <FloatingContact />
    </div>
  );
}
