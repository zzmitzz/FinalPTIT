import admin from 'firebase-admin'

const firebaseAdmin = admin.default || admin

let firebaseInitialized = false

export function initializeFirebase() {
    if (firebaseInitialized) {
        return
    }

    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(serviceAccount),
            })
        }
        else if (process.env.FIREBASE_PROJECT_ID) {
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            })
        }
        else {
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.applicationDefault(),
            })
        }

        firebaseInitialized = true
        console.log('✅ Firebase Admin SDK initialized')
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error.message)
        throw error
    }
}

/**
 * Send notification to single device
 */
export async function sendToDevice(fcmToken, notification, data = {}) {
    initializeFirebase()

    try {
        const message = {
            token: fcmToken,
            notification: {
                title: notification.title,
                body: notification.body,
                ...(notification.image_url && { imageUrl: notification.image_url }),
            },
            data: {
                ...data,
                notification_id: data.notification_id || '',
                action_type: data.action_type || '',
                action_data: JSON.stringify(data.action_data || {}),
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        }

        const response = await firebaseAdmin.messaging().send(message)
        return {
            success: true,
            messageId: response,
        }
    } catch (error) {
        console.error('FCM send error:', error)
        return {
            success: false,
            error: error.message,
            errorCode: error.code,
        }
    }
}

/**
 * Send notification to multiple devices (batch)
 * Firebase allows max 500 tokens per request
 */
export async function sendToMultipleDevices(fcmTokens, notification, data = {}) {
    initializeFirebase()

    if (!fcmTokens || fcmTokens.length === 0) {
        return {
            successCount: 0,
            failureCount: 0,
            responses: [],
        }
    }

    try {
        const message = {
            tokens: fcmTokens,
            notification: {
                title: notification.title,
                body: notification.body,
                ...(notification.image_url && { imageUrl: notification.image_url }),
            },
            data: {
                ...data,
                notification_id: data.notification_id || '',
                action_type: data.action_type || '',
                action_data: JSON.stringify(data.action_data || {}),
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        }

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message)

        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses.map((res, idx) => ({
                success: res.success,
                messageId: res.messageId,
                error: res.error
                    ? {
                        code: res.error.code,
                        message: res.error.message,
                    }
                    : null,
                token: fcmTokens[idx],
            })),
        }
    } catch (error) {
        console.error('FCM batch send error:', error)
        throw new Error(`Failed to send batch notification: ${error.message}`)
    }
}

/**
 * Send notification in batches (splits into chunks of 500)
 */
export async function sendToBatches(fcmTokens, notification, data = {}) {
    initializeFirebase()

    const BATCH_SIZE = 500
    const batches = []

    // Split tokens into batches of 500
    for (let i = 0; i < fcmTokens.length; i += BATCH_SIZE) {
        batches.push(fcmTokens.slice(i, i + BATCH_SIZE))
    }

    const results = {
        totalSuccessCount: 0,
        totalFailureCount: 0,
        allResponses: [],
    }

    // Send each batch
    for (const batch of batches) {
        const batchResult = await sendToMultipleDevices(batch, notification, data)
        results.totalSuccessCount += batchResult.successCount
        results.totalFailureCount += batchResult.failureCount
        results.allResponses.push(...batchResult.responses)
    }

    return results
}

/**
 * Validate FCM token
 */
export async function validateToken(fcmToken) {
    initializeFirebase()

    try {
        // Try sending a dry run message
        const message = {
            token: fcmToken,
            notification: {
                title: 'Test',
                body: 'Test',
            },
            dryRun: true,
        }

        await firebaseAdmin.messaging().send(message)
        return { valid: true }
    } catch (error) {
        return {
            valid: false,
            error: error.message,
            errorCode: error.code,
        }
    }
}

/**
 * Subscribe token to topic
 */
export async function subscribeToTopic(fcmTokens, topic) {
    initializeFirebase()

    try {
        const response = await firebaseAdmin.messaging().subscribeToTopic(fcmTokens, topic)
        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            errors: response.errors,
        }
    } catch (error) {
        throw new Error(`Failed to subscribe to topic: ${error.message}`)
    }
}

/**
 * Unsubscribe token from topic
 */
export async function unsubscribeFromTopic(fcmTokens, topic) {
    initializeFirebase()

    try {
        const response = await firebaseAdmin.messaging().unsubscribeFromTopic(fcmTokens, topic)
        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            errors: response.errors,
        }
    } catch (error) {
        throw new Error(`Failed to unsubscribe from topic: ${error.message}`)
    }
}
