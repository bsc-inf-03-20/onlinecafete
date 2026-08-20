import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Online Cafeteria API')
    .setDescription(
      'Order food, manage customer profiles, and track cafeteria operations from a single backend. ' +
        'In Swagger, click Authorize and paste the raw JWT token only. Swagger adds the Bearer prefix for you.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Register, sign in, and fetch the current account.')
    .addTag('Users', 'Manage customer profiles and saved addresses.')
    .addTag('Menu', 'Browse menu categories and manage menu items.')
    .addTag('Orders', 'Create and manage cafeteria orders.')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(port);
  // console.log(`App started. Listening on port ${port}`);
}
bootstrap().catch((err) => {
  console.log(`Fatal error during initialization:`, err);
  process.exit(1);
});
