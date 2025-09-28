import * as eventRequest from '@/app/requests/organizer/event.request'
import * as eventMiddleware from '@/app/middleware/organizer/event.middleware'
import * as eventController from '@/app/controllers/organizer/event.controller'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-organizer-authentication'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'
import validate from '@/app/middleware/common/validate'
import {EVENT_MINI_GAME} from '@/models'
import * as lwprizeMiddleware from '@/app/middleware/organizer/lwprize.middleware'
import * as emailTemplateRequest from '@/app/requests/organizer/email-template.request'
import * as emailTemplateMiddleware from '@/app/middleware/organizer/email-template.middleware'
import * as emailTemplateController from '@/app/controllers/organizer/email-template.controller'
import * as emailSendMiddleware from '@/app/middleware/organizer/email.send.middleware'

const eventRouter = Router()

/**
 * @swagger
 * tags:
 *   name: OrganizerEvent
 *   description: API endpoints for organizers to manage events
 */

eventRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events for the organizer
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *       401:
 *         description: Unauthorized
 */
eventRouter.get('/', asyncHandler(validate(eventRequest.readRoot)), asyncHandler(eventController.readRoot))

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
eventRouter.post(
    '/',
    asyncHandler(validate(eventRequest.createItem)),
    asyncHandler(eventController.createItem)
)

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.put(
    '/:eventId',
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.canUpdateEvent,
    asyncHandler(validate(eventRequest.updateItem)),
    asyncHandler(eventController.updateItem)
)

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.delete(
    '/:eventId',
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.canDeleteEvent,
    asyncHandler(eventController.deleteItem)
)

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.readItem)
)

/**
 * @swagger
 * /events/{eventId}/form:
 *   put:
 *     summary: Save form for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                     required:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Form saved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.put(
    '/:eventId/form',
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.canUpdateForm,
    asyncHandler(validate(eventRequest.saveFormForEvent)),
    asyncHandler(eventController.saveFormForEvent)
)

/**
 * @swagger
 * /events/{eventId}/public-form:
 *   patch:
 *     summary: Make event form public
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Form made public successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.patch(
    '/:eventId/public-form',
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.canUpdateForm,
    asyncHandler(eventMiddleware.canPublicForm),
    asyncHandler(eventController.publicEventForm)
)

/**
 * @swagger
 * /events/{eventId}/export-template-excel-file:
 *   get:
 *     summary: Export template Excel file for registrations
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Excel template exported successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/export-template-excel-file',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventMiddleware.canExportTemplateExcelFile),
    asyncHandler(eventController.exportTemplateExcelFile)
)

/**
 * @swagger
 * /events/{eventId}/upload-registration-data:
 *   post:
 *     summary: Upload registration data from Excel file
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file with registration data
 *     responses:
 *       200:
 *         description: Registration data uploaded successfully
 *       400:
 *         description: Invalid file or data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.post(
    '/:eventId/upload-registration-data',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventMiddleware.canUploadRegistrationExcelData),
    asyncHandler(validate(eventRequest.uploadRegistrationExcelData)),
    asyncHandler(eventMiddleware.validateRegistrationExcelData),
    asyncHandler(eventController.uploadRegistrationExcelData)
)

/**
 * @swagger
 * /events/{eventId}/registrations:
 *   get:
 *     summary: Get registrations for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/registrations',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.readRegistrations)),
    asyncHandler(eventController.readRegistrations)
)

/**
 * @swagger
 * /events/{eventId}/registrations/{registrationId}/response:
 *   patch:
 *     summary: Update registration response
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The updated registration response data
 *     responses:
 *       200:
 *         description: Registration response updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or registration not found
 */
eventRouter.patch(
    '/:eventId/registrations/:registrationId/response',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventMiddleware.verifyRegistrationId),
    asyncHandler(validate(eventRequest.updateRegistrationResponse)),
    asyncHandler(eventController.updateRegistrationResponse)
)

/**
 * @swagger
 * /events/{eventId}/registrations/{registrationId}/vip:
 *   patch:
 *     summary: Update registration VIP status
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_vip:
 *                 type: boolean
 *                 description: Whether the registrant is a VIP or not
 *             required:
 *               - is_vip
 *     responses:
 *       200:
 *         description: Registration VIP status updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or registration not found
 */
eventRouter.patch(
    '/:eventId/registrations/:registrationId/vip',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventMiddleware.verifyRegistrationId),
    asyncHandler(validate(eventRequest.updateRegistrationVIP)),
    asyncHandler(eventController.updateRegistrationVIP)
)

/**
 * @swagger
 * /events/{eventId}/mini-game/{MINI_GAME_CODE}:
 *   get:
 *     summary: Get prizes of a mini game for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: MINI_GAME_CODE
 *         required: true
 *         schema:
 *           type: string
 *         description: The mini game code
 *     responses:
 *       200:
 *         description: Prizes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or mini game not found
 */
eventRouter.get(
    `/:eventId/mini-game/:MINI_GAME_CODE(${Object.values(EVENT_MINI_GAME).join('|')})`,
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.checkMiniGameCode,
    asyncHandler(eventController.readPrizesOfEvent)
)

/**
 * @swagger
 * /events/{eventId}/mini-game:
 *   post:
 *     summary: Update mini game settings for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               miniGameCode:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Mini game settings updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.post(
    '/:eventId/mini-game',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.updateMiniGameSetting)),
    asyncHandler(eventController.updateMiniGameSetting)
)

/**
 * @swagger
 * /events/{eventId}/mini-game/{MINI_GAME_CODE}/sort:
 *   patch:
 *     summary: Sort prizes of a mini game
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: MINI_GAME_CODE
 *         required: true
 *         schema:
 *           type: string
 *         description: The mini game code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prizeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of prize IDs in the desired order
 *     responses:
 *       200:
 *         description: Prizes sorted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or mini game not found
 */
eventRouter.patch(
    `/:eventId/mini-game/:MINI_GAME_CODE(${Object.values(EVENT_MINI_GAME).join('|')})/sort`,
    asyncHandler(eventMiddleware.verifyEventId),
    eventMiddleware.checkMiniGameCode,
    asyncHandler(validate(eventRequest.sortPrize)),
    asyncHandler(eventController.sortPrize)
)

/*
 - CRUD prizes
   
*/

/**
 * @swagger
 * /events/{eventId}/upload-prizes:
 *   post:
 *     summary: Create a new prize for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: The prize image file (e.g., jpeg, png).
 *               availability:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Prize created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.post(
    '/:eventId/upload-prizes',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.lwUploadPrize)),
    asyncHandler(eventController.lwCreatePrize)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel-prizes:
 *   get:
 *     summary: Get all prizes for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: List of prizes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The prize ID
 *                   event_id:
 *                     type: string
 *                     description: The event ID
 *                   name:
 *                     type: string
 *                     description: The prize name
 *                   picture:
 *                     type: string
 *                     description: The prize picture URL
 *                   availability:
 *                     type: boolean
 *                     description: The prize availability
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/lucky-wheel-prizes',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.lwReadPrizesOfEvent)
)

/**
 * @swagger
 * /events/{eventId}/update-prizes/{prizeId}:
 *   put:
 *     summary: Update a prize
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: prizeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The prize ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: The prize image file (e.g., jpeg, png).
 *               availability:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Prize updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or prize not found
 */
eventRouter.put(
    '/:eventId/update-prizes/:prizeId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(lwprizeMiddleware.verifyPrizeOfEvent),
    asyncHandler(validate(eventRequest.lwUpdatePrize)),
    asyncHandler(eventController.lwUpdatePrize)
)

/**
 * @swagger
 * /events/{eventId}/delete-prizes/{prizeId}:
 *   delete:
 *     summary: Delete a prize
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: prizeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The prize ID
 *     responses:
 *       200:
 *         description: Prize deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or prize not found
 */
eventRouter.delete(
    '/:eventId/delete-prizes/:prizeId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(lwprizeMiddleware.verifyPrizeOfEvent),
    asyncHandler(eventController.lwDeletePrize)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheels:
 *   get:
 *     summary: Get all lucky wheels for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Lucky wheels retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/lucky-wheels',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.getLuckyWheels)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel:
 *   post:
 *     summary: Create a new lucky wheel for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [LUCKY_PRIZE, LUCKY_CHECKED_IN]
 *             required:
 *               - title
 *               - type
 *     responses:
 *       201:
 *         description: Lucky wheel created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.post(
    '/:eventId/lucky-wheel',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.createLuckyWheel)),
    asyncHandler(eventController.createLuckyWheel)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}:
 *   get:
 *     summary: Get a lucky wheel by ID
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     responses:
 *       200:
 *         description: Lucky wheel retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.get(
    '/:eventId/lucky-wheel/:luckyWheelId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.getLuckyWheel)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}:
 *   put:
 *     summary: Update a lucky wheel
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [LUCKY_PRIZE, LUCKY_CHECKED_IN]
 *     responses:
 *       200:
 *         description: Lucky wheel updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.put(
    '/:eventId/lucky-wheel/:luckyWheelId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.updateLuckyWheel)),
    asyncHandler(eventController.updateLuckyWheel)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}:
 *   delete:
 *     summary: Delete a lucky wheel
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     responses:
 *       200:
 *         description: Lucky wheel deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.delete(
    '/:eventId/lucky-wheel/:luckyWheelId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.deleteLuckyWheel)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}/prizes:
 *   post:
 *     summary: Set prizes and quantities for a lucky wheel
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prizes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     prize_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 0
 *             required:
 *               - prizes
 *     responses:
 *       200:
 *         description: Prizes set successfully for the lucky wheel
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.post(
    '/:eventId/lucky-wheel/:luckyWheelId/prizes',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.setLuckyWheelPrizes)),
    asyncHandler(eventController.setLuckyWheelPrizes)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}/prizes:
 *   get:
 *     summary: Get prizes and their remaining quantities for a lucky wheel
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     responses:
 *       200:
 *         description: Prizes and quantities retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.get(
    '/:eventId/lucky-wheel/:luckyWheelId/prizes',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.getLuckyWheelPrizes)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}/spin:
 *   post:
 *     summary: Spin the lucky wheel to get a random prize
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration_id:
 *                 type: string
 *                 description: Optional registration ID for LUCKY_PRIZE type. For LUCKY_CHECKED_IN, a random registration will be selected.
 *     responses:
 *       200:
 *         description: Spin result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prize:
 *                   type: object
 *                   description: The prize information
 *                 registration:
 *                   type: object
 *                   description: The registration information (only for LUCKY_CHECKED_IN type)
 *                 remaining_quantities:
 *                   type: object
 *                   description: Remaining quantities of each prize
 *       400:
 *         description: Invalid request or no prizes available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.post(
    '/:eventId/lucky-wheel/:luckyWheelId/spin',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.spinLuckyWheel)
)

/**
 * @swagger
 * /events/{eventId}/lucky-wheel/{luckyWheelId}/history:
 *   get:
 *     summary: Get the history of lucky wheel spins
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: luckyWheelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lucky wheel ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Items per page
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or lucky wheel not found
 */
eventRouter.get(
    '/:eventId/lucky-wheel/:luckyWheelId/history',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(eventRequest.getLuckyWheelHistory)),
    asyncHandler(eventController.getLuckyWheelHistory)
)

// Added 20250522: CRUD Email Template

/**
 * @swagger
 * /events/{eventId}/email-template:
 *   get:
 *     summary: Get all email templates for organizer
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Items per page
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort item order
 *     responses:
 *       200:
 *         description: Lấy danh sách email template thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách email template thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           template_name:
 *                             type: string
 *                             example: Welcome Email
 *                           sender_name:
 *                             type: string
 *                             example: John Doe
 *                           subject:
 *                             type: string
 *                             example: Welcome to Our Event!
 *                           body:
 *                             type: string
 *                             example: "<p>Dear attendee, welcome...</p>"
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["https://static.example.com/uploads/file1.jpg", "https://static.example.com/uploads/file2.pdf"]
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-27T12:00:00.000Z"
 *       401:
 *         description: Unauthorized
 */
eventRouter.get(
    '/:eventId/email-template',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(validate(emailTemplateRequest.getEmailTemplates)),
    asyncHandler(emailTemplateController.getEmailTemplates)
)

/**
 * @swagger
 * /events/{eventId}/email-template/{templateId}:
 *   get:
 *     summary: Get an email template by ID
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The email template ID
 *     responses:
 *       200:
 *         description: Lấy email template thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy email template thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     template_name:
 *                       type: string
 *                       example: Welcome Email
 *                     sender_name:
 *                       type: string
 *                       example: John Doe
 *                     subject:
 *                       type: string
 *                       example: Welcome to Our Event!
 *                     body:
 *                       type: string
 *                       example: "<p>Dear attendee, welcome...</p>"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://static.example.com/uploads/file1.jpg", "https://static.example.com/uploads/file2.pdf"]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-27T12:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy template.
 */
eventRouter.get(
    '/:eventId/email-template/:templateId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyEmailTemplateId),
    asyncHandler(emailTemplateController.getEmailTemplate)
)

/**
 * @swagger
 * /events/{eventId}/email-template:
 *   post:
 *     summary: Create a new email template
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_name:
 *                 type: string
 *               sender_name:
 *                 type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               created_at:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email template đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email template đã được tạo thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     template_name:
 *                       type: string
 *                       example: "Welcome Email"
 *                     sender_name:
 *                       type: string
 *                       example: "Organizer Name"
 *                     subject:
 *                       type: string
 *                       example: "Welcome to Our Event!"
 *                     body:
 *                       type: string
 *                       example: "<p>Dear attendee, welcome...</p>"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://static.example.com/uploads/file1.jpg", "https://static.example.com/uploads/file2.pdf"]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-27T12:00:00.000Z"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       417:
 *         description: Kích thước tệp vượt quá giới hạn cho phép (25MB)
 */
eventRouter.post(
    '/:eventId/email-template',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyFileUploadSize),
    asyncHandler(validate(emailTemplateRequest.createEmailTemplate)),
    asyncHandler(emailTemplateController.createEmailTemplate)
)

/**
 * @swagger
 * /events/{eventId}/email-template/{templateId}:
 *   put:
 *     summary: Update an email template
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The email template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template_name:
 *                 type: string
 *               sender_name:
 *                 type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               created_at:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật email template thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cập nhật email template thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     template_name:
 *                       type: string
 *                       example: "Updated Template"
 *                     sender_name:
 *                       type: string
 *                       example: "Updated Sender"
 *                     subject:
 *                       type: string
 *                       example: "Updated Subject"
 *                     body:
 *                       type: string
 *                       example: "<p>Updated content...</p>"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-27T12:00:00.000Z"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy email template
 *       417:
 *         description: Kích thước tệp vượt quá giới hạn cho phép (25MB)
 */
eventRouter.put(
    '/:eventId/email-template/:templateId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyEmailTemplateId),
    asyncHandler(emailTemplateMiddleware.verifyFileUploadSize),
    asyncHandler(validate(emailTemplateRequest.updateEmailTemplate)),
    asyncHandler(emailTemplateController.updateEmailTemplate)
)

/**
 * @swagger
 * /events/{eventId}/email-template/{templateId}:
 *   delete:
 *     summary: Delete an email template
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The email template ID
 *     responses:
 *       200:
 *         description: Xóa email template thành công.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy template.
 */
eventRouter.delete(
    '/:eventId/email-template/:templateId',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyEmailTemplateId),
    asyncHandler(emailTemplateController.deleteEmailTemplate)
)

/**
 * @swagger
 * /events/{eventId}/email-template/{templateId}/get-fields:
 *   get:
 *     summary: Get all email templates' dynamic fields for event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The email template ID
 *     responses:
 *       200:
 *         description: Lấy trường dữ liệu email template thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy trường dữ liệu email template thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Ho_va_ten", "Email", "So_dien_thoai", "Chuc_vu", "Ten_su_kien", "Ngay_su_kien", "Thoi_gian_su_kien", "Dia_diem_su_kien", "Ngay_hien_tai", "Ten_he_thong"]
 *       401:
 *         description: Unauthorized
 */
eventRouter.get(
    '/:eventId/email-template/:templateId/get-fields',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyEmailTemplateId),
    asyncHandler(emailTemplateController.getFieldsForEmailTemplate)
)

/**
 * @swagger
 * /events/{eventId}/email-template/{templateId}/send-email:
 *   post:
 *     summary: Log email sending job to specific registrations
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The email template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of registration IDs to send emails to
 *             required:
 *               - registration_ids
 *     responses:
 *       200:
 *         description: Email sending jobs created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Emails queued for sending successfully"
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       registration_id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [PENDING, SENT, FAILED]
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or email template not found
 */
eventRouter.post(
    '/:eventId/email-template/:templateId/send-email',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateMiddleware.verifyEmailTemplateId),
    asyncHandler(validate(emailSendMiddleware.sendEmail)),
    asyncHandler(emailTemplateController.sendEmail)
)

/**
 * @swagger
 * /events/{eventId}/email-history:
 *   get:
 *     summary: Get all email logs for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Email logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/email-history',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(emailTemplateController.getEmailLogs)
)

/**
 * @swagger
 * /events/{eventId}/statistics:
 *   get:
 *     summary: Get detailed statistics for an event
 *     tags: [OrganizerEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   check_in_at:
 *                     type: string
 *                     format: date-time
 *                     description: Check-in timestamp
 *                   check_in_by:
 *                     type: string
 *                     description: Check-in method
 *                   check_in_count:
 *                     type: integer
 *                     description: Number of check-ins
 *                   booth_name:
 *                     type: string
 *                     description: Name of the booth
 *                   name:
 *                     type: string
 *                     description: Full name of the registrant
 *                   phone:
 *                     type: string
 *                     description: Phone number of the registrant
 *                   email:
 *                     type: string
 *                     description: Email address of the registrant
 *                   position:
 *                     type: string
 *                     description: Position of the registrant
 *                   affiliation:
 *                     type: string
 *                     description: Affiliation of the registrant
 *                   avatar:
 *                     type: string
 *                     description: URL of the registrant's avatar
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:eventId/statistics',
    asyncHandler(eventMiddleware.verifyEventId),
    asyncHandler(eventController.getEventStatistics)
)

export default eventRouter
