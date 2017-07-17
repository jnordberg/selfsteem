import {Client, Discussion, DisqussionQuery} from 'dsteem'

export type FilterFn = (Discussion) => boolean
const allowAll = (post: Discussion) => true

export async function fetchPosts(client: Client, author: string, limit: number = 10, filter: FilterFn = allowAll, from?: string): Promise<Discussion[]> {
    let results: Discussion[] = []
    let seen: {[id: number]: boolean} = {}
    let query: DisqussionQuery = {tag: author, limit: limit+1}
    if (from) {
        query.start_author = author
        query.start_permlink = from
    }
    do {
        const posts: Discussion[] = await client.database.getDiscussions('blog', query)
        let valid: Discussion[] = []
        for (const post of posts) {
            // filter out resteemed posts
            if (post.author === author && !seen[post.id]) {
                seen[post.id] = true // .. why can you resteem your own posts?
                valid.push(post)
                if (results.length === limit) {
                    break
                }
            }
        }
        results = results.concat(valid.filter(filter))
        if (posts.length !== query.limit) {
            break
        }
        query.start_author = posts[posts.length-1].author
        query.start_permlink = posts[posts.length-1].permlink
    } while (results.length < limit)
    return results
}

export async function fetchPost(client: Client, author: string, permalink: string): Promise<Discussion> {
    let query: DisqussionQuery = {
        tag: author,
        limit: 1,
        start_author: author,
        start_permlink: permalink,
    }
    let results = await client.database.getDiscussions('blog', query)
    if (results.length !== 1) {
        throw new Error(`Unable to find post: @${ author }/${ permalink }`)
    }
    return results[0]
}
