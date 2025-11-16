import { describe, test, expect } from 'bun:test';
import { createPersonName, type PersonName } from './PersonName';
import { isOk, isErr } from '@shared/functional/result';

describe('PersonName', () => {
  describe('createPersonName', () => {
    test('有効な名前から PersonName を作成できる', () => {
      const result = createPersonName('山田太郎');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('PersonName');
        expect(result.value.value).toBe('山田太郎');
      }
    });

    test('前後の空白をトリムして PersonName を作成できる', () => {
      const result = createPersonName('  田中花子  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('田中花子');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createPersonName('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_NAME');
        expect(result.error.message).toContain('空');
      }
    });

    test('空白のみの場合はエラーを返す', () => {
      const result = createPersonName('   ');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_NAME');
      }
    });

    test('100文字を超える名前の場合はエラーを返す', () => {
      const longName = 'あ'.repeat(101);
      const result = createPersonName(longName);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NAME_TOO_LONG');
        expect(result.error.message).toContain('100');
      }
    });

    test('ちょうど100文字の名前は作成できる', () => {
      const exactlyHundred = 'あ'.repeat(100);
      const result = createPersonName(exactlyHundred);

      expect(isOk(result)).toBe(true);
    });
  });

  describe('unwrapPersonName', () => {
    test('PersonName から文字列値を取り出せる', () => {
      const result = createPersonName('佐藤一郎');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const name = result.value;
        expect(name.value).toBe('佐藤一郎');
      }
    });
  });

  describe('equalsPersonName', () => {
    test('同じ値を持つ PersonName は等しい', () => {
      const name1Result = createPersonName('鈴木次郎');
      const name2Result = createPersonName('鈴木次郎');

      expect(isOk(name1Result) && isOk(name2Result)).toBe(true);
      if (isOk(name1Result) && isOk(name2Result)) {
        expect(name1Result.value.value).toBe(name2Result.value.value);
      }
    });

    test('異なる値を持つ PersonName は等しくない', () => {
      const name1Result = createPersonName('高橋三郎');
      const name2Result = createPersonName('田中花子');

      expect(isOk(name1Result) && isOk(name2Result)).toBe(true);
      if (isOk(name1Result) && isOk(name2Result)) {
        expect(name1Result.value.value).not.toBe(name2Result.value.value);
      }
    });
  });
});
