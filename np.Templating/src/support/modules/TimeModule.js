import moment from 'moment/min/moment-with-locales'
import { getUserLocale } from 'get-user-locale'

export default class TimeModule {
  constructor(config) {
    this.config = config

    let osLocale = getUserLocale()
    if (this.config?.locale?.length > 0) {
      osLocale = this.config?.locale
    }

    moment.locale(osLocale)
  }

  format(format = '', date = '') {
    let dateValue = date.length > 0 ? date : new Date()
    const configFormat = this.config?.defaultFormats?.time || 'HH:mm A'
    format = format.length > 0 ? format : configFormat

    if (date instanceof Date) {
      return moment(date).format(format)
    } else {
      dateValue = new Date(date).toLocaleString()
      return moment(new Date(dateValue)).format(format)
    }
  }

  now(format = '', offset = '') {
    const locale = this.config?.locale || 'en-US'
    const configFormat = this.config?.defaultFormats?.time || 'HH:mm A'

    format = format.length > 0 ? format : configFormat
    let formattedTime = moment(new Date()).format(format)

    if (format === 'short' || format === 'medium' || format === 'long' || format === 'full') {
      formattedTime = new Intl.DateTimeFormat(locale, { timeStyle: format }).format(new Date())
    }

    return this.isValid(formattedTime)
  }

  isValid(timeObj = null) {
    return timeObj
    // return timeObj && moment(timeObj).isValid() ? timeObj : 'INVALID_TIME_FORMAT'
  }
}
