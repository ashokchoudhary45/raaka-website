import { getD1 } from "@/lib/d1";
import { getCurrentUser } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

const MAX_POST = 280;
const PAGE_SIZE = 20;

function cleanHandle(value: string) {
  return value
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

function cleanName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

function cleanBody(value: string) {
  return value.trim().slice(0, MAX_POST);
}

function verificationType(row: any) {
  if (
    row?.verification_type === "blue" ||
    row?.verification_type === "gold" ||
    row?.verification_type === "grey"
  ) {
    return row.verification_type;
  }

  return "none";
}

function verificationData(row: any) {
  const type = verificationType(row);

  return {
    verified: type !== "none" || Boolean(row?.verified),
    verificationType: type,
    verificationLabel: row?.verification_label || null,
  };
}

async function ensureProfile(
  db: D1Database,
  visitorId: string,
  displayName = "RAAKA Fan",
  handle = ""
) {
  const existing = await db
    .prepare(
      "SELECT * FROM social_profiles WHERE visitor_id = ? LIMIT 1"
    )
    .bind(visitorId)
    .first<any>();

  if (existing) {
    return existing;
  }

  let base =
    cleanHandle(handle) ||
    cleanHandle(displayName) ||
    `fan_${visitorId.replace(/-/g, "").slice(0, 8)}`;

  if (!/^[a-z0-9_]{3,20}$/.test(base)) {
    base = `fan_${visitorId.replace(/-/g, "").slice(0, 8)}`;
  }

  let candidate = base;

  for (let i = 0; i < 100; i++) {
    const taken = await db
      .prepare(
        "SELECT visitor_id FROM social_profiles WHERE handle = ? COLLATE NOCASE LIMIT 1"
      )
      .bind(candidate)
      .first();

    if (!taken) {
      break;
    }

    candidate = `${base.slice(0, 17)}_${i + 1}`;
  }

  await db
    .prepare(
      `INSERT INTO social_profiles
       (visitor_id, handle, display_name)
       VALUES (?, ?, ?)`
    )
    .bind(
      visitorId,
      candidate,
      cleanName(displayName) || "RAAKA Fan"
    )
    .run();

  return await db
    .prepare(
      "SELECT * FROM social_profiles WHERE visitor_id = ? LIMIT 1"
    )
    .bind(visitorId)
    .first<any>();
}

function profileShape(row: any) {
  const verification = verificationData(row);

  return {
    visitorId: row.visitor_id,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio || "",
    followers: Number(row.followers_count || 0),
    following: Number(row.following_count || 0),
    posts: Number(row.posts_count || 0),

    verified: verification.verified,
    verificationType: verification.verificationType,
    verificationLabel: verification.verificationLabel,
  };
}

function postShape(row: any) {
  const verification = verificationData(row);

  return {
    id: Number(row.id),
    body: row.body,
    createdAt: row.created_at,
    likes: Number(row.likes_count || 0),
    replies: Number(row.replies_count || 0),
    reposts: Number(row.reposts_count || 0),
    liked: Boolean(row.liked),
    bookmarked: Boolean(row.bookmarked),
    following: Boolean(row.following),

    author: {
      visitorId: row.visitor_id,
      handle: row.handle,
      displayName: row.display_name,

      verified: verification.verified,
      verificationType: verification.verificationType,
      verificationLabel: verification.verificationLabel,
    },

    replyToId: row.reply_to_id
      ? Number(row.reply_to_id)
      : null,

    repostOfId: row.repost_of_id
      ? Number(row.repost_of_id)
      : null,
  };
}

async function getAuthenticatedUser(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      user: null,
      response: Response.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      ),
    };
  }

  if (!user.verifiedAt) {
    return {
      user: null,
      response: Response.json(
        {
          success: false,
          error: "Please verify your email first.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

async function createNotification(
  db: D1Database,
  recipientId: string,
  actorId: string,
  type: string,
  postId: number | null
) {
  if (!recipientId || recipientId === actorId) {
    return;
  }

  await db
    .prepare(
      `INSERT INTO social_notifications
       (recipient_id, actor_id, type, post_id)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      recipientId,
      actorId,
      type,
      postId
    )
    .run();
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return auth.response;
    }

    const userId = auth.user.userId;
    const db = getD1();
    const url = new URL(request.url);

    const action =
      url.searchParams.get("action") || "feed";

    const cursor = Number(
      url.searchParams.get("cursor") || "0"
    );

    await ensureProfile(db, userId);

    /*
     * PROFILE
     */
    if (action === "profile") {
      const handle = cleanHandle(
        url.searchParams.get("handle") || ""
      );

      const target = handle
        ? await db
            .prepare(
              `SELECT *
               FROM social_profiles
               WHERE handle = ? COLLATE NOCASE
               LIMIT 1`
            )
            .bind(handle)
            .first<any>()
        : await db
            .prepare(
              `SELECT *
               FROM social_profiles
               WHERE visitor_id = ?
               LIMIT 1`
            )
            .bind(userId)
            .first<any>();

      if (!target) {
        return Response.json(
          {
            success: false,
            error: "Profile not found.",
          },
          { status: 404 }
        );
      }

      const following = await db
        .prepare(
          `SELECT 1
           FROM social_follows
           WHERE follower_id = ?
             AND following_id = ?
           LIMIT 1`
        )
        .bind(
          userId,
          target.visitor_id
        )
        .first();

      return Response.json({
        success: true,
        profile: {
          ...profileShape(target),
          isFollowing: Boolean(following),
        },
      });
    }

    /*
     * NOTIFICATIONS
     */
    if (action === "notifications") {
      const rows = await db
        .prepare(
          `SELECT
             n.id,
             n.type,
             n.post_id,
             n.created_at,
             p.handle,
             p.display_name,
             p.verified,
             p.verification_type,
             p.verification_label
           FROM social_notifications n
           JOIN social_profiles p
             ON p.visitor_id = n.actor_id
           WHERE n.recipient_id = ?
           ORDER BY n.id DESC
           LIMIT 30`
        )
        .bind(userId)
        .all<any>();

      return Response.json({
        success: true,
        notifications: rows.results.map(
          (r: any) => ({
            id: r.id,
            type: r.type,
            postId: r.post_id,
            createdAt: r.created_at,

            actor: {
              handle: r.handle,
              displayName: r.display_name,
              ...verificationData(r),
            },
          })
        ),
      });
    }

    /*
     * SEARCH
     */
    if (action === "search") {
      const q = (
        url.searchParams.get("q") || ""
      )
        .trim()
        .slice(0, 40);

      if (!q) {
        return Response.json({
          success: true,
          users: [],
          posts: [],
        });
      }

      const safeQuery = q.replace(
        /[%_]/g,
        ""
      );

      const like = `%${safeQuery}%`;

      const users = await db
        .prepare(
          `SELECT *
           FROM social_profiles
           WHERE handle LIKE ? COLLATE NOCASE
              OR display_name LIKE ? COLLATE NOCASE
           ORDER BY followers_count DESC
           LIMIT 10`
        )
        .bind(like, like)
        .all<any>();

      const posts = await db
        .prepare(
          `SELECT
             s.*,
             p.handle,
             p.display_name,
             p.verified,
             p.verification_type,
             p.verification_label,

             EXISTS(
               SELECT 1
               FROM social_likes l
               WHERE l.post_id = s.id
                 AND l.visitor_id = ?
             ) AS liked,

             EXISTS(
               SELECT 1
               FROM social_bookmarks b
               WHERE b.post_id = s.id
                 AND b.visitor_id = ?
             ) AS bookmarked,

             EXISTS(
               SELECT 1
               FROM social_follows f
               WHERE f.following_id = s.visitor_id
                 AND f.follower_id = ?
             ) AS following

           FROM social_posts s

           JOIN social_profiles p
             ON p.visitor_id = s.visitor_id

           WHERE s.body LIKE ?

           ORDER BY s.id DESC
           LIMIT 10`
        )
        .bind(
          userId,
          userId,
          userId,
          like
        )
        .all<any>();

      return Response.json({
        success: true,

        users: users.results.map(
          profileShape
        ),

        posts: posts.results.map(
          postShape
        ),
      });
    }

    /*
     * FEED
     */
    const followingOnly =
      action === "following";

    const where = followingOnly
      ? `WHERE s.visitor_id IN (
           SELECT following_id
           FROM social_follows
           WHERE follower_id = ?
         )`
      : `WHERE 1 = 1`;

    const params: any[] =
      followingOnly
        ? [userId]
        : [];

    const cursorSql =
      cursor > 0
        ? " AND s.id < ?"
        : "";

    if (cursor > 0) {
      params.push(cursor);
    }

    params.push(
      userId,
      userId,
      userId
    );

    const rows = await db
      .prepare(
        `SELECT
           s.*,
           p.handle,
           p.display_name,
           p.verified,
           p.verification_type,
           p.verification_label,

           EXISTS(
             SELECT 1
             FROM social_likes l
             WHERE l.post_id = s.id
               AND l.visitor_id = ?
           ) AS liked,

           EXISTS(
             SELECT 1
             FROM social_bookmarks b
             WHERE b.post_id = s.id
               AND b.visitor_id = ?
           ) AS bookmarked,

           EXISTS(
             SELECT 1
             FROM social_follows f
             WHERE f.following_id = s.visitor_id
               AND f.follower_id = ?
           ) AS following

         FROM social_posts s

         JOIN social_profiles p
           ON p.visitor_id = s.visitor_id

         ${where}
         ${cursorSql}

         ORDER BY s.id DESC
         LIMIT ${PAGE_SIZE}`
      )
      .bind(...params)
      .all<any>();

    const posts =
      rows.results.map(postShape);

    return Response.json({
      success: true,
      posts,

      nextCursor:
        posts.length === PAGE_SIZE
          ? posts[posts.length - 1].id
          : 0,
    });
  } catch (error) {
    console.error(
      "RAAKA Social GET error",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Social service temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const auth =
      await getAuthenticatedUser(request);

    if (!auth.user) {
      return auth.response;
    }

    const userId =
      auth.user.userId;

    const db = getD1();

    const body =
      (await request.json()) as any;

    const action =
      String(body.action || "");

    /*
     * Never trust visitorId from browser.
     * Always use authenticated session user.
     */
    const me =
      await ensureProfile(
        db,
        userId,
        body.displayName,
        body.handle
      );

    /*
     * PROFILE UPDATE
     */
    if (action === "profile") {
      const displayName =
        cleanName(
          String(
            body.displayName ||
              me.display_name
          )
        );

      const handle =
        cleanHandle(
          String(
            body.handle ||
              me.handle
          )
        );

      const bio =
        String(body.bio || "")
          .trim()
          .slice(0, 160);

      if (
        !/^[a-z0-9_]{3,20}$/.test(
          handle
        )
      ) {
        return Response.json(
          {
            success: false,
            error:
              "Handle must be 3–20 letters, numbers or _.",
          },
          { status: 400 }
        );
      }

      const taken =
        await db
          .prepare(
            `SELECT visitor_id
             FROM social_profiles
             WHERE handle = ? COLLATE NOCASE
               AND visitor_id <> ?
             LIMIT 1`
          )
          .bind(
            handle,
            userId
          )
          .first();

      if (taken) {
        return Response.json(
          {
            success: false,
            error:
              "That handle is already taken.",
          },
          { status: 409 }
        );
      }

      await db
        .prepare(
          `UPDATE social_profiles
           SET
             display_name = ?,
             handle = ?,
             bio = ?,
             updated_at = CURRENT_TIMESTAMP
           WHERE visitor_id = ?`
        )
        .bind(
          displayName ||
            "RAAKA Fan",
          handle,
          bio,
          userId
        )
        .run();

      const updated =
        await db
          .prepare(
            `SELECT *
             FROM social_profiles
             WHERE visitor_id = ?
             LIMIT 1`
          )
          .bind(userId)
          .first<any>();

      return Response.json({
        success: true,
        profile:
          profileShape(updated),
      });
    }

    /*
     * CREATE POST
     */
    if (action === "post") {
      const postBody =
        cleanBody(
          String(body.text || "")
        );

      if (!postBody) {
        return Response.json(
          {
            success: false,
            error:
              "Write something first.",
          },
          { status: 400 }
        );
      }

      if (
        postBody.length > MAX_POST
      ) {
        return Response.json(
          {
            success: false,
            error:
              `Maximum ${MAX_POST} characters.`,
          },
          { status: 400 }
        );
      }

      const result =
        await db
          .prepare(
            `INSERT INTO social_posts
             (visitor_id, body)
             VALUES (?, ?)`
          )
          .bind(
            userId,
            postBody
          )
          .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET
             posts_count = posts_count + 1,
             updated_at = CURRENT_TIMESTAMP
           WHERE visitor_id = ?`
        )
        .bind(userId)
        .run();

      return Response.json({
        success: true,
        id: result.meta.last_row_id,
      });
    }

    /*
     * DELETE OWN POST
     */
    if (action === "delete") {
      const postId =
        Number(body.postId);

      if (!postId) {
        return Response.json(
          {
            success: false,
            error: "Invalid post.",
          },
          { status: 400 }
        );
      }

      const post =
        await db
          .prepare(
            `SELECT
               id,
               visitor_id,
               reply_to_id,
               repost_of_id
             FROM social_posts
             WHERE id = ?
             LIMIT 1`
          )
          .bind(postId)
          .first<any>();

      if (!post) {
        return Response.json(
          {
            success: false,
            error: "Post not found.",
          },
          { status: 404 }
        );
      }

      if (post.visitor_id !== userId) {
        return Response.json(
          {
            success: false,
            error:
              "You can only delete your own posts.",
          },
          { status: 403 }
        );
      }

      if (post.reply_to_id) {
        await db
          .prepare(
            `UPDATE social_posts
             SET replies_count =
               MAX(0, replies_count - 1)
             WHERE id = ?`
          )
          .bind(post.reply_to_id)
          .run();
      }

      if (post.repost_of_id) {
        await db
          .prepare(
            `UPDATE social_posts
             SET reposts_count =
               MAX(0, reposts_count - 1)
             WHERE id = ?`
          )
          .bind(post.repost_of_id)
          .run();
      }

      await db
        .prepare(
          `DELETE FROM social_likes
           WHERE post_id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `DELETE FROM social_bookmarks
           WHERE post_id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `DELETE FROM social_notifications
           WHERE post_id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `DELETE FROM social_posts
           WHERE id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET
             posts_count =
               MAX(0, posts_count - 1),
             updated_at =
               CURRENT_TIMESTAMP
           WHERE visitor_id = ?`
        )
        .bind(userId)
        .run();

      return Response.json({
        success: true,
        deleted: true,
        postId,
      });
    }

    /*
     * REPLY
     */
    if (action === "reply") {
      const postId =
        Number(body.postId);

      const text =
        cleanBody(
          String(body.text || "")
        );

      if (!postId || !text) {
        return Response.json(
          {
            success: false,
            error:
              "Reply is incomplete.",
          },
          { status: 400 }
        );
      }

      const parent =
        await db
          .prepare(
            `SELECT
               id,
               visitor_id
             FROM social_posts
             WHERE id = ?
             LIMIT 1`
          )
          .bind(postId)
          .first<any>();

      if (!parent) {
        return Response.json(
          {
            success: false,
            error:
              "Post not found.",
          },
          { status: 404 }
        );
      }

      const result =
        await db
          .prepare(
            `INSERT INTO social_posts
             (visitor_id, body, reply_to_id)
             VALUES (?, ?, ?)`
          )
          .bind(
            userId,
            text,
            postId
          )
          .run();

      await db
        .prepare(
          `UPDATE social_posts
           SET replies_count =
             replies_count + 1
           WHERE id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET posts_count =
             posts_count + 1
           WHERE visitor_id = ?`
        )
        .bind(userId)
        .run();

      await createNotification(
        db,
        parent.visitor_id,
        userId,
        "reply",
        postId
      );

      return Response.json({
        success: true,
        id: result.meta.last_row_id,
      });
    }

    /*
     * LIKE / UNLIKE
     */
    if (action === "like") {
      const postId =
        Number(body.postId);

      if (!postId) {
        return Response.json(
          {
            success: false,
            error:
              "Invalid post.",
          },
          { status: 400 }
        );
      }

      const post =
        await db
          .prepare(
            `SELECT visitor_id
             FROM social_posts
             WHERE id = ?
             LIMIT 1`
          )
          .bind(postId)
          .first<any>();

      if (!post) {
        return Response.json(
          {
            success: false,
            error:
              "Post not found.",
          },
          { status: 404 }
        );
      }

      const existing =
        await db
          .prepare(
            `SELECT 1
             FROM social_likes
             WHERE visitor_id = ?
               AND post_id = ?
             LIMIT 1`
          )
          .bind(
            userId,
            postId
          )
          .first();

      if (existing) {
        await db
          .prepare(
            `DELETE FROM social_likes
             WHERE visitor_id = ?
               AND post_id = ?`
          )
          .bind(
            userId,
            postId
          )
          .run();

        await db
          .prepare(
            `UPDATE social_posts
             SET likes_count =
               MAX(0, likes_count - 1)
             WHERE id = ?`
          )
          .bind(postId)
          .run();

        return Response.json({
          success: true,
          liked: false,
        });
      }

      await db
        .prepare(
          `INSERT INTO social_likes
           (visitor_id, post_id)
           VALUES (?, ?)`
        )
        .bind(
          userId,
          postId
        )
        .run();

      await db
        .prepare(
          `UPDATE social_posts
           SET likes_count =
             likes_count + 1
           WHERE id = ?`
        )
        .bind(postId)
        .run();

      await createNotification(
        db,
        post.visitor_id,
        userId,
        "like",
        postId
      );

      return Response.json({
        success: true,
        liked: true,
      });
    }

    /*
     * FOLLOW / UNFOLLOW
     */
    if (action === "follow") {
      const targetId =
        String(body.targetId || "");

      if (
        !targetId ||
        targetId === userId
      ) {
        return Response.json(
          {
            success: false,
            error:
              "Invalid profile.",
          },
          { status: 400 }
        );
      }

      const target =
        await db
          .prepare(
            `SELECT visitor_id
             FROM social_profiles
             WHERE visitor_id = ?
             LIMIT 1`
          )
          .bind(targetId)
          .first();

      if (!target) {
        return Response.json(
          {
            success: false,
            error:
              "Profile not found.",
          },
          { status: 404 }
        );
      }

      const existing =
        await db
          .prepare(
            `SELECT 1
             FROM social_follows
             WHERE follower_id = ?
               AND following_id = ?
             LIMIT 1`
          )
          .bind(
            userId,
            targetId
          )
          .first();

      if (existing) {
        await db
          .prepare(
            `DELETE FROM social_follows
             WHERE follower_id = ?
               AND following_id = ?`
          )
          .bind(
            userId,
            targetId
          )
          .run();

        await db
          .prepare(
            `UPDATE social_profiles
             SET following_count =
               MAX(0, following_count - 1)
             WHERE visitor_id = ?`
          )
          .bind(userId)
          .run();

        await db
          .prepare(
            `UPDATE social_profiles
             SET followers_count =
               MAX(0, followers_count - 1)
             WHERE visitor_id = ?`
          )
          .bind(targetId)
          .run();

        return Response.json({
          success: true,
          following: false,
        });
      }

      await db
        .prepare(
          `INSERT INTO social_follows
           (follower_id, following_id)
           VALUES (?, ?)`
        )
        .bind(
          userId,
          targetId
        )
        .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET following_count =
             following_count + 1
           WHERE visitor_id = ?`
        )
        .bind(userId)
        .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET followers_count =
             followers_count + 1
           WHERE visitor_id = ?`
        )
        .bind(targetId)
        .run();

      await createNotification(
        db,
        targetId,
        userId,
        "follow",
        null
      );

      return Response.json({
        success: true,
        following: true,
      });
    }

    /*
     * BOOKMARK / REMOVE BOOKMARK
     */
    if (action === "bookmark") {
      const postId =
        Number(body.postId);

      if (!postId) {
        return Response.json(
          {
            success: false,
            error:
              "Invalid post.",
          },
          { status: 400 }
        );
      }

      const post =
        await db
          .prepare(
            `SELECT id
             FROM social_posts
             WHERE id = ?
             LIMIT 1`
          )
          .bind(postId)
          .first();

      if (!post) {
        return Response.json(
          {
            success: false,
            error:
              "Post not found.",
          },
          { status: 404 }
        );
      }

      const existing =
        await db
          .prepare(
            `SELECT 1
             FROM social_bookmarks
             WHERE visitor_id = ?
               AND post_id = ?
             LIMIT 1`
          )
          .bind(
            userId,
            postId
          )
          .first();

      if (existing) {
        await db
          .prepare(
            `DELETE FROM social_bookmarks
             WHERE visitor_id = ?
               AND post_id = ?`
          )
          .bind(
            userId,
            postId
          )
          .run();

        return Response.json({
          success: true,
          bookmarked: false,
        });
      }

      await db
        .prepare(
          `INSERT INTO social_bookmarks
           (visitor_id, post_id)
           VALUES (?, ?)`
        )
        .bind(
          userId,
          postId
        )
        .run();

      return Response.json({
        success: true,
        bookmarked: true,
      });
    }

    /*
     * REPOST
     */
    if (action === "repost") {
      const postId =
        Number(body.postId);

      if (!postId) {
        return Response.json(
          {
            success: false,
            error:
              "Invalid post.",
          },
          { status: 400 }
        );
      }

      const original =
        await db
          .prepare(
            `SELECT
               visitor_id,
               body
             FROM social_posts
             WHERE id = ?
             LIMIT 1`
          )
          .bind(postId)
          .first<any>();

      if (!original) {
        return Response.json(
          {
            success: false,
            error:
              "Post not found.",
          },
          { status: 404 }
        );
      }

      const already =
        await db
          .prepare(
            `SELECT id
             FROM social_posts
             WHERE visitor_id = ?
               AND repost_of_id = ?
             LIMIT 1`
          )
          .bind(
            userId,
            postId
          )
          .first();

      if (already) {
        return Response.json(
          {
            success: false,
            error:
              "Already reposted.",
          },
          { status: 409 }
        );
      }

      await db
        .prepare(
          `INSERT INTO social_posts
           (visitor_id, body, repost_of_id)
           VALUES (?, ?, ?)`
        )
        .bind(
          userId,
          original.body,
          postId
        )
        .run();

      await db
        .prepare(
          `UPDATE social_posts
           SET reposts_count =
             reposts_count + 1
           WHERE id = ?`
        )
        .bind(postId)
        .run();

      await db
        .prepare(
          `UPDATE social_profiles
           SET posts_count =
             posts_count + 1
           WHERE visitor_id = ?`
        )
        .bind(userId)
        .run();

      await createNotification(
        db,
        original.visitor_id,
        userId,
        "repost",
        postId
      );

      return Response.json({
        success: true,
      });
    }

    return Response.json(
      {
        success: false,
        error:
          "Unknown social action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "RAAKA Social POST error",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Social service temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}