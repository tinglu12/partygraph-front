import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// lower case and dedupe
export function cleanTags(arr: string[], tag: string) {
  let items = [tag, ...arr];
  items = items.map((elem) => elem.toLowerCase());
  // dedupe
  items = items.filter((item, index, self) => self.indexOf(item) === index);
  // TODO avoid duplicate with the first element eg 'hiphop' and 'hiphop concert'
  return items;
}
