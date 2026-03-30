export interface MessageRepository {
  getLastMessage(): string | null;
  saveMessage(message: string): void;
}

export class InMemoryMessageRepository implements MessageRepository {
  private lastMessage: string | null = null;

  getLastMessage(): string | null {
    return this.lastMessage;
  }

  saveMessage(message: string): void {
    this.lastMessage = message;
  }
}
