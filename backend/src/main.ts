import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

/**
 * Entry point da API.
 *
 * Fluxo de inicializacao:
 * 1) cria instancia Nest;
 * 2) aplica seguranca HTTP, CORS e validacao global;
 * 3) publica Swagger quando habilitado;
 * 4) inicia servidor na porta configurada.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configuracoes base vindas de variaveis de ambiente.
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:4200');

  // Headers de seguranca HTTP.
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );

  // CORS explicito para controlar quais origens podem autenticar via browser.
  app.enableCors({
    origin: corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 3600,
  });

  // Validacao global: remove campos extras e converte tipos simples automaticamente.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // Swagger fica ativo fora de producao, ou quando for explicitamente habilitado.
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', nodeEnv !== 'production');

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('API de Autenticacao')
      .setDescription('Sistema de autenticacao e gerenciamento de usuarios')
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticacao')
      .addTag('users', 'Gerenciamento de usuarios')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Insira o token JWT',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tryItOutEnabled: true,
      },
    });

    logger.log(`Swagger disponivel em: http://localhost:${port}/api/docs`);
  }

  if (nodeEnv === 'production') {
    app.enableShutdownHooks();
    logger.log('Modo de producao ativado');
  } else {
    logger.log('Modo de desenvolvimento ativado');
  }

  await app.listen(port);

  logger.log('='.repeat(50));
  logger.log(`Aplicacao iniciada com sucesso`);
  logger.log(`Servidor: http://localhost:${port}`);
  logger.log(`Ambiente: ${nodeEnv}`);
  logger.log(`CORS: ${corsOrigin}`);
  logger.log('='.repeat(50));
}

// Falhas nao tratadas encerram o processo para evitar estado inconsistente.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
