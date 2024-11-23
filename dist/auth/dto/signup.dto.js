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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SignUpDto {
}
exports.SignUpDto = SignUpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'd@d.com',
        description: 'User email',
    }),
    (0, class_validator_1.IsEmail)({}, { message: '유효한 이메일을 입력해주세요' }),
    __metadata("design:type", String)
], SignUpDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '12341234',
        description: 'User password - minimum 8 characters',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' }),
    __metadata("design:type", String)
], SignUpDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '강건마',
        description: 'User name',
    }),
    (0, class_validator_1.IsString)({ message: '이름을 입력해주세요' }),
    __metadata("design:type", String)
], SignUpDto.prototype, "name", void 0);
//# sourceMappingURL=signup.dto.js.map