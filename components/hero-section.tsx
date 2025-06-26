import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                Close More Solar Deals with Purpose-Built CRM
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Streamline your solar installation business from lead to
                completion. Manage leads, track projects, and grow your revenue
                with affordable software designed for solar professionals.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Try It Today For Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Quick Setup
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/solar.jpg"
              width="1280"
              height="720"
              alt="Solar CRM Dashboard"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
