import {LINK_STATIC_URL} from '@/configs'
import LwPrize from '@/models/lucky_wheel_flow/lucky_wheel_prize'
import {FileUpload} from '@/utils/classes'
import _ from 'lodash'

export async function create(session, {picture, ...requestBody}) {
    if (picture instanceof FileUpload) {
        picture.save()
    }
    const prize = new LwPrize({picture, ...requestBody})
    await prize.save({session})
}

export async function update(session, prize, {name, picture, availability}) {
    prize.name = name
    prize.availability = availability
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

export async function remove(session, prize){
    await LwPrize.findByIdAndDelete(prize._id, {session})
    if (prize.picture) {
        FileUpload.remove(prize.picture)
    }
}


export async function getPrizeOfEvent(event) {
    const prizes = await LwPrize.find({
        event_id: event._id,
    }).sort({created_at: -1})
    prizes.forEach(function (prize) {
        prize.picture = prize.picture && LINK_STATIC_URL + prize.picture
    })
    return prizes
}