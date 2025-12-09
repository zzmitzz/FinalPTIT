import { LINK_STATIC_URL } from '@/configs'

/**
 * Build a static URL for a resource
 * @param {string} urlSource - The relative path stored in the database
 * @returns {string} - The full static URL
 */
export function buildStaticUrl(urlSource) {
    if (!urlSource) {
        return null
    }

    // If it's already a full URL (http/https), return as is
    if (urlSource.startsWith('http://') || urlSource.startsWith('https://')) {
        return urlSource
    }

    // Build the static URL by combining base URL with the path
    return `${LINK_STATIC_URL}${urlSource}`
}

/**
 * Transform resource object to include full static URL in url_source
 * @param {Object} resource - The resource object
 * @returns {Object} - Resource with transformed url_source
 */
export function transformResourceUrl(resource) {
    if (!resource) {
        return resource
    }

    const resourceData = resource.toJSON ? resource.toJSON() : resource

    return {
        ...resourceData,
        url_source: buildStaticUrl(resourceData.url_source)
    }
}

/**
 * Transform array of resources to include full static URLs in url_source
 * @param {Array} resources - Array of resource objects
 * @returns {Array} - Resources with transformed url_source
 */
export function transformResourceUrlList(resources) {
    if (!Array.isArray(resources)) {
        return resources
    }

    return resources.map(resource => transformResourceUrl(resource))
}
