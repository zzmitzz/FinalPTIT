import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as speakerRequest from '@/app/requests/organizer/speaker.request'
import * as speakerController from '@/app/controllers/organizer/speaker.controller'
import * as speakerMiddleware from '@/app/middleware/organizer/speaker.middleware'

const speakerRouter = Router()

// All routes require authentication
speakerRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizer/speakers:
 *   post:
 *     summary: Create a new speaker for an event
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - full_name
 *               - email
 *             properties:
 *               event_id:
 *                 type: string
 *                 description: ID of the event this speaker belongs to
 *               full_name:
 *                 type: string
 *                 description: Speaker's full name
 *               bio:
 *                 type: string
 *                 description: Speaker's biography
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Speaker's email address
 *               phone:
 *                 type: string
 *                 description: Speaker's phone number
 *               organization:
 *                 type: string
 *                 description: Speaker's organization
 *               photo_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to speaker's photo
 *               title:
 *                 type: string
 *                 description: Speaker's professional title
 *               linkedin_url:
 *                 type: string
 *                 format: uri
 *                 description: Speaker's LinkedIn profile URL
 *               expertise_areas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas of expertise
 *               years_experience:
 *                 type: integer
 *                 description: Years of professional experience
 *               is_keynote_speaker:
 *                 type: boolean
 *                 description: Whether this is a keynote speaker
 *                 default: false
 *               is_active:
 *                 type: boolean
 *                 description: Whether the speaker is active
 *                 default: true
 *     responses:
 *       201:
 *         description: Speaker created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 */
speakerRouter.post(
    '/',
    asyncHandler(speakerMiddleware.verifyEventOwnership),
    asyncHandler(validate(speakerRequest.createItem)),
    asyncHandler(speakerController.createItem)
)

/**
 * @swagger
 * /organizer/speakers/search:
 *   get:
 *     summary: Search speakers
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (searches in name, organization, title, expertise)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       401:
 *         description: Unauthorized
 */
speakerRouter.get(
    '/search',
    asyncHandler(validate(speakerRequest.searchItems)),
    asyncHandler(speakerController.searchItems)
)

/**
 * @swagger
 * /organizer/speakers/keynote:
 *   get:
 *     summary: Get all keynote speakers
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Keynote speakers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
speakerRouter.get(
    '/keynote',
    asyncHandler(speakerController.getKeynoteSpeakers)
)

/**
 * @swagger
 * /organizer/speakers/active:
 *   get:
 *     summary: Get all active speakers
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active speakers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
speakerRouter.get(
    '/active',
    asyncHandler(speakerController.getActiveSpeakers)
)

/**
 * @swagger
 * /organizer/speakers/expertise:
 *   get:
 *     summary: Get speakers by expertise areas
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expertise
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Expertise area(s) to filter by
 *     responses:
 *       200:
 *         description: Speakers retrieved successfully
 *       400:
 *         description: Missing expertise parameter
 *       401:
 *         description: Unauthorized
 */
speakerRouter.get(
    '/expertise',
    asyncHandler(validate(speakerRequest.getSpeakersByExpertise)),
    asyncHandler(speakerController.getSpeakersByExpertise)
)

/**
 * @swagger
 * /organizer/speakers/organization/{organization}:
 *   get:
 *     summary: Get speakers by organization
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organization
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization name to search for
 *     responses:
 *       200:
 *         description: Speakers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
speakerRouter.get(
    '/organization/:organization',
    asyncHandler(speakerController.getSpeakersByOrganization)
)

/**
 * @swagger
 * /organizer/speakers/event/{eventId}:
 *   get:
 *     summary: Get all speakers for a specific event
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Speakers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 *       404:
 *         description: Event not found
 */
speakerRouter.get(
    '/event/:eventId',
    asyncHandler(speakerMiddleware.verifyEventOwnership),
    asyncHandler(speakerController.getListByEventId)
)

/**
 * @swagger
 * /organizer/speakers/{id}:
 *   get:
 *     summary: Get a specific speaker by ID
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     responses:
 *       200:
 *         description: Speaker retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Speaker does not belong to organizer
 *       404:
 *         description: Speaker not found
 */
speakerRouter.get(
    '/:id',
    asyncHandler(speakerMiddleware.checkSpeakerId),
    asyncHandler(speakerMiddleware.verifySpeakerOwnership),
    asyncHandler(speakerController.getItem)
)

/**
 * @swagger
 * /organizer/speakers/{id}:
 *   put:
 *     summary: Update a speaker (full update)
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               organization:
 *                 type: string
 *               photo_url:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *               linkedin_url:
 *                 type: string
 *                 format: uri
 *               expertise_areas:
 *                 type: array
 *                 items:
 *                   type: string
 *               years_experience:
 *                 type: integer
 *               is_keynote_speaker:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Speaker updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Speaker does not belong to organizer
 *       404:
 *         description: Speaker not found
 */
speakerRouter.put(
    '/:id',
    asyncHandler(speakerMiddleware.checkSpeakerId),
    asyncHandler(speakerMiddleware.verifySpeakerOwnership),
    asyncHandler(validate(speakerRequest.updateItem)),
    asyncHandler(speakerController.updateItem)
)

/**
 * @swagger
 * /organizer/speakers/{id}/properties:
 *   patch:
 *     summary: Update specific speaker properties (partial update)
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               organization:
 *                 type: string
 *               photo_url:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *               linkedin_url:
 *                 type: string
 *                 format: uri
 *               expertise_areas:
 *                 type: array
 *                 items:
 *                   type: string
 *               years_experience:
 *                 type: integer
 *               is_keynote_speaker:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Speaker properties updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Speaker does not belong to organizer
 *       404:
 *         description: Speaker not found
 */
speakerRouter.patch(
    '/:id/properties',
    asyncHandler(speakerMiddleware.checkSpeakerId),
    asyncHandler(speakerMiddleware.verifySpeakerOwnership),
    asyncHandler(validate(speakerRequest.updateProperties)),
    asyncHandler(speakerController.updateProperties)
)

/**
 * @swagger
 * /organizer/speakers/{id}:
 *   delete:
 *     summary: Delete a speaker
 *     tags: [Organizer Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     responses:
 *       200:
 *         description: Speaker deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Speaker does not belong to organizer
 *       404:
 *         description: Speaker not found
 */
speakerRouter.delete(
    '/:id',
    asyncHandler(speakerMiddleware.checkSpeakerId),
    asyncHandler(speakerMiddleware.verifySpeakerOwnership),
    asyncHandler(speakerController.deleteItem)
)

export default speakerRouter

