No overload matches this call.
  Overload 1 of 3, '(body: CompletionCreateParamsNonStreaming, options?: RequestOptions | undefined): APIPromise<CreateChatCompletionResponse>', gave the following error.
    Property 'name' is missing in type '{ schema: { type: string; properties: { people: { type: string; items: { type: string; properties: { nickname: { type: string; description: string; }; quotes: { type: string; description: string; items: { type: string; }; }; }; required: string[]; additionalProperties: boolean; }; }; }; required: string[]; additiona...' but required in type 'JsonSchema'.
  Overload 2 of 3, '(body: CompletionCreateParamsStreaming, options?: RequestOptions | undefined): APIPromise<Stream<CreateChatCompletionResponseStreamChunk>>', gave the following error.
    Property 'name' is missing in type '{ schema: { type: string; properties: { people: { type: string; items: { type: string; properties: { nickname: { type: string; description: string; }; quotes: { type: string; description: string; items: { type: string; }; }; }; required: string[]; additionalProperties: boolean; }; }; }; required: string[]; additiona...' but required in type 'JsonSchema'.
  Overload 3 of 3, '(body: CompletionCreateParamsBase, options?: RequestOptions | undefined): APIPromise<CreateChatCompletionResponse | Stream<...>>', gave the following error.
    Property 'name' is missing in type '{ schema: { type: string; properties: { people: { type: string; items: { type: string; properties: { nickname: { type: string; description: string; }; quotes: { type: string; description: string; items: { type: string; }; }; }; required: string[]; additionalProperties: boolean; }; }; }; required: string[]; additiona...' but required in type 'JsonSchema'.ts(2769)
completions.d.mts(103, 13): 'name' is declared here.
completions.d.mts(103, 13): 'name' is declared here.
completions.d.mts(103, 13): 'name' is declared here.
make this a valid json schema

