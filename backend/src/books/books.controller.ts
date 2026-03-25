import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';

@Controller('books')
export class BooksController {
  @Inject(BooksService) bookSer: BooksService;

  // ✅ GET /books  — liste paginée pour le frontend (anciennement /books/all)
  @Get()
  async chercherTousLesLivres(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('available') available?: string,
  ) {
    return this.bookSer.getAllBooks({ page: +page, limit: +limit, search, available });
  }

  // ✅ GET /books/all — conservé pour compatibilité
  @Get('/all')
  async chercherTousLesLivresLegacy() {
    return this.bookSer.getAllBooksLegacy();
  }

  // ✅ GET /books/stats — doit être AVANT /books/:id sinon NestJS le confond
  @Get('stats')
  async nbreLivresParAnnee() {
    return this.bookSer.nbBooksPerYear();
  }

  @Get('stats/v2')
  async nbreLivresParAnneeV2(@Query('year1') year1, @Query('year2') year2) {
    return this.bookSer.nbBooksPerYearV2(year1, year2);
  }

  // ✅ GET /books/:id — récupérer un livre par id (anciennement /books/search/:id)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async chercherBook(@Param('id', ParseIntPipe) id, @Req() request) {
    return this.bookSer.getBookById(id);
  }

  // ✅ POST /books — créer un livre (anciennement /books/new)
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Post()
  async ajouterLivre(@Req() req: Request, @Body() body) {
    return this.bookSer.addBook(body, req['user']['userId']);
  }

  // ✅ PATCH /books/:id — modifier un livre (anciennement PUT /books/edit/:id)
  @Patch(':id')
  async modifierBook(@Body() body, @Param('id', ParseIntPipe) id) {
    return this.bookSer.updateBook(id, body);
  }

  // ✅ DELETE /books/:id — supprimer un livre (anciennement /books/remove/:id)
  @Delete(':id')
  async removeBook(@Param('id', ParseIntPipe) id) {
    return this.bookSer.removeBook(id);
  }

  // --- Routes supplémentaires conservées ---
  @Delete('hard/:id')
  async deleteBook(@Param('id', ParseIntPipe) id) {
    return this.bookSer.deleteBook(id);
  }

  @Delete('soft/:id')
  async softDeleteBook(@Param('id', ParseIntPipe) id) {
    return this.bookSer.softDeleteBook(id);
  }

  @Patch('restore/:id')
  async restoreBook(@Param('id', ParseIntPipe) id) {
    return this.bookSer.restoreBook(id);
  }

  @Patch('recover/:id')
  async recoverBook(@Param('id', ParseIntPipe) id) {
    return this.bookSer.recoverBook(id);
  }
}
