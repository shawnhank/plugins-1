// @flow
/* global describe, expect, test */
import {
  type noteAndLine,
  type resultObjectTypeV3,
  type resultOutputTypeV3,
  type SearchConfig,
  type typedSearchTerm,
  applySearchOperators,
  createFormattedResultLines,
  differenceByPropVal,
  differenceByObjectEquality,
  // differenceByInnerArrayLine,
  normaliseSearchTerms,
  noteAndLineIntersection,
  numberOfUniqueFilenames,
  reduceAndSortNoteAndLineArray,
  validateAndTypeSearchTerms,
} from '../src/searchHelpers'
import { JSP, clo } from '../../helpers/dev'

const searchTerms: Array<typedSearchTerm> = [
  { term: 'TERM1', type: 'may', termRep: 'TERM1' },
  { term: 'TERM2', type: 'not-line', termRep: '-TERM2' },
  { term: 'TERM3', type: 'must', termRep: '+TERM3' },
  { term: 'TERM2', type: 'not-note', termRep: '!TERM2' }, // alternative of 2nd one that is more restrictive
  { term: 'TERM2', type: 'may', termRep: 'TERM2' }, // inverse of searchTerms[1]
  { term: 'TERM1', type: 'must', termRep: '+TERM1' }, // alternative of 1st one for ++ test
  { term: 'TERM2', type: 'must', termRep: '+TERM2' }, // alternative for ++ test
]

const emptyArr: Array<noteAndLine> = []

const mayArr: Array<noteAndLine> = [ // lines with TERM1, ordered by filename
  { noteFilename: 'file1', line: '1.1 includes TERM1 and TERM2' },
  { noteFilename: 'file1', line: '1.2 includes TERM1 and TERM2 again' },
  { noteFilename: 'file2', line: '2.1 includes TERM1 and TERM2' },
  { noteFilename: 'file2', line: '2.2 includes TERM1 only' },
  { noteFilename: 'file3', line: '3.1 boring but has TERM1' },
  { noteFilename: 'file5', line: '5.1 includes TERM1' },
  { noteFilename: 'file6', line: '6.1 includes TERM1' },
  { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
  { noteFilename: 'file7', line: '7.1 (W£%&W(*%&)) TERM1' },
  { noteFilename: 'file7', line: '7.2 has TERM1' },
]
// clo(mayArr, 'mayArr:')

const notArr: Array<noteAndLine> = [ // lines with TERM2, ordered by filename
  { noteFilename: 'file1', line: '1.1 includes TERM1 and TERM2' },
  { noteFilename: 'file1', line: '1.2 includes TERM1 and TERM2 again' },
  { noteFilename: 'file2', line: '2.1 includes TERM1 and TERM2' },
  { noteFilename: 'file2', line: '2.3 just TERM2 to avoid' },
  { noteFilename: 'file4', line: '4.1 includes TERM2' },
  { noteFilename: 'file6', line: '6.2 has TERM2' },
]
// clo(notArr, 'notArr:')

const mustArr: Array<noteAndLine> = [ // lines with TERM3, ordered by filename
  { noteFilename: 'file4', line: '4.2 also has TERM3' },
  { noteFilename: 'file4', line: '4.3 also has TERM3' },
  { noteFilename: 'file5', line: '5.2 includes TERM3' },
  { noteFilename: 'file6', line: '6.3 has TERM3' },
  { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
  { noteFilename: 'file7', line: '7.3 has TERM3' },
]
// clo(mustArr, 'mustArr:')

describe('searchHelpers.js tests', () => {
  describe('numberOfUniqueFilenames()', () => {
    test('should return 6', () => {
      const result = numberOfUniqueFilenames(mayArr)
      expect(result).toEqual(6)
    })
    test('should return 4', () => {
      const result = numberOfUniqueFilenames(notArr)
      expect(result).toEqual(4)
    })
  })

  describe('reduceAndSortNoteAndLineArray()', () => {
    test('should return same as mustArr', () => {
      const dupedUnsortedMustArr: Array<noteAndLine> = [
        { noteFilename: 'file5', line: '5.2 includes TERM3' },
        { noteFilename: 'file4', line: '4.3 also has TERM3' },
        { noteFilename: 'file5', line: '5.2 includes TERM3' },
        { noteFilename: 'file7', line: '7.3 has TERM3' },
        { noteFilename: 'file4', line: '4.2 also has TERM3' },
        { noteFilename: 'file6', line: '6.3 has TERM3' },
        { noteFilename: 'file7', line: '7.3 has TERM3' },
        { noteFilename: 'file4', line: '4.3 also has TERM3' },
        { noteFilename: 'file6', line: '6.3 has TERM3' },
        { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
      ]
      const result = reduceAndSortNoteAndLineArray(dupedUnsortedMustArr)
      expect(result).toEqual(mustArr)
    })
    // TODO: more ???
  })

  describe('noteAndLineIntersection', () => {
    test('should return empty array, from [] []', () => {
      const result = noteAndLineIntersection([], [])
      expect(result).toEqual(emptyArr)
    })
    test('should return empty array, from [+TERM2] []', () => {
      const result = noteAndLineIntersection(mustArr, [])
      expect(result).toEqual(emptyArr)
    })

    test('should return results, from [+TERM2 +TERM3]', () => {
      const result = noteAndLineIntersection(notArr, mustArr)
      expect(result).toEqual(emptyArr)
    })

    const expectedArr: Array<noteAndLine> = [
      { noteFilename: 'file1', line: '1.1 includes TERM1 and TERM2' },
      { noteFilename: 'file1', line: '1.2 includes TERM1 and TERM2 again' },
      { noteFilename: 'file2', line: '2.1 includes TERM1 and TERM2' },
    ]
    test('should return results, from [+TERM1 +TERM2]', () => {
      const result = noteAndLineIntersection(mayArr, notArr)
      expect(result).toEqual(expectedArr)
    })
    test('should return results, from [+TERM2 +TERM1]', () => {
      const result = noteAndLineIntersection(notArr, mayArr)
      expect(result).toEqual(expectedArr)
    })
  })

  describe('differenceByPropVal() with noteFilename as match term', () => {
    test('should return empty array, from empty input1', () => {
      const result = differenceByPropVal([], notArr, 'noteFilename')
      expect(result).toEqual([])
    })
    test('should return input array, from empty exclude', () => {
      const result = differenceByPropVal(mayArr, [], 'noteFilename')
      expect(result).toEqual(mayArr)
    })

    test('should return narrower (note) diff of mayArr, notArr (using noteFilename)', () => {
      const diffArr: Array<noteAndLine> = [ // *notes* with TERM1 but not TERM2
        { noteFilename: 'file3', line: '3.1 boring but has TERM1' },
        { noteFilename: 'file5', line: '5.1 includes TERM1' },
        { noteFilename: 'file7', line: '7.1 (W£%&W(*%&)) TERM1' },
        { noteFilename: 'file7', line: '7.2 has TERM1' },
      ]
      const result = differenceByPropVal(mayArr, notArr, 'noteFilename')
      // clo(result, 'test result for TERM1 but not TERM2')
      expect(result).toEqual(diffArr)
    })
    test('should return narrower (note) diff of mustArr, notArr (using noteFilename)', () => {
      const diffArr: Array<noteAndLine> = [ // *notes* with TERM3 but not TERM2
        { noteFilename: 'file5', line: '5.2 includes TERM3' },
        { noteFilename: 'file7', line: '7.3 has TERM3' },
      ]
      const result = differenceByPropVal(mustArr, notArr, 'noteFilename')
      // clo(result, 'test result for TERM3 but not TERM2')
      expect(result).toEqual(diffArr)
    })
  })

  describe('differenceByObjectEquality()', () => {
    test('should return empty array, from empty input1', () => {
      const result = differenceByObjectEquality([], notArr)
      expect(result).toEqual([])
    })
    test('should return input array, from empty exclude', () => {
      const result = differenceByObjectEquality(mayArr, [])
      expect(result).toEqual(mayArr)
    })

    test('should return wider (line) diff of mayArr, notArr', () => {
      const diffArr: Array<noteAndLine> = [
        { noteFilename: 'file2', line: '2.2 includes TERM1 only' },
        { noteFilename: 'file3', line: '3.1 boring but has TERM1' },
        { noteFilename: 'file5', line: '5.1 includes TERM1' },
        { noteFilename: 'file6', line: '6.1 includes TERM1' },
        { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
        { noteFilename: 'file7', line: '7.1 (W£%&W(*%&)) TERM1' },
        { noteFilename: 'file7', line: '7.2 has TERM1' },
      ]
      const result = differenceByObjectEquality(mayArr, notArr)
      // clo(result, 'test result for TERM1 but not TERM2')
      expect(result).toEqual(diffArr)
    })
    test('should return wider (line) diff of modifiedMustArr, notArr', () => {
      const modifiedMustArr: Array<noteAndLine> = [
        { noteFilename: 'file1', line: '1.1 includes TERM1 and TERM2' },
        { noteFilename: 'file4', line: '4.1 includes TERM2' },
        { noteFilename: 'file4', line: '4.2 also has TERM3' },
        { noteFilename: 'file4', line: '4.3 also has TERM3' },
        { noteFilename: 'file5', line: '5.2 includes TERM3' },
        { noteFilename: 'file6', line: '6.2 has TERM2' },
        { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
        { noteFilename: 'file7', line: '7.3 has TERM3' },
      ]
      const diffArr: Array<noteAndLine> = [ // *lines* with TERM3 but not TERM2
        { noteFilename: 'file4', line: '4.2 also has TERM3' },
        { noteFilename: 'file4', line: '4.3 also has TERM3' },
        { noteFilename: 'file5', line: '5.2 includes TERM3' },
        { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
        { noteFilename: 'file7', line: '7.3 has TERM3' },
      ]
      const result = differenceByObjectEquality(modifiedMustArr, notArr)
      clo(result, '*** test result for TERM3 but not TERM2')
      expect(result).toEqual(diffArr)
    })
  })

  // ----------------

  describe('applySearchOperators(termsResults: Array<resultObjectTypeV2>, operateOnWholeNote: boolean): resultObjectType', () => {
    // clo(combinedResults, 'combinedResults: ')

    test('should return no results from simple no results', () => {
      // For empty results
      const combinedResults: Array<resultObjectTypeV3> = [
        { searchTerm: searchTerms[0], resultNoteAndLineArr: emptyArr, resultCount: 0 },
      ]
      const expectedNoteBasedOutput: resultOutputTypeV3 = { // for no results
        searchTermsRepArr: ["TERM1"],
        resultNoteAndLineArr: [],
        resultCount: 0,
        resultNoteCount: 0,
      }
      const result = applySearchOperators(combinedResults)
      // clo(expectedNoteBasedOutput, 'expectedNoteBasedOutput = ')
      expect(result).toEqual(expectedNoteBasedOutput)
    })

    test('should return no results from [TERM2 -TERM2] search', () => {
      // For empty results
      const combinedResults: Array<resultObjectTypeV3> = [
        { searchTerm: searchTerms[4], resultNoteAndLineArr: notArr, resultCount: 6 },
        { searchTerm: searchTerms[1], resultNoteAndLineArr: notArr, resultCount: 6 },
      ]
      const expectedNoteBasedOutput: resultOutputTypeV3 = { // for no results
        searchTermsRepArr: ["TERM2", "-TERM2"],
        resultNoteAndLineArr: [],
        resultCount: 0,
        resultNoteCount: 0,
      }
      const result = applySearchOperators(combinedResults)
      // clo(expectedNoteBasedOutput, 'expectedNoteBasedOutput = ')
      expect(result).toEqual(expectedNoteBasedOutput)
    })

    test('should return few results from [+TERM1 +TERM2] search', () => {
      const combinedResults: Array<resultObjectTypeV3> = [
        { searchTerm: searchTerms[5], resultNoteAndLineArr: mayArr, resultCount: 10 },
        { searchTerm: searchTerms[6], resultNoteAndLineArr: notArr, resultCount: 6 },
      ]
      const expectedNoteBasedOutput: resultOutputTypeV3 = {
        searchTermsRepArr: ["+TERM1", "+TERM2"],
        resultNoteAndLineArr: [
          { noteFilename: 'file1', line: '1.1 includes TERM1 and TERM2' },
          { noteFilename: 'file1', line: '1.2 includes TERM1 and TERM2 again' },
          { noteFilename: 'file2', line: '2.1 includes TERM1 and TERM2' },
        ],
        resultCount: 3,
        resultNoteCount: 2,
      }
      const result = applySearchOperators(combinedResults)
      // clo(expectedNoteBasedOutput, 'expectedNoteBasedOutput = ')
      expect(result).toEqual(expectedNoteBasedOutput)
    })

    test('should return narrower !term results', () => {
      // For TERM1, -TERM2, +TERM3
      const combinedResults: Array<resultObjectTypeV3> = [
        { searchTerm: searchTerms[0], resultNoteAndLineArr: mayArr, resultCount: 1 },
        { searchTerm: searchTerms[3], resultNoteAndLineArr: notArr, resultCount: 2 }, // the !TERM2 alternative
        { searchTerm: searchTerms[2], resultNoteAndLineArr: mustArr, resultCount: 4 },
      ]
      const expectedNoteBasedOutput: resultOutputTypeV3 = { // For TERM1, -TERM2, +TERM3 matching *notes*
        searchTermsRepArr: ["TERM1", "!TERM2", "+TERM3"],
        resultNoteAndLineArr: [
          { noteFilename: 'file5', line: '5.1 includes TERM1' },
          { noteFilename: 'file5', line: '5.2 includes TERM3' },
          { noteFilename: 'file7', line: '7.1 (W£%&W(*%&)) TERM1' },
          { noteFilename: 'file7', line: '7.2 has TERM1' },
          { noteFilename: 'file7', line: '7.3 has TERM3' },
        ],
        resultCount: 5,
        resultNoteCount: 2,
      }
      const result = applySearchOperators(combinedResults)
      // clo(expectedNoteBasedOutput, 'expectedNoteBasedOutput = ')
      expect(result).toEqual(expectedNoteBasedOutput)
    })

    test('should return wider -term results', () => {
      // For TERM1, -TERM2, +TERM3
      const combinedResults: Array<resultObjectTypeV3> = [
        { searchTerm: searchTerms[0], resultNoteAndLineArr: mayArr, resultCount: 1 },
        { searchTerm: searchTerms[1], resultNoteAndLineArr: notArr, resultCount: 2 },
        { searchTerm: searchTerms[2], resultNoteAndLineArr: mustArr, resultCount: 4 },
      ]
      const expectedLineBasedOutput: resultOutputTypeV3 = { // For TERM1, -TERM2, +TERM3 matching *lines*
        searchTermsRepArr: ["TERM1", "-TERM2", "+TERM3"],
        resultNoteAndLineArr: [
          { noteFilename: 'file4', line: '4.2 also has TERM3' },
          { noteFilename: 'file4', line: '4.3 also has TERM3' },
          { noteFilename: 'file5', line: '5.1 includes TERM1' },
          { noteFilename: 'file5', line: '5.2 includes TERM3' },
          { noteFilename: 'file6', line: '6.1 includes TERM1' },
          { noteFilename: 'file6', line: '6.3 has TERM3' },
          { noteFilename: 'file6', line: '6.4 TERM3 has gone "(*$&(*%^" and with TERM1' },
          { noteFilename: 'file7', line: '7.1 (W£%&W(*%&)) TERM1' },
          { noteFilename: 'file7', line: '7.2 has TERM1' },
          { noteFilename: 'file7', line: '7.3 has TERM3' },
        ],
        resultCount: 10,
        resultNoteCount: 4,
      }
      const result = applySearchOperators(combinedResults)
      // clo(result, 'line-based test result for TERM1, -TERM2, +TERM3')
      expect(result).toEqual(expectedLineBasedOutput)
    })
  })

  describe('normaliseSearchTerms', () => {
    test('empty string', () => {
      const result = normaliseSearchTerms('')
      expect(result).toEqual([])
    })
    test('just spaces', () => {
      const result = normaliseSearchTerms('  ')
      expect(result).toEqual([])
    })
    test('free-floating operator +', () => {
      const result = normaliseSearchTerms(' - + ! ')
      expect(result).toEqual([])
    })
    test('too-short word term', () => {
      const result = normaliseSearchTerms('aa')
      expect(result).toEqual([])
    })
    test('single word term', () => {
      const result = normaliseSearchTerms('xxx')
      expect(result).toEqual(['xxx'])
    })
    test('xxx yyy', () => {
      const result = normaliseSearchTerms('xxx yyy')
      expect(result).toEqual(['xxx', 'yyy'])
    })
    test('#hashtag #hashtag/child @mention @run(5)', () => {
      const result = normaliseSearchTerms('#hashtag #hashtag/child @mention @run(5)')
      expect(result).toEqual(['#hashtag', '#hashtag/child', '@mention', '@run(5)'])
    })
    test('xxx OR yyy', () => {
      const result = normaliseSearchTerms('xxx OR yyy')
      expect(result).toEqual(['xxx', 'yyy'])
    })
    test('xxx OR yyy OR zzz', () => {
      const result = normaliseSearchTerms('xxx OR yyy OR zzz')
      expect(result).toEqual(['xxx', 'yyy', 'zzz'])
    })
    test('xxx, yyy', () => {
      const result = normaliseSearchTerms('xxx, yyy')
      expect(result).toEqual(['xxx', 'yyy'])
    })
    test('xxx,yyy, zzz', () => {
      const result = normaliseSearchTerms('xxx,yyy, zzz')
      expect(result).toEqual(['xxx', 'yyy', 'zzz'])
    })
    test('xxx AND yyy', () => {
      const result = normaliseSearchTerms('xxx AND yyy')
      expect(result).toEqual(['+xxx', '+yyy'])
    })
    test('xxx AND yyy AND z', () => {
      const result = normaliseSearchTerms('xxx AND yyy AND zzz')
      expect(result).toEqual(['+xxx', '+yyy', '+zzz'])
    })
    test('"1 John", 1Jn (do modify)', () => {
      const result = normaliseSearchTerms('"1 John", 1Jn', true)
      expect(result).toEqual(['+1', '+John', '1Jn'])
    })
    test('"1 John", 1Jn (do not modify)', () => {
      const result = normaliseSearchTerms('"1 John", 1Jn', false)
      expect(result).toEqual(['1 John', '1Jn'])
    })
    test("mix of quoted and unquoted terms (do modify)", () => {
      const result = normaliseSearchTerms('-term1 "term two" !term3', true)
      expect(result).toEqual(['-term1', '+term', '+two', '!term3'])
    })
    test("mix of quoted and unquoted terms (don't modify)", () => {
      const result = normaliseSearchTerms('-term1 "term two" !term3', false)
      expect(result).toEqual(['-term1', 'term two', '!term3'])
    })
    test("terms with apostrophes in quoted terms (do modify)", () => {
      const result = normaliseSearchTerms('-term1 "couldn\'t possibly" !term3', true)
      expect(result).toEqual(['-term1', '+couldn\'t', '+possibly', '!term3'])
    })
    test("terms with apostrophes in quoted terms (don't modify)", () => {
      const result = normaliseSearchTerms('-term1 "couldn\'t possibly" !term3', false)
      expect(result).toEqual(['-term1', 'couldn\'t possibly', '!term3'])
    })
    // TODO: This one failing on the apostophe -> [- "can't",+ "can",+ "t", "term2"]
    test.skip("terms with apostrophes in unquoted terms", () => {
      const result = normaliseSearchTerms("can't term2")
      expect(result).toEqual(["can't", 'term2'])
    })
    test("mix of quoted and unquoted terms (do modify)", () => {
      const result = normaliseSearchTerms('bob "xxx",\'yyy\', "asd\'sa" \'bob two\' "" hello', true)
      expect(result).toEqual(['bob', 'xxx', 'yyy', "asd'sa", "+bob", "+two", "hello"])
    })
    test("mix of quoted and unquoted terms (don't modify)", () => {
      const result = normaliseSearchTerms('bob "xxx",\'yyy\', "asd\'sa" \'bob two\' "" hello', false)
      expect(result).toEqual(['bob', 'xxx', 'yyy', "asd'sa", "bob two", "hello"])
    })
    // TODO: This one failing on "-bob two" -> [- "-bob two", '+bob' '+two']
    test.skip("mix of quoted and unquoted terms and operators (do modify)", () => {
      const result = normaliseSearchTerms('+bob "xxx",\'yyy\', !"asd\'sa" -\'bob two\' "" !hello', true)
      expect(result).toEqual(['+bob', 'xxx', 'yyy', "!asd'sa", "-bob two", "!hello"])
    })
    test("mix of quoted and unquoted terms and operators (don't modify)", () => {
      const result = normaliseSearchTerms('+bob "xxx",\'yyy\', !"asd\'sa" -\'bob two\' "" !hello', false)
      expect(result).toEqual(['+bob', 'xxx', 'yyy', "!asd'sa", "-bob two", "!hello"])
    })
    // TODO: can't mix OR with +
  })

  describe('validateAndTypeSearchTerms', () => {
    test('should return empty array from empty input', () => {
      const result = validateAndTypeSearchTerms('')
      expect(result).toEqual([])
    })
    test('should return empty array from too-short terms', () => {
      const result = validateAndTypeSearchTerms('ab 12 c')
      expect(result).toEqual([])
    })
    test('should return empty array from too many terms', () => {
      const result = validateAndTypeSearchTerms('abc def ghi jkl mno pqr stu vwz')
      expect(result).toEqual([])
    })
    test('should return empty array from no positive terms', () => {
      const result = validateAndTypeSearchTerms('-term1 -term2 -term3')
      expect(result).toEqual([])
    })
    test('single term string', () => {
      const result = validateAndTypeSearchTerms('term1')
      expect(result).toEqual([{ term: 'term1', type: 'may', termRep: 'term1' }])
    })
    test('single term array', () => {
      const result = validateAndTypeSearchTerms('term1')
      expect(result).toEqual([{ term: 'term1', type: 'may', termRep: 'term1' }])
    })
    test('two term string', () => {
      const result = validateAndTypeSearchTerms('term1 "term two"')
      expect(result).toEqual([
        { term: 'term1', type: 'may', termRep: 'term1' },
        { term: 'term', type: 'must', termRep: '+term' },
        { term: 'two', type: 'must', termRep: '+two' }])
    })
    test('two term array', () => {
      const result = validateAndTypeSearchTerms('term1 "term two"')
      expect(result).toEqual([
        { term: 'term1', type: 'may', termRep: 'term1' },
        { term: 'term', type: 'must', termRep: '+term' },
        { term: 'two', type: 'must', termRep: '+two' }])
    })
    test('three terms with +//-', () => {
      const result = validateAndTypeSearchTerms('+term1 "term two" -term3')
      expect(result).toEqual([
        { term: 'term1', type: 'must', termRep: '+term1' },
        { term: 'term', type: 'must', termRep: '+term' },
        { term: 'two', type: 'must', termRep: '+two' },
        { term: 'term3', type: 'not-line', termRep: '-term3' }])
    })
    test('three terms with +//!', () => {
      const result = validateAndTypeSearchTerms('+term1 "term two" !term3')
      expect(result).toEqual([
        { term: 'term1', type: 'must', termRep: '+term1' },
        { term: 'term', type: 'must', termRep: '+term' },
        { term: 'two', type: 'must', termRep: '+two' },
        { term: 'term3', type: 'not-note', termRep: '!term3' }])
    })
    test('"1 John", 1Jn', () => {
      const result = validateAndTypeSearchTerms('"1 John", 1Jn')
      expect(result).toEqual([
        { term: 'John', type: 'must', termRep: '+John' },
        { term: '1Jn', type: 'may', termRep: '1Jn' }])
    })
  })

  // Just a no-result test -- rest too hard to mock up
  describe('createFormattedResultLines', () => {
    test("for empty result", () => {
      const resultSet: resultOutputTypeV3 = {
        searchTermsRepArr: ["TERM1", "-TERM2"],
        resultNoteAndLineArr: [],
        resultCount: 0,
        resultNoteCount: 0,
      }
      const config: $Shape<SearchConfig> = { resultStyle: 'NotePlan', headingLevel: 2, groupResultsByNote: true, highlightResults: true, resultPrefix: '- ', resultQuoteLength: 120, dateStyle: 'date' }
      const result = createFormattedResultLines(resultSet, config)
      expect(result).toEqual([])
    })
  })
})

// ----------------------------------
  // Removed, as this is no longer used, and relied on state of file at 0.5.0-beta4
  // describe('differenceByInnerArrayLine()', () => {
  //   test('should return empty array, from empty input1', () => {
  //     const result = differenceByInnerArrayLine([], notArr)
  //     expect(result).toEqual([])
  //   })
  //   test('should return input array, from empty exclude', () => {
  //     const result = differenceByInnerArrayLine(mayArr, [])
  //     expect(result).toEqual(mayArr)
  //   })

  //   // Removed, as this is no longer used
  //   test('should return wider (line) diff of mayArr, notArr (using noteFilename)', () => {
  //     const diffArr: Array<noteAndLines> = [ // *lines* with TERM1 but not TERM2
  //       { noteFilename: 'file2', lines: ['2.2 includes TERM1 only'] },
  //       { noteFilename: 'file3', lines: ['3.1 boring but has TERM1'] },
  //       { noteFilename: 'file5', lines: ['5.1 includes TERM1'] },
  //       { noteFilename: 'file6', lines: ['6.1 includes TERM1', '6.4 TERM3 has gone "(*$&(*%^" and with TERM1'] },
  //       { noteFilename: 'file7', lines: ['7.1 (W£%&W(*%&)) TERM1', '7.2 has TERM1'] },
  //     ]
  //     const result = differenceByInnerArrayLine(mayArr, notArr)
  //     // clo(result, 'test result for TERM1 but not TERM2')
  //     expect(result).toEqual(diffArr)
  //   })

  //   test('should return wider (line) diff of mustArr, notArr (using noteFilename)', () => {
  //     const diffArr: Array<noteAndLines> = [ // *lines* with TERM3 but not TERM2
  //       { noteFilename: 'file4', lines: ['4.2 includes TERM3', '4.3 also has TERM3'] },
  //       { noteFilename: 'file5', lines: ['5.2 includes TERM3'] },
  //       { noteFilename: 'file6', lines: ['6.3 has TERM3', '6.4 TERM3 has gone "(*$&(*%^" and with TERM1'] },
  //       { noteFilename: 'file7', lines: ['7.3 has TERM3'] },
  //     ]
  //     const result = differenceByInnerArrayLine(mustArr, notArr)
  //     // clo(result, 'test result for TERM3 but not TERM2')
  //     expect(result).toEqual(diffArr)
  //   })
  // })
