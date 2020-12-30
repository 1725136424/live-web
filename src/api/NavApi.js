import {Get, Post} from '@/utils/http'

export const login = (user) => Post('/live/user/login', user)

export const isLogin = () => Get('/live/user/isLogin')

export const getCategory = () => Get('/live/category/getAll')

export const logout = () => Get('/live/user/logout')

export const anchor = (anchor) => Post('/live/user/anchor', anchor)

export const startAnchor = (anchor) => Post('/live/live/startAnchor', anchor)
