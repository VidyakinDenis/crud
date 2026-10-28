var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
let UserService = class UserService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getUserById(id) {
        return await this.db
            .selectFrom('users')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
    }
    ;
    async getAllUsers(pageSize, page, login) {
        return await this.db.transaction().execute(async (trx) => {
            let usersQuery = trx
                .selectFrom('users')
                .select(['id', 'name', 'email', 'login', 'description', 'age']);
            let countQuery = trx
                .selectFrom('users');
            if (login) {
                usersQuery = usersQuery.where('login', 'ilike', `%${login}%)`);
                countQuery = countQuery.where('login', '=', login);
            }
            const { total } = await countQuery
                .select((eb) => eb.fn.countAll().as('total'))
                .executeTakeFirstOrThrow();
            const users = await usersQuery
                .orderBy('id')
                .limit(pageSize)
                .offset((page - 1) * pageSize)
                .execute();
            return {
                data: users,
                page,
                pageSize,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / pageSize),
            };
        });
    }
    async createUser(dto) {
        return await this.db
            .insertInto('users')
            .values(dto)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async patchUser(dto, id) {
        return await this.db
            .updateTable('users')
            .set(dto)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async deleteUserById(id) {
        return await this.db
            .updateTable('users')
            .set({ 'deleted': true })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async getUsersByLogin(login) {
        return await this.db
            .selectFrom('users')
            .selectAll()
            .where('login', '=', login)
            .executeTakeFirst();
    }
};
UserService = __decorate([
    Injectable(),
    __param(0, InjectKysely()),
    __metadata("design:paramtypes", [Kysely])
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map