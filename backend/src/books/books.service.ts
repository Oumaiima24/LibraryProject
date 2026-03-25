import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity) private bookRepo: Repository<BookEntity>,
  ) {}

  // ✅ Nouvelle méthode paginée pour le frontend Vue.js
  async getAllBooks(options: {
    page: number;
    limit: number;
    search?: string;
    available?: string;
  }) {
    const { page = 1, limit = 10, search, available } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtre recherche sur le titre
    if (search) {
      where.title = ILike(`%${search}%`);
    }

    // Filtre disponibilité
    if (available !== undefined && available !== '') {
      where.available = available === 'true';
    }

    const [data, total] = await this.bookRepo.findAndCount({
      where,
      relations: { author: true },
      select: {
        author: {
          // ✅ adapté selon vos champs réels dans author.entity.ts
          // Si votre auteur a nom + prenom :
          id: true,
          nom: true,
          prenom: true,
        },
      },
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    // ✅ Format réponse attendu par le frontend
    return {
      data: data.map((book) => ({
        ...book,
        // Construire un champ "author.name" pour le frontend
        author: book.author
          ? {
              ...book.author,
              name: `${book.author.prenom ?? ''} ${book.author.nom ?? ''}`.trim(),
            }
          : null,
      })),
      total,
      page,
      limit,
    };
  }

  // ✅ Ancienne méthode conservée pour /books/all
  async getAllBooksLegacy() {
    try {
      const tab = await this.bookRepo.find({ loadRelationIds: true });
      return { listeBooks: tab };
    } catch (err) {
      return { message: 'Problème avec TypeOrm' };
    }
  }

  // ✅ Ajouter un livre — retourne directement le livre créé
  async addBook(newBook, idUser) {
    newBook.user = idUser;
    const saved = await this.bookRepo.save(newBook);
    return saved;
  }

  async getBookById(selectedId) {
    try {
      const book = await this.bookRepo.findOne({
        where: { id: selectedId },
        relations: { author: true },
        select: {
          author: { id: true, prenom: true, nom: true },
        },
      });
      if (!book) throw new NotFoundException('Livre introuvable');
      return book;
    } catch (err) {
      return err;
    }
  }

  // ✅ Correction : les paramètres étaient inversés dans l'original
  async updateBook(id: number, uBook) {
    const b = await this.bookRepo.preload({ id, ...uBook });
    if (!b) throw new NotFoundException('Livre introuvable');
    const response = await this.bookRepo.save(b);
    return response;
  }

  async deleteBook(id) {
    return this.bookRepo.delete(id);
  }

  async removeBook(selectedId) {
    const selectedBook = await this.bookRepo.findOneBy({ id: selectedId });
    if (!selectedBook) throw new NotFoundException('Livre introuvable');
    const response = await this.bookRepo.remove(selectedBook);
    return {
      message: `Le livre "${response.title}" a été supprimé avec succès`,
    };
  }

  async softDeleteBook(id) {
    return this.bookRepo.softDelete(id);
  }

  async restoreBook(id) {
    return this.bookRepo.restore(id);
  }

  async recoverBook(selectedId) {
    const selectedBook = await this.bookRepo.findOneBy({ id: selectedId });
    const response = await this.bookRepo.recover(selectedBook);
    return { message: `Le livre "${response.title}" a été restauré` };
  }

  async softRemoveBook(selectedId) {
    const selectedBook = await this.bookRepo.findOneBy({ id: selectedId });
    return this.bookRepo.softRemove(selectedBook);
  }

  async nbBooksPerYear() {
    return this.bookRepo
      .createQueryBuilder('book')
      .select('book.year, count(book.id) as NbBooks')
      .groupBy('book.year')
      .getRawMany();
  }

  async nbBooksPerYearV2(y1, y2) {
    return this.bookRepo
      .createQueryBuilder('book')
      .select('book.year, count(book.id) as NbBooks')
      .where('book.year >= :yearMin and book.year <= :yearMax', {
        yearMin: y1,
        yearMax: y2,
      })
      .groupBy('book.year')
      .getRawMany();
  }
}