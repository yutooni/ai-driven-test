import { EchoMessage } from '../domain/EchoMessage.js';
import { MessageRepository } from '../domain/MessageRepository.js';

export type EchoMessageResult =
  | { success: true; message: string }
  | { success: false; error: 'empty' | 'duplicate' };

export class EchoMessageUseCase {
  constructor(private readonly repository: MessageRepository) {}

  execute(message: string): EchoMessageResult {
    const echoMessage = EchoMessage.create(message);
    if (echoMessage === null) {
      return { success: false, error: 'empty' };
    }

    const lastMessage = this.repository.getLastMessage();
    if (lastMessage === message) {
      return { success: false, error: 'duplicate' };
    }

    this.repository.saveMessage(message);
    return { success: true, message: echoMessage.getValue() };
  }
}
