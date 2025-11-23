export default {
    providers: [
      {
        domain: process.env.CLERK_ISSUER_URL || "https://capital-glider-83.clerk.accounts.dev", 
        applicationID: "convex",
      },
    ],
  };