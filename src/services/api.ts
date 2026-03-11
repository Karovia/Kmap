import { chatService } from './chatService';
import { documentsService } from './documentsService';
import { graphService } from './graphService';
import { providersService } from './providersService';

export const api = {
  ...chatService,
  ...providersService,
  ...graphService,
  ...documentsService,
};
