import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // 👇 mock database
  private users = [
    { id: 1, name: 'Ahmed' },
    { id: 2, name: 'Sara' },
  ];

  // GET /users
  findAll() {
    return this.users;
  }

  // GET /users/:id
  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  // POST /users
  create(data: any) {
    const newUser = {
      id: Date.now(),
      ...data,
    };

    this.users.push(newUser);
    return newUser;
  }

  // PATCH /users/:id
  update(id: number, data: any) {
    const user = this.findOne(id);

    if (!user) return null;

    Object.assign(user, data);
    return user;
  }

  // DELETE /users/:id
  remove(id: number) {
    this.users = this.users.filter((user) => user.id !== id);
    return { deleted: true };
  }
}
