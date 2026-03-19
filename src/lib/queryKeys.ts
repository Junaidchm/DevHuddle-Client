export const queryKeys = {
  // Profile queries
  profiles: {
    all: ["profiles"] as const,
    detail: (username: string) => ["profiles", "detail", username] as const,
  },

  feed: {
    all: ["feed"] as const,
    list: (filters?: any) => ["feed", "list", { filters }] as const,
    user: (userId: string, limit?: number) => ["feed", "user", userId, { limit }] as const,
  },

  // Network queries (followers/following lists)
  network: {
    all: ["network"] as const,
    list: (username: string, type: "followers" | "following") => ["network", "list", username, type] as const,
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
  },

  // Engagement queries
  engagement: {
    // Post likes
    postLikes: {
      count: (postId: string) => ["engagement", "post-likes", "count", postId] as const,
      status: (postId: string, userId: string) => ["engagement", "post-likes", "status", postId, userId] as const,
      list: (postId: string) => ["engagement", "post-likes", "list", postId] as const,
    },

    // Comment likes
    commentLikes: {
      count: (commentId: string) => ["engagement", "comment-likes", "count", commentId] as const,
      status: (commentId: string, userId: string) => ["engagement", "comment-likes", "status", commentId, userId] as const,
    },

    // Comments
    comments: {
      all: (postId: string) => ["engagement", "comments", "all", postId] as const,
      preview: (postId: string) => ["engagement", "comments", "preview", postId] as const,
      list: (postId: string, limit: number, offset: number) => ["engagement", "comments", "list", postId, limit, offset] as const,
      count: (postId: string) => ["engagement", "comments", "count", postId] as const,
      detail: (commentId: string) => ["engagement", "comments", "detail", commentId] as const,
      replies: (commentId: string) => ["engagement", "comments", "replies", commentId] as const,
    },

    // Shares
    shares: {
      count: (postId: string) => ["engagement", "shares", "count", postId] as const,
      status: (postId: string, userId: string) => ["engagement", "shares", "status", postId, userId] as const,
    },

    // Mentions
    mentions: {
      post: (postId: string) => ["engagement", "mentions", "post", postId] as const,
      comment: (commentId: string) => ["engagement", "mentions", "comment", commentId] as const,
    },

    connections: {
      all: (userId?: string) => ["engagement", "connections", ...(userId ? [userId] : [])] as const,
    },
  },

  // Project queries
  projects: {
    all: ["projects"] as const,
    list: (filters?: any) => ["projects", "list", { filters }] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
    trending: (period?: string) => ["projects", "trending", { period }] as const,
    top: (period?: string) => ["projects", "top", { period }] as const,
    search: (query: string, filters?: any) => ["projects", "search", query, { filters }] as const,
    user: (userId: string, limit?: number) => ["projects", "user", userId, { limit }] as const,

    // Project Comments
    comments: {
      all: (projectId: string) => ["projects", "comments", "all", projectId] as const,
      count: (projectId: string) => ["projects", "comments", "count", projectId] as const,
      replies: (commentId: string) => ["projects", "comments", "replies", commentId] as const,
    },

    // Project Likes
    likes: {
      count: (projectId: string) => ["projects", "likes", "count", projectId] as const,
      status: (projectId: string, userId: string) => ["projects", "likes", "status", projectId, userId] as const,
    },
  },

  // User queries
  users: {
    search: (query: string) => ["users", "search", query] as const,
    tagging: (query: string) => ["users", "tagging", query] as const,
    connections: ["users", "connections"] as const,
  },

  // chat queries
  chat: {
    all: ["chat"] as const,
    conversations: {
      all: ["chat", "conversations"] as const,
      list: () => ["chat", "conversations", "list"] as const,
    },
    suggestions: {
      all: ["chat", "suggestions"] as const,
      list: () => ["chat", "suggestions", "list"] as const,
    },
    messages: {
      all: (conversationId: string) => ["chat", "messages", conversationId] as const,
      list: (conversationId: string) => ["chat", "messages", "list", conversationId] as const,
    },

  },
};