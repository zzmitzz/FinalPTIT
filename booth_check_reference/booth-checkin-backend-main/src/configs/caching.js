import _ from 'lodash'
import assert from 'assert'
import {FileSystemCache} from 'file-system-cache'
import {CACHE_DIR} from './constants'

class Cache {
    constructor() {
        this.basePath = CACHE_DIR
        this.hash = 'sha256'
        this.extension = 'json'
    }

    create(namespace) {
        assert(_.isString(namespace) && !_.isEmpty(namespace), new TypeError('"namespace" is required and must be a string.'))
        const options = namespace ? {ns: namespace} : {}
        Object.assign(options, this)
        const result = new FileSystemCache(options)
        return result
    }
}

export default Cache
