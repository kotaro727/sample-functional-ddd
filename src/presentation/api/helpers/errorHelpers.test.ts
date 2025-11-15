import { describe, test, expect } from 'bun:test';
import { errorTypeToHttpStatus, parseOrderId } from './errorHelpers';
import { isOk, isErr } from '@shared/functional/result';

describe('errorTypeToHttpStatus', () => {
  test('VALIDATION_ERRORは400を返す', () => {
    expect(errorTypeToHttpStatus('VALIDATION_ERROR')).toBe(400);
  });

  test('PRODUCT_NOT_FOUNDは400を返す', () => {
    expect(errorTypeToHttpStatus('PRODUCT_NOT_FOUND')).toBe(400);
  });

  test('INVALID_PARAMETERは400を返す', () => {
    expect(errorTypeToHttpStatus('INVALID_PARAMETER')).toBe(400);
  });

  test('NOT_FOUNDは404を返す', () => {
    expect(errorTypeToHttpStatus('NOT_FOUND')).toBe(404);
  });

  test('CONFLICTは409を返す', () => {
    expect(errorTypeToHttpStatus('CONFLICT')).toBe(409);
  });

  test('未知のエラータイプは500を返す', () => {
    expect(errorTypeToHttpStatus('UNKNOWN_ERROR_TYPE')).toBe(500);
  });

  test('空文字列は500を返す', () => {
    expect(errorTypeToHttpStatus('')).toBe(500);
  });
});

describe('parseOrderId', () => {
  test('正の整数をパースできる', () => {
    const result = parseOrderId('1');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(1);
    }
  });

  test('大きな正の整数をパースできる', () => {
    const result = parseOrderId('999999');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(999999);
    }
  });

  test('0はエラーを返す', () => {
    const result = parseOrderId('0');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.type).toBe('INVALID_PARAMETER');
      expect(result.error.message).toBe('無効な注文IDです');
    }
  });

  test('負の数はエラーを返す', () => {
    const result = parseOrderId('-1');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.type).toBe('INVALID_PARAMETER');
    }
  });

  test('数値でない文字列はエラーを返す', () => {
    const result = parseOrderId('abc');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.type).toBe('INVALID_PARAMETER');
    }
  });

  test('小数はエラーを返す', () => {
    const result = parseOrderId('1.5');
    expect(isErr(result)).toBe(true);
  });

  test('空文字列はエラーを返す', () => {
    const result = parseOrderId('');
    expect(isErr(result)).toBe(true);
  });
});
