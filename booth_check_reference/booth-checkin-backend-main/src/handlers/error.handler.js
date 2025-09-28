import _ from 'lodash'
import statuses from 'statuses'
import chalk from 'chalk'
import {APP_DEBUG, STATUS_DEFAULT_MESSAGE, logger} from '@/configs'
import {normalizeError} from '@/utils/helpers'

function errorHandler(err, req, res, next) {
    if (err instanceof Error) {
        const success = false
        let status = err.status || err.statusCode
        if (status) {
            res.status(status).json({
                status,
                success,
                message: err.message,
                detail: err.detail,
            })
            return
        }

        status = 500
        const message = STATUS_DEFAULT_MESSAGE[status] ?? statuses(status)
        res.status(status).json({
            status,
            success,
            message,
        })

        const detail = normalizeError(err)
        console.error(chalk.redBright(detail.name + ': ' + detail.message))
        if (_.isArray(detail.stack)) {
            const stack = detail.stack.map((s) => '- ' + s).join('\n')
            console.error(chalk.redBright(stack))
        }
        if (APP_DEBUG) return

        logger.error({
            request: {
                method: req.method,
                originalUrl: req.originalUrl,
                headers: req.headers,
                body: req.body,
            },
            ...detail,
        })

        return
    }

    res.sendStatus(500)
    next(err)
}

export default errorHandler
