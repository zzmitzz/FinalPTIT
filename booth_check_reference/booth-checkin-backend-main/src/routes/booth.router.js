import { asyncHandler } from '@/utils/helpers'
import { Router } from 'express'
import validate from '@/app/middleware/common/validate'

import * as boothController from '@/app/controllers/booth.controller'
import * as boothRequest from '@/app/requests/booth.request'
import * as boothMiddleware from '@/app/middleware/booth.middleware'
import { EVENT_MINI_GAME } from '@/models'

const boothRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Booth
 *   description: API endpoints for managing booths
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The event ID
 *         name:
 *           type: string
 *           description: The event name
 *       required:
 *         - _id
 *         - name
 */

boothRouter.use(asyncHandler(boothMiddleware.verifyBoothMacAddress))

/**
 * @swagger
 * /booth/event:
 *   post:
 *     summary: Get event information
 *     tags: [Booth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: The event ID
 *     responses:
 *       200:
 *         description: Event information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Event not found
 */
boothRouter.post(
    '/event',
    asyncHandler(validate(boothRequest.readEvent)),
    asyncHandler(boothController.readEvent)
)

/**
 * @swagger
 * /booth/event/{eventId}/check-in:
 *   post:
 *     summary: Check in an attendee to an event
 *     tags: [Booth]
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
 *               registrationId:
 *                 type: string
 *                 description: The registration ID of the attendee
 *     responses:
 *       200:
 *         description: Attendee checked in successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Event or registration not found
 */
boothRouter.post(
    '/event/:eventId/check-in',
    asyncHandler(boothMiddleware.verifyEventId),
    boothMiddleware.requireEventOngoing,
    asyncHandler(validate(boothRequest.confirmAttendance)),
    asyncHandler(boothMiddleware.canCheckIn),
    asyncHandler(boothController.confirmAttendance)
)

// Showcase flow, replace soon.
boothRouter.post(
    '/event/:eventId/multi-check-in',
    asyncHandler(boothMiddleware.verifyEventId),
    boothMiddleware.requireEventOngoing,
    asyncHandler(validate(boothRequest.confirmAttendances)),
    asyncHandler(boothController.confirmAttendances)
)

/**
 * @swagger
 * /booth/ping:
 *   post:
 *     summary: Ping booth to check if it's online
 *     tags: [Booth]
 *     responses:
 *       200:
 *         description: Booth is online
 */
boothRouter.post(
    '/ping',
    asyncHandler(boothController.pingBooth)
)

/**
 * @swagger
 * /booth/event/{eventId}/registrations:
 *   get:
 *     summary: Get list of registrations for an event
 *     tags: [Booth]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: List of registrations retrieved successfully
 *       404:
 *         description: Event not found
 */
boothRouter.get(
    '/event/:eventId/registrations',
    asyncHandler(boothMiddleware.verifyEventId),
    asyncHandler(boothController.getListRegistration)
)

/**
 * @swagger
 * /booth:
 *   get:
 *     summary: Get event assigned to this booth
 *     tags: [Booth]
 *     responses:
 *       200:
 *         description: Event assigned to booth retrieved successfully
 */
boothRouter.get(
    '/',
    asyncHandler(boothController.readEventAssigned)
)

/**
 * @swagger
 * /booth/event/{eventId}/grant-prize/{MINI_GAME_CODE}:
 *   post:
 *     summary: Grant prize to attendee
 *     tags: [Booth]
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
 *               registrationId:
 *                 type: string
 *                 description: The registration ID of the attendee
 *     responses:
 *       200:
 *         description: Prize granted successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Event, registration, or mini game not found
 */
boothRouter.post(
    `/event/:eventId/grant-prize/:MINI_GAME_CODE(${Object.values(EVENT_MINI_GAME).join('|')})`,
    asyncHandler(boothMiddleware.verifyEventId),
    boothMiddleware.requireEventOngoing,
    boothMiddleware.checkMiniGameCode,
    asyncHandler(validate(boothRequest.grantPrize)),
    asyncHandler(boothMiddleware.canReceivePrize),
    asyncHandler(boothController.grantPrize),
)

export default boothRouter
