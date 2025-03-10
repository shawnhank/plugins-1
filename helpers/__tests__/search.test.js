/* global describe, expect, test */
import * as s from '../search'

describe('search.js tests', () => {

  describe('caseInsensitiveMatch', () => {
    test('should not match ABC to ABCDEFG', () => {
      const result = s.caseInsensitiveMatch('ABC', 'ABCDEFG')
      expect(result).toEqual(false)
    })
    test('should match ABC to ABC', () => {
      const result = s.caseInsensitiveMatch('ABC', 'ABC')
      expect(result).toEqual(true)
    })
    test('should match ABC to abc', () => {
      const result = s.caseInsensitiveMatch('ABC', 'abc')
      expect(result).toEqual(true)
    })
    test('should match ABC to AbcDefg', () => {
      const result = s.caseInsensitiveMatch('ABC', 'AbcDefg')
      expect(result).toEqual(false)
    })
    test('should not match ABC to AB', () => {
      const result = s.caseInsensitiveMatch('ABC', 'AB')
      expect(result).toEqual(false)
    })
    test('should not match ABC to <blank>', () => {
      const result = s.caseInsensitiveMatch('ABC', '')
      expect(result).toEqual(false)
    })
  })

  describe('caseInsensitiveStartsWith', () => {
    test('should match ABC to ABCDEFG', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'ABCDEFG')
      expect(result).toEqual(true)
    })
    test('should match ABC to ABC', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'ABC')
      expect(result).toEqual(false) // there should be more to match
    })
    test('should match ABC to abc', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'abc')
      expect(result).toEqual(false)
    })
    test('should match ABC to abc', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'abc/two/three')
      expect(result).toEqual(true)
    })
    test('should match ABC to AbcDefg', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'AbcDefg')
      expect(result).toEqual(true)
    })
    test('should not match ABC to AB', () => {
      const result = s.caseInsensitiveStartsWith('ABC', 'AB')
      expect(result).toEqual(false)
    })
    test('should not match ABC to <blank>', () => {
      const result = s.caseInsensitiveStartsWith('ABC', '')
      expect(result).toEqual(false)
    })
  })

  describe('isHashtagWanted', () => {
    const wantedSet1 = ['#TeStInG', '#Programming']
    const excludedSet1 = ['#odd']
    test('should want #TESTING from set1', () => {
      const result = s.isHashtagWanted('#TESTING', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should want #testing from set1', () => {
      const result = s.isHashtagWanted('#testing', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should want #TeStInG from set1', () => {
      const result = s.isHashtagWanted('#TeStInG', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should want #Programming from set1', () => {
      const result = s.isHashtagWanted('#Programming', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should want #programming from set1', () => {
      const result = s.isHashtagWanted('#programming', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should want #programMING from set1', () => {
      const result = s.isHashtagWanted('#programMING', wantedSet1, excludedSet1)
      expect(result).toEqual(true)
    })
    test('should not want #ODD from set1', () => {
      const result = s.isHashtagWanted('#ODD', wantedSet1, excludedSet1)
      expect(result).toEqual(false)
    })
  })

  // Identical logic is found in isMentionWanted

  describe('simplifyRawContent()', () => {
    test('empty -> empty', () => {
      const output = s.simplifyRawContent('')
      expect(output).toEqual('')
    })
    test('trim: surrounding whitespace only', () => {
      const output = s.simplifyRawContent('  trim me  ')
      expect(output).toEqual('trim me')
    })
    test('trim: padded * task line', () => {
      const output = s.simplifyRawContent('  * task line')
      expect(output).toEqual('* task line')
    })
    test('trim: - task line', () => {
      const output = s.simplifyRawContent('- task line    ')
      expect(output).toEqual('- task line')
    })
    test('trim: > quotation line', () => {
      const output = s.simplifyRawContent('  > quotation line ')
      expect(output).toEqual('> quotation line')
    })
    test('remove: blockID 1 at end', () => {
      const output = s.simplifyRawContent('  > blockID line ^abc123 ')
      expect(output).toEqual('> blockID line')
    })
    test('remove: blockID 2 at end', () => {
      const output = s.simplifyRawContent('- this is open at root @menty @everse/Kyle ^i0kuo6')
      expect(output).toEqual('- this is open at root @menty @everse/Kyle')
    })
    test('remove: blockID at start', () => {
      const output = s.simplifyRawContent('^abc123 > blockID line ')
      expect(output).toEqual('> blockID line')
    })
    test('remove: several blockIDs', () => {
      const output = s.simplifyRawContent('^abc123 > blockID line ^d4w2g7')
      expect(output).toEqual('> blockID line')
    })
    test('don\'t remove: invalid blockID', () => {
      const output = s.simplifyRawContent('this is invalid ^abc1234 ok?')
      expect(output).toEqual('this is invalid ^abc1234 ok?')
    })
  })

  describe('getLineMainContentPos()', () => {
    test('empty input)', () => {
      const output = s.getLineMainContentPos('')
      expect(output).toEqual(0)
    })
    test('only whitespace only', () => {
      const output = s.getLineMainContentPos('  trim me  ')
      expect(output).toEqual(0)
    })
    test('line with * [x] in the middle', () => {
      const output = s.getLineMainContentPos('line with * [x] in the middle')
      expect(output).toEqual(0)
    })
    test('#hashtag at start of line', () => {
      const output = s.getLineMainContentPos('#hashtag at start of line')
      expect(output).toEqual(0)
    })
    test('* task line', () => {
      const output = s.getLineMainContentPos('* task line')
      expect(output).toEqual(2)
    })
    test('padded * task line', () => {
      const output = s.getLineMainContentPos('  * task line')
      expect(output).toEqual(4)
    })
    test('- task line', () => {
      const output = s.getLineMainContentPos('- task line')
      expect(output).toEqual(2)
    })
    test('padded - task line', () => {
      const output = s.getLineMainContentPos('  - task line')
      expect(output).toEqual(4)
    })
    test('* [x] task line', () => {
      const output = s.getLineMainContentPos('* [x] task line')
      expect(output).toEqual(6)
    })
    test('padded * [x] task line', () => {
      const output = s.getLineMainContentPos('  * [x] task line')
      expect(output).toEqual(8)
    })
    test('* [-] task line', () => {
      const output = s.getLineMainContentPos('* [-] task line')
      expect(output).toEqual(6)
    })
    test('padded * [-] task line', () => {
      const output = s.getLineMainContentPos('    * [-] task line')
      expect(output).toEqual(10)
    })
    test('* [ ] task line', () => {
      const output = s.getLineMainContentPos('* [ ] task line')
      expect(output).toEqual(6)
    })
    test('padded * [ ] task line', () => {
      const output = s.getLineMainContentPos('  * [ ] task line')
      expect(output).toEqual(8)
    })
    test('- [ ] task line', () => {
      const output = s.getLineMainContentPos('- [ ] task line')
      expect(output).toEqual(6)
    })
    test('- [x] task line', () => {
      const output = s.getLineMainContentPos('- [x] task line')
      expect(output).toEqual(6)
    })
    test('## heading line', () => {
      const output = s.getLineMainContentPos('## heading line')
      expect(output).toEqual(3)
    })
    test('#### heading line', () => {
      const output = s.getLineMainContentPos('#### heading line')
      expect(output).toEqual(5)
    })
    test('> quotation line', () => {
      const output = s.getLineMainContentPos('  > quotation line ')
      expect(output).toEqual(4)
    })
  })

  /**
   * This will be rather fiddly to test fully, but here's some to get started.
   * Will not test inside of URIs or [MD](links) because if present they're not significant.
  */
  describe('trimAndHighlightTermInLine()', () => {
    test('should return same as input (no maxChars)', () => {
      const output = s.trimAndHighlightTermInLine('Something in [tennis title](http://www.random-rubbish.org/)', ['tennis'], false, false, '- ')
      expect(output).toEqual('Something in [tennis title](http://www.random-rubbish.org/)')
    })
    test('should return same as input (maxChars=0)', () => {
      const output = s.trimAndHighlightTermInLine('Something in [tennis title](http://www.random-rubbish.org/)', ['tennis'], false, false, '- ', 0)
      expect(output).toEqual('Something in [tennis title](http://www.random-rubbish.org/)')
    })
    test('should return same as input', () => {
      const output = s.trimAndHighlightTermInLine('Something in [tennis title](http://www.random-rubbish.org/)', ['tennis'], false, false, '- ', 100)
      expect(output).toEqual('Something in [tennis title](http://www.random-rubbish.org/)')
    })
    test('should return same as input + highlight', () => {
      const output = s.trimAndHighlightTermInLine('Something in [tennis title](http://www.random-rubbish.org/)', ['tennis'], false, true, '- ', 100)
      expect(output).toEqual('Something in [==tennis== title](http://www.random-rubbish.org/)')
    })
    test('should return same as input (no term included at all)', () => {
      const output = s.trimAndHighlightTermInLine('Something in [link title](http://www.random-rubbish.org/)', ['cabbage'], false, true, '- ', 100)
      expect(output).toEqual('Something in [link title](http://www.random-rubbish.org/)')
    })
    test('should return 3 highlights; not simplified; leaving padding', () => {
      const output = s.trimAndHighlightTermInLine("\t\t* [ ] There's Tennis and tennis.org and unTENNISlike behaviour!  ", ['tennis'], false, true, '- ', 100)
      expect(output).toEqual("\t\t* [ ] There's ==Tennis== and ==tennis==.org and un==TENNIS==like behaviour!")
    })
    test('should return 3 highlights, dealing with padding, simplifying', () => {
      const output = s.trimAndHighlightTermInLine("  * [ ] There's Tennis and tennis.org and unTENNISlike behaviour!  ", ['tennis'], true, true, '- ', 100)
      expect(output).toEqual("- There's ==Tennis== and ==tennis==.org and un==TENNIS==like behaviour!")
    })
    test('should return 3 highlights; not simplified; from tab padded', () => {
      const output = s.trimAndHighlightTermInLine("\t\tThere's Tennis and tennis.org and unTENNISlike behaviour!  ", ['tennis'], false, true, '- ', 100)
      expect(output).toEqual("There's ==Tennis== and ==tennis==.org and un==TENNIS==like behaviour!")
    })
    test('should return 3 highlights; simplified; from tab padded', () => {
      const output = s.trimAndHighlightTermInLine("\t\tThere's Tennis and tennis.org and unTENNISlike behaviour!  ", ['tennis'], true, true, '- ', 100)
      expect(output).toEqual("- There's ==Tennis== and ==tennis==.org and un==TENNIS==like behaviour!")
    })
    test('should return 2 highlight and no trimming', () => {
      const output = s.trimAndHighlightTermInLine("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], false, true, '- ', 100)
      expect(output).toEqual("Lorem ipsum dolor sit amet, ==sed== consectetur adipisicing elit, ==sed== do eiusmod tempor incididunt")
    })
    test('should return 1 highlight and end trimmng', () => {
      const output = s.trimAndHighlightTermInLine("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], false, false, '- ', 86)
      expect(output).toEqual("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod ...")
    })
    test('should return 1 highlight and front and end trimming', () => {
      const output = s.trimAndHighlightTermInLine("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], false, false, '- ', 70)
      expect(output).toEqual("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed ...")
    })
    test('should return 1 highlight and front and end trimming leaving task marker', () => {
      const output = s.trimAndHighlightTermInLine("  * [x] Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], false, false, '- ', 70)
      expect(output).toEqual("  * [x] Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed ...")
    })
    test('should return 1 highlight and front and end trimming + simplify to set prefix -', () => {
      const output = s.trimAndHighlightTermInLine("  * [x] Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], true, false, '- ', 70)
      expect(output).toEqual("- Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed ...")
    })
    // TODO: Ran out of energy to do the detail on this ...
    test.skip('should return 1 highlight and front and end trimming', () => {
      const output = s.trimAndHighlightTermInLine("Lorem ipsum dolor sit amet, sed consectetur adipisicing elit, sed do eiusmod tempor incididunt", ['sed'], false, false, '- ', 48)
      expect(output).toEqual("... ipsum dolor sit amet, sed consectetur adipisicing elit, ...")
    })
    test('should return 1 new highlight but not add extra to existing highlit term', () => {
      const output = s.trimAndHighlightTermInLine("Should add highlight to tennis, but not to this existing one: ==tennis==", ['tennis'], false, true, '- ')
      expect(output).toEqual("Should add highlight to ==tennis==, but not to this existing one: ==tennis==")
    })
  })
})
