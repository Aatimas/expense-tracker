import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, IsBoolean } from "class-validator";
import { WalletType } from "../entities/wallet.entity";

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WalletType)
  @IsOptional()
  type?: WalletType = WalletType.WALLET;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  balance?: number = 0;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean = false;
}
