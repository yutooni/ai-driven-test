import { Request, Response } from 'express';
import { EchoMessageUseCase } from '../usecase/EchoMessageUseCase.js';

export const messagesHandler = (req: Request, res: Response): void => {
  const { message } = req.body;

  if (typeof message !== 'string') {
    res.status(400).json({ error: 'message must be a string' });
    return;
  }

  const usecase = new EchoMessageUseCase();
  const result = usecase.execute(message);

  if (result === null) {
    res.status(400).json({ error: 'message must not be empty' });
    return;
  }

  res.status(200).json({ message: result });
};
