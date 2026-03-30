export interface MessageRepository {
  isDuplicate(message: string, currentTime: number, cooldownMs: number): boolean;
  saveMessage(message: string, timestamp: number): void;
}

export class InMemoryMessageRepository implements MessageRepository {
  private lastMessage: { message: string; timestamp: number } | null = null;

  isDuplicate(message: string, currentTime: number, cooldownMs: number): boolean {
    if (this.lastMessage === null) {
      return false;
    }

    if (this.lastMessage.message !== message) {
      return false;
    }

    const elapsed = currentTime - this.lastMessage.timestamp;
    return elapsed < cooldownMs;
  }

  saveMessage(message: string, timestamp: number): void {
    this.lastMessage = { message, timestamp };
  }
}
