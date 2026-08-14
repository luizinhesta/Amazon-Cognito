// GET /game/status - Returns game status message

import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaResponse } from '../types';
import { buildResponse } from '../utils/response';

export function handleGameStatus(event: APIGatewayProxyEvent): LambdaResponse {
  const origin = event.headers?.origin || event.headers?.Origin;
  return buildResponse(200, {
    message: 'O jogo será disponibilizado no Projeto 2',
  }, origin);
}
