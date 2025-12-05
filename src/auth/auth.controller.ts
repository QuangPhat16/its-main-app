import {Controller, Post, Body, Get, Req, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Req() req: any, @Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: any, @Body() dto: LoginDto) {
   return this.authService.login(req.user);
  }

  // Google OAuth
  @Get('google')
  @ApiOperation({ summary: 'Redirect to Google OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirecting to Google...' })
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'User logged in via Google' })
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

}