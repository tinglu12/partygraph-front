export function jsonToMarkdown(jsonData: any): string {
  let markdown = "";

  // Handle arrays
  if (Array.isArray(jsonData)) {
    jsonData.forEach((item, index) => {
      markdown += `## Item ${index + 1}\n\n`;
      markdown += jsonToMarkdown(item);
      markdown += "\n\n";
    });
    return markdown;
  }

  // Handle objects
  if (typeof jsonData === "object" && jsonData !== null) {
    for (const [key, value] of Object.entries(jsonData)) {
      if (typeof value === "object" && value !== null) {
        markdown += `### ${key}\n\n`;
        markdown += jsonToMarkdown(value);
      } else {
        markdown += `**${key}**: ${value}\n\n`;
      }
    }
    return markdown;
  }

  // Handle primitive values
  return String(jsonData);
}
