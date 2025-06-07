import { Button } from "@/components/ui/button";
import { ArrowRight, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
            <Network className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Discover Events Through
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
            Connected Networks
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          EventGraph revolutionizes event discovery by visualizing connections
          between events, venues, artists, and communities in an interactive
          node network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => router.push("/vibe")}
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          Trusted by 50,000+ event enthusiasts worldwide
        </div>

        {/* Meta Llama API Branding - More Prominent */}
        <div className="mt-20 flex flex-col items-center space-y-6">
          <p className="text-base text-gray-300 font-medium">Powered by Meta Llama API</p>
          <Link 
            href="https://www.llama.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex justify-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <Image
              src="/Meta_Company Lockup/1 Positive Primary/RGB/Meta_lockup_positive primary_RGB.svg"
              alt="Meta Logo"
              width={200}
              height={60}
              className="opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
