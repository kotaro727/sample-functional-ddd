import { describe, test, expect, spyOn } from 'bun:test';
import { ConsoleEmailService } from './consoleEmailService';
import { isOk } from '@shared/functional/result';

describe('ConsoleEmailService', () => {
  describe('send', () => {
    test('メールメッセージをコンソールに出力する', async () => {
      // Arrange
      const emailService = new ConsoleEmailService();
      const message = {
        to: 'test@example.com',
        subject: 'テスト件名',
        body: 'テスト本文',
      };

      // コンソール出力をキャプチャ
      const consoleLogSpy = spyOn(console, 'log');

      // Act
      const result = await emailService.send(message);

      // Assert
      expect(isOk(result)).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalled();

      // コンソール出力に必要な情報が含まれることを確認
      const allLogs = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allLogs).toContain('test@example.com');
      expect(allLogs).toContain('テスト件名');
      expect(allLogs).toContain('テスト本文');

      // クリーンアップ
      consoleLogSpy.mockRestore();
    });

    test('常に成功のResultを返す', async () => {
      // Arrange
      const emailService = new ConsoleEmailService();
      const message = {
        to: 'another@example.com',
        subject: '別のテスト',
        body: '別の本文',
      };

      // コンソール出力を抑制
      const consoleLogSpy = spyOn(console, 'log');

      // Act
      const result = await emailService.send(message);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      // クリーンアップ
      consoleLogSpy.mockRestore();
    });

    test('複数のメールを連続して送信できる', async () => {
      // Arrange
      const emailService = new ConsoleEmailService();
      const consoleLogSpy = spyOn(console, 'log');

      // Act
      const result1 = await emailService.send({
        to: 'user1@example.com',
        subject: '件名1',
        body: '本文1',
      });

      const result2 = await emailService.send({
        to: 'user2@example.com',
        subject: '件名2',
        body: '本文2',
      });

      // Assert
      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(0);

      // クリーンアップ
      consoleLogSpy.mockRestore();
    });
  });
});
