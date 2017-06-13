
import * as moment from 'moment'
import * as marked from 'marked'

import {IDiscussion} from './steem-utils'

let postFullTemplate: HTMLElement
let postPreviewTemplate: HTMLElement
let postDateFormat: string

function postPermalink(post: IDiscussion): string {
    return `?post=${ post.permlink }`
}

function isImage(url: string): boolean {
    return /\.(png|jpg|jpeg|gif)(\?.*)*$/i.test(url)
}

function renderBody(post: IDiscussion): HTMLElement {
    let element = document.createElement('div')
    element.innerHTML = marked(post.body)
    for (const a of Array.from(element.querySelectorAll('a'))) {
        a.target = '_blank'
        if (isImage(a.href)) {
            a.innerHTML = `<img src="${ a.href }" />`
        }
    }
    return element
}

export function renderPost(post: IDiscussion, preview: boolean = false): HTMLElement {
    const template = preview ? postPreviewTemplate : postFullTemplate
    let element = template.cloneNode(true) as HTMLElement

    for (const el of Array.from(element.querySelectorAll('.title'))) {
        el.textContent = post.title
    }

    const permalink = postPermalink(post)
    for (const el of Array.from(element.querySelectorAll('.permalink'))) {
        el.setAttribute('href', permalink)
    }

    const date = moment(post.created+'Z').format(postDateFormat)
    for (const el of Array.from(element.querySelectorAll('.date'))) {
        el.textContent = date
    }

    const body = renderBody(post)
    const postBody = element.querySelector('.body')

    if (preview) {
        const firstImage = body.querySelector('img')
        if (firstImage) {
            const imageP = document.createElement('p')
            const imageLink = document.createElement('a')
            imageLink.appendChild(firstImage)
            imageLink.href = permalink
            imageP.appendChild(imageLink)
            postBody.appendChild(imageP)
        }
        const firstParagraphs = Array.from(body.querySelectorAll('p:nth-child(-n+2)'))
        for (const p of firstParagraphs) {
            postBody.appendChild(p)
        }
    } else {
        postBody.appendChild(body)
    }

    return element
}

export function init(templates: HTMLElement, dateFormat: string) {
    postDateFormat = dateFormat
    postFullTemplate = templates.querySelector('.post.full') as HTMLElement
    postPreviewTemplate = templates.querySelector('.post.preview') as HTMLElement
}
