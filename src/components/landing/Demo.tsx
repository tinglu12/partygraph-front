
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

export const Demo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const nodes = [
      { x: 200, y: 150, radius: 25, color: '#3B82F6', label: 'Music Festival', connections: [1, 2, 4] },
      { x: 350, y: 100, radius: 20, color: '#8B5CF6', label: 'Concert', connections: [0, 3] },
      { x: 150, y: 250, radius: 18, color: '#06B6D4', label: 'Art Show', connections: [0, 3, 4] },
      { x: 400, y: 220, radius: 22, color: '#10B981', label: 'Food Fair', connections: [1, 2] },
      { x: 280, y: 300, radius: 15, color: '#F59E0B', label: 'Workshop', connections: [0, 2] }
    ];
    
    let animationFrame: number;
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
      time += 0.02;
      
      // Draw connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      
      nodes.forEach((node, i) => {
        node.connections.forEach(connIndex => {
          if (connIndex > i) { // Avoid drawing duplicate lines
            const connNode = nodes[connIndex];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connNode.x, connNode.y);
            ctx.stroke();
          }
        });
      });
      
      // Draw nodes
      nodes.forEach((node, i) => {
        const pulse = 1 + Math.sin(time + i) * 0.1;
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Draw glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse + 5, 0, 2 * Math.PI);
        ctx.fillStyle = node.color + '40';
        ctx.fill();
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
  
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See Connections in Action
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our node visualization reveals hidden relationships between events, 
            helping you discover experiences you never knew existed.
          </p>
        </div>
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-2xl">
          <div className="relative">
            <canvas 
              ref={canvasRef}
              className="w-full h-96 rounded-lg"
              style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))' }}
            />
            
            {/* Floating labels */}
            <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Music Festival
            </div>
            <div className="absolute top-16 right-8 bg-purple-500/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Concert
            </div>
            <div className="absolute bottom-8 left-8 bg-cyan-500/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Art Show
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Interactive demo - Click and explore connections between related events
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};