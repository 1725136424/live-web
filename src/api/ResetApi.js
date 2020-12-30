import {Post} from '@/utils/http'

export const resetPassword = (params) => Post(`/live/user/reset`, params)
