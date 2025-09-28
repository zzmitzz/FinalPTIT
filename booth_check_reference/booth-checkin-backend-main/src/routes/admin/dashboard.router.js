import * as dashboardController from '@/app/controllers/admin/dashboard.controller'
import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import requirePermissions from '@/app/middleware/admin/require-permission'
import {PERMISSION} from '@/models'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'

const dashboardRouter = Router()

dashboardRouter.use(asyncHandler(requireAdminAuthentication))
dashboardRouter.use(asyncHandler(requirePermissions(PERMISSION.DASHBOARD)))

dashboardRouter.get('/statistical', asyncHandler(dashboardController.getStatistical))
dashboardRouter.get('/chart', asyncHandler(dashboardController.getChartData))

export default dashboardRouter
