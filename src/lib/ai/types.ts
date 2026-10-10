/** Per-message metadata sent to the client; only filled when AI_ASSISTANT_DEBUG is on. */
export type AssistantMetadata = {
  startedAt?: number
  finishedAt?: number
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}
