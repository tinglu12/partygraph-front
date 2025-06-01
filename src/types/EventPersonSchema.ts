// export const EventPersonSchema = {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   $id: "EventPersonSchema.json",
//   title: "EventPerson",
//   type: "object",
//   additionalProperties: false,
//   properties: {
//     description: { type: "string" },
//     interests: {
//       type: "array",
//       items: { type: "string" },
//     },
//     name: { type: "string" },
//     stereotype: { type: "string" },
//   },
// };

// export const xEventPersonSchema = {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   $id: "EventPersonSchema.json",
//   title: "EventPerson",

//   schema: {
//     type: "object",
//     properties: {
//       name: { type: "string" },
//       description: { type: "string" },
//       // interests: {
//       //   type: "array",
//       //   items: { type: "string" },
//       // },
//       // name: { type: "string" },
//       // stereotype: { type: "string" },
//     },
//   },
// };

// export const EventPersonSchema = {
//   type: "object",
//   properties: {
//     nickname: {
//       type: "string",
//       description: "a short nickname for this type of person",
//     },
//     stereotype: {
//       type: "string",
//       description:
//         "a stereotype of the person, a typical type of person found in different neighborhoods of New York",
//     },
//     // interests: {
//     //   type: "array",
//     //   items: {
//     //     type: "string",
//     //     description: "a list of interests the person has",
//     //   },
//     // },
//   },
//   required: ["nickname", "stereotype"], // ✅ MUST be at the same level as "properties"
//   additionalProperties: false,
// };

export const EventPeopleSchema = {
  schema: {
    type: "object",
    properties: {
      people: {
        type: "array",
        items: {
          type: "object",
          properties: {
            nickname: {
              type: "string",
              description:
                "a two word short nickname for this type of person. do not use a prefix like 'the' ",
            },
            // stereotype: {
            //   type: "string",
            //   description:
            //     "a five words or less stereotype of the person, a typical type of person found in different neighborhoods of New York",
            // },
            quotes: {
              type: "array",
              description:
                "a list of three short funny or interesting quotes this type of person might say at this type of event, in an 'overheard in New York' style",
              items: { type: "string" },
            },
          },
          required: ["nickname", "quotes"],
          additionalProperties: false,
        },
      },
    },
    required: ["people"], // ✅ add this if people must be present
    additionalProperties: false,
  },
};
