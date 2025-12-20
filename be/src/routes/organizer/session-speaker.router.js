import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as sessionSpeakerRequest from '@/app/requests/organizer/session-speaker.request'
import * as sessionSpeakerController from '@/app/controllers/organizer/session-speaker.controller'
import * as sessionSpeakerMiddleware from '@/app/middleware/organizer/session-speaker.middleware'

const sessionSpeakerRouter = Router()

// All routes require authentication
sessionSpeakerRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * tags:
 *   name: Organizer Session Speakers
 *   description: Organizer session speaker management - Add and manage speakers in sessions
 */

/**
 * @swagger
 * /organizer/session-speakers:
 *   post:
 *     summary: Add a speaker to a session
 *     description: Allows organizers to add a speaker to a session. Both session and speaker must belong to events owned by the organizer.
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *               - speaker_id
 *             properties:
 *               session_id:
 *                 type: integer
 *                 description: ID of the session
 *               speaker_id:
 *                 type: integer
 *                 description: ID of the speaker
 *               role:
 *                 type: string
 *                 description: Role of the speaker in the session (e.g., main_speaker, panelist, moderator)
 *                 default: speaker
 *               speaking_order:
 *                 type: integer
 *                 minimum: 1
 *                 description: Order in which the speaker will present
 *               speaking_duration_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 description: Allocated speaking time in minutes
 *               notes:
 *                 type: string
 *                 description: Internal notes about the speaker's participation
 *     responses:
 *       201:
 *         description: Speaker added to session successfully
 *       400:
 *         description: Invalid request data or speaker already in session
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session or speaker does not belong to organizer
 *       404:
 *         description: Session or speaker not found
 */
sessionSpeakerRouter.post(
    '/',
    asyncHandler(sessionSpeakerMiddleware.checkSessionId),
    asyncHandler(sessionSpeakerMiddleware.checkSpeakerId),
    asyncHandler(sessionSpeakerMiddleware.verifySessionOwnership),
    asyncHandler(sessionSpeakerMiddleware.verifySpeakerOwnership),
    sessionSpeakerMiddleware.verifySameEvent,
    asyncHandler(validate(sessionSpeakerRequest.addSpeakerToSession)),
    asyncHandler(sessionSpeakerController.addSpeakerToSession)
)

/**
 * @swagger
 * /organizer/session-speakers/session/{sessionId}:
 *   get:
 *     summary: Get all speakers for a specific session
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Speakers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
sessionSpeakerRouter.get(
    '/session/:sessionId',
    asyncHandler(sessionSpeakerMiddleware.checkSessionId),
    asyncHandler(sessionSpeakerMiddleware.verifySessionOwnership),
    asyncHandler(sessionSpeakerController.getSpeakersBySession)
)

/**
 * @swagger
 * /organizer/session-speakers/speaker/{speakerId}:
 *   get:
 *     summary: Get all sessions for a specific speaker
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: speakerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Speaker does not belong to organizer
 *       404:
 *         description: Speaker not found
 */
sessionSpeakerRouter.get(
    '/speaker/:speakerId',
    asyncHandler(sessionSpeakerMiddleware.checkSpeakerId),
    asyncHandler(sessionSpeakerMiddleware.verifySpeakerOwnership),
    asyncHandler(sessionSpeakerController.getSessionsBySpeaker)
)

/**
 * @swagger
 * /organizer/session-speakers/session/{sessionId}/speaker/{speakerId}:
 *   get:
 *     summary: Get a specific session-speaker relationship
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *       - in: path
 *         name: speakerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     responses:
 *       200:
 *         description: Session-speaker relationship retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session or speaker does not belong to organizer
 *       404:
 *         description: Session, speaker, or relationship not found
 */
sessionSpeakerRouter.get(
    '/session/:sessionId/speaker/:speakerId',
    asyncHandler(sessionSpeakerMiddleware.checkSessionId),
    asyncHandler(sessionSpeakerMiddleware.checkSpeakerId),
    asyncHandler(sessionSpeakerMiddleware.verifySessionOwnership),
    asyncHandler(sessionSpeakerMiddleware.verifySpeakerOwnership),
    sessionSpeakerMiddleware.verifySameEvent,
    asyncHandler(sessionSpeakerController.getSessionSpeaker)
)

/**
 * @swagger
 * /organizer/session-speakers/session/{sessionId}/speaker/{speakerId}:
 *   put:
 *     summary: Update a session-speaker relationship
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *       - in: path
 *         name: speakerId
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
 *               role:
 *                 type: string
 *                 description: Role of the speaker in the session
 *               speaking_order:
 *                 type: integer
 *                 minimum: 1
 *                 description: Order in which the speaker will present
 *               speaking_duration_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 description: Allocated speaking time in minutes
 *               notes:
 *                 type: string
 *                 description: Internal notes about the speaker's participation
 *     responses:
 *       200:
 *         description: Session-speaker relationship updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session or speaker does not belong to organizer
 *       404:
 *         description: Session, speaker, or relationship not found
 */
sessionSpeakerRouter.put(
    '/session/:sessionId/speaker/:speakerId',
    asyncHandler(sessionSpeakerMiddleware.checkSessionId),
    asyncHandler(sessionSpeakerMiddleware.checkSpeakerId),
    asyncHandler(sessionSpeakerMiddleware.verifySessionOwnership),
    asyncHandler(sessionSpeakerMiddleware.verifySpeakerOwnership),
    sessionSpeakerMiddleware.verifySameEvent,
    asyncHandler(validate(sessionSpeakerRequest.updateSessionSpeaker)),
    asyncHandler(sessionSpeakerController.updateSessionSpeaker)
)

/**
 * @swagger
 * /organizer/session-speakers/session/{sessionId}/speaker/{speakerId}:
 *   delete:
 *     summary: Remove a speaker from a session
 *     tags: [Organizer Session Speakers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *       - in: path
 *         name: speakerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Speaker ID
 *     responses:
 *       200:
 *         description: Speaker removed from session successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session or speaker does not belong to organizer
 *       404:
 *         description: Session, speaker, or relationship not found
 */
sessionSpeakerRouter.delete(
    '/session/:sessionId/speaker/:speakerId',
    asyncHandler(sessionSpeakerMiddleware.checkSessionId),
    asyncHandler(sessionSpeakerMiddleware.checkSpeakerId),
    asyncHandler(sessionSpeakerMiddleware.verifySessionOwnership),
    asyncHandler(sessionSpeakerMiddleware.verifySpeakerOwnership),
    sessionSpeakerMiddleware.verifySameEvent,
    asyncHandler(sessionSpeakerController.removeSpeakerFromSession)
)

export default sessionSpeakerRouter

