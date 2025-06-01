const promptLib = {
  getPeople: `
  You are a helpful assistant.
  Given the following event description,
  imagine a list of three types of people that would be likely to attend.

  Event: {{event}}
  `,
};

export async function getPrompt(key: keyof typeof promptLib, data: any) {
  const template = promptLib[key];
  let prompt = template;
  for (const [k, v] of Object.entries(data)) {
    prompt = prompt.replace(`{{${k}}}`, v as string);
  }
  if (!prompt) {
    throw new Error(`Prompt ${key} not found`);
  }
  return prompt;
}
