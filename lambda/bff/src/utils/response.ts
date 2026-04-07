// utils/response.ts
export const unauthorized = () => ({
  statusCode: 401,
  body: JSON.stringify({ message: "Unauthorized" }),
});

export const badRequest = (error: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message: error }),
});

export const internalServerError = () => ({
  statusCode: 500,
  body: JSON.stringify({ message: "Internal Server Error" }),
});