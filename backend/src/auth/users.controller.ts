import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';

// ✅ Controller dédié aux opérations CRUD utilisateurs pour le frontend admin
@Controller('users')
@UseGuards(JwtAuthGuard, IsAdminGuard)
export class UsersController {
  constructor(private authService: AuthService) {}

  // GET /users?page=1&limit=10&search=...&role=...
  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.authService.getAllUsers({
      page: +page,
      limit: +limit,
      search,
      role,
    });
  }

  // GET /users/:id
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getProfile(id);
  }

  // POST /users — créer un utilisateur (admin)
  @Post()
  async create(@Body() body) {
    return this.authService.signUp(body);
  }

  // PATCH /users/:id — modifier un utilisateur
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body) {
    return this.authService.updateUser(id, body);
  }

  // DELETE /users/:id — supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteUser(id);
  }
}
