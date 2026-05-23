import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * SERVICE: AIService
 * Connects to AWS Bedrock to generate professional dish descriptions.
 */
@Injectable()
export class AIService {
  private client: BedrockRuntimeClient;

  constructor(private configService: ConfigService) {
    this.client = new BedrockRuntimeClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  /**
   * Generates a description using AWS Bedrock (e.g., Claude or Llama model).
   */
  async generateDescription(dishName: string): Promise<string> {
    const prompt = `Human: Create a concise, engaging marketing description for a restaurant dish named "${dishName}". 
    The description should be professional and appetizing.
    Assistant:`;

    const input = {
      modelId: 'anthropic.claude-v2', // Or any other model available in your region
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 100,
        temperature: 0.7,
      }),
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      const resBody = JSON.parse(new TextDecoder().decode(response.body));
      return resBody.completion.trim();
    } catch (error) {
      console.error('Error calling AWS Bedrock:', error);
      // Fallback description if AI fails
      return `Delicious ${dishName}, seasoned to perfection and crafted with the finest ingredients.`;
    }
  }
}
