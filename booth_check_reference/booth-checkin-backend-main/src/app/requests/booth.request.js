import {CRYPTO_TYPE} from '@/configs'
import {EVENT_CHECK_IN_TYPE, EVENT_STATUS, Event, Registration} from '@/models'
import {AsyncValidate} from '@/utils/classes'
import {decrypt} from '@/utils/helpers'
import Joi from 'joi'
import _ from 'lodash'
import * as faceRecognizeService from '../services/third-party/face-recognize.service'
import {isValidObjectId} from 'mongoose'

export const readEvent = Joi.object({
    pin_code: Joi.string()
        .trim()
        .pattern(/^\d+$/)
        .required()
        .label('Mã PIN')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const event = await Event.findOne({
                        pin_code: value,
                        deleted: false,
                    })
                    if (!event) return helpers.message('Sự kiện không tồn tại.')
                    if (event.is_locked) return helpers.message('Sự kiện đã bị khoá.')
                    if (event.status !== EVENT_STATUS.APPROVED)
                        return helpers.message('Sự kiện chưa được phê duyệt.')
                    req.event = event
                    return value
                })
        ),
})


export const confirmAttendances = Joi.object({


    check_in_by: Joi.string()
        .trim()
        .valid(...Object.values(EVENT_CHECK_IN_TYPE))
        .required()
        .label('Loại check-in'),
    list_hashed_str: Joi.any()
        .when('check_in_by', {
            is: Joi.valid(EVENT_CHECK_IN_TYPE.QR_CODE).required(),
            then: Joi.string()
                .label('Mã QR')
                .custom(function (value, helpers) {
                    const registrationId = decrypt(value, CRYPTO_TYPE.QR_CODE)
                    if (_.isUndefined(registrationId)) {
                        return helpers.error('any.invalid')
                    }
                    return new AsyncValidate(value, async function (req) {
                        const member = await Registration.findOne({
                            _id: registrationId,
                            event_id: req.event._id,
                        })
                        req.member = member
                        return member ? value : helpers.error('any.invalid')
                    })
                }),
            otherwise: Joi.any().when('check_in_by', {
                is: Joi.valid(EVENT_CHECK_IN_TYPE.FACE_ID).required(),
                then: Joi.array().items(Joi.string())
                    .label('Mã base64')
                    .custom(function (value, helpers) {
                        return new AsyncValidate(value, async function (req) {
                            const {success, errorCode, results} =
                                await faceRecognizeService.multiFaceRecognise(req.event, value)
                            if(success && results){
                                const proccessedResults = []
                                await Promise.all(results.map(async (item, index) => {
                                    if(item.status === 200){
                                        const member = await Registration.findOne({
                                            _id: item.id,
                                            event_id: req.event._id,
                                        })
                                        proccessedResults.push(
                                            {
                                                status: item.status,
                                                id: item.id,
                                                registration: member,
                                                msg: 'Ngon',
                                                index: index
                                            }
                                        )
                                    }
                                    else{
                                        const {API_ERROR_CODE} = faceRecognizeService
                                        let msg
                                        switch(item.status){
                                            case API_ERROR_CODE.NO_FACE_FOUND:
                                                msg = 'Không có khuôn mặt nào được nhận diện.'
                                                break
                                            case API_ERROR_CODE.NO_RESULTS_FOUND:
                                                msg = 'Không tìm thấy khuôn mặt trong hệ thống.'
                                                break
                                            default:
                                                msg = 'Hình ảnh không hợp lệ.'
                                                break
                                        }
                                        proccessedResults.push(
                                            {
                                                status: item.status,
                                                msg: msg,
                                                index: index
                                            }
                                        )
                                    }
                                }))
                                req.proccessedResults = proccessedResults
                                return proccessedResults
                            }
                            // if (success && results) {
                            //     const members = await Registration.find({
                            //         _id: {$in: registrationIds},
                            //         event_id: req.event._id,
                            //     })
                            //     req.members = members
                            //     console.log(members)
                            //     return value
                            // } else if (errorCode) {
                            //     const {API_ERROR_CODE} = faceRecognizeService
                            //     let msg
                            //     switch (errorCode) {
                            //         case API_ERROR_CODE.NO_FACE_FOUND:
                            //             msg = 'Không có khuôn mặt nào được nhận diện.'
                            //             break
                            //         case API_ERROR_CODE.NO_RESULTS_FOUND:
                            //             msg = 'Không tìm thấy khuôn mặt trong hệ thống.'
                            //             break
                            //         default:
                            //             msg = 'Hình ảnh không hợp lệ.'
                            //             break
                            //     }
                            //     return helpers.message(msg)
                            // }
                            return helpers.error('any.invalid')
                        })
                    }),
                otherwise: Joi.any().strip(),
            }),
        })
        .required(),
})


export const confirmAttendance = Joi.object({
    check_in_by: Joi.string()
        .trim()
        .valid(...Object.values(EVENT_CHECK_IN_TYPE))
        .required()
        .label('Loại check-in'),
    hashed_str: Joi.any()
        .when('check_in_by', {
            is: Joi.valid(EVENT_CHECK_IN_TYPE.QR_CODE).required(),
            then: Joi.string()
                .label('Mã QR')
                .custom(function (value, helpers) {
                    const registrationId = decrypt(value, CRYPTO_TYPE.QR_CODE)
                    if (_.isUndefined(registrationId)) {
                        return helpers.error('any.invalid')
                    }
                    return new AsyncValidate(value, async function (req) {
                        const member = await Registration.findOne({
                            _id: registrationId,
                            event_id: req.event._id,
                        })
                        req.member = member
                        return member ? value : helpers.error('any.invalid')
                    })
                }),
            otherwise: Joi.any().when('check_in_by', {
                is: Joi.valid(EVENT_CHECK_IN_TYPE.FACE_ID).required(),
                then: Joi.string()
                    .label('Mã base64')
                    .custom(function (value, helpers) {
                        return new AsyncValidate(value, async function (req) {
                            const {success, errorCode, registrationId} =
                                await faceRecognizeService.faceRecognize(req.event, value)
                            if (success && registrationId) {
                                const member = await Registration.findOne({
                                    _id: registrationId,
                                    event_id: req.event._id,
                                })
                                if (member) {
                                    req.member = member
                                    return value
                                }
                            } else if (errorCode) {
                                const {API_ERROR_CODE} = faceRecognizeService
                                let msg
                                switch (errorCode) {
                                    case API_ERROR_CODE.NO_FACE_FOUND:
                                        msg = 'Không có khuôn mặt nào được nhận diện.'
                                        break
                                    case API_ERROR_CODE.NO_RESULTS_FOUND:
                                        msg = 'Không tìm thấy khuôn mặt trong hệ thống.'
                                        break
                                    default:
                                        msg = 'Hình ảnh không hợp lệ.'
                                        break
                                }
                                return helpers.message(msg)
                            }
                            return helpers.error('any.invalid')
                        })
                    }),
                otherwise: Joi.any().strip(),
            }),
        })
        .required(),
})

export const grantPrize = Joi.object({
    registration_id: Joi.string()
        .trim()
        .required()
        .label('Người đăng ký')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            return new AsyncValidate(value, async function (req) {
                const registration = await Registration.findOne({
                    _id: value,
                    event_id: req.event._id,
                }).populate({
                    path: 'prizes',
                    populate: 'prize',
                })
                if (!registration) {
                    return helpers.error('any.invalid')
                }
                req.registration = registration
                return value
            })
        }),
})
