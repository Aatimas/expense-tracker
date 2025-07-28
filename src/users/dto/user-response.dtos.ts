// users/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Don't expose password, deleted_at, etc.
}
