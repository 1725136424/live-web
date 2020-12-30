import {Get} from '@/utils/http'

export const getLive = (params) => Get('/live/live/list', params)

export const getCategory = (id) => Get(`/live/category/info/${id}`)
