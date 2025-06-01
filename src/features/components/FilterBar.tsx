import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventNode } from "@/lib/sampleData";

interface FilterBarProps {
  events: EventNode[];
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export function FilterBar({ events, onSearch, onCategoryChange }: FilterBarProps) {
  // Get unique categories
  const categories = Array.from(new Set(events.map(event => event.category).filter(Boolean)));

  return (
    <div className="flex gap-4 p-4 border-b">
      <Input
        placeholder="Search events..."
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category!}>
              {category}
            </SelectItem>
          ))} */}
        </SelectContent>
      </Select>
    </div>
  );
} 