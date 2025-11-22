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

        // After attaching uploaded files into req.body (e.g. req.body.speakers[0].photo_url = FileUpload),
        // if client also sent a speakers_json field (stringified array of speaker metadata),
        // merge the parsed metadata with the file-only entries so downstream validators
        // (which run as route middleware) see a unified `req.body.speakers` array.
        if (req.body && req.body.speakers_json) {
            try {
                const parsed = JSON.parse(req.body.speakers_json)
                if (Array.isArray(parsed)) {
                    // Ensure req.body.speakers is an array
                    if (!Array.isArray(req.body.speakers)) req.body.speakers = []
                    // Merge each parsed speaker object with any file-only entry produced earlier
                    for (let i = 0; i < parsed.length; i++) {
                        const meta = parsed[i] || {}
                        const fileEntry = req.body.speakers[i] || {}
                        // Prefer metadata fields, but keep fileEntry.photo_url (FileUpload) if present
                        req.body.speakers[i] = {
                            ...meta,
                            ...fileEntry,
                        }
                    }
                }
            } catch (err) {
                // If parsing fails, leave req.body.speakers as-is (file-only entries)
                // downstream handlers will handle validation/error reporting.
                // Do not throw here.
            }
        }

        delete req.files
    }

    next()
}

export default formDataHandler
