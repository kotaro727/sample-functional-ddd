import { Result, ok, isErr } from '@shared/functional/result';
import { createPostalCode, type PostalCode, type PostalCodeValidationError } from './PostalCode';
import { createPrefecture, type Prefecture, type PrefectureValidationError } from './Prefecture';
import { createCity, type City, type CityValidationError } from './City';
import { createAddressLine, type AddressLine, type AddressLineValidationError } from './AddressLine';

/**
 * Address - 住所を表す値オブジェクト
 */
export type Address = {
  readonly _tag: 'Address';
  readonly postalCode: PostalCode;
  readonly prefecture: Prefecture;
  readonly city: City;
  readonly addressLine: AddressLine;
};

/**
 * Address バリデーションエラー
 */
export type AddressValidationError =
  | PostalCodeValidationError
  | PrefectureValidationError
  | CityValidationError
  | AddressLineValidationError;

/**
 * 住所の構成要素から Address を作成する
 */
export const createAddress = (input: {
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
}): Result<Address, AddressValidationError> => {
  // 郵便番号の検証と作成
  const postalCodeResult = createPostalCode(input.postalCode);
  if (isErr(postalCodeResult)) {
    return postalCodeResult;
  }

  // 都道府県の検証と作成
  const prefectureResult = createPrefecture(input.prefecture);
  if (isErr(prefectureResult)) {
    return prefectureResult;
  }

  // 市区町村の検証と作成
  const cityResult = createCity(input.city);
  if (isErr(cityResult)) {
    return cityResult;
  }

  // 町名番地の検証と作成
  const addressLineResult = createAddressLine(input.addressLine);
  if (isErr(addressLineResult)) {
    return addressLineResult;
  }

  // 全ての検証が成功した場合、Address を構築
  return ok({
    _tag: 'Address',
    postalCode: postalCodeResult.value,
    prefecture: prefectureResult.value,
    city: cityResult.value,
    addressLine: addressLineResult.value,
  });
};
