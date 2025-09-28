import _ from 'lodash'
import statuses from 'statuses'
import assert from 'assert'
import {APP_DIR, NODE_MODULES_DIR, STATUS_DEFAULT_MESSAGE} from '@/configs'
import {AxiosError} from 'axios'

export function normalizeError(error) {
    assert(_.isError(error), new TypeError('"error" is required and must be an error.'))
    const re = new RegExp(_.escapeRegExp(APP_DIR) + '(.*?)' + '\\)', 'g')
    let stack = error.stack ? error.stack.match(re) : error.stack
    stack = _.isArray(stack)
        ? stack.map((s) => s.slice(0, -1)).filter((s) => !s.startsWith(NODE_MODULES_DIR))
        : stack
    let response
    if (error instanceof AxiosError && error.response) {
        response = {
            status: error.response.status,
            data: error.response.data,
        }
    }
    return {
        name: error.name || 'Error',
        message: error.message || `${error}`,
        response,
        stack,
    }
}

export function abort(statusCode, message, detail) {
    const msg = statuses(statusCode)
    assert(
        statusCode >= 400,
        new TypeError(`Invalid response status: ${statusCode}. Please use error status code!`)
    )

    if (_.isObject(message) && _.isUndefined(detail)) {
        [detail, message] = [message, detail]
    }
    assert(_.isNil(message) || _.isString(message), new TypeError('"message" must be a string.'))

    if (!_.isString(message)) {
        message = STATUS_DEFAULT_MESSAGE[statusCode] ?? msg
    }
    const error = new Error(message)
    error.status = statusCode
    error.detail = detail
    throw error
}
