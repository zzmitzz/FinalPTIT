import assert from 'assert'
import _ from 'lodash'
import statuses from 'statuses'
import {STATUS_DEFAULT_MESSAGE} from '@/configs'

function jsonify(data, message) {
    const status = this.statusCode || 200
    assert(status >= 200 && status <= 300, new TypeError(`Invalid response status: ${status}. Please use success status code!`))

    if (_.isString(data) && _.isUndefined(message)) {
        [message, data] = [data, message]
    }
    assert(_.isNil(message) || _.isString(message), new TypeError('"message" must be a string.'))

    const success = true
    if (!_.isString(message)) {
        message = STATUS_DEFAULT_MESSAGE[status] ?? statuses(status)
    }
    return this.json({status, success, message, data})
}

export default jsonify
