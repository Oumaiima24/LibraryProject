import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authSer: AuthService) {}

  // ✅ POST /auth/signup — inscription
  @Post('signup')
  inscription(@Body() body) {
    return this.authSer.signUp(body);
  }

  // ✅ POST /auth/signin — connexion (retourne { access_token, user })
  @Post('signin')
  seConnecter(@Body() body) {
    return this.authSer.signIn(body);
  }

  // ✅ GET /auth/me — profil utilisateur connecté (utilisé par le frontend)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.authSer.getProfile(req.user.userId);
  }
}
