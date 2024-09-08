export const requestMatcherSchema = {
  type: 'object',
  properties: {
    body: {
      description: 'Body content for matching',
      type: 'object',
      optional: true,
    },
    params: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      description: 'URL parameters for matching',
      optional: true,
    },
    headers: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      description: 'HTTP headers for matching',
      optional: true,
    },
    query: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      description: 'Query parameters for matching',
      optional: true,
    },
  },
};
