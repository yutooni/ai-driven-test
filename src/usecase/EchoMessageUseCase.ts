import { EchoMessage } from '../domain/EchoMessage.js';
import { MessageRepository } from '../domain/MessageRepository.js';
import { TimeProvider } from './TimeProvider.js';

export type EchoMessageResult =
  | { success: true; message: string }
  | { success: false; error: 'empty' | 'duplicate' };

export class EchoMessageUseCase {
  private readonly cooldownMs = 5000; // 5 seconds

  constructor(
    private readonly repository: MessageRepository,
    private readonly timeProvider: TimeProvider
  ) {}

  execute(message: string): EchoMessageResult {
    const echoMessage = EchoMessage.create(message);
    if (echoMessage === null) {
      return { success: false, error: 'empty' };
    }

    const currentTime = this.timeProvider.now();

    if (this.repository.isDuplicate(message, currentTime, this.cooldownMs)) {
      return { success: false, error: 'duplicate' };
    }

    this.repository.saveMessage(message, currentTime);
    return { success: true, message: echoMessage.getValue() };
  }
}
