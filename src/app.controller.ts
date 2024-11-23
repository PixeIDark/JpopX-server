import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { message: 'Minchelin API Server is running!' };
  }
}
