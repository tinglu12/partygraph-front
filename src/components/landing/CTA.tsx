
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Explore the Network?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event enthusiasts who've discovered amazing experiences 
            through our connected event ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Exploring
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
            >
              <Mail className="mr-2 w-5 h-5" />
              Get Updates
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            Free to join • No spam • Unsubscribe anytime
          </div>
        </div>
      </div>
    </section>
  );
};