import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-orange-500 to-yellow-500">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
              Tired of Juggling Spreadsheets and Lost Leads?
            </h2>
            <p className="max-w-[900px] mx-auto text-white/90 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              There's a better way. Our intuitive Solar CRM centralizes your
              operations, from initial contact to final installation, giving you
              back time to focus on growth.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 bg-white border-white"
              />
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Start Free Trial
              </Button>
            </form>
            <p className="text-xs text-white/80">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
