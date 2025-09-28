import {corsOptions as cors} from '@/handlers/cors.handler'
import {Server} from 'socket.io'
import {pathToRegexp} from 'path-to-regexp'
import requireAuthentication, {ACTOR} from './require-authentication'

import * as organizerEventNamespace from './organizer/event.namespace'
import * as adminEventNamespace from './admin/event.namespace'
import * as adminBoothNamespace from './admin/booth.namespace'
import * as boothEventNamespace from './booth/event.namespace'
import * as boothNamespace from './booth/booth.namespace'
import * as boothOrganizerNamespace from './organizer/booth.namspace'
import verifyBoothMacAddress from './booth/verify-booth-mac-address'
import requirePermissions from './admin/require-permissions'
import {PERMISSION} from '@/models'

const io = new Server({cors})

io.of(pathToRegexp(organizerEventNamespace.path))
    .use(requireAuthentication(ACTOR.ORGANIZER))
    .use(organizerEventNamespace.verifyEventId)

io.of(pathToRegexp(adminEventNamespace.path))
    .use(requireAuthentication(ACTOR.ADMIN))
    .use(requirePermissions(PERMISSION.READ_EVENT))
    .use(adminEventNamespace.verifyEventId)

io.of(adminBoothNamespace.path)
    .use(requireAuthentication(ACTOR.ADMIN))
    .use(requirePermissions(PERMISSION.LIST_BOOTH))

io.of(boothNamespace.path)
    .use(verifyBoothMacAddress)
    .on('connect', boothNamespace.onConnected)

io.of(boothOrganizerNamespace.path)
    .use(requireAuthentication(ACTOR.ORGANIZER))

io.of(pathToRegexp(boothEventNamespace.path))
    .use(verifyBoothMacAddress)
    .use(boothEventNamespace.verifyEventId)

export default io
