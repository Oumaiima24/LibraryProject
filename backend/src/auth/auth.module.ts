import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller'; 
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),

    // ✅ Ajout du ConfigModule
    ConfigModule,

    // ✅ JWT avec .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: {
          expiresIn: '1w',
        },
      }),
    }),

    // ✅ jwt en minuscule
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],

  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, UsersController],
  exports: [AuthService],
})
export class AuthModule {}