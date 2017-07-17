
import * as moment from 'moment'
import * as marked from 'marked'
import {Discussion} from 'dsteem'

// // from condenser
const youTubeId = /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)/i

let postFullTemplate: HTMLElement
let postPreviewTemplate: HTMLElement
let postDateFormat: string

function postPermalink(post: Discussion): string {
    return `?post=${ post.permlink }`
}

function isImage(url: string): boolean {
    return /\.(png|jpg|jpeg|gif)(\?.*)*$/i.test(url)
}

function renderBody(post: Discussion): HTMLElement {
    let element = document.createElement('div')
    element.innerHTML = marked(post.body)
    for (const a of Array.from(element.querySelectorAll('a'))) {
        a.target = '_blank'
        if (isImage(a.href)) {
            a.innerHTML = `<img src="${ a.href }" />`
        }
        const matches = a.href.match(youTubeId)
        if (matches) {
            const iframe = document.createElement('iframe')
            iframe.id = 'ytplayer'
            iframe.frameBorder = '0'
            iframe.src = `https://www.youtube.com/embed/${ matches[1] }`
            a.parentNode.replaceChild(iframe, a)
        }
    }
    return element
}

export function renderPost(post: Discussion, preview: boolean = false): HTMLElement {
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
    const metadata = JSON.parse(post.json_metadata)

    if (preview) {
        let firstImage: HTMLImageElement
        if (metadata.image && metadata.image.length > 0) {
            const image = document.createElement('img')
            image.src = metadata.image[0]
            firstImage = image
        } else {
            firstImage = body.querySelector('img')
        }
        if (firstImage) {
            const imageP = document.createElement('p')
            const imageLink = document.createElement('a')
            imageLink.appendChild(firstImage)
            imageLink.href = permalink
            imageP.appendChild(imageLink)
            postBody.appendChild(imageP)
        }
        let numAppended = 0
        const firstParagraphs = Array.from(body.querySelectorAll('p'))
        for (const p of firstParagraphs) {
            if (p.querySelectorAll('img,a').length > 0 && p.textContent.length < 60) {
                continue
            }
            postBody.appendChild(p)
            if (++numAppended > 2) {
                break
            }
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
