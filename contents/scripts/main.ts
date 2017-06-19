
import {fetchPosts, fetchPost, IDiscussion} from './steem-utils'
import {init as initRender, renderPost} from './render'
import isBlogPost from './filter'

import * as marked from 'marked'
import * as moment from 'moment'
import * as querystring from 'querystring'

// this loads all moment locales, to save a few bytes from the bundle
// require just the locales needed instead, e.g. require('moment/locale/ja')
require('moment/min/locales.min')

marked.setOptions({smartypants: true})

interface AppConfig {
    locale: string
    username: string
    perPage?: number
    dateFormat?: string
}

const configDefaults = {
    dateFormat: 'LL',
    perPage: 4,
}

export default async function main(config: AppConfig) {
    moment.locale(config.locale)
    initRender(document.getElementById('templates'), config.dateFormat || configDefaults.dateFormat)

    const args = querystring.parse((window.location.search || '').substr(1))
    const perPage = config.perPage || configDefaults.perPage

    let postsContainer = document.querySelector('#posts')

    let olderLink = document.querySelector('#posts-nav .older') as HTMLAnchorElement
    let homeLink = document.querySelector('#posts-nav .home') as HTMLAnchorElement

    homeLink.href = window.location.pathname

    if (args.post) {
        let post = await fetchPost(config.username, args.post)
        postsContainer.appendChild(renderPost(post))
        document.documentElement.classList.add('on-post')
    } else {
        if (args.from) {
            document.documentElement.classList.add('in-history')
        }
        let posts = await fetchPosts(config.username, perPage+1, isBlogPost, args.from)
        let next: IDiscussion
        if (posts.length === perPage+1) {
            next = posts.pop()
            document.documentElement.classList.add('has-older')
            olderLink.href = `?from=${ next.permlink }`
        }
        for (const post of posts) {
            postsContainer.appendChild(renderPost(post, true))
        }
    }

    document.documentElement.classList.add('loaded')
}
