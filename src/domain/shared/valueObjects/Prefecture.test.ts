import { describe, test, expect } from 'bun:test';
import { createPrefecture } from './Prefecture';
import { isOk, isErr } from '@shared/functional/result';

describe('Prefecture', () => {
  describe('createPrefecture', () => {
    test('有効な都道府県名から Prefecture を作成できる', () => {
      const result = createPrefecture('東京都');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('Prefecture');
        expect(result.value.value).toBe('東京都');
      }
    });

    test('前後の空白をトリムして Prefecture を作成できる', () => {
      const result = createPrefecture('  大阪府  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('大阪府');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createPrefecture('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_PREFECTURE');
        expect(result.error.message).toContain('空');
      }
    });

    test('空白のみの場合はエラーを返す', () => {
      const result = createPrefecture('   ');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_PREFECTURE');
      }
    });

    test('10文字を超える場合はエラーを返す', () => {
      const longPrefecture = 'あ'.repeat(11);
      const result = createPrefecture(longPrefecture);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('PREFECTURE_TOO_LONG');
        expect(result.error.message).toContain('10');
      }
    });

    test('全ての都道府県名を作成できる', () => {
      const prefectures = [
        '北海道',
        '青森県',
        '岩手県',
        '宮城県',
        '秋田県',
        '山形県',
        '福島県',
        '茨城県',
        '栃木県',
        '群馬県',
        '埼玉県',
        '千葉県',
        '東京都',
        '神奈川県',
        '新潟県',
        '富山県',
        '石川県',
        '福井県',
        '山梨県',
        '長野県',
        '岐阜県',
        '静岡県',
        '愛知県',
        '三重県',
        '滋賀県',
        '京都府',
        '大阪府',
        '兵庫県',
        '奈良県',
        '和歌山県',
        '鳥取県',
        '島根県',
        '岡山県',
        '広島県',
        '山口県',
        '徳島県',
        '香川県',
        '愛媛県',
        '高知県',
        '福岡県',
        '佐賀県',
        '長崎県',
        '熊本県',
        '大分県',
        '宮崎県',
        '鹿児島県',
        '沖縄県',
      ];

      prefectures.forEach((pref) => {
        const result = createPrefecture(pref);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value.value).toBe(pref);
        }
      });
    });
  });
});
