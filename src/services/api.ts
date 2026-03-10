import { documentsService } from './documentsService';
import { providersService } from './providersService';

export const api = {
  ...providersService,
  ...documentsService,
};
