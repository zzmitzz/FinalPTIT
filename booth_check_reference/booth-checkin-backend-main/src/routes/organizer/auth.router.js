import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-organizer-authentication'
import * as authMiddleware from '../../app/middleware/organizer/auth.middleware'
import * as authRequest from '../../app/requests/organizer/auth.request'
import * as authController from '../../app/controllers/organizer/auth.controller'

const authRouter = Router()

authRouter.post(
    '/login',
    asyncHandler(validate(authRequest.login)),
    asyncHandler(authController.login)
)

authRouter.get(
    '/logout',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(authController.logout)
)

authRouter.get(
    '/me',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(authController.me)
)

authRouter.put(
    '/me',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

authRouter.patch(
    '/change-password',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

authRouter.post(
    '/forgot-password',
    asyncHandler(validate(authRequest.forgotPassword)),
    asyncHandler(authController.forgotPassword),
)

authRouter.post(
    '/reset-password/:token',
    asyncHandler(authMiddleware.verifyForgotPasswordToken),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(authController.resetPassword),
)

export default authRouter
