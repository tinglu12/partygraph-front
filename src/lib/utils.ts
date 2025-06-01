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
  // TODO avoid duplicate with the first element eg 'hiphop' and 'hiphop concert'
  const items = arr.map((elem) => elem.toLowerCase());
  const finalItems = items.filter(
    (item, index, self) => self.indexOf(item) === index
  );
  return [tag, ...finalItems];
}
