import _ from 'lodash'
import {FileUpload} from '../utils/classes'

function formDataHandler(req, res, next) {
    const files = req.files

    if (files) {
        for (let file of files) {
            const rawField = file.fieldname
            const uploaded = new FileUpload(file)

            // Handle bracket notation: e.g. speakers[0][photo_url]
            const bracketMatch = rawField.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/)
            if (bracketMatch) {
                const base = bracketMatch[1]
                const idx = parseInt(bracketMatch[2], 10)
                const prop = bracketMatch[3]

                if (!_.isArray(req.body[base])) req.body[base] = []
                if (!req.body[base][idx]) req.body[base][idx] = {}
                req.body[base][idx][prop] = uploaded
                continue
            }

            // Fallback: existing behavior for flat fieldnames
            const fieldname = rawField

            if (_.isUndefined(req.body[fieldname])) {
                req.body[fieldname] = uploaded
            } else {
                if (_.isArray(req.body[fieldname])) {
                    req.body[fieldname].push(uploaded)
                } else {
                    req.body[fieldname] = [req.body[fieldname], uploaded]
                }
            }
        }

        delete req.files
    }

    next()
}

export default formDataHandler
