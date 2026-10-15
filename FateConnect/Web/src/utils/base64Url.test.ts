import { base64UrlToBytes } from './base64Url';

describe('base64UrlToBytes', () => {
  it('should read the url alphabet and the missing padding as the bytes they encode', () => {
    expect(Array.from(base64UrlToBytes('-_8'))).toEqual([0xfb, 0xff]);
    expect(Array.from(base64UrlToBytes('AQID'))).toEqual([1, 2, 3]);
  });
});
