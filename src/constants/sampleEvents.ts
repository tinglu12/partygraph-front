import { EventNode } from "@/types/EventGraph";
import { techweekEvents } from "./techweekEvents";
import { pickedEvents } from "./pickedEvents";
// import { sampleDateRangeEvents } from "@/constants/sampleDateRangeEvents";
// import {originalSampleEvents} from '@/constants/sampleEvents';

// export const sampleEvents: EventNode[] = [...pickedEvents, ...techweekEvents];

// Combine existing events with sample date range events for testing
export const sampleEvents: EventNode[] = [
  ...pickedEvents,
  ...techweekEvents,
  // ...sampleDateRangeEvents,
];
