import {Get} from '@/utils/http'

export const getLiveById = (id) => Get(`/live/live/info_two/${id}`)

export const followRoom = (roomId) => Get(`/live/userlive/follow/${roomId}`)
