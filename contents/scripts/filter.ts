
import {Discussion} from 'dsteem'

interface ISteemitMetadata {
    tags: string[]
    image: string[]
    app: string
    format: string
}

// edit this function to determine which posts to include
// in your blog, by default all posts are shown
export default function filter(post: Discussion): boolean {
    return true
}

// for example, this only includes posts that has the steemit tag 'blog'
function example(post: Discussion): boolean {
    let metadata: ISteemitMetadata
    try {
        metadata = JSON.parse(post.json_metadata)
    } catch (error) {
        console.warn('Unable to parse metadata for', post.url)
        return false
    }
    if (metadata.tags && metadata.tags.indexOf('blog') !== -1) {
        return true
    }
    return false
}
