import {Get, Post} from '@/utils/http'

export const getOSSPolicy = () => Get('/oss/policy')

export const register = (user) => Post('/live/user/save', user)

export const sendCode = (phone) => Get(`/sms/sendCode/${phone}`)

export const isExistByUsername = (username) => Get(`/live/user/isExist/${username}`)
