import axios, {AxiosError} from 'axios'
import {FACE_RECOGNIZE_API_KEY, FACE_RECOGNIZE_API_URL} from '@/configs'
import _ from 'lodash'

export const faceRecognizeAxios = axios.create({
    baseURL: `${FACE_RECOGNIZE_API_URL}/api`,
    headers: {
        'X-API-Key': FACE_RECOGNIZE_API_KEY,
    },
})

export const API_ERROR_CODE = {
    NO_FACE_FOUND: 402,
    IMAGE_INVALID_FORMAT: 403,
    NO_RESULTS_FOUND: 406,
    DUPLICATE_USER_REGISTRATION: 407,
}

export async function addUser(data) {
    try {
        await faceRecognizeAxios.post('/add_user', data)
        return false
    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
            const code = _.get(error, 'response.data.detail.error')
            if (
                _.isNumber(code) &&
                [
                    API_ERROR_CODE.NO_FACE_FOUND,
                    API_ERROR_CODE.IMAGE_INVALID_FORMAT,
                    API_ERROR_CODE.DUPLICATE_USER_REGISTRATION,
                ].includes(code)
            )
                return code
        }
        throw error
    }
}

export async function faceRecognize(event, avatarBase64Str) {
    try {
        const response = await faceRecognizeAxios.post('/face_recognize', {
            event_id: event._id,
            avatar_checkin_base64: avatarBase64Str,
        })
        return {
            success: true,
            registrationId: response.data?.id,
        }
    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
            const errorCode = _.get(error, 'response.data.detail.error')
            if (
                _.isNumber(errorCode) &&
                [
                    API_ERROR_CODE.NO_FACE_FOUND,
                    API_ERROR_CODE.IMAGE_INVALID_FORMAT,
                    API_ERROR_CODE.NO_RESULTS_FOUND,
                ].includes(errorCode)
            )
                return {
                    success: false,
                    errorCode,
                }
        }
        throw error
    }
}

export async function multiFaceRecognise(event, listAvatarBase64Str) {
    try {
        const response = await faceRecognizeAxios.post('/stack_faces_recognition', {
            event_id: event._id,
            list_faces_checkin_base64: listAvatarBase64Str,
        })
        const listResponse = response.data
        const processedResults = listResponse.map(item => {
            if (item.status === 200) {
                return {
                    status: item.status,
                    id: item.id
                }
            }
            return {
                status: item.status
            }
        })

        return {
            success: true,
            results: processedResults
        }
    } catch (error) {
        
        console.log(error)
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
            const errorCode = _.get(error, 'response.data.detail.error')
            if (
                _.isNumber(errorCode) &&
                [
                    API_ERROR_CODE.NO_FACE_FOUND,
                    API_ERROR_CODE.IMAGE_INVALID_FORMAT,
                    API_ERROR_CODE.NO_RESULTS_FOUND,
                ].includes(errorCode)
            )
                return {
                    success: false,
                    errorCode,
                }
        }
        throw error
    }
}