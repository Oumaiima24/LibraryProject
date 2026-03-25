import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './generics/role.enum';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtSer: JwtService,
  ) {}

  async signUp(informations) {
    const newUserEntity = this.userRepo.create({
      email: informations.email,
      username: informations.username,
      role: informations.role || Roles.ROLE_USER,
      salt: await bcrypt.genSalt(),
    });

    newUserEntity.password = await bcrypt.hash(
      informations.password,
      newUserEntity.salt,
    );

    try {
      const saved = await this.userRepo.save(newUserEntity);
      // ✅ Ne jamais retourner le mot de passe ou le salt au frontend
      const { password, salt, ...safeUser } = saved;
      return safeUser;
    } catch {
      throw new ConflictException(
        'Email ou nom d\'utilisateur déjà utilisé',
      );
    }
  }

  async signIn(informations) {
    const { identifiant, password } = informations;

    const user = await this.userRepo
      .createQueryBuilder('user')
      .select('user')
      .where('user.username = :ident or user.email = :ident')
      .setParameter('ident', identifiant)
      .getOne();

    if (!user) throw new NotFoundException('Identifiant inexistant');

    const resultMatching = await bcrypt.compare(password, user.password);

    if (!resultMatching)
      throw new UnauthorizedException('Mot de passe erroné');

    const token = this.jwtSer.sign({
      id: user.id,
      userId: user.id,       // ✅ userId utilisé par JwtAuthGuard
      userRole: user.role,   // ✅ userRole utilisé par IsAdminGuard
    });

    // ✅ Réponse propre pour le frontend (sans password/salt)
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        // name construit pour l'affichage dans la sidebar
        name: user.username,
      },
    };
  }

  // ✅ Nouvelle méthode utilisée par GET /auth/me
  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const { password, salt, ...safeUser } = user;
    return {
      ...safeUser,
      name: user.username,
    };
  }

  // ✅ Méthode utilisée par UsersController pour lister les utilisateurs
  async getAllUsers(options: { page: number; limit: number; search?: string; role?: string }) {
    const { page = 1, limit = 10, search, role } = options;
    const skip = (page - 1) * limit;

    const qb = this.userRepo.createQueryBuilder('user');

    if (search) {
      qb.where(
        'user.username ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    const [users, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map(({ password, salt, ...u }) => ({
        ...u,
        name: u.username,
      })),
      total,
      page,
      limit,
    };
  }
  // ✅ Ajoutez ces deux méthodes à la fin de votre AuthService existant
// (dans auth.service.ts, avant la dernière accolade fermante)

  async updateUser(id: number, data: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Mettre à jour les champs autorisés
    if (data.username) user.username = data.username;
    if (data.email)    user.email    = data.email;
    if (data.role)     user.role     = data.role;

    // Si un nouveau mot de passe est fourni, le hacher
    if (data.password) {
      user.salt     = await bcrypt.genSalt();
      user.password = await bcrypt.hash(data.password, user.salt);
    }

    const saved = await this.userRepo.save(user);
    const { password, salt, ...safeUser } = saved;
    return { ...safeUser, name: safeUser.username };
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepo.remove(user);
    return { message: `L'utilisateur "${user.username}" a été supprimé` };
  }
}
