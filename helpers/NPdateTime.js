// @flow
//-------------------------------------------------------------------------------
// Date functions that rely on NotePlan functions/types
// @jgclark except where shown

import moment from 'moment'
import { trimAnyQuotes } from './dataManipulation'
import {
  getWeek,
  monthNameAbbrev,
  todaysDateISOString,
  toISODateString,
  toISOShortDateTimeString,
  weekStartEnd,
} from './dateTime'
import { logDebug, logError } from './dev'
import { chooseOption, getInput } from './userInput'

// TODO: Finish moving references to this file from dateTime.js
export function toLocaleDateTimeString(dateObj: Date, locale: string | Array<string> = [], options: Intl$DateTimeFormatOptions = {}): string {
  /**
   * TODO: use details from NotePlan.environment...
   *  "languageCode": "en",
   *   "regionCode": "GB",
   *   "is12hFormat": 0,
   *   "preferredLanguages": [
   *     "en-GB"
   *   ],
   */
  return dateObj.toLocaleString(locale, options)
}

// TODO: Finish moving references to this file from dateTime.js
export function toLocaleDateString(dateObj: Date, locale: string | Array<string> = [], options: Intl$DateTimeFormatOptions = {}): string {
  /**
   * TODO: use details from NotePlan.environment...
   *  "languageCode": "en",
   *   "regionCode": "GB",
   *   "preferredLanguages": [
   *     "en-GB"
   *   ],
   */
  return dateObj.toLocaleDateString(locale, options)
}

// TODO: Finish moving references to this file from dateTime.js
export function toLocaleTime(dateObj: Date, locale: string | Array<string> = [], options: Intl$DateTimeFormatOptions = {}): string {
  /**
   * TODO: use details from NotePlan.environment...
   *  "languageCode": "en",
   *   "regionCode": "GB",
   *   "is12hFormat": 0,
   *   "preferredLanguages": [
   *     "en-GB"
   *   ],
   */
  return dateObj.toLocaleTimeString(locale, options)
}

export function printDateRange(dr: DateRange) {
  console.log(`DateRange <${toISOShortDateTimeString(dr.start)} - ${toISOShortDateTimeString(dr.end)}>`)
}

/**
 * DEPRECATED: Calculate an offset date, as a JS Date.
 * **Now use version in helpers/dateTime.js which doesn't rely on NP APIs, and has tests!**
 * v2 method, using built-in NotePlan function 'Calendar.addUnitToDate(date, type, num)'
 * @author @jgclark
 *
 * @param {string} baseDateISO is type ISO Date (i.e. YYYY-MM-DD) - NB: different from JavaScript's Date type
 * @param {interval} string of form +nn[bdwmq] or -nn[bdwmq], where 'b' is weekday (i.e. Monday - Friday in English)
 * @returns {Date} new date as a JS Date (or null if there is an error)
 */
export function calcOffsetDate(baseDateISO: string, interval: string): Date | null {
  try {
    const momentDate = moment(baseDateISO) // use moment() to work in the local timezone [says @dwertheimer]
    // const baseDate = new Date(baseDateISO)
    const baseDate = new Date(momentDate.format()) // ditto
    // log('calcOffsetDate()', `baseDateISO:${baseDateISO} momentDate:${momentDate} baseDate:${baseDate.toString()}`)
    let daysToAdd = 0
    let monthsToAdd = 0
    let yearsToAdd = 0
    const unit = interval.charAt(interval.length - 1) // get last character
    let num = Number(interval.substr(0, interval.length - 1)) // return all but last character
    // log('helpers/calcOffsetDate', `base: ${toISODateString(baseDate)} / ${num} / ${unit}`)

    switch (unit) {
      case 'b': {
        // week days
        // Method from Arjen at https://stackoverflow.com/questions/279296/adding-days-to-a-date-but-excluding-weekends
        // Avoids looping, and copes with negative intervals too
        const currentDayOfWeek = baseDate.getUTCDay() // = day of week with Sunday = 0, ..Saturday = 6
        let dayOfWeek
        if (num < 0) {
          dayOfWeek = (currentDayOfWeek - 12) % 7
        } else {
          dayOfWeek = (currentDayOfWeek + 6) % 7 // % = modulo operator in JSON
        }
        if (dayOfWeek === 6) {
          num--
        }
        if (dayOfWeek === -6) {
          num++
        }
        // console.log("    c_o_d b: " + currentDayOfWeek + " / " + num + " / " + dayOfWeek)
        const numWeekends = Math.trunc((num + dayOfWeek) / 5)
        daysToAdd = num + numWeekends * 2
        break
      }
      case 'd':
        daysToAdd = num // need *1 otherwise treated as a string for some reason
        break
      case 'w':
        daysToAdd = num * 7
        break
      case 'm':
        monthsToAdd = num
        break
      case 'q':
        monthsToAdd = num * 3
        break
      case 'y':
        yearsToAdd = num
        break
      default:
        logError('helpers/calcOffsetDate', `Invalid date interval: '${interval}'`)
        break
    }

    // Now add (or subtract) the number, using NP's built-in helper
    const newDate =
      Math.abs(daysToAdd) > 0
        ? Calendar.addUnitToDate(baseDate, 'day', daysToAdd)
        : Math.abs(monthsToAdd) > 0
        ? Calendar.addUnitToDate(baseDate, 'month', monthsToAdd)
        : Math.abs(yearsToAdd) > 0
        ? Calendar.addUnitToDate(baseDate, 'year', yearsToAdd)
        : baseDate // if nothing else, leave date the same

    return newDate
  } catch (e) {
    logError('helpers/calcOffsetDate', `${e.message} for baseDateISO '${baseDateISO}'`)
    return null
  }
}

/**
 * DEPRECATED: Calculate an offset date, as ISO Strings.
 * v2 method, using built-in NotePlan function 'Calendar.addUnitToDate(date, type, num)'
 * NB: doesn't actually use NP functions, but to avoid a circular dependency it needs to be in this file.
 * @author @jgclark
 *
 * @param {string} baseDateISO is type ISO Date (i.e. YYYY-MM-DD) - NB: different from JavaScript's Date type
 * @param {interval} string of form +nn[bdwmq] or -nn[bdwmq], where 'b' is weekday (i.e. Monday - Friday in English)
 * @returns {string} new date in ISO Date format
 */
export function calcOffsetDateStr(baseDateISO: string, interval: string): string {
  const newDate = calcOffsetDate(baseDateISO, interval)
  return newDate ? toISODateString(newDate) : ''
}

/**
 * Return quarter start and end dates for a given quarter
  // TODO: change to use date arithmetic in moment library and move to dateTime.js
 * @param {number} qtr - quarter number in year (1-4)
 * @param {number} year - year (4-digits)
 * @returns {[Date, Date]}} - start and end dates (as JS Dates)
 */
export function quarterStartEnd(qtr: number, year: number): [Date, Date] {
  // Default values are needed to account for the
  // default case of the switch statement below.
  // Otherwise, these variables will never get initialized before
  // being used.
  let startDate: Date = new Date()
  let endDate: Date = new Date()

  // Because this seems to use ISO dates, we appear to need to take timezone
  // offset into account in order to avoid landing up crossing date boundaries.
  // I.e. when in BST (=UTC+0100) it's calculating dates which are often 1 too early.
  // Get TZOffset in minutes. If positive then behind UTC; if negative then ahead.
  const TZOffset = new Date().getTimezoneOffset()

  switch (qtr) {
    case 1: {
      startDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 1, 1, 0, 0, 0), 'minute', -TZOffset)
      endDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 3, 31, 0, 0, 0), 'minute', -TZOffset)
      break
    }
    case 2: {
      startDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 4, 1, 0, 0, 0), 'minute', -TZOffset)
      endDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 6, 30, 0, 0, 0), 'minute', -TZOffset)
      break
    }
    case 3: {
      startDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 7, 1, 0, 0, 0), 'minute', -TZOffset)
      endDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 9, 30, 0, 0, 0), 'minute', -TZOffset)
      break
    }
    case 4: {
      startDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 10, 1, 0, 0, 0), 'minute', -TZOffset)
      endDate = Calendar.addUnitToDate(Calendar.dateFrom(year, 12, 31, 0, 0, 0), 'minute', -TZOffset)
      break
    }
    default: {
      console.log(`error: invalid quarter given: ${qtr}`)
      break
    }
  }
  return [startDate, endDate]
}

/**
 * Returns the user's chosen day of the week in the specified date according to UTC, where 0 represents Sunday.
 * @author @jgclark
 * @returns {number}
 */
export function getUsersFirstDayOfWeekUTC(): number {
  // Get user preference for start of week.
  // In NP this is Sunday = 1 ...Sat = 6.  Can also be undefined -> 1.
  return typeof DataStore.preference('firstDayOfWeek') === 'number' ? Number(DataStore.preference('firstDayOfWeek')) - 1 : 1
}

/**
 * Array of period types and their descriptions, as used by getPeriodStartEndDates().
 * (Not dependent on NotePlan functions, but easier to keep it with the function that uses it.)
 */
export const periodTypesAndDescriptions = [
  {
    label: 'Last Week',
    value: 'lw',
  },
  {
    label: 'This week (so far)',
    value: 'userwtd',
  },
  {
    label: 'Other Week',
    value: 'ow',
  },
  {
    label: 'Last Month',
    value: 'lm',
  },
  {
    label: 'This Month (to date)',
    value: 'mtd',
  },
  {
    label: 'Other Month',
    value: 'om',
  },
  {
    label: 'Last Quarter',
    value: 'lq',
  },
  {
    label: 'This Quarter (to date)',
    value: 'qtd',
  },
  {
    label: 'Other Quarter',
    value: 'oq',
  },
  {
    label: 'Last Year',
    value: 'ly',
  },
  {
    label: 'Year to date',
    value: 'ytd',
  },
  {
    label: 'Other Year',
    value: 'oy',
  },
]

/**
 * Get a time period from 'periodTypesAndDescriptions' (e.g. 'Last Quarter') and returns a set of details for it:
 * - {Date} start (js) date of time period
 * - {Date} end (js) date of time period
 * - {string} periodType    (e.g. 'lq' for 'Last Quarter')
 * - {string} periodString  (e.g. '2022 Q2 (Apr-June)')
 * - {string} periodPartStr (e.g. 'day 4' showing how far through we are in a partial ('... to date') time period)
 * Normally does this by asking user, unless param 'periodType' is supplied.
 * @author @jgclark
 * 
 * @param {string} question to show user
 * @param {string} periodType optional; if not provided ask user instead
 * @returns {[Date, Date, string, string, string]}
 */
export async function getPeriodStartEndDates(question: string = 'Create stats for which period?', periodTypeToUse?: string): Promise<[Date, Date, string, string, string]> {
  let periodType: string
  // If we're passed the period, then use that, otherwise ask user
  if (periodTypeToUse) {
    // It may come with surrounding quotes, so remove those
    periodType = trimAnyQuotes(periodTypeToUse)
  } else {
    // Ask user what date interval to do tag counts for
    periodType = await chooseOption(question, periodTypesAndDescriptions, 'mtd')
  }
  let fromDate: Date = new Date()
  let toDate: Date = new Date()
  let periodString = ''
  let periodPartStr = ''

  const todaysDate = new Date()
  // couldn't get const { y, m, d } = getYearMonthDate(todaysDate) to work ??
  const y = todaysDate.getFullYear()
  const m = todaysDate.getMonth() + 1 // counting from 1
  const d = todaysDate.getDate()

  // We appear to need to take timezone offset into account in order to avoid landing
  // up crossing date boundaries.
  // I.e. when in BST (=UTC+0100) it's calculating dates which are often 1 too early.
  // Get TZOffset in minutes. If positive then behind UTC; if negative then ahead.
  // TODO: ideally use moment library instead, which should make this easier
  const TZOffset = new Date().getTimezoneOffset()
  // log(pluginJson, `getPeriodStartEndDates: periodType = ${periodType}, TZOffset = ${TZOffset}.`)

  switch (periodType) {
    case 'lm': {
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(y, m, 1, 0, 0, 0), 'minute', -TZOffset) // go to start of this month
      fromDate = Calendar.addUnitToDate(fromDate, 'month', -1) // -1 month
      toDate = Calendar.addUnitToDate(fromDate, 'month', 1) // + 1 month
      toDate = Calendar.addUnitToDate(toDate, 'day', -1) // -1 day, to get last day of last month
      periodString = `${monthNameAbbrev(fromDate.getMonth() + 1)} ${y}`
      break
    }
    case 'mtd': {
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(y, m, 1, 0, 0, 0), 'minute', -TZOffset) // start of this month
      toDate = Calendar.dateFrom(y, m, d, 0, 0, 0)
      periodString = `${monthNameAbbrev(m)} ${y}`
      periodPartStr = `day ${d}`
      break
    }
    case 'om': {
      const theY = Number(await getInput(`Choose year, e.g. ${y}`, 'OK', 'Counts for Month', String(y)))
      const theM = Number(await getInput('Choose month, (1-12)', 'OK', 'Counts for Month'))
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(theY, theM, 1, 0, 0, 0), 'minute', -TZOffset) // start of this month
      toDate = Calendar.addUnitToDate(fromDate, 'month', 1) // + 1 month
      toDate = Calendar.addUnitToDate(toDate, 'day', -1) // -1 day, to get last day of last month
      periodString = `${monthNameAbbrev(theM)} ${theY}`
      break
    }

    case 'lq': {
      const thisQ = Math.floor((m - 1) / 3) + 1 // quarter 1-4
      const lastQ = thisQ > 0 ? thisQ - 1 : 4 // last quarter
      const lastY = lastQ === 4 ? y - 1 : y // change the year if we want Q4
      const [f, t] = quarterStartEnd(lastQ, lastY)
      fromDate = f
      toDate = t
      const lastQStartMonth = (lastQ - 1) * 3 + 1
      toDate = Calendar.addUnitToDate(fromDate, 'month', 3) // +1 quarter
      toDate = Calendar.addUnitToDate(toDate, 'day', -1) // -1 day, to get last day of last month
      periodString = `${lastY} Q${lastQ} (${monthNameAbbrev(lastQStartMonth)}-${monthNameAbbrev(lastQStartMonth + 2)})`
      break
    }
    case 'qtd': {
      const thisQ = Math.floor((m - 1) / 3) + 1
      const thisQStartMonth = (thisQ - 1) * 3 + 1
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(y, thisQStartMonth, 1, 0, 0, 0), 'minute', -TZOffset) // start of this quarter
      toDate = Calendar.addUnitToDate(Calendar.dateFrom(y, m, d, 0, 0, 0), 'minute', -TZOffset)
      periodString = `${y} Q${thisQ} (${monthNameAbbrev(thisQStartMonth)}-${monthNameAbbrev(thisQStartMonth + 2)})`
      periodPartStr = `(to ${todaysDateISOString})`
      break
    }
    case 'oq': {
      const theY = Number(await getInput(`Choose year, e.g. ${y}`, 'OK', 'Counts for Quarter', String(y)))
      const theQ = Number(await getInput('Choose quarter, (1-4)', 'OK', 'Counts for Quarter'))
      const theQStartMonth = (theQ - 1) * 3 + 1
      const [f, t] = quarterStartEnd(theQ, theY)
      fromDate = f
      toDate = t
      toDate = Calendar.addUnitToDate(fromDate, 'month', 3) // +1 quarter
      toDate = Calendar.addUnitToDate(toDate, 'day', -1) // -1 day, to get last day of last month
      periodString = `${theY} Q${theQ} (${monthNameAbbrev(theQStartMonth)}-${monthNameAbbrev(theQStartMonth + 2)})`
      break
    }

    case 'lw': {
      // last week, using ISO 8601 date definition, which always starts on a Monday
      let theYear = y
      const currentWeekNum = getWeek(todaysDate)
      // First deal with edge case: after start of ordinal year but before first week starts
      if (currentWeekNum === 52 && m === 1) {
        theYear -= 1
      }
      let lastWeekNum = 0
      if (currentWeekNum === 1) {
        lastWeekNum = 52
        theYear--
      } else {
        lastWeekNum = currentWeekNum - 1
      }
      ;[fromDate, toDate] = weekStartEnd(lastWeekNum, theYear)
      periodString = `${theYear}-W${lastWeekNum}`
      break
    }
    case 'userwtd': {
      // week to date from user's chosen Week Start (in app settings)
      const dayOfWeekWithSundayZero = new Date().getDay()
      // Get user preference for start of week, with Sunday = 0 ...
      const usersStartOfWeekWithSundayZero = getUsersFirstDayOfWeekUTC()
      // Work out day number (1..7) within user's week
      const dateWithinInterval = ((dayOfWeekWithSundayZero + 7 - usersStartOfWeekWithSundayZero) % 7) + 1
      logDebug('getPeriodStartEndDates()', `userwtd: dayOfWeekWithSundayZero: ${dayOfWeekWithSundayZero}, usersStartOfWeekWithSundayZero: ${usersStartOfWeekWithSundayZero}, dateWithinInterval: ${dateWithinInterval}`)
      fromDate = Calendar.addUnitToDate(Calendar.addUnitToDate(Calendar.dateFrom(y, m, d, 0, 0, 0), 'minute', -TZOffset), 'day', -(dateWithinInterval - 1))
      toDate = Calendar.addUnitToDate(fromDate, 'day', 6)
      periodString = `this week`
      periodPartStr = `day ${dateWithinInterval}`
      break
    }
    case 'wtd': {
      // week to date, using ISO 8601 date definition, which always starts on a Monday
      let theYear = y
      const currentWeekNum = getWeek(todaysDate)
      // First deal with edge case: after start of ordinal year but before first week starts
      if (currentWeekNum === 52 && m === 1) {
        theYear -= 1
      }
      // I don't know why the [from, to] construct doesn't work here, but using tempObj instead
      const tempObj = weekStartEnd(currentWeekNum, theYear)
      fromDate = tempObj[0]
      toDate = tempObj[1]
      periodString = `${theYear}-W${currentWeekNum}`
      // get ISO dayOfWeek (Monday = 1 to Sunday = 7)
      const todaysISODayOfWeek = moment().isoWeekday()
      periodPartStr = `day ${todaysISODayOfWeek}`
      logDebug('getPeriodStartEndDates()', `wtd: currentWeekNum: ${currentWeekNum}, theYear: ${theYear}, todaysISODayOfWeek: ${todaysISODayOfWeek}`)
      break
    }
    case 'ow': {
      // other week
      const theYear = Number(await getInput(`Choose year, e.g. ${y}`, 'OK', 'Counts for Week', String(y)))
      const weekNum = Number(await getInput('Choose week number, 1-53', 'OK', 'Counts for Week'))
      // I don't know why the [from, to] form doesn't work here, but using tempObj instead
      const tempObj = weekStartEnd(weekNum, theYear)
      fromDate = tempObj[0]
      toDate = tempObj[1]
      periodString = `${theYear}-W${weekNum}`
      break
    }

    case 'ly': {
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(y - 1, 1, 1, 0, 0, 0), 'minute', -TZOffset) // start of last year
      toDate = Calendar.addUnitToDate(Calendar.dateFrom(y - 1, 12, 31, 0, 0, 0), 'minute', -TZOffset) // end of last year
      periodString = `${y - 1}`
      break
    }
    case 'ytd': {
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(y, 1, 1, 0, 0, 0), 'minute', -TZOffset) // start of this year
      toDate = Calendar.addUnitToDate(Calendar.dateFrom(y, m, d, 0, 0, 0), 'minute', -TZOffset)
      periodString = `${y}`
      periodPartStr = `(to ${todaysDateISOString})`
      break
    }
    case 'oy': {
      const theYear = Number(await getInput(`Choose year, e.g. ${y}`, 'OK', 'Counts for Year', String(y)))
      fromDate = Calendar.addUnitToDate(Calendar.dateFrom(theYear, 1, 1, 0, 0, 0), 'minute', -TZOffset) // start of this year
      toDate = Calendar.addUnitToDate(Calendar.dateFrom(theYear, 12, 31, 0, 0, 0), 'minute', -TZOffset)
      periodString = `${theYear}`
      break
    }
    default: {
      periodString = `<Error: couldn't parse interval type '${periodType}'>`
    }
  }
  // log(pluginJson, `-> ${fromDate.toString()}, ${toDate.toString()}, ${periodString}, ${periodPartStr}`)
  return [fromDate, toDate, periodType, periodString, periodPartStr]
}
