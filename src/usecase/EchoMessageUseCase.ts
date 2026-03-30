import { EchoMessage } from '../domain/EchoMessage.js';

export class EchoMessageUseCase {
  execute(message: string): string | null {
    const echoMessage = EchoMessage.create(message);
    if (echoMessage === null) {
      return null;
    }
    return echoMessage.getValue();
  }
}
