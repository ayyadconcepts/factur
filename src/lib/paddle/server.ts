import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { PADDLE_CONFIG } from './config';

let paddleInstance: Paddle | null = null;

/**
 * Retourne l'instance serveur Paddle initialisée avec la clé API et l'environnement configurés.
 */
export function getPaddleServer(): Paddle {
  if (!paddleInstance) {
    if (!PADDLE_CONFIG.apiKey) {
      throw new Error('PADDLE_API_KEY is not defined in environment variables');
    }
    paddleInstance = new Paddle(PADDLE_CONFIG.apiKey, {
      environment:
        PADDLE_CONFIG.environment === 'production'
          ? Environment.production
          : Environment.sandbox,
    });
  }
  return paddleInstance;
}
