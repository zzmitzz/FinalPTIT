import {LINK_STATIC_URL} from '@/configs'
import {Prize, RegistrationPrize} from '@/models'
import {FileUpload} from '@/utils/classes'
import { getRandomElementByRate } from '@/utils/helpers'
import _ from 'lodash'

export async function readPrizesOfEvent(event, miniGameCode) {
    const prizes = await Prize.find({
        event_id: event._id,
        mini_game: miniGameCode,
    }).sort({position: 1, created_at: -1, _id: -1})
    prizes.forEach(function (prize) {
        prize.picture = prize.picture && LINK_STATIC_URL + prize.picture
    })
    return prizes
}

export async function create(session, {picture, ...requestBody}) {
    if (picture instanceof FileUpload) {
        picture.save()
    }
    const prize = new Prize({picture, ...requestBody})
    await prize.save({session})
}

export async function update(session, prize, {name, picture, rate, quantity}) {
    prize.name = name
    prize.rate = rate
    prize.quantity = quantity
    let deletedPicture
    if (picture instanceof FileUpload) {
        deletedPicture = prize.picture
        prize.picture = picture.save()
    } else if (picture === 'remove') {
        deletedPicture = prize.picture
        prize.picture = ''
    }
    await prize.save({session})
    if (deletedPicture) {
        FileUpload.remove(deletedPicture)
    }
}

export async function remove(session, prize) {
    await Prize.findByIdAndDelete(prize._id, {session})
    if (prize.picture) {
        FileUpload.remove(prize.picture)
    }
}

export async function distributePrize(session, miniGameCode, registration, {booth_mac} = {}) {
    let prizes = await Prize.find({event_id: registration.event_id, mini_game: miniGameCode})
        .sort({rate: 1})
        .session(session)
    prizes = prizes.filter(
        ({rate, quantity, distributed_count}) =>
            (rate !== 0 && _.isNil(quantity)) || quantity > distributed_count
    )
    const [, gift] = getRandomElementByRate(prizes)
    if (!gift) return
    gift.distributed_count += 1
    await gift.save({session})
    await RegistrationPrize.insertMany(
        {
            registration_id: registration._id,
            prize_id: gift._id,
            booth_mac,
        },
        {session}
    )
    return {
        _id: gift._id,
        name: gift.name,
        picture: gift.picture,
    }
}

export async function sort(session, {prizes}) {
    await Promise.all(
        prizes.map((prizeId, position) => Prize.findByIdAndUpdate(prizeId, {$set: {position}}, {session}))
    )
}
