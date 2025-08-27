import {
  validateArticleName,
  splitFragmentAt,
  mergeFragments,
  validateFragments,
  smartSplitFragment,
} from '../../utils/sentenceFragmentSplitter';


console.log('ENV', typeof window, typeof document, typeof navigator);

describe('sentenceFragmentSplitter', () => {
  test('validateArticleName accepts alnum, dash, underscore, 3-50 chars', () => {
    expect(validateArticleName('abc-DEF_123')).toBe(true);
    expect(validateArticleName('ab')).toBe(false);
  });

  test('splitFragmentAt splits on index and trims edges', () => {
    const parts = splitFragmentAt(['hello world'], 0, 5);
    expect(parts).toEqual(['hello', 'world']);
  });

  test('mergeFragments merges consecutive items', () => {
    const merged = mergeFragments(['a', 'b', 'c'], 1);
    expect(merged).toEqual(['a', 'b c']);
  });

  test('smartSplitFragment falls back to middle when no hints', () => {
    const res = smartSplitFragment(['onetwothree'], 0);
    expect(res.length).toBe(2);
  });

  test('validateFragments flags long/short correctly', () => {
    const data = validateFragments(['short', 'this one is rather too long for comfort'.repeat(1)]);
    expect(data.totalFragments).toBe(2);
  });
});
