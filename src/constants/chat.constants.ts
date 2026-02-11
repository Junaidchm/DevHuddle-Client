export const CHAT_CONFIG = {
  // Voice Recording
  VOICE: {
    MIME_TYPE: 'audio/webm;codecs=opus',
    CHUNK_INTERVAL_MS: 100,
    FFT_SIZE: 256,
    SMOOTHING_TIME_CONSTANT: 0.8,
    VISUALIZER_BAR_COUNT: 50,
  },
  
  // Media Uploads
  MEDIA: {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    ACCEPTED_FILE_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
    ],
  },

  // WebSocket / Chat Logic
  OPTIMISTIC_ID_PREFIX: 'temp-',
  TYPING_TIMEOUT_MS: 3000,
};

export const WS_EVENTS = {
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
} as const;
