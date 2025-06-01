import { EventPerson } from "./EventPerson";

export type EventType = {
  title: string;
  id?: string;
  description?: string;
  category?: string;

  date?: string;
  time?: string;
  location?: string;
  neighborhood?: string;
  price?: string;
  accessibility?: string;
  link?: string;
  tags?: string[];
  keywords?: string[];
  people?: EventPerson[];
};
