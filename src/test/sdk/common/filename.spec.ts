import { checkDirAndFileName, decodeHttpApiPath, encodeHttpApiPath } from '../../../sdk/common/filename.js';

import { describe, expect, it } from 'vitest';

describe('HTTP API Path Encoding and Decoding', () => {
  it('should correctly encode HTTP method and API path', () => {
    const method = 'GET';
    const apiPath = '/users/profile';
    const encoded = encodeHttpApiPath(method, apiPath);
    expect(encoded).toBe('__GET__users__profile__');
  });

  it('should correctly decode to HTTP method and API path', () => {
    const dirname = '__GET__users__profile__';
    const [method, path] = decodeHttpApiPath(dirname);
    expect(method).toBe('GET');
    expect(path).toBe('/users/profile');
  });

  it('should throw an error for invalid dirname format', () => {
    const invalidDirname = 'GET__users__profile';
    expect(() => decodeHttpApiPath(invalidDirname)).toThrow('Invalid dirname format');
  });

  it('should handle empty path segments correctly', () => {
    const method = 'POST';
    const apiPath = '/users//profile/';
    const encoded = encodeHttpApiPath(method, apiPath);
    expect(encoded).toBe('__POST__users__profile__');
  });

  describe('Filename Validation Tests', () => {
    it('should validate normal filenames', () => {
      expect(checkDirAndFileName('test')).toBeTruthy();
      expect(checkDirAndFileName('example.txt')).toBeTruthy();
      expect(checkDirAndFileName('another_example_file.md')).toBeTruthy();
    });

    it('should invalidate filenames with illegal characters', () => {
      expect(checkDirAndFileName('test/x')).toBeFalsy();
      expect(checkDirAndFileName('test./x')).toBeFalsy();
      expect(checkDirAndFileName('test?name')).toBeFalsy();
      expect(checkDirAndFileName('test<name')).toBeFalsy();
      expect(checkDirAndFileName('test>name')).toBeFalsy();
      expect(checkDirAndFileName('test:name')).toBeFalsy();
      expect(checkDirAndFileName('test"name')).toBeFalsy();
      expect(checkDirAndFileName('test|name')).toBeFalsy();
      expect(checkDirAndFileName('test\\name')).toBeFalsy();
      expect(checkDirAndFileName('test*name')).toBeFalsy();
    });

    it('should handle edge cases', () => {
      expect(checkDirAndFileName('')).toBeFalsy(); // 空字符串
      expect(checkDirAndFileName('.')).toBeFalsy(); // 只有一个点
      expect(checkDirAndFileName('..')).toBeFalsy(); // 只有两个点
      expect(checkDirAndFileName(' ')).toBeFalsy(); // 只有空格
      expect(checkDirAndFileName('    ')).toBeFalsy(); // 只有多个空格
      expect(checkDirAndFileName('.hiddenfile')).toBeTruthy(); // 隐藏文件
      expect(checkDirAndFileName('endwithspace ')).toBeFalsy(); // 结尾有空格
      expect(checkDirAndFileName('endwithdot.')).toBeTruthy(); // 结尾有点
    });
  });
});
