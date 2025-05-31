
import { Card } from "@/components/ui/card";
import { Network, Search, Users, Calendar, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Visual Network Discovery",
    description: "See how events connect through shared venues, artists, organizers, and communities in an intuitive node graph."
  },
  {
    icon: Search,
    title: "Smart Recommendations",
    description: "Our AI analyzes network patterns to suggest events you'll love based on your interests and connections."
  },
  {
    icon: Users,
    title: "Community Mapping",
    description: "Discover vibrant communities and find events where like-minded people gather."
  },
  {
    icon: Calendar,
    title: "Timeline Visualization",
    description: "See how events cluster in time and space, helping you plan perfect event sequences."
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Watch the network evolve as new events appear and connections form dynamically."
  },
  {
    icon: Globe,
    title: "Global & Local",
    description: "Explore networks from your neighborhood to international scenes, all in one platform."
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powered by Network Intelligence
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            EventGraph uses advanced graph algorithms and visualization to revolutionize 
            how you discover and connect with events.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-white/5 border-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};