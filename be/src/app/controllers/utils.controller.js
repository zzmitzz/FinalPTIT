import debug from 'debug'

const log = debug('app:utils-controller')

// Simple in-memory cache to avoid repeated requests
const geocodeCache = new Map()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Rate limiting: track last request time
const lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests

export async function reverseGeocode(req, res) {
    try {
        const lat = req.query.lat
        const lon = req.query.lon || req.query.lng

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Missing lat or lon parameter' })
        }

        const latNum = Number(lat)
        const lonNum = Number(lon)
        if (!isFinite(latNum) || !isFinite(lonNum)) {
            return res.status(400).json({ success: false, message: 'Invalid lat or lon' })
        }

        // Validate coordinate ranges
        if (latNum < -90 || latNum > 90) {
            return res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90' })
        }
        if (lonNum < -180 || lonNum > 180) {
            return res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180' })
        }

        // Use OpenStreetMap Nominatim reverse geocoding
        const params = new URLSearchParams({
            format: 'jsonv2',
            lat: String(latNum),
            lon: String(lonNum),
            'accept-language': 'vi',
            addressdetails: '1',
        })
        const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`

        // Nominatim requires a valid User-Agent and Referer header
        // Use a descriptive User-Agent that identifies your application
        const headers = {
            'User-Agent': 'FinalPTIT-Conference-Platform/1.0 (Event Management System)',
            Referer: 'https://github.com/zzmitzz/FinalPTIT',
        }

        log('Requesting Nominatim:', url)
        const resp = await fetch(url, { headers })
        const txt = await resp.text()

        if (!resp.ok) {
            log('nominatim error', resp.status, txt)
            return res
                .status(502)
                .json({ success: false, message: 'Reverse geocode provider error', details: txt })
        }

        let payload
        try {
            payload = JSON.parse(txt)
        } catch (e) {
            log('Failed to parse Nominatim response:', txt)
            return res.status(502).json({ success: false, message: 'Invalid response from geocode provider' })
        }

        // Check if Nominatim returned an error
        if (payload.error) {
            log('Nominatim returned error:', payload.error)
            return res.status(404).json({ success: false, message: payload.error })
        }

        // Normalize response
        const result = {
            display_name: payload.display_name || null,
            address: payload.address || null,
            lat: payload.lat || String(latNum),
            lon: payload.lon || String(lonNum),
            raw: payload,
        }

        log('Reverse geocode successful:', result.display_name)
        return res.json({ success: true, data: result })
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        log('reverseGeocode error', msg)
        return res.status(500).json({ success: false, message: msg })
    }
}

export default { reverseGeocode }
