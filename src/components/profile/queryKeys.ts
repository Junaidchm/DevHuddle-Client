export const queryKeys = {
  // Profile queries
  profiles: {
    all: ["profiles"] as const,
    detail: (username: string) => ["profiles", "detail", username] as const,
  },

  // Network queries (followers/following lists)
  network: {
    all: ["network"] as const,
    list: (username:string, type: "followers" | "following") => ["network", "list", username, type] as const,
  },

  // Suggestion queries
  suggestions: {
    all: ["suggestions"] as const,
    list: (userId: string) => ["suggestions", "list", userId] as const,
  },

  // Notification queries
  notifications: {
    all: ["notifications"] as const,
    list: (userId: string) => ["notifications", "list", userId] as const,
    count: (userId: string) => ["notifications", "count", userId] as const,
  }
};