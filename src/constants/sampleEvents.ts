import { EventNode } from "@/types/EventGraph";
import { techweekEvents } from "./techweekEvents";
import { pickedEvents } from "./pickedEvents";

export const sampleEvents: EventNode[] = [...pickedEvents, ...techweekEvents];
