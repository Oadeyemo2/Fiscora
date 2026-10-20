import arcjet, { tokenBucket } from "@arcjet/next";

// Rate limiting with Arcjet. If ARCJET_KEY is not set (for example a local
// or demo deployment), fall back to a stub that allows every request so the
// rest of the app keeps working.
const noLimit = {
  protect: async () => ({ isDenied: () => false }),
};

const aj = process.env.ARCJET_KEY
  ? arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: ["userId"], // Track based on Clerk userId
      rules: [
        // Limit transaction creation
        tokenBucket({
          mode: "LIVE",
          refillRate: 10, // 10 transactions
          interval: 3600, // per hour
          capacity: 10, // maximum burst capacity
        }),
      ],
    })
  : noLimit;

export default aj;
