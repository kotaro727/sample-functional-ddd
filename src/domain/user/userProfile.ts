import { Result, ok, isErr } from '@shared/functional/result';
import { createPersonName, type PersonName, type PersonNameValidationError } from '@domain/shared/valueObjects/PersonName';
import { createAddress, type Address, type AddressValidationError } from '@domain/shared/valueObjects/Address';
import { createPhoneNumber, type PhoneNumber, type PhoneNumberValidationError } from '@domain/shared/valueObjects/PhoneNumber';

/**
 * UnvalidatedUserProfile - 未検証のユーザープロフィール
 */
export type UnvalidatedUserProfile = {
  name: string;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
  };
  phone: string;
};

/**
 * ValidatedUserProfile - 検証済みのユーザープロフィール
 * _tagフィールドでUnvalidatedと型レベルで区別
 */
export type ValidatedUserProfile = {
  readonly _tag: 'ValidatedUserProfile';
  readonly name: PersonName;
  readonly address: Address;
  readonly phone: PhoneNumber;
};

/**
 * UserProfile バリデーションエラー
 */
export type UserProfileValidationError =
  | PersonNameValidationError
  | AddressValidationError
  | PhoneNumberValidationError;

/**
 * 未検証のユーザープロフィールを検証
 */
export const validateUserProfile = (
  unvalidated: UnvalidatedUserProfile
): Result<ValidatedUserProfile, UserProfileValidationError> => {
  // 名前の検証
  const nameResult = createPersonName(unvalidated.name);
  if (isErr(nameResult)) {
    return nameResult;
  }

  // 住所の検証
  const addressResult = createAddress({
    postalCode: unvalidated.address.postalCode,
    prefecture: unvalidated.address.prefecture,
    city: unvalidated.address.city,
    addressLine: unvalidated.address.addressLine,
  });
  if (isErr(addressResult)) {
    return addressResult;
  }

  // 電話番号の検証
  const phoneResult = createPhoneNumber(unvalidated.phone);
  if (isErr(phoneResult)) {
    return phoneResult;
  }

  // 全てのバリデーションが成功した場合、ValidatedUserProfileを構築
  return ok({
    _tag: 'ValidatedUserProfile',
    name: nameResult.value,
    address: addressResult.value,
    phone: phoneResult.value,
  });
};
