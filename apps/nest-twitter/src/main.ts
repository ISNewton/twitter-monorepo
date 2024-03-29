import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, Like } from 'typeorm'
import { User } from './users/entities/user.entity'
import { ValidationError } from 'class-validator'
import { Tweet } from './tweets/entities/tweets.entity'

export const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: '',
  database: 'nest_twitter',
  entities: [ Tweet , Like , User ],
  synchronize: true,
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors:ValidationError[]) => {
      return new BadRequestException(
        errors.map(error => {
          return {
            field: error.property,
            errors: Object.values(error.constraints ?? {}),
          }
        })
      )
    },
  }))
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
  }

  app.enableCors({
    origin:'*' 
  })
  await app.listen(3001)
}
bootstrap()
