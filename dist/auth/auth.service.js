"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(connection, jwtService) {
        this.connection = connection;
        this.jwtService = jwtService;
    }
    async signup(email, password, name) {
        const [existingUsers] = await this.connection.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            throw new common_1.UnauthorizedException('이미 이메일이 존재');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.connection.execute('INSERT INTO users (email, password, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [email, hashedPassword, name]);
        return { message: '회원가입 성공' };
    }
    async login(email, password) {
        const [users] = await this.connection.execute('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
        const user = users[0];
        if (!user) {
            throw new common_1.UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
        }
        const accessToken = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '30m' });
        const refreshToken = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '7d' });
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_CONNECTION')),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map