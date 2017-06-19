import * as steem from 'steem'

// https://github.com/steemit/steem/blob/3be8334d43aff85daa93e53ec6162206a098d758/libraries/app/include/steemit/app/database_api.hpp#L83
export interface IDisqussionQuery {
    tag: string                // author to fetch
    limit: number              // number of posts, max 100
    filter_tags?: string[]     // ?
    select_authors?: string[]  // ?
    select_tags?: string[]     // ?
    truncate_body?: number     // number of bytes of post body, default 0 (all)
    start_author?: string      // ?
    start_permlink?: string    // start from this post?
    parent_author?: string     // ?
    parent_permlink?: string   // ?
}

// https://github.com/steemit/steem/blob/9cac7d549c79f8a570e0dd38dbe301a8746eb951/libraries/app/include/steemit/app/steem_api_objects.hpp#L59
export interface ICommentApiObj {
    id: number // comment_id_type
    category: string
    parent_author: string // account_name_type
    parent_permlink: string
    author: string // account_name_type
    permlink: string
    title: string
    body: string
    json_metadata: string
    last_update: string // time_point_sec
    created: string // time_point_sec
    active: string // time_point_sec
    last_payout: string // time_point_sec
    depth: number // uint8_t
    children: number // uint32_t
    net_rshares: string // share_type
    abs_rshares: string // share_type
    vote_rshares: string // share_type
    children_abs_rshares: string // share_type
    cashout_time: string // time_point_sec
    max_cashout_time: string // time_point_sec
    total_vote_weight: number // uint64_t
    reward_weight: number // uint16_t
    total_payout_value: string // asset
    curator_payout_value: string // asset
    author_rewards: string // share_type
    net_votes: number // int32_t
    root_comment: number // comment_id_type
    max_accepted_payout: string // asset
    percent_steem_dollars: number // uint16_t
    allow_replies: boolean
    allow_votes: boolean
    allow_curation_rewards: boolean
    beneficiaries: any[] // beneficiary_route_type[]
}

// https://github.com/steemit/steem/blob/9cac7d549c79f8a570e0dd38dbe301a8746eb951/libraries/app/include/steemit/app/state.hpp#L65
export interface IDiscussion extends ICommentApiObj {
    url: string // /category/@rootauthor/root_permlink#author/permlink
    root_title: string
    pending_payout_value: string // "asset" sbd
    total_pending_payout_value: string // "asset" sbd including replies
    active_votes: any[] // vote_state[]
    replies: string[] ///< author/slug mapping
    author_reputation: number // share_type
    promoted: string // asset sbd
    body_length: string // uint32
    reblogged_by: any[] // account_name_type[]
    first_reblogged_by?: any // account_name_type
    first_reblogged_on?: any // time_point_sec
}

export type FilterFn = (IDiscussion) => boolean
const allowAll = (post: IDiscussion) => true

export async function fetchPosts(author: string, limit: number = 10, filter: FilterFn = allowAll, from?: string): Promise<IDiscussion[]> {
    let results: IDiscussion[] = []
    let seen: {[id: number]: boolean} = {}
    let query: IDisqussionQuery = {tag: author, limit: limit+1}
    if (from) {
        query.start_author = author
        query.start_permlink = from
    }
    do {
        const posts: IDiscussion[] = await steem.api.getDiscussionsByBlog(query)
        let valid: IDiscussion[] = []
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
        results.concat(valid.filter(filter))
        if (posts.length !== query.limit) {
            break
        }
        query.start_author = posts[posts.length-1].author
        query.start_permlink = posts[posts.length-1].permlink
    } while (results.length < limit)
    return results
}

export async function fetchPost(author: string, permalink: string): Promise<IDiscussion> {
    let query: IDisqussionQuery = {
        tag: author,
        limit: 1,
        start_author: author,
        start_permlink: permalink,
    }
    let results = await steem.api.getDiscussionsByBlog(query)
    if (results.length !== 1) {
        throw new Error(`Unable to find post: @${ author }/${ permalink }`)
    }
    return results[0]
}
