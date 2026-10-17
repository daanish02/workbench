// Architecture diagrams for the CS case studies, drawn by ArchDiagram.astro.
// Nodes sit on a grid (col 0–4, row 0–3). Edges are 'sync' (the caller waits) or 'async'
// (queued or fire-and-forget). A flow is a list of steps; `at` names an edge as 'from>to'
// (the reverse spelling 'to>from' highlights the same edge as a reply) or a single node id.

export type NodeKind = 'client' | 'service' | 'store' | 'queue' | 'external';
export interface ArchNode { id: string; label: string; tag?: string; col: number; row: number; kind: NodeKind }
export interface ArchEdge { from: string; to: string; kind: 'sync' | 'async' }
export interface ArchStep { at: string; text: string }
export interface Arch {
  title: string;
  caption: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  flows: { name: string; steps: ArchStep[] }[];
}

const s = (from: string, to: string): ArchEdge => ({ from, to, kind: 'sync' });
const a = (from: string, to: string): ArchEdge => ({ from, to, kind: 'async' });

export const architectures: Record<string, Arch> = {
  'url-shortener': {
    title: 'URL shortener: cache in front, analytics off the hot path',
    caption: 'Pick a flow and press Step. Redirects touch only the cache on a hit; a miss falls through to the store and fills the cache. The click event goes to a queue, so analytics can be slow or down without slowing a redirect.',
    nodes: [
      { id: 'c', label: 'Browser', col: 0, row: 1, kind: 'client' },
      { id: 'lb', label: 'Load balancer', col: 1, row: 1, kind: 'service' },
      { id: 'app', label: 'App servers', tag: 'stateless', col: 2, row: 1, kind: 'service' },
      { id: 'cache', label: 'Cache', tag: 'LRU · cache-aside', col: 3, row: 0, kind: 'store' },
      { id: 'db', label: 'Key-value store', tag: 'sharded by code', col: 4, row: 1, kind: 'store' },
      { id: 'ids', label: 'ID ranges', tag: 'blocks of 10,000', col: 2, row: 2, kind: 'service' },
      { id: 'q', label: 'Click queue', col: 3, row: 2, kind: 'queue' },
      { id: 'an', label: 'Analytics', tag: 'batch counts', col: 4, row: 2, kind: 'service' },
    ],
    edges: [s('c', 'lb'), s('lb', 'app'), s('app', 'cache'), s('app', 'db'), s('app', 'ids'), a('app', 'q'), a('q', 'an')],
    flows: [
      { name: 'Redirect, cache hit', steps: [
        { at: 'c>lb', text: 'The browser requests sho.rt/8sud2.' },
        { at: 'lb>app', text: 'Any app server can answer: they hold no state.' },
        { at: 'app>cache', text: 'Look up 8sud2 in the cache: hit, the long URL comes back.' },
        { at: 'app>q', text: 'Publish a click event and move on without waiting for it.' },
        { at: 'app>lb', text: 'Reply 302 with the long URL in the Location header.' },
        { at: 'lb>c', text: 'The browser follows the redirect. The store was never touched.' },
      ] },
      { name: 'Redirect, cache miss', steps: [
        { at: 'c>lb', text: 'A rarely used link is requested.' },
        { at: 'lb>app', text: 'Routed to any app server.' },
        { at: 'app>cache', text: 'Cache miss.' },
        { at: 'app>db', text: 'Read the long URL from the store by its key.' },
        { at: 'app>cache', text: 'Write it into the cache so the next click is a hit.' },
        { at: 'app>q', text: 'Click event to the queue.' },
        { at: 'q>an', text: 'Later, the analytics consumer counts clicks in batches.' },
        { at: 'lb>c', text: 'Reply 302.' },
      ] },
      { name: 'Create link', steps: [
        { at: 'c>lb', text: 'POST the long URL.' },
        { at: 'lb>app', text: 'Routed to any app server.' },
        { at: 'app', text: 'Take the next number from this server’s range and write it in base62.' },
        { at: 'app>ids', text: 'Only when the range runs out: claim a new block of 10,000 numbers.' },
        { at: 'app>db', text: 'Insert code → long URL.' },
        { at: 'lb>c', text: 'Reply with the short link.' },
      ] },
    ],
  },

  'chat-application': {
    title: 'Chat: gateways hold connections, one owner orders each conversation',
    caption: 'Step a message from sender to recipient. Gateways only hold WebSockets; the chat service that owns the conversation assigns the sequence number and persists before acknowledging. Delivery to the recipient happens after the ack, so it is drawn asynchronous.',
    nodes: [
      { id: 's', label: 'Sender', col: 0, row: 0, kind: 'client' },
      { id: 'ga', label: 'Gateway A', tag: 'WebSocket', col: 1, row: 0, kind: 'service' },
      { id: 'chat', label: 'Chat service', tag: 'one owner per chat', col: 2, row: 1, kind: 'service' },
      { id: 'reg', label: 'Registry', tag: 'user → gateway', col: 3, row: 0, kind: 'store' },
      { id: 'store', label: 'Message store', tag: 'partitioned log', col: 4, row: 1, kind: 'store' },
      { id: 'push', label: 'Push service', tag: 'phone platform', col: 3, row: 2, kind: 'external' },
      { id: 'gb', label: 'Gateway B', tag: 'WebSocket', col: 1, row: 2, kind: 'service' },
      { id: 'r', label: 'Recipient', col: 0, row: 2, kind: 'client' },
    ],
    edges: [s('s', 'ga'), s('ga', 'chat'), s('chat', 'store'), s('chat', 'reg'), a('chat', 'gb'), s('gb', 'r'), a('chat', 'push')],
    flows: [
      { name: 'Recipient online', steps: [
        { at: 's>ga', text: 'The app sends the message with a client-generated id over its open WebSocket.' },
        { at: 'ga>chat', text: 'Gateway A forwards it to the partition that owns this conversation.' },
        { at: 'chat>store', text: 'Assign the next sequence number and persist durably.' },
        { at: 'chat>ga', text: 'Only now acknowledge: the sender sees one tick.' },
        { at: 'chat>reg', text: 'Look up the recipient: connected to Gateway B.' },
        { at: 'chat>gb', text: 'Push the message to Gateway B.' },
        { at: 'gb>r', text: 'Down the recipient’s connection. Their ack gives the sender two ticks.' },
      ] },
      { name: 'Recipient offline', steps: [
        { at: 's>ga', text: 'The message arrives at Gateway A.' },
        { at: 'ga>chat', text: 'Forwarded to the owner.' },
        { at: 'chat>store', text: 'Sequence number 42, persisted.' },
        { at: 'chat>ga', text: 'Acknowledge the sender.' },
        { at: 'chat>reg', text: 'No connection registered for the recipient.' },
        { at: 'chat>push', text: 'Send a push notification through the phone platform.' },
        { at: 'r>gb', text: 'Later the app reconnects: “send me everything after 41”.' },
        { at: 'gb>chat', text: 'Gateway B asks the owner for the backlog.' },
        { at: 'chat>store', text: 'Read the conversation log after sequence 41.' },
        { at: 'gb>r', text: 'Message 42 is delivered in order.' },
      ] },
    ],
  },

  'news-feed': {
    title: 'News feed: push for most posts, pull celebrities at read time',
    caption: 'Step a post and a feed read. Publishing returns as soon as the post is stored; fan-out to follower timelines runs from a queue. A read is one timeline lookup, plus a pull of the few celebrities the reader follows, then hydration of ids into posts.',
    nodes: [
      { id: 'c', label: 'App', col: 0, row: 1, kind: 'client' },
      { id: 'api', label: 'Feed API', tag: 'stateless', col: 1, row: 1, kind: 'service' },
      { id: 'post', label: 'Posts', col: 2, row: 0, kind: 'service' },
      { id: 'q', label: 'Fan-out queue', col: 3, row: 0, kind: 'queue' },
      { id: 'w', label: 'Fan-out workers', tag: 'skip celebrities', col: 4, row: 0, kind: 'service' },
      { id: 'graph', label: 'Follow graph', col: 4, row: 1, kind: 'store' },
      { id: 'tl', label: 'Timeline cache', tag: 'ids · bounded', col: 3, row: 1, kind: 'store' },
      { id: 'pdb', label: 'Post store', tag: 'by author', col: 2, row: 2, kind: 'store' },
      { id: 'pc', label: 'Post cache', tag: 'hydrate ids', col: 3, row: 2, kind: 'store' },
    ],
    edges: [s('c', 'api'), s('api', 'post'), s('post', 'pdb'), a('post', 'q'), a('q', 'w'), s('w', 'graph'), s('w', 'tl'), s('api', 'tl'), s('api', 'pdb'), s('api', 'pc')],
    flows: [
      { name: 'Publish a post', steps: [
        { at: 'c>api', text: 'An ordinary user posts.' },
        { at: 'api>post', text: 'Handed to the post service.' },
        { at: 'post>pdb', text: 'Store the post once, under its author.' },
        { at: 'post>q', text: 'Enqueue a fan-out job and reply to the user: the post is live.' },
        { at: 'q>w', text: 'A worker picks up the job.' },
        { at: 'w>graph', text: 'Fetch the author’s followers.' },
        { at: 'w>tl', text: 'Prepend the post id to each active follower’s timeline.' },
      ] },
      { name: 'Read the feed', steps: [
        { at: 'c>api', text: 'The reader opens the app.' },
        { at: 'api>tl', text: 'One lookup: the precomputed list of post ids.' },
        { at: 'api>pdb', text: 'Pull recent posts from the few celebrities this reader follows, and merge by time.' },
        { at: 'api>pc', text: 'Hydrate the ids into post bodies in one batch; deleted posts drop out here.' },
        { at: 'api>c', text: 'Return the first page with a cursor for the next one.' },
      ] },
    ],
  },

  'payment-system': {
    title: 'Payments: every step keyed, guarded and recorded',
    caption: 'Step a payment, a timeout and a retry. The idempotency store makes a retry return the first result; each state change is a compare-and-set; the ledger is append-only. A timeout parks the payment as unknown until a webhook or a status check settles it, and reconciliation checks everything afterwards.',
    nodes: [
      { id: 'c', label: 'Checkout', col: 0, row: 1, kind: 'client' },
      { id: 'api', label: 'Payment service', col: 1, row: 1, kind: 'service' },
      { id: 'idem', label: 'Idempotency keys', tag: 'key → result', col: 1, row: 0, kind: 'store' },
      { id: 'db', label: 'Payments DB', tag: 'compare-and-set', col: 2, row: 0, kind: 'store' },
      { id: 'prov', label: 'Card provider', tag: 'external', col: 3, row: 1, kind: 'external' },
      { id: 'wh', label: 'Webhooks', tag: 'verify · dedupe', col: 3, row: 0, kind: 'service' },
      { id: 'led', label: 'Ledger', tag: 'double-entry', col: 2, row: 2, kind: 'store' },
      { id: 'rec', label: 'Reconciliation', tag: 'daily job', col: 4, row: 2, kind: 'service' },
    ],
    edges: [s('c', 'api'), s('api', 'idem'), s('api', 'db'), s('api', 'prov'), a('prov', 'wh'), s('wh', 'db'), s('api', 'led'), s('rec', 'led'), s('rec', 'prov')],
    flows: [
      { name: 'Happy path', steps: [
        { at: 'c>api', text: 'Pay $50 with idempotency key K, generated when checkout started.' },
        { at: 'api>idem', text: 'K is new: record it as in progress.' },
        { at: 'api>db', text: 'Create the payment in state created.' },
        { at: 'api>prov', text: 'Ask the provider to authorize, passing K along.' },
        { at: 'prov>api', text: 'Approved.' },
        { at: 'api>db', text: 'Compare-and-set created → authorized.' },
        { at: 'api>led', text: 'Append entries that sum to zero: customer −$50, merchant +$50.' },
        { at: 'api>idem', text: 'Store the result under K.' },
        { at: 'api>c', text: 'Reply: paid.' },
      ] },
      { name: 'Provider times out', steps: [
        { at: 'c>api', text: 'Pay with key K.' },
        { at: 'api>prov', text: 'The call times out: the money may or may not have moved.' },
        { at: 'api>db', text: 'Mark the payment unknown, never failed.' },
        { at: 'api>c', text: 'Tell the customer it is processing.' },
        { at: 'prov>wh', text: 'Later the provider’s webhook says: authorized.' },
        { at: 'wh', text: 'Verify the signature; ignore the event id if already handled.' },
        { at: 'wh>db', text: 'Compare-and-set unknown → authorized.' },
      ] },
      { name: 'Client retries', steps: [
        { at: 'c>api', text: 'The network dropped the reply, so checkout resends with the same key K.' },
        { at: 'api>idem', text: 'K is already stored with a result.' },
        { at: 'api>c', text: 'Return the stored result. The provider is not called again: no double charge.' },
      ] },
      { name: 'Reconcile', steps: [
        { at: 'rec>prov', text: 'Fetch the provider’s settlement report for the day.' },
        { at: 'rec>led', text: 'Compare it with the ledger, entry by entry.' },
        { at: 'rec', text: 'Flag every mismatch: missing, duplicated or different amounts.' },
      ] },
    ],
  },

  'rate-limiter': {
    title: 'Distributed rate limiter: one shared, atomic count per key',
    caption: 'Step an allowed request, a rejected one and a store outage. Every gateway asks the same counter store, so the count is global; the check-and-increment runs as one atomic script. When the store does not answer within a few milliseconds, the fail-open or fail-closed policy decides.',
    nodes: [
      { id: 'c', label: 'Client', col: 0, row: 1, kind: 'client' },
      { id: 'lb', label: 'Load balancer', col: 1, row: 1, kind: 'service' },
      { id: 'gw', label: 'API gateways', tag: 'local fast path', col: 2, row: 1, kind: 'service' },
      { id: 'cnt', label: 'Counter store', tag: 'atomic script', col: 3, row: 0, kind: 'store' },
      { id: 'api', label: 'Backend', col: 4, row: 1, kind: 'service' },
    ],
    edges: [s('c', 'lb'), s('lb', 'gw'), s('gw', 'cnt'), s('gw', 'api')],
    flows: [
      { name: 'Allowed', steps: [
        { at: 'c>lb', text: 'A request with API key k.' },
        { at: 'lb>gw', text: 'Spread to any gateway.' },
        { at: 'gw>cnt', text: 'One atomic increment-and-check: 57 ≤ 100 this minute.' },
        { at: 'gw>api', text: 'Forward to the backend.' },
        { at: 'lb>c', text: 'Response with RateLimit headers: 43 left.' },
      ] },
      { name: 'Over the limit', steps: [
        { at: 'c>lb', text: 'Request number 101 this minute.' },
        { at: 'lb>gw', text: 'A different gateway this time; it does not matter.' },
        { at: 'gw>cnt', text: 'The shared count says 101 > 100.' },
        { at: 'gw>lb', text: 'Reject without touching the backend.' },
        { at: 'lb>c', text: '429 Too Many Requests, Retry-After: 12.' },
      ] },
      { name: 'Store down', steps: [
        { at: 'c>lb', text: 'A request arrives during a store outage.' },
        { at: 'lb>gw', text: 'Routed to a gateway.' },
        { at: 'gw>cnt', text: 'No answer within the 5 ms timeout.' },
        { at: 'gw', text: 'Apply the policy chosen in advance: fail open (allow) or fail closed (reject).' },
        { at: 'gw>api', text: 'Fail open: the request goes through, unprotected.' },
      ] },
    ],
  },

  'ride-hailing': {
    title: 'Ride hailing: positions in memory, trips in a transactional store',
    caption: 'Step a driver update and a ride request. Positions are ephemeral and write-heavy, so they live in an in-memory geo index with expiry, partitioned by city. The trip is durable and guarded. Claiming a driver is a compare-and-set, so two riders cannot get the same car.',
    nodes: [
      { id: 'r', label: 'Rider app', col: 0, row: 0, kind: 'client' },
      { id: 'd', label: 'Driver app', col: 0, row: 2, kind: 'client' },
      { id: 'gw', label: 'Gateways', tag: 'WebSocket', col: 1, row: 1, kind: 'service' },
      { id: 'match', label: 'Matching', tag: 'rank by ETA', col: 2, row: 0, kind: 'service' },
      { id: 'loc', label: 'Locations', col: 2, row: 2, kind: 'service' },
      { id: 'geo', label: 'Geo index', tag: 'in memory · TTL', col: 3, row: 1, kind: 'store' },
      { id: 'trip', label: 'Trip store', tag: 'state machine', col: 4, row: 0, kind: 'store' },
      { id: 'surge', label: 'Surge pricing', tag: 'stream per cell', col: 4, row: 2, kind: 'service' },
    ],
    edges: [s('r', 'gw'), s('d', 'gw'), s('gw', 'loc'), s('loc', 'geo'), a('loc', 'surge'), s('gw', 'match'), s('match', 'geo'), s('match', 'trip')],
    flows: [
      { name: 'Driver update', steps: [
        { at: 'd>gw', text: 'Every 4 seconds the driver app sends its position.' },
        { at: 'gw>loc', text: 'Forwarded to the location service for that city.' },
        { at: 'loc>geo', text: 'Move the driver to their current cell, with a short expiry.' },
        { at: 'loc>surge', text: 'The update also feeds the per-cell supply count.' },
      ] },
      { name: 'Request a ride', steps: [
        { at: 'r>gw', text: 'The rider asks for a car.' },
        { at: 'gw>match', text: 'Handed to matching for this city.' },
        { at: 'match>geo', text: 'Read drivers in the rider’s cell and its neighbours; rank them by ETA.' },
        { at: 'match>geo', text: 'Claim the best one: compare-and-set available → offered.' },
        { at: 'match>trip', text: 'Create the trip in state requested.' },
        { at: 'gw>d', text: 'Offer the trip to the driver.' },
        { at: 'd>gw', text: 'The driver accepts.' },
        { at: 'match>trip', text: 'Compare-and-set requested → accepted.' },
        { at: 'gw>r', text: 'Push the driver and live ETA to the rider.' },
      ] },
    ],
  },

  'search-autocomplete': {
    title: 'Search and autocomplete: two systems, one log',
    caption: 'Step a search, a keystroke and the two background loops. A search scatters to every document shard and merges their top results. Autocomplete never touches the index: it reads a trie of popular queries built offline from the same query logs.',
    nodes: [
      { id: 'u', label: 'User', col: 0, row: 1, kind: 'client' },
      { id: 'ac', label: 'Autocomplete', tag: 'trie with top-k', col: 1, row: 0, kind: 'service' },
      { id: 'tb', label: 'Trie builder', tag: 'hourly batch', col: 2, row: 0, kind: 'service' },
      { id: 'logs', label: 'Query logs', col: 3, row: 0, kind: 'queue' },
      { id: 'qs', label: 'Query service', tag: 'scatter-gather', col: 1, row: 1, kind: 'service' },
      { id: 'sh', label: 'Index shards', tag: 'by document', col: 3, row: 1, kind: 'store' },
      { id: 'rr', label: 'Re-ranker', tag: 'learned model', col: 1, row: 2, kind: 'service' },
      { id: 'ix', label: 'Indexer', tag: 'immutable segments', col: 3, row: 2, kind: 'service' },
      { id: 'docs', label: 'New documents', col: 4, row: 2, kind: 'queue' },
    ],
    edges: [s('u', 'ac'), s('u', 'qs'), s('qs', 'sh'), s('qs', 'rr'), a('qs', 'logs'), a('logs', 'tb'), a('tb', 'ac'), a('docs', 'ix'), s('ix', 'sh')],
    flows: [
      { name: 'Search', steps: [
        { at: 'u>qs', text: 'Query: waterproof red jacket.' },
        { at: 'qs>sh', text: 'Scatter to every shard; each intersects its postings lists and scores with BM25.' },
        { at: 'sh>qs', text: 'Each shard returns its local top results; slow shards are cut off at the timeout.' },
        { at: 'qs>rr', text: 'Re-rank the merged few hundred with the expensive model.' },
        { at: 'qs>u', text: 'Return the top ten.' },
        { at: 'qs>logs', text: 'Log the query, off the response path.' },
      ] },
      { name: 'Keystroke', steps: [
        { at: 'u>ac', text: 'The user has typed “wat” (after a short debounce).' },
        { at: 'ac', text: 'Walk three trie nodes; the last already stores its top completions.' },
        { at: 'ac>u', text: 'Return them in a few milliseconds. No index shard was touched.' },
      ] },
      { name: 'Background loops', steps: [
        { at: 'logs>tb', text: 'Every hour the builder counts queries from the logs.' },
        { at: 'tb>ac', text: 'Ship the new trie to every autocomplete node.' },
        { at: 'docs>ix', text: 'Meanwhile new documents stream to the indexer.' },
        { at: 'ix>sh', text: 'Each batch becomes a new immutable segment; merges happen later in the background.' },
      ] },
    ],
  },

  'video-streaming': {
    title: 'Video: an asynchronous pipeline in, a CDN out',
    caption: 'Step an upload and a playback. Transcoding takes minutes, so it runs from a queue and the upload returns at once. Playback is plain HTTP for small segments; the edge serves almost all of them, and the player picks each segment’s quality from the throughput it measures.',
    nodes: [
      { id: 'cr', label: 'Creator', col: 0, row: 0, kind: 'client' },
      { id: 'up', label: 'Uploads', col: 1, row: 0, kind: 'service' },
      { id: 'q', label: 'Transcode queue', col: 2, row: 0, kind: 'queue' },
      { id: 'tc', label: 'Transcoders', tag: 'idempotent per chunk', col: 3, row: 0, kind: 'service' },
      { id: 'meta', label: 'Metadata DB', col: 2, row: 1, kind: 'store' },
      { id: 'obj', label: 'Object storage', tag: 'segments + manifest', col: 4, row: 1, kind: 'store' },
      { id: 'v', label: 'Player', tag: 'adaptive bitrate', col: 0, row: 2, kind: 'client' },
      { id: 'edge', label: 'CDN edge', tag: 'near the viewer', col: 1, row: 2, kind: 'store' },
      { id: 'mid', label: 'Mid-tier cache', col: 3, row: 2, kind: 'store' },
    ],
    edges: [s('cr', 'up'), s('up', 'obj'), a('up', 'q'), a('q', 'tc'), s('tc', 'obj'), s('tc', 'meta'), s('v', 'edge'), s('edge', 'mid'), s('mid', 'obj')],
    flows: [
      { name: 'Upload', steps: [
        { at: 'cr>up', text: 'The creator uploads the original file.' },
        { at: 'up>obj', text: 'Store the raw file as-is.' },
        { at: 'up>q', text: 'Enqueue a transcode job and reply: processing.' },
        { at: 'q>tc', text: 'Workers split the video into chunks and take them in parallel.' },
        { at: 'tc>obj', text: 'Write every chunk at every rung of the bitrate ladder, plus the manifest.' },
        { at: 'tc>meta', text: 'Mark the video ready.' },
      ] },
      { name: 'Play', steps: [
        { at: 'v>edge', text: 'Fetch the manifest from the nearby edge.' },
        { at: 'v>edge', text: 'Segment 1 at 240p, so playback starts fast: an edge hit.' },
        { at: 'v', text: 'Measured throughput is high: pick 720p for the next segment.' },
        { at: 'v>edge', text: 'Segment 2 at 720p: an edge miss.' },
        { at: 'edge>mid', text: 'The edge asks the mid-tier cache: also a miss.' },
        { at: 'mid>obj', text: 'Fetch from the origin, once for the whole region.' },
        { at: 'edge>v', text: 'Served, and now cached for every other viewer nearby.' },
      ] },
    ],
  },

  'web-crawler': {
    title: 'Web crawler: one loop of stages joined by queues',
    caption: 'Step one page around the loop. Every stage except the frontier and the seen-sets is a stateless worker pool, and stages hand work on through queues, so a slow parser never stalls fetching. Only links that pass the URL filter return to the frontier.',
    nodes: [
      { id: 'seed', label: 'Seed URLs', col: 0, row: 0, kind: 'client' },
      { id: 'fr', label: 'URL frontier', tag: 'per-host queues', col: 1, row: 0, kind: 'queue' },
      { id: 'fe', label: 'Fetchers', tag: 'robots.txt cache', col: 2, row: 0, kind: 'service' },
      { id: 'web', label: 'The web', col: 3, row: 0, kind: 'external' },
      { id: 'pa', label: 'Parser', tag: 'content dedupe', col: 3, row: 1, kind: 'service' },
      { id: 'st', label: 'Page store', col: 4, row: 2, kind: 'store' },
      { id: 'ex', label: 'Link extractor', col: 2, row: 1, kind: 'service' },
      { id: 'uf', label: 'URL filter', tag: 'Bloom filter', col: 1, row: 1, kind: 'service' },
    ],
    edges: [s('seed', 'fr'), s('fr', 'fe'), s('fe', 'web'), a('fe', 'pa'), a('pa', 'st'), a('pa', 'ex'), s('ex', 'uf'), a('uf', 'fr')],
    flows: [
      { name: 'One page', steps: [
        { at: 'fr>fe', text: 'The frontier releases a URL whose host has waited out its politeness gap.' },
        { at: 'fe>web', text: 'Check the cached robots.txt, resolve DNS from cache, GET the page.' },
        { at: 'fe>pa', text: 'Hand the raw HTML to the parse queue; the fetcher moves on.' },
        { at: 'pa', text: 'Hash the body: not seen before, so keep it.' },
        { at: 'pa>st', text: 'Write the page for the indexer.' },
        { at: 'pa>ex', text: 'Pass on the three outbound links.' },
        { at: 'ex>uf', text: 'Normalize them: two are spellings of one URL, and the Bloom filter has seen it.' },
        { at: 'uf>fr', text: 'One new URL joins its host’s queue in the frontier.' },
      ] },
    ],
  },

  'collaborative-editor': {
    title: 'Collaborative editor: one session server per document',
    caption: 'Step an edit. Every editor of one document reaches the same server, found by hashing the document id. The client applies its edit locally first; the server orders, logs and broadcasts it. Cursors take the same path but are never persisted.',
    nodes: [
      { id: 'a', label: 'Editor A', tag: 'local-first', col: 0, row: 0, kind: 'client' },
      { id: 'b', label: 'Editor B', col: 0, row: 2, kind: 'client' },
      { id: 'rt', label: 'Router', tag: 'hash(doc id)', col: 1, row: 1, kind: 'service' },
      { id: 'sv', label: 'Session server', tag: 'orders operations', col: 2, row: 1, kind: 'service' },
      { id: 'log', label: 'Operation log', tag: 'append-only', col: 3, row: 0, kind: 'store' },
      { id: 'snap', label: 'Snapshots', tag: 'periodic', col: 3, row: 2, kind: 'store' },
    ],
    edges: [s('a', 'rt'), s('b', 'rt'), s('rt', 'sv'), s('sv', 'log'), a('sv', 'snap')],
    flows: [
      { name: 'An edit', steps: [
        { at: 'a', text: 'A types “x”. It appears at once; the operation joins A’s unacknowledged queue.' },
        { at: 'a>rt', text: 'Send it with a unique operation id over the WebSocket.' },
        { at: 'rt>sv', text: 'The router hashes the document id: every editor reaches this one process.' },
        { at: 'sv', text: 'Transform against concurrent operations and give it the next position in the order.' },
        { at: 'sv>log', text: 'Append to the durable log.' },
        { at: 'rt>a', text: 'Acknowledge A, which drops it from its queue.' },
        { at: 'rt>b', text: 'Broadcast the transformed operation to B.' },
        { at: 'sv>snap', text: 'Now and then, snapshot the document so loading is snapshot plus recent operations.' },
      ] },
      { name: 'Reconnect', steps: [
        { at: 'a', text: 'A went offline and kept typing; three operations wait in its queue.' },
        { at: 'a>rt', text: 'On reconnect, resend all three with their original ids.' },
        { at: 'rt>sv', text: 'One had already arrived before the drop; its id is known, so it is ignored.' },
        { at: 'sv>log', text: 'Append the other two.' },
        { at: 'rt>b', text: 'B receives them, transformed into its current document.' },
      ] },
    ],
  },

  'key-value-store': {
    title: 'Key-value store: a coordinator and N replicas on the ring',
    caption: 'Step a write, a read and a write with one replica down. With N = 3 and W = R = 2, the coordinator answers after two replicas respond. When C is down, the sloppy quorum puts its copy on D with a hint, and D hands it back once C recovers.',
    nodes: [
      { id: 'c', label: 'Client', col: 0, row: 1, kind: 'client' },
      { id: 'co', label: 'Coordinator', tag: 'any node', col: 1, row: 1, kind: 'service' },
      { id: 'ra', label: 'Replica A', col: 3, row: 0, kind: 'store' },
      { id: 'rb', label: 'Replica B', col: 3, row: 1, kind: 'store' },
      { id: 'rc', label: 'Replica C', col: 3, row: 2, kind: 'store' },
      { id: 'rd', label: 'Node D', tag: 'next on the ring', col: 2, row: 2, kind: 'store' },
    ],
    edges: [s('c', 'co'), s('co', 'ra'), s('co', 'rb'), s('co', 'rc'), s('co', 'rd'), a('rd', 'rc')],
    flows: [
      { name: 'Write, W = 2', steps: [
        { at: 'c>co', text: 'put(cart:42). Any node can coordinate; it hashes the key onto the ring.' },
        { at: 'co>ra', text: 'Send to the first replica in the preference list.' },
        { at: 'co>rb', text: 'And the second.' },
        { at: 'co>rc', text: 'And the third, all in parallel.' },
        { at: 'co>c', text: 'A and B have acked: W = 2 reached, so reply. C catches up on its own.' },
      ] },
      { name: 'Read, R = 2', steps: [
        { at: 'c>co', text: 'get(cart:42).' },
        { at: 'co>rb', text: 'Ask the replicas.' },
        { at: 'co>rc', text: 'B and C answer first.' },
        { at: 'co', text: 'Compare vector clocks: return the newest, or both siblings if concurrent.' },
        { at: 'co>c', text: 'Reply. W + R = 4 > N = 3, so at least one of the two saw the last write.' },
      ] },
      { name: 'Replica down', steps: [
        { at: 'c>co', text: 'put(cart:42) while C is unreachable.' },
        { at: 'co>ra', text: 'A acks.' },
        { at: 'co>rc', text: 'C does not answer.' },
        { at: 'co>rd', text: 'Write to the next healthy node, D, with a hint: “this belongs to C”.' },
        { at: 'co>c', text: 'Two acks: the write succeeds despite the failure.' },
        { at: 'rd>rc', text: 'When gossip shows C is back, D hands the data over and deletes its copy.' },
      ] },
    ],
  },

  'kv-node-engine': {
    title: 'Inside one node: the LSM write and read paths',
    caption: 'Step a write, a flush and a read. Writes are a sequential log append plus a memory insert. Reads check memory first, then files newest first, skipping any file whose Bloom filter rules the key out.',
    nodes: [
      { id: 'in', label: 'Request', col: 0, row: 1, kind: 'client' },
      { id: 'log', label: 'Commit log', tag: 'sequential append', col: 1, row: 0, kind: 'store' },
      { id: 'mem', label: 'Memtable', tag: 'sorted, in memory', col: 2, row: 1, kind: 'store' },
      { id: 'bf', label: 'Bloom filters', tag: 'one per file', col: 2, row: 2, kind: 'store' },
      { id: 'sst', label: 'SSTables', tag: 'immutable, sorted', col: 3, row: 1, kind: 'store' },
      { id: 'cmp', label: 'Compaction', tag: 'drops tombstones', col: 4, row: 1, kind: 'service' },
    ],
    edges: [s('in', 'log'), s('in', 'mem'), a('mem', 'sst'), s('in', 'bf'), s('bf', 'sst'), a('cmp', 'sst')],
    flows: [
      { name: 'Write and flush', steps: [
        { at: 'in>log', text: 'put(k, v): append to the commit log first, for durability.' },
        { at: 'in>mem', text: 'Insert into the sorted memtable, and acknowledge.' },
        { at: 'mem>sst', text: 'When the memtable fills, write it out as one new sorted file.' },
        { at: 'cmp>sst', text: 'In the background, merge files and drop overwritten values and tombstones.' },
      ] },
      { name: 'Read', steps: [
        { at: 'in>mem', text: 'get(k): not in the memtable.' },
        { at: 'in>bf', text: 'Ask each file’s Bloom filter: “definitely not” for all but one.' },
        { at: 'bf>sst', text: 'Read only that file, found by binary search.' },
        { at: 'in', text: 'Return the value. Most files were never opened.' },
      ] },
    ],
  },
};
