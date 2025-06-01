import { EventNode } from "@/lib/sampleData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventDetailsProps {
  event: EventNode | null;
  onClose: () => void;
}

export function EventDetails({ event, onClose }: EventDetailsProps) {
  if (!event) return null;

  return (
    <Card className="w-[350px] h-full ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{event.description}</p>
            </div>
            {event.category && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <Badge variant="secondary">{event.category}</Badge>
              </div>
            )}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 