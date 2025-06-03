// basics for json-schema

export type BaseSchema = {
  name: string;
  schema: {
    type: "object";
    properties: any;
    required: string[];
    additionalProperties: boolean;
  };
};
