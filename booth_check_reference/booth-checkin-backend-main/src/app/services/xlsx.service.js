import {FIELD_TYPE, OPTION_FIELD, Registration} from '@/models'
import {generateSchema, validateAsync} from '@/utils/helpers'
import excelJs from 'exceljs'
import _ from 'lodash'
import moment from 'moment'

export async function exportTemplateXlsxFromFields(formFields) {
    const workbook = new excelJs.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')
    const header = []
    const subHeaders = []

    const hasOptionField = formFields.some(({field_type}) => Object.values(OPTION_FIELD).includes(field_type))
    for (const {field_label, required, field_type, field_options, field_has_other_option} of formFields) {
        if (field_type === FIELD_TYPE.FILE || field_type === FIELD_TYPE.FACE_ID) {
            continue
        }
        header.push(`${field_label}${required ? ' *' : ''}`)
        if (Object.values(OPTION_FIELD).includes(field_type)) {
            const addition = field_has_other_option ? field_options.length : field_options.length - 1
            header.push(..._.times(addition, _.constant('')))
        }
    }

    const headerRow = worksheet.addRow(header)

    if (hasOptionField) {
        for (const {field_type, field_options, field_has_other_option} of formFields) {
            if (field_type === FIELD_TYPE.FILE || field_type === FIELD_TYPE.FACE_ID) {
                continue
            }
            if (Object.values(OPTION_FIELD).includes(field_type)) {
                const startCol = subHeaders.length + 1
                subHeaders.push(...field_options)
                const endCol = subHeaders.length
                if (field_has_other_option) {
                    subHeaders.push('Khác')
                    worksheet.mergeCells(1, startCol, 1, endCol + 1)
                } else {
                    worksheet.mergeCells(1, startCol, 1, endCol)
                }
            } else {
                subHeaders.push(null)
            }
        }

        const subHeaderRow = worksheet.addRow(subHeaders)

        subHeaders.forEach((field, index) => {
            if (!field) {
                worksheet.mergeCells(1, index + 1, 2, index + 1)
            }
        })

        subHeaderRow.eachCell((cell) => {
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
            }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FF1155CC'},
            }
            cell.font = {color: {argb: 'FFFFFFFF'}, bold: true}
            cell.border = {
                left: {style: 'thin', color: {argb: 'FF808080'}},
                bottom: {style: 'thin', color: {argb: 'FF808080'}},
                right: {style: 'thin', color: {argb: 'FF808080'}},
            }
        })
    }

    headerRow.eachCell((cell) => {
        cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FF1155CC'},
        }
        cell.font = {color: {argb: 'FFFFFFFF'}, bold: true}
        cell.border = {
            top: {style: 'thin', color: {argb: 'FF808080'}},
            left: {style: 'thin', color: {argb: 'FF808080'}},
            bottom: {style: 'thin', color: {argb: 'FF808080'}},
            right: {style: 'thin', color: {argb: 'FF808080'}},
        }
    })

    worksheet.columns = header.map(() => ({width: 20}))
    return await workbook.xlsx.writeBuffer()
}

export async function convertXlsxToRegistrationData(form, xlsxBuffer) {
    const formFields = form.fields
    const registrationData = {
        registrations: [],
        registrationResponses: [],
    }
    const error = {}
    const emails = []
    const phones = []
    const workbook = new excelJs.Workbook()
    await workbook.xlsx.load(xlsxBuffer)
    const worksheet = workbook.getWorksheet(1)
    const hasOptionField = formFields.some(({field_type}) => Object.values(OPTION_FIELD).includes(field_type))

    for (let indexRow = hasOptionField ? 3 : 2; indexRow <= worksheet.rowCount; indexRow++) {
        const registration = new Registration({
            event_id: form.event_id,
            form_id: form._id,
        })
        registrationData.registrations.push(registration)
        let indexCell = 1
        for (const field of formFields) {
            const {field_type, field_label, field_has_other_option, field_options, is_primary_key} = field
            if (field_type === FIELD_TYPE.FILE || field_type === FIELD_TYPE.FACE_ID) {
                continue
            }
            const schema = generateSchema(field)
            const row = worksheet.getRow(indexRow)
            let response = null
            if (
                [
                    FIELD_TYPE.EMAIL,
                    FIELD_TYPE.PHONE,
                    FIELD_TYPE.TEXT,
                    FIELD_TYPE.TEXTAREA,
                    FIELD_TYPE.NUMBER,
                ].includes(field_type)
            ) {
                const cell = row.getCell(indexCell++)
                response = _.isNil(cell.text) ? '' : cell.text.trim()
                const [value, errorDetail] = await validateAsync(schema, response)
                if (errorDetail['']) {
                    error[cell.address] = errorDetail['']
                } else {
                    response = value
                    if (field_type === FIELD_TYPE.EMAIL && value) {
                        emails.push({
                            registrationId: registration._id,
                            emailAddress: value,
                        })
                    } else if (field_type === FIELD_TYPE.PHONE && is_primary_key && value) {
                        if (phones.includes(value)) {
                            error[cell.address] = 'Số điện thoại bị trùng.'
                        } else {
                            phones.push(value)
                        }
                    }
                }
            } else if (field_type === FIELD_TYPE.DATE) {
                const cell = row.getCell(indexCell++)
                if (cell.type === excelJs.ValueType.Date) {
                    response = cell.value.toISOString()
                    response = moment(response).unix()
                } else {
                    const isEmpty = _.isNil(cell.value) || (_.isString(cell.value) && _.isEmpty(cell.value))
                    response = isEmpty ? '' : cell.value
                }
                const [value, errorDetail] = await validateAsync(schema, response)
                if (errorDetail['']) {
                    error[cell.address] = errorDetail['']
                } else {
                    response = moment.unix(value).toDate()
                }
            } else if (field_type === FIELD_TYPE.TIME_MINUTE) {
                const cell = row.getCell(indexCell++)
                const isEmpty = _.isNil(cell.value)
                if (!isEmpty && cell.type === excelJs.ValueType.Date) {
                    const celValue = cell.value.toISOString()
                    const date = moment(celValue).unix()
                    const startOfDay = moment.utc(celValue).startOf('day').unix()
                    response = date - startOfDay
                } else {
                    const isEmpty = _.isNil(cell.value) || (_.isString(cell.value) && _.isEmpty(cell.value))
                    response = isEmpty ? '' : cell.value
                }
                const [value, errorDetail] = await validateAsync(schema, response)
                if (errorDetail['']) {
                    error[cell.address] = errorDetail['']
                } else {
                    response = value
                }
            } else if (field_type === FIELD_TYPE.RADIO) {
                response = ''
                for (let i = 0; i < field_options.length; i++) {
                    const cell = row.getCell(indexCell + i)
                    const cellValue = _.isNil(cell.value) ? '' : cell.value
                    if (_.isString(cellValue) && cellValue.trim().toLowerCase() === 'x') {
                        response = field_options[i]
                    } else if (!_.isString(cellValue) || cellValue.trim() !== '') {
                        error[cell.address] = `Trường ${field_label} sai định dạng.`
                    }
                }
                if (field_has_other_option) {
                    const cell = row.getCell(indexCell + field_options.length)
                    const cellValue = _.isNil(cell.value) ? '' : cell.value
                    response = _.isString(cellValue) && _.isEmpty(cellValue.trim()) ? response : cell.value
                }
                const [value, errorDetail] = await validateAsync(schema, response)
                if (errorDetail['']) {
                    const startCell = row.getCell(indexCell)
                    const endCell = row.getCell(indexCell + (field_has_other_option ? field_options.length : field_options.length - 1))
                    error[`${startCell.address}-${endCell.address}`] = errorDetail['']
                } else {
                    response = value
                }
                indexCell += field_has_other_option ? field_options.length + 1 : field_options.length
            } else if (field_type === FIELD_TYPE.CHECKBOX) {
                response = []
                for (let i = 0; i < field_options.length; i++) {
                    const cell = row.getCell(indexCell + i)
                    const cellValue = _.isNil(cell.value) ? '' : cell.value
                    if (_.isString(cellValue) && cellValue.trim().toLowerCase() === 'x') {
                        response.push(field_options[i])
                    } else if (!_.isString(cellValue) || cellValue.trim() !== '') {
                        error[cell.address] = `Trường ${field_label} sai định dạng.`
                    }
                }
                if (field_has_other_option) {
                    const cell = row.getCell(indexCell + field_options.length)
                    const cellValue = _.isNil(cell.value) ? '' : cell.value
                    if (_.isString(cellValue) && !_.isEmpty(cellValue.trim())) {
                        response.push(cellValue)
                    }
                }
                const [value, errorDetail] = await validateAsync(schema, response)
                if (errorDetail['']) {
                    const startCell = row.getCell(indexCell)
                    const endCell = row.getCell(indexCell + (field_has_other_option ? field_options.length : field_options.length - 1))
                    error[`${startCell.address}-${endCell.address}`] = errorDetail['']
                } else {
                    response = value
                }
                indexCell += field_has_other_option ? field_options.length + 1 : field_options.length
            } else {
                response = null
                indexCell++
            }
            registrationData.registrationResponses.push({
                event_id: form.event_id,
                form_id: form._id,
                registration_id: registration._id,
                position: field.position,
                is_primary_key: field.is_primary_key,
                field_label: field.field_label,
                field_description: field.field_description,
                field_type: field.field_type,
                field_options: field.field_options,
                field_has_other_option: field.field_has_other_option,
                field_range: field.field_range,
                field_extensions: field.field_extensions,
                required: field.required,
                response: _.isString(response) && _.isEmpty(response) ? null : response,
            })
        }
    }
    return {registrationData, emails, error}
}
