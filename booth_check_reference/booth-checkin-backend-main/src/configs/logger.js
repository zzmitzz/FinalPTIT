import moment from 'moment'
import yaml from 'yaml'
import winston from 'winston'
import _ from 'lodash'
import {LOG_DIR} from './constants'

class Logger {
    #logger
    constructor() {
        const format = winston.format.printf(function (info) {
            const {level, message, ...data} = info
            let msg = moment().format('\\[YYYY-MM-DD, HH:mm:ss\\] ') + _.upperCase(level) + ': ' + message
            if (!_.isEmpty(data)) {
                msg += '\n' + yaml.stringify(data)
            }
            return msg
        })
        this.#logger = winston.createLogger({format})

        return new Proxy(this, {
            get(target, prop) {
                const fileLog = `node-${moment().format('YYYY-MM-DD')}.log`
                const [transport] = target.#logger.transports

                if (transport?.filename !== fileLog) {
                    target.#logger.configure({
                        transports: new winston.transports.File({
                            filename: fileLog,
                            dirname: LOG_DIR,
                        }),
                    })
                }

                return target.#logger[prop]
            },
        })
    }
}

export default Logger
