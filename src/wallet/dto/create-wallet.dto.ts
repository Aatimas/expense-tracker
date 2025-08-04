import {
  IsString,
  Length,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEnum(WalletType)
  type: WalletType;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
