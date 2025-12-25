import parser from 'cron-parser'
import moment from 'moment-timezone'

/**
 * Validate cron pattern
 * @param {string} cronPattern - Cron pattern (e.g., "0 9 * * 1")
 * @returns {boolean}
 */
export function isValidCronPattern(cronPattern) {
    try {
        parser.parseExpression(cronPattern)
        return true
    } catch (error) {
        return false
    }
}

/**
 * Get next execution time from cron pattern
 * @param {string} cronPattern - Cron pattern
 * @param {string} timezone - Timezone (default: UTC)
 * @param {Date} currentDate - Current date (optional)
 * @returns {Date|null}
 */
export function getNextExecutionTime(cronPattern, timezone = 'UTC', currentDate = new Date()) {
    try {
        const interval = parser.parseExpression(cronPattern, {
            currentDate,
            tz: timezone,
        })
        return interval.next().toDate()
    } catch (error) {
        console.error('Error getting next execution time:', error)
        return null
    }
}

/**
 * Get next N execution times
 * @param {string} cronPattern - Cron pattern
 * @param {number} count - Number of next executions to get
 * @param {string} timezone - Timezone
 * @returns {Date[]}
 */
export function getNextExecutionTimes(cronPattern, count = 5, timezone = 'UTC') {
    try {
        const interval = parser.parseExpression(cronPattern, {
            currentDate: new Date(),
            tz: timezone,
        })

        const times = []
        for (let i = 0; i < count; i++) {
            times.push(interval.next().toDate())
        }
        return times
    } catch (error) {
        console.error('Error getting next execution times:', error)
        return []
    }
}

/**
 * Check if cron should execute now
 * @param {string} cronPattern - Cron pattern
 * @param {Date} lastSentAt - Last execution time
 * @param {string} timezone - Timezone
 * @returns {boolean}
 */
export function shouldExecuteNow(cronPattern, lastSentAt = null, timezone = 'UTC') {
    try {
        const now = moment().tz(timezone)
        const currentMinute = now.format('YYYY-MM-DD HH:mm')

        // If never sent, check if current time matches pattern
        if (!lastSentAt) {
            const interval = parser.parseExpression(cronPattern, {
                currentDate: now.clone().subtract(1, 'minute').toDate(),
                tz: timezone,
            })
            const nextExecution = moment(interval.next().toDate()).tz(timezone)
            const nextMinute = nextExecution.format('YYYY-MM-DD HH:mm')

            return currentMinute === nextMinute
        }

        // If sent before, check if next execution time has passed
        const interval = parser.parseExpression(cronPattern, {
            currentDate: lastSentAt,
            tz: timezone,
        })
        const nextExecution = moment(interval.next().toDate()).tz(timezone)

        // Execute if current time is >= next execution time (within the same minute)
        return now.isSameOrAfter(nextExecution, 'minute')
    } catch (error) {
        console.error('Error checking cron execution:', error)
        return false
    }
}

/**
 * Convert cron pattern to human-readable description
 * @param {string} cronPattern - Cron pattern (e.g., "0 9 * * 1")
 * @param {string} timezone - Timezone for display
 * @returns {string} Human-readable description
 */
export function cronToHumanReadable(cronPattern, timezone = 'UTC') {
    try {
        const parts = cronPattern.trim().split(/\s+/)
        if (parts.length !== 5) {
            return 'Invalid cron pattern'
        }

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

        // Build description
        let description = ''
        let timeStr = ''

        // Time part (minute and hour)
        if (hour !== '*' && minute !== '*') {
            const hourNum = parseInt(hour)
            const minuteNum = parseInt(minute)
            timeStr = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`
        } else if (hour !== '*') {
            timeStr = `every minute at hour ${hour}`
        } else if (minute !== '*') {
            timeStr = `at minute ${minute} of every hour`
        } else {
            timeStr = 'every minute'
        }

        // Frequency part
        if (dayOfWeek !== '*') {
            // Weekly pattern
            const days = parseDayOfWeek(dayOfWeek)
            description = `Every ${days.join(', ')} at ${timeStr}`
        } else if (dayOfMonth !== '*') {
            // Monthly pattern
            if (dayOfMonth.includes(',')) {
                description = `On days ${dayOfMonth} of every month at ${timeStr}`
            } else if (dayOfMonth.includes('-')) {
                description = `From day ${dayOfMonth} of every month at ${timeStr}`
            } else {
                description = `On day ${dayOfMonth} of every month at ${timeStr}`
            }
        } else if (month !== '*') {
            // Specific months
            const months = parseMonth(month)
            description = `Every day in ${months.join(', ')} at ${timeStr}`
        } else if (hour !== '*' && minute !== '*') {
            // Daily pattern
            description = `Every day at ${timeStr}`
        } else if (hour !== '*') {
            // Hourly at specific hour
            description = `Every hour ${hour}, ${timeStr}`
        } else {
            // Every minute or complex pattern
            description = `Runs ${timeStr}`
        }

        // Add timezone if not UTC
        if (timezone !== 'UTC') {
            description += ` (${timezone})`
        }

        return description
    } catch (error) {
        console.error('Error converting cron to readable:', error)
        return 'Unable to parse cron pattern'
    }
}

/**
 * Parse day of week from cron pattern
 * @param {string} dayOfWeek - Day of week part (0-6 or SUN-SAT)
 * @returns {string[]}
 */
function parseDayOfWeek(dayOfWeek) {
    const dayMap = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday', // Some systems use 7 for Sunday
    }

    if (dayOfWeek === '*') return ['day']

    const days = dayOfWeek.split(',').map((d) => {
        const dayNum = parseInt(d.trim())
        return dayMap[dayNum] || d
    })

    return days
}

/**
 * Parse month from cron pattern
 * @param {string} month - Month part (1-12)
 * @returns {string[]}
 */
function parseMonth(month) {
    const monthMap = {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December',
    }

    if (month === '*') return ['every month']

    const months = month.split(',').map((m) => {
        const monthNum = parseInt(m.trim())
        return monthMap[monthNum] || m
    })

    return months
}

/**
 * Get common cron patterns with descriptions
 * @returns {Object[]} Array of common patterns
 */
export function getCommonCronPatterns() {
    return [
        {
            pattern: '0 9 * * *',
            description: 'Every day at 9:00 AM',
            category: 'Daily',
        },
        {
            pattern: '0 12 * * *',
            description: 'Every day at 12:00 PM (noon)',
            category: 'Daily',
        },
        {
            pattern: '0 18 * * *',
            description: 'Every day at 6:00 PM',
            category: 'Daily',
        },
        {
            pattern: '0 9 * * 1',
            description: 'Every Monday at 9:00 AM',
            category: 'Weekly',
        },
        {
            pattern: '0 9 * * 1-5',
            description: 'Every weekday (Mon-Fri) at 9:00 AM',
            category: 'Weekly',
        },
        {
            pattern: '0 9 * * 0',
            description: 'Every Sunday at 9:00 AM',
            category: 'Weekly',
        },
        {
            pattern: '0 9 1 * *',
            description: 'First day of every month at 9:00 AM',
            category: 'Monthly',
        },
        {
            pattern: '0 9 15 * *',
            description: 'On the 15th of every month at 9:00 AM',
            category: 'Monthly',
        },
        {
            pattern: '0 * * * *',
            description: 'Every hour (at minute 0)',
            category: 'Hourly',
        },
        {
            pattern: '*/15 * * * *',
            description: 'Every 15 minutes',
            category: 'Frequent',
        },
        {
            pattern: '*/30 * * * *',
            description: 'Every 30 minutes',
            category: 'Frequent',
        },
        {
            pattern: '0 0 * * *',
            description: 'Every day at midnight',
            category: 'Daily',
        },
    ]
}

/**
 * Validate and get cron info
 * @param {string} cronPattern - Cron pattern
 * @param {string} timezone - Timezone
 * @returns {Object} Validation result with human-readable info
 */
export function validateAndDescribeCron(cronPattern, timezone = 'UTC') {
    const isValid = isValidCronPattern(cronPattern)

    if (!isValid) {
        return {
            isValid: false,
            error: 'Invalid cron pattern',
            description: null,
            nextExecutions: [],
        }
    }

    const description = cronToHumanReadable(cronPattern, timezone)
    const nextExecutions = getNextExecutionTimes(cronPattern, 5, timezone)

    return {
        isValid: true,
        error: null,
        description,
        nextExecutions,
        pattern: cronPattern,
        timezone,
    }
}
