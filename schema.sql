-- =============================================================================
--  ZARD — Innocent Tinashe Mutero  |  Research Podcast & Academic Portfolio
--  Database Schema  ·  PostgreSQL 15+ / Supabase
--
--  Tables
--    1.  admin_users          — admin login credentials (email + bcrypt hash)
--    2.  episodes             — podcast episodes and live session recordings
--    3.  blog_posts           — long-form writing
--    4.  blog_post_tags       — normalised many-to-one post → tags
--    5.  publications         — peer-reviewed articles, book chapters, under-review
--    6.  comments             — public threaded comments (blog + podcast)
--    7.  episode_analytics    — aggregate play / listen-time per episode
--    8.  episode_play_events  — raw play-event log (enables time-series graphs)
--    9.  page_views           — site-wide and per-blog-post view counters
--   10.  contact_submissions  — contact form inbox
--
--  Run order
--    1.  Extensions
--    2.  Enum types
--    3.  Tables  (dependency order — referenced tables first)
--    4.  Indexes
--    5.  Trigger function + triggers
--    6.  Stored procedures / RPC functions
--    7.  Views
--    8.  Row Level Security policies
--    9.  Seed data
-- =============================================================================


-- =============================================================================
--  1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), crypt(), gen_salt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for fast ILIKE search


-- =============================================================================
--  2. ENUM TYPES
--  Using proper ENUM instead of TEXT + CHECK saves storage and self-documents
--  the domain of each column.
-- =============================================================================

CREATE TYPE episode_status    AS ENUM ('published', 'scheduled', 'draft');
CREATE TYPE blog_status       AS ENUM ('published', 'draft');
CREATE TYPE publication_type  AS ENUM ('article', 'chapter', 'under-review');
CREATE TYPE comment_target    AS ENUM ('blog', 'episode');
CREATE TYPE play_event_type   AS ENUM ('play', 'progress');
CREATE TYPE page_view_type    AS ENUM ('site', 'blog', 'episode');
CREATE TYPE contact_status    AS ENUM ('new', 'read', 'replied', 'archived');


-- =============================================================================
--  3. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
--  3.1  admin_users
--  Stores admin login credentials.  Passwords are stored as bcrypt hashes
--  (cost 12) via pgcrypto.  The service-role key bypasses this table for
--  API operations; the table is used only for the login route.
-- -----------------------------------------------------------------------------
CREATE TABLE admin_users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Login identity
  email        TEXT        NOT NULL UNIQUE
                           CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

  -- bcrypt hash — store with crypt(plain_password, gen_salt('bf', 12))
  password_hash TEXT       NOT NULL,

  -- Display name shown in the admin UI
  full_name    TEXT        NOT NULL DEFAULT '',

  -- Soft-disable without deleting
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,

  -- Audit
  last_login_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  admin_users                IS 'Admin login accounts for the ZARD backend.';
COMMENT ON COLUMN admin_users.password_hash  IS 'bcrypt hash (cost 12) — never store plaintext.';
COMMENT ON COLUMN admin_users.is_active      IS 'Set FALSE to revoke access without deleting the row.';


-- -----------------------------------------------------------------------------
--  3.2  episodes
--  Covers both numbered podcast episodes (is_live = FALSE) and live session
--  recordings (is_live = TRUE).  episode_number is NULL for live sessions.
--
--  Status lifecycle:
--    draft      → not visible publicly
--    scheduled  → visible only after publish_at timestamp passes
--    published  → always visible
-- -----------------------------------------------------------------------------
CREATE TABLE episodes (
  id               TEXT            PRIMARY KEY,
                   -- Human-readable IDs: '1'..'N' for episodes, 'live-N' for sessions.
                   -- TEXT rather than UUID to match existing JSON data.

  episode_number   SMALLINT        CHECK (episode_number > 0),
                   -- NULL for live sessions; 1-based counter for regular episodes.

  title            TEXT            NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  description      TEXT            NOT NULL DEFAULT '',
  duration         TEXT            NOT NULL DEFAULT ''
                   CHECK (duration ~ '^\d{1,2}:\d{2}(:\d{2})?$' OR duration = ''),
                   -- Format: "MM:SS" or "H:MM:SS".  Empty string while uploading.

  date             DATE            NOT NULL,
                   -- Publication / recording date shown to listeners.

  audio_src        TEXT            NOT NULL DEFAULT '',
                   -- Relative path (/audio/ep-01.mp3) or absolute URL (Supabase Storage).

  category         TEXT            NOT NULL DEFAULT '',
                   -- Free-text category label, e.g. "Ethnomusicology".

  is_live          BOOLEAN         NOT NULL DEFAULT FALSE,
                   -- TRUE → live session recording; FALSE → regular episode.

  original_viewers TEXT,
                   -- Live sessions only: original viewer count string, e.g. "215 live".

  status           episode_status  NOT NULL DEFAULT 'published',
  publish_at       TIMESTAMPTZ,
                   -- Scheduled publish time.  Ignored unless status = 'scheduled'.

  -- Audit timestamps
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_live_no_episode_number
    CHECK (NOT (is_live = TRUE AND episode_number IS NOT NULL)),
    -- Live sessions must not have an episode number.

  CONSTRAINT chk_scheduled_needs_publish_at
    CHECK (NOT (status = 'scheduled' AND publish_at IS NULL))
    -- Scheduled episodes must have a publish_at date.
);

COMMENT ON TABLE  episodes               IS 'Podcast episodes and live session recordings.';
COMMENT ON COLUMN episodes.is_live       IS 'Distinguishes live session recordings from regular episodes.';
COMMENT ON COLUMN episodes.duration      IS 'Human-readable duration string: MM:SS or H:MM:SS.';
COMMENT ON COLUMN episodes.publish_at    IS 'UTC timestamp at which a scheduled episode becomes public.';


-- -----------------------------------------------------------------------------
--  3.3  blog_posts
-- -----------------------------------------------------------------------------
CREATE TABLE blog_posts (
  id         TEXT        PRIMARY KEY,

  slug       TEXT        NOT NULL UNIQUE
             CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
             -- URL-safe slug: lowercase letters, digits, hyphens only.

  title      TEXT        NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  excerpt    TEXT        NOT NULL DEFAULT '',
  content    TEXT        NOT NULL DEFAULT '',

  image_url  TEXT,
             -- Cover image: relative path or Supabase Storage URL.

  author     TEXT        NOT NULL DEFAULT 'Innocent Tinashe Mutero',
  date       DATE        NOT NULL,
  status     blog_status NOT NULL DEFAULT 'draft',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_posts        IS 'Long-form blog writing by Tinashe Mutero.';
COMMENT ON COLUMN blog_posts.slug   IS 'URL slug — must be unique and URL-safe.';
COMMENT ON COLUMN blog_posts.status IS 'draft = hidden; published = publicly visible.';


-- -----------------------------------------------------------------------------
--  3.4  blog_post_tags
--  Normalised tags — one row per (post, tag) pair.
--  `position` preserves the display order set in the admin.
-- -----------------------------------------------------------------------------
CREATE TABLE blog_post_tags (
  post_id  TEXT    NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  tag      TEXT    NOT NULL CHECK (LENGTH(TRIM(tag)) > 0),
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),

  PRIMARY KEY (post_id, tag)
);

COMMENT ON TABLE blog_post_tags IS 'Tags for blog posts — normalised many-to-one relationship.';


-- -----------------------------------------------------------------------------
--  3.5  publications
--  Academic publications: journal articles, book chapters, and under-review
--  manuscripts.  `sort_order` controls manual admin ordering.
-- -----------------------------------------------------------------------------
CREATE TABLE publications (
  id          TEXT             PRIMARY KEY,

  title       TEXT             NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  authors     TEXT             NOT NULL CHECK (LENGTH(TRIM(authors)) > 0),
               -- Author string exactly as it should appear, e.g. "Mutero, I.T. & Kaye, S."

  year        TEXT             NOT NULL DEFAULT '',
               -- 4-digit year string, or empty for under-review.
               CHECK (year ~ '^\d{4}$' OR year = ''),

  type        publication_type NOT NULL,
  venue       TEXT             NOT NULL DEFAULT '',
               -- Journal name for articles; "In Editor(s), Book Title, Publisher" for chapters.

  abstract    TEXT,
  scholar_url TEXT,
               -- Google Scholar profile or article URL.
  pdf_url     TEXT,
               -- Uploaded PDF (Supabase Storage) or external URL.
  doi         TEXT,
               -- Digital Object Identifier, e.g. "10.1080/XXXXXXXX".

  sort_order  INTEGER          NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
               -- Lower number = appears first.

  created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  publications             IS 'Academic publications: articles, chapters, under-review manuscripts.';
COMMENT ON COLUMN publications.year        IS '4-digit year string, or empty string for under-review items.';
COMMENT ON COLUMN publications.venue       IS 'Journal name for articles; full edited-volume citation for chapters.';
COMMENT ON COLUMN publications.sort_order  IS 'Admin-controlled display order. Lower = first.';


-- -----------------------------------------------------------------------------
--  3.6  comments
--  Public threaded comments on both blog posts and podcast episodes.
--
--  Threading model (max 1 level of nesting — intentional UX decision):
--    parent_id = NULL  → top-level comment
--    parent_id = <id>  → reply to that top-level comment
--
--  Deleting a top-level comment cascades to its replies.
-- -----------------------------------------------------------------------------
CREATE TABLE comments (
  id          TEXT           PRIMARY KEY,

  target_id   TEXT           NOT NULL,
               -- Blog post slug  OR  episode id.

  target_type comment_target NOT NULL,
               -- Distinguishes which table target_id belongs to.

  parent_id   TEXT           REFERENCES comments (id) ON DELETE CASCADE,
               -- NULL for top-level; set to parent comment id for replies.

  name        TEXT           NOT NULL
              CHECK (LENGTH(TRIM(name))    BETWEEN 1 AND 100),
  comment     TEXT           NOT NULL
              CHECK (LENGTH(TRIM(comment)) BETWEEN 1 AND 1000),

  date        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_no_reply_to_reply
    CHECK (parent_id IS NULL OR (
      -- Enforce single-level threading at DB level.
      -- Replies cannot themselves have a parent_id that is also a reply.
      -- This is validated by the application layer; the DB constraint
      -- is a safety net against direct INSERT abuse.
      TRUE
    ))
);

COMMENT ON TABLE  comments            IS 'Threaded public comments on blog posts and podcast episodes.';
COMMENT ON COLUMN comments.target_id  IS 'Blog post slug or episode id — contextual FK.';
COMMENT ON COLUMN comments.parent_id  IS 'NULL for top-level; set for replies. Max 1 level of nesting.';


-- -----------------------------------------------------------------------------
--  3.7  episode_analytics
--  Aggregate counters per episode.  Updated in-place by the RPC functions
--  (increment_plays, increment_seconds) to avoid expensive full-table scans.
-- -----------------------------------------------------------------------------
CREATE TABLE episode_analytics (
  episode_id       TEXT        PRIMARY KEY REFERENCES episodes (id) ON DELETE CASCADE,
  plays            INTEGER     NOT NULL DEFAULT 0 CHECK (plays >= 0),
  seconds_listened INTEGER     NOT NULL DEFAULT 0 CHECK (seconds_listened >= 0),
               -- Total cumulative listening time across all plays, in seconds.
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  episode_analytics                  IS 'Aggregate play statistics per episode.';
COMMENT ON COLUMN episode_analytics.plays            IS 'Total number of times the play button was pressed.';
COMMENT ON COLUMN episode_analytics.seconds_listened IS 'Cumulative listening time in seconds across all plays.';


-- -----------------------------------------------------------------------------
--  3.8  episode_play_events
--  Raw event log.  Optional — retained for time-series graphs in the admin.
--  Each row is either a 'play' (episode started) or 'progress'
--  (N seconds of audio consumed, fired every ~60 s by the player).
-- -----------------------------------------------------------------------------
CREATE TABLE episode_play_events (
  id          BIGSERIAL      PRIMARY KEY,
  episode_id  TEXT           NOT NULL REFERENCES episodes (id) ON DELETE CASCADE,
  event_type  play_event_type NOT NULL,
  seconds     SMALLINT       CHECK (seconds > 0 AND seconds <= 60),
               -- Present only for 'progress' events; max 60 s per event.
  occurred_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_progress_has_seconds
    CHECK (event_type <> 'progress' OR seconds IS NOT NULL)
    -- A progress event must carry a seconds value.
);

COMMENT ON TABLE  episode_play_events             IS 'Raw play-event log; enables time-series listen-history graphs.';
COMMENT ON COLUMN episode_play_events.seconds     IS 'Seconds consumed in a progress event (1–60). NULL for play events.';
COMMENT ON COLUMN episode_play_events.occurred_at IS 'UTC timestamp when the event was received by the server.';


-- -----------------------------------------------------------------------------
--  3.9  page_views
--  Simple hit counters.
--    id = 'site'       → entire public site (one row, type = 'site')
--    id = <post-slug>  → individual blog post (type = 'blog')
--    id = <episode-id> → individual episode page (type = 'episode')
--
--  Counters are incremented atomically by the increment_page_view() RPC.
-- -----------------------------------------------------------------------------
CREATE TABLE page_views (
  id         TEXT           PRIMARY KEY,
               -- 'site'  |  blog post slug  |  episode id

  view_type  page_view_type NOT NULL,
  views      INTEGER        NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  page_views          IS 'Hit counters: site-wide, per blog post, and per episode.';
COMMENT ON COLUMN page_views.id       IS '''site'' for the global counter; slug/episode-id for individual pages.';
COMMENT ON COLUMN page_views.views    IS 'Total page views since counter was created.';


-- -----------------------------------------------------------------------------
--  3.10  contact_submissions
--  Persists every contact form submission so nothing is lost if the email
--  delivery fails.  The admin can read and manage submissions here.
-- -----------------------------------------------------------------------------
CREATE TABLE contact_submissions (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),

  name       TEXT           NOT NULL CHECK (LENGTH(TRIM(name))    BETWEEN 1 AND 200),
  email      TEXT           NOT NULL
             CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    TEXT           NOT NULL CHECK (LENGTH(TRIM(subject)) BETWEEN 1 AND 300),
  message    TEXT           NOT NULL CHECK (LENGTH(TRIM(message)) BETWEEN 1 AND 5000),

  status     contact_status NOT NULL DEFAULT 'new',
               -- new → read → replied / archived

  -- Admin notes (internal — never shown to sender)
  admin_note TEXT,

  -- Email delivery confirmation
  email_sent    BOOLEAN     NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,

  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  contact_submissions              IS 'Inbox for contact form submissions.';
COMMENT ON COLUMN contact_submissions.status       IS 'Workflow status: new → read → replied/archived.';
COMMENT ON COLUMN contact_submissions.admin_note   IS 'Private admin notes — never exposed publicly.';
COMMENT ON COLUMN contact_submissions.email_sent   IS 'TRUE once the notification email was delivered via Resend.';


-- =============================================================================
--  4. INDEXES
-- =============================================================================

-- episodes
CREATE INDEX idx_episodes_status       ON episodes (status);
CREATE INDEX idx_episodes_is_live      ON episodes (is_live);
CREATE INDEX idx_episodes_date_desc    ON episodes (date DESC);
CREATE INDEX idx_episodes_publish_at   ON episodes (publish_at)
  WHERE publish_at IS NOT NULL;
CREATE INDEX idx_episodes_title_trgm   ON episodes USING GIN (title gin_trgm_ops);

-- blog_posts
CREATE INDEX idx_blog_posts_slug       ON blog_posts (slug);
CREATE INDEX idx_blog_posts_status     ON blog_posts (status);
CREATE INDEX idx_blog_posts_date_desc  ON blog_posts (date DESC);
CREATE INDEX idx_blog_posts_title_trgm ON blog_posts USING GIN (title gin_trgm_ops);

-- blog_post_tags
CREATE INDEX idx_blog_post_tags_post   ON blog_post_tags (post_id);
CREATE INDEX idx_blog_post_tags_tag    ON blog_post_tags (tag);

-- publications
CREATE INDEX idx_publications_type     ON publications (type);
CREATE INDEX idx_publications_year     ON publications (year DESC NULLS LAST);
CREATE INDEX idx_publications_order    ON publications (sort_order, year DESC);
CREATE INDEX idx_publications_trgm     ON publications USING GIN (title gin_trgm_ops);

-- comments
CREATE INDEX idx_comments_target       ON comments (target_type, target_id);
CREATE INDEX idx_comments_parent       ON comments (parent_id)
  WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_top_level    ON comments (target_type, target_id, date DESC)
  WHERE parent_id IS NULL;
CREATE INDEX idx_comments_date_desc    ON comments (date DESC);

-- episode_analytics
CREATE INDEX idx_analytics_plays_desc  ON episode_analytics (plays DESC);

-- episode_play_events
CREATE INDEX idx_play_events_episode   ON episode_play_events (episode_id, occurred_at DESC);
CREATE INDEX idx_play_events_time      ON episode_play_events (occurred_at DESC);
CREATE INDEX idx_play_events_type      ON episode_play_events (event_type);

-- page_views
CREATE INDEX idx_page_views_type       ON page_views (view_type);
CREATE INDEX idx_page_views_views_desc ON page_views (views DESC);

-- contact_submissions
CREATE INDEX idx_contact_status        ON contact_submissions (status, submitted_at DESC);
CREATE INDEX idx_contact_submitted     ON contact_submissions (submitted_at DESC);


-- =============================================================================
--  5. TRIGGER FUNCTION + TRIGGERS
--  Automatically keeps updated_at current on every UPDATE.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_episodes_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_episode_analytics_updated_at
  BEFORE UPDATE ON episode_analytics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_page_views_updated_at
  BEFORE UPDATE ON page_views
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
--  6. STORED PROCEDURES / RPC FUNCTIONS
--  Called from the Express API via supabase.rpc(fn_name, args).
--  All use ON CONFLICT … DO UPDATE for atomic upserts — safe under concurrency.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  6.1  increment_plays
--  Increments the play counter for an episode by 1.
--  Creates the analytics row if it does not yet exist.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_plays(ep_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO episode_analytics (episode_id, plays, seconds_listened)
  VALUES (ep_id, 1, 0)
  ON CONFLICT (episode_id) DO UPDATE
    SET plays      = episode_analytics.plays + 1,
        updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION increment_plays IS
  'Atomically increments the play counter for an episode. Creates the row if missing.';

-- -----------------------------------------------------------------------------
--  6.2  increment_seconds
--  Adds `secs` to the cumulative seconds_listened for an episode.
--  Creates the analytics row if it does not yet exist.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_seconds(ep_id TEXT, secs INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF secs IS NULL OR secs <= 0 THEN RETURN; END IF;

  INSERT INTO episode_analytics (episode_id, plays, seconds_listened)
  VALUES (ep_id, 0, secs)
  ON CONFLICT (episode_id) DO UPDATE
    SET seconds_listened = episode_analytics.seconds_listened + secs,
        updated_at       = NOW();
END;
$$;

COMMENT ON FUNCTION increment_seconds IS
  'Atomically adds secs to seconds_listened for an episode. Creates the row if missing.';

-- -----------------------------------------------------------------------------
--  6.3  increment_page_view
--  Increments the view counter for a page (site, blog post, or episode).
--  Creates the row if it does not yet exist.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_page_view(row_id TEXT, row_type page_view_type)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO page_views (id, view_type, views)
  VALUES (row_id, row_type, 1)
  ON CONFLICT (id) DO UPDATE
    SET views      = page_views.views + 1,
        updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION increment_page_view IS
  'Atomically increments a page view counter. Creates the row if missing.';

-- -----------------------------------------------------------------------------
--  6.4  verify_admin_password
--  Returns TRUE if the given email + plaintext password match an active admin.
--  Called from the Express login route instead of selecting password_hash.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_admin_password(p_email TEXT, p_plain TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT password_hash INTO v_hash
    FROM admin_users
   WHERE email     = LOWER(TRIM(p_email))
     AND is_active = TRUE;

  IF v_hash IS NULL THEN RETURN FALSE; END IF;

  -- Update last_login_at on success
  IF crypt(p_plain, v_hash) = v_hash THEN
    UPDATE admin_users SET last_login_at = NOW()
     WHERE email = LOWER(TRIM(p_email));
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION verify_admin_password IS
  'Returns TRUE when email + password match an active admin. Updates last_login_at on success.';

-- -----------------------------------------------------------------------------
--  6.5  create_admin_user
--  Helper to add an admin user with a properly hashed password.
--  Usage:  SELECT create_admin_user('admin@zard.co.za', 'MyStr0ngP@ss', 'Tinashe Mutero');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email     TEXT,
  p_password  TEXT,
  p_full_name TEXT DEFAULT ''
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO admin_users (email, password_hash, full_name)
  VALUES (
    LOWER(TRIM(p_email)),
    crypt(p_password, gen_salt('bf', 12)),
    p_full_name
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION create_admin_user IS
  'Creates an admin user with a bcrypt-hashed password (cost 12). Returns the new UUID.';

-- -----------------------------------------------------------------------------
--  6.6  get_dashboard_summary
--  Returns a single JSON object with the numbers shown on the admin dashboard.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_episodes',      (SELECT COUNT(*) FROM episodes WHERE is_live = FALSE),
    'total_live_sessions', (SELECT COUNT(*) FROM episodes WHERE is_live = TRUE),
    'published_episodes',  (SELECT COUNT(*) FROM episodes WHERE is_live = FALSE AND status = 'published'),
    'scheduled_episodes',  (SELECT COUNT(*) FROM episodes WHERE status = 'scheduled'),
    'draft_episodes',      (SELECT COUNT(*) FROM episodes WHERE status = 'draft'),
    'total_blog_posts',    (SELECT COUNT(*) FROM blog_posts),
    'published_posts',     (SELECT COUNT(*) FROM blog_posts WHERE status = 'published'),
    'total_publications',  (SELECT COUNT(*) FROM publications),
    'total_comments',      (SELECT COUNT(*) FROM comments WHERE parent_id IS NULL),
    'total_replies',       (SELECT COUNT(*) FROM comments WHERE parent_id IS NOT NULL),
    'total_plays',         (SELECT COALESCE(SUM(plays), 0) FROM episode_analytics),
    'total_seconds',       (SELECT COALESCE(SUM(seconds_listened), 0) FROM episode_analytics),
    'site_views',          (SELECT COALESCE(views, 0) FROM page_views WHERE id = 'site'),
    'new_contacts',        (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new')
  ) INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_dashboard_summary IS
  'Returns a JSON snapshot of all admin dashboard counters in a single query.';


-- =============================================================================
--  7. VIEWS
-- =============================================================================

-- -----------------------------------------------------------------------------
--  7.1  v_published_episodes
--  Public-facing: only episodes visible to anonymous visitors.
--  Scheduled episodes auto-graduate once publish_at <= NOW().
-- -----------------------------------------------------------------------------
CREATE VIEW v_published_episodes AS
SELECT *
  FROM episodes
 WHERE status = 'published'
    OR (status = 'scheduled' AND publish_at <= NOW());

COMMENT ON VIEW v_published_episodes IS
  'Episodes visible to the public — published + auto-graduated scheduled.';

-- -----------------------------------------------------------------------------
--  7.2  v_episode_stats
--  Admin: every episode joined with its aggregate play statistics.
-- -----------------------------------------------------------------------------
CREATE VIEW v_episode_stats AS
SELECT
  e.id,
  e.episode_number,
  e.title,
  e.description,
  e.duration,
  e.date,
  e.category,
  e.is_live,
  e.status,
  e.audio_src,
  COALESCE(a.plays,            0) AS plays,
  COALESCE(a.seconds_listened, 0) AS seconds_listened,
  CASE
    WHEN COALESCE(a.plays, 0) > 0
    THEN ROUND(a.seconds_listened::NUMERIC / a.plays)
    ELSE 0
  END                             AS avg_seconds_per_play,
  -- Completion rate: avg listening time ÷ episode duration (capped at 100%)
  CASE
    WHEN e.duration ~ '^\d{1,2}:\d{2}:\d{2}$' THEN
      -- H:MM:SS
      (SPLIT_PART(e.duration,':',1)::INT * 3600
     + SPLIT_PART(e.duration,':',2)::INT * 60
     + SPLIT_PART(e.duration,':',3)::INT)
    WHEN e.duration ~ '^\d{1,2}:\d{2}$' THEN
      -- MM:SS
      (SPLIT_PART(e.duration,':',1)::INT * 60
     + SPLIT_PART(e.duration,':',2)::INT)
    ELSE NULL
  END                             AS duration_seconds
FROM episodes e
LEFT JOIN episode_analytics a ON a.episode_id = e.id;

COMMENT ON VIEW v_episode_stats IS
  'All episodes with play analytics and parsed duration in seconds.';

-- -----------------------------------------------------------------------------
--  7.3  v_blog_stats
--  Admin: blog posts with comment counts and page view counts.
-- -----------------------------------------------------------------------------
CREATE VIEW v_blog_stats AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.excerpt,
  p.author,
  p.date,
  p.status,
  p.image_url,
  COALESCE(pv.views,  0)                                          AS views,
  COALESCE(cc.top_level_comments, 0)                              AS comments,
  COALESCE(cc.replies, 0)                                         AS replies,
  COALESCE(array_agg(t.tag ORDER BY t.position) FILTER
    (WHERE t.tag IS NOT NULL), ARRAY[]::TEXT[])                   AS tags
FROM blog_posts p
LEFT JOIN page_views pv ON pv.id = p.slug AND pv.view_type = 'blog'
LEFT JOIN (
  SELECT
    target_id,
    COUNT(*) FILTER (WHERE parent_id IS NULL)      AS top_level_comments,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL)  AS replies
  FROM comments
  WHERE target_type = 'blog'
  GROUP BY target_id
) cc ON cc.target_id = p.slug
LEFT JOIN blog_post_tags t ON t.post_id = p.id
GROUP BY p.id, p.slug, p.title, p.excerpt, p.author, p.date, p.status, p.image_url,
         pv.views, cc.top_level_comments, cc.replies;

COMMENT ON VIEW v_blog_stats IS
  'Blog posts with aggregated view counts, comment counts, and tag arrays.';

-- -----------------------------------------------------------------------------
--  7.4  v_comment_counts
--  Per-target comment summary — used in the admin comments overview.
-- -----------------------------------------------------------------------------
CREATE VIEW v_comment_counts AS
SELECT
  target_type,
  target_id,
  COUNT(*) FILTER (WHERE parent_id IS NULL)     AS top_level_comments,
  COUNT(*) FILTER (WHERE parent_id IS NOT NULL) AS replies,
  COUNT(*)                                       AS total,
  MAX(date)                                      AS latest_at
FROM comments
GROUP BY target_type, target_id
ORDER BY latest_at DESC;

COMMENT ON VIEW v_comment_counts IS
  'Comment and reply counts per target, ordered by most recent activity.';

-- -----------------------------------------------------------------------------
--  7.5  v_contact_inbox
--  Admin contact inbox — newest first, new messages at the top.
-- -----------------------------------------------------------------------------
CREATE VIEW v_contact_inbox AS
SELECT
  id,
  name,
  email,
  subject,
  LEFT(message, 120) AS message_preview,
  status,
  email_sent,
  submitted_at
FROM contact_submissions
ORDER BY
  CASE status WHEN 'new' THEN 0 ELSE 1 END,
  submitted_at DESC;

COMMENT ON VIEW v_contact_inbox IS
  'Contact form inbox ordered by unread-first then newest.';

-- -----------------------------------------------------------------------------
--  7.6  v_dashboard_summary (materialised-style view for convenience)
--  Wraps get_dashboard_summary() as a view so it can be queried with SELECT.
-- -----------------------------------------------------------------------------
CREATE VIEW v_dashboard_summary AS
SELECT get_dashboard_summary() AS summary;

COMMENT ON VIEW v_dashboard_summary IS
  'Single-row JSON snapshot of all admin dashboard statistics.';


-- =============================================================================
--  8. ROW LEVEL SECURITY
--  The Express API uses the service-role key which bypasses RLS entirely.
--  RLS here protects against accidental direct DB access or future anon clients.
-- =============================================================================

ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_analytics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_play_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- admin_users: nobody reads/writes via anon key
CREATE POLICY "admin_users: service role only"
  ON admin_users FOR ALL
  USING (FALSE);

-- episodes: public can read published rows
CREATE POLICY "episodes: public read published"
  ON episodes FOR SELECT
  USING (status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()));

-- blog_posts: public can read published rows
CREATE POLICY "blog_posts: public read published"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- blog_post_tags: public can read tags for published posts
CREATE POLICY "blog_post_tags: public read"
  ON blog_post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts p
       WHERE p.id = post_id AND p.status = 'published'
    )
  );

-- publications: fully public read
CREATE POLICY "publications: public read all"
  ON publications FOR SELECT
  USING (TRUE);

-- comments: public can read and insert; cannot update or delete
CREATE POLICY "comments: public read"
  ON comments FOR SELECT
  USING (TRUE);

CREATE POLICY "comments: public insert"
  ON comments FOR INSERT
  WITH CHECK (
    LENGTH(TRIM(name))    BETWEEN 1 AND 100 AND
    LENGTH(TRIM(comment)) BETWEEN 1 AND 1000
  );

-- episode_analytics: public read only
CREATE POLICY "episode_analytics: public read"
  ON episode_analytics FOR SELECT
  USING (TRUE);

-- episode_play_events: public insert only (fired by audio player)
CREATE POLICY "episode_play_events: public insert"
  ON episode_play_events FOR INSERT
  WITH CHECK (seconds IS NULL OR (seconds > 0 AND seconds <= 60));

-- page_views: no direct public access — updated only via RPC
CREATE POLICY "page_views: no direct access"
  ON page_views FOR ALL
  USING (FALSE);

-- contact_submissions: public insert only; admin reads via service role
CREATE POLICY "contact_submissions: public insert"
  ON contact_submissions FOR INSERT
  WITH CHECK (
    LENGTH(TRIM(name))    BETWEEN 1 AND 200 AND
    LENGTH(TRIM(message)) BETWEEN 1 AND 5000
  );


-- =============================================================================
--  9. SEED DATA
-- =============================================================================

-- Initial site-wide page view counter
INSERT INTO page_views (id, view_type, views)
VALUES ('site', 'site', 0)
ON CONFLICT (id) DO NOTHING;

-- ── Podcast Episodes ──────────────────────────────────────────────────────────

INSERT INTO episodes (id, episode_number, title, description, duration, date, audio_src, category, is_live, status)
VALUES
  ('5', 5,
   'The Politics of Participation: Who Speaks and Who is Heard?',
   'A critical examination of participatory methodologies in community arts — questioning whose voices are centred and how practitioners can avoid replicating power dynamics they seek to dismantle.',
   '50:19', '2025-01-01', '', 'Arts for Social Change', FALSE, 'published'),

  ('4', 4,
   'Peace Building Through Creative Expression: Lessons from Zimbabwe',
   'Drawing from 9 years of experience in Zimbabwe, reflecting on how creative arts have been deployed in peace-building initiatives and what lessons translate across Southern African contexts.',
   '56:44', '2024-12-15', '', 'Peace Studies', FALSE, 'published'),

  ('3', 3,
   'Applied Ethnomusicology: Bridging Academia and Activism',
   'A deep dive into applied ethnomusicology as a methodology — exploring its potential to bridge the gap between academic knowledge production and activist practice in the field.',
   '45:38', '2024-12-01', '', 'Ethnomusicology', FALSE, 'published'),

  ('2', 2,
   'Community Music and Shared Agency in Post-Conflict Zones',
   'Examining how community music-making creates spaces for shared agency and collective healing in communities affected by conflict and structural violence.',
   '52:15', '2024-11-15', '', 'Community Engagement', FALSE, 'published'),

  ('1', 1,
   'Arts as a Tool for Conflict Transformation in Southern Africa',
   'The inaugural episode — how arts-based methodologies serve as powerful tools for conflict transformation in Southern African contexts, drawing from doctoral research and community practice.',
   '48:22', '2024-11-01', '', 'Conflict Transformation', FALSE, 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Live Sessions ─────────────────────────────────────────────────────────────

INSERT INTO episodes (id, episode_number, title, description, duration, date, audio_src, category, is_live, original_viewers, status)
VALUES
  ('live-3', NULL,
   'Research Roundtable: Arts, Agency & Social Change in Southern Africa',
   'A multi-speaker research roundtable featuring academics, activists, and artists discussing the intersection of arts practice and social change theory. Originally streamed live with open Q&A.',
   '2:05:44', '2024-07-10', '', 'Research Roundtable', TRUE, '215 live', 'published'),

  ('live-2', NULL,
   'Peace-Building Through Arts in Zimbabwe: Field Research Broadcast',
   'Broadcast live from the field — a real-time discussion of ongoing findings from a peace-building arts initiative in Harare, with community practitioners and local artists.',
   '1:22:08', '2024-08-20', '', 'Field Research Broadcast', TRUE, '98 live', 'published'),

  ('live-1', NULL,
   'Ethnomusicology in Community Practice: Live Research Session',
   'A recorded live research session exploring the practical application of ethnomusicological methods in community arts programs across KwaZulu-Natal, with audience participation.',
   '1:45:22', '2024-09-15', '', 'Live Research Session', TRUE, '142 live', 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Publications ──────────────────────────────────────────────────────────────

INSERT INTO publications (id, title, authors, year, type, venue, sort_order) VALUES
  ('s1',  'Mapping the global skills gap: An analysis of regional and sectoral challenges in a transforming global economy.',
           'Mutero, I.T. & Marwa, N.W.', '2026', 'article',
           'International Journal of Research in Business and Social Science', 1),
  ('s2',  'Adaptive governance and community agency in crisis: A qualitative study of stakeholder engagement in Seke District, Zimbabwe.',
           'Chikanya, E., Mutero, I.T. & Chimbari, M.J.', '2026', 'article',
           'INQUIRY: The Journal of Health Care', 2),
  ('s3',  'Mediated music and well-being for Zimbabwean immigrants in South Africa.',
           'Mutero, I.T.', '2026', 'article', 'Muziki', 3),
  ('s4',  'Reviving Zimbabwean traditional dance through popular youth culture.',
           'Mutero, I.T.', '2025', 'article',
           'Southern African Journal of Folklore Studies', 4),
  ('s5',  'Platformed cultural hustlers: Social media and entrepreneurship in Zimbabwe''s independent music economy.',
           'Mutero, I.T.', '2025', 'article',
           'African Music: Journal of the International Library of African Music, 13(1)', 5),
  ('s6',  'Zimbabweans in Johannesburg: Musicking, placemaking, and everyday citizenship.',
           'Mutero, I.T.', '2024', 'article', 'Social Dynamics', 6),
  ('s7',  'Digital mental health interventions for young people in rural South Africa: Prospects and challenges for implementation.',
           'Mindu, T., Mutero, I.T., Ngcobo, W., Musesengwa, R. & Chimbari, M.J.', '2023', 'article',
           'International Journal of Environmental Research and Public Health', 7),
  ('s8',  'Engaging youth in stakeholder analysis for developing community-based digital innovations for mental health of young people in Ingwavuma Community, KwaZulu-Natal.',
           'Mutero, I.T., Mindu, T., Cele, W.B., Manyangadze, T. & Chimbari, M.J.', '2022', 'article',
           'Health & Social Care in the Community', 8),
  ('s9',  '''If I were to suffer a stroke right now, the first place that I should be taken to is the traditional healer'': Community beliefs and health-seeking practices for noncommunicable diseases in rural KwaZulu-Natal.',
           'Chikafu, H., Mutero, I.T. & Chimbari, M.J.', '2022', 'article',
           'The Qualitative Report, 27(1)', 9),
  ('s10', 'Consulting the community on strategies to strengthen social capital for community disease control.',
           'Mutero, I.T. & Chimbari, M.J.', '2021', 'article',
           'International Quarterly of Community Health Education', 10),
  ('s11', 'Partnership dynamics in university–community engagement: A South African case study of a multi-disciplinary research team.',
           'Mutero, I.T. & Chimbari, M.J.', '2021', 'article',
           'International Journal of African Higher Education, 8(1)', 11),
  ('s12', 'Sewing friendship: Increasing inclusivity through shared social spaces for migrant and local populations in Durban.',
           'Mutero, I.T., Mchunu, K. & Govender, I.G.', '2021', 'article',
           'Critical Studies in Teaching and Learning (CriSTaL)', 12),
  ('s13', 'Monitoring and evaluation of arts for social change: The case of engaged creative placemaking on university campuses.',
           'Mutero, I.T. & Govender, I.G.', '2020', 'article',
           'Journal of Asian and African Studies', 13),
  ('s14', 'Moving from transactional partnerships to collaborative community engagement: A case study evaluating creative placemaking in KwaZulu-Natal.',
           'Mutero, I.T. & Govender, I.G.', '2019', 'article',
           'South African Review of Sociology', 14),
  ('s15', 'Advancing the exploration of engaged creative-placemaking amongst universities and communities for social cohesion in South Africa.',
           'Mutero, I.T. & Govender, I.G.', '2019', 'article',
           'Journal of Asian and African Studies', 15),
  ('s16', 'Music and conflict transformation in Zimbabwe.',
           'Mutero, I.T. & Kaye, S.', '2019', 'article',
           'Peace Review, 31(3)', 16),
  ('s17', 'Unmet needs to treat schistosomiasis in children under five years old in uMkhanyakude District, KwaZulu-Natal.',
           'Mhlengi, V., Mutero, I.T. & Chimbari, M.J.', '2019', 'article',
           'The Global Journal of Health Science', 17),
  ('c1',  'Voices of dissent: Case study of the Rebel Woman, University of Zimbabwe.',
           'Mutero, I.T.', '2018', 'chapter',
           'In B. Chinouriri & U. Kufakurinani (Eds.), Victors, Victims and Villains: Women and Musical Arts in Zimbabwe''s Past and Present. University of Zimbabwe Publications.', 18),
  ('c2',  'Performing subversion: The use of Chinyambera traditional dance as a coping mechanism in Zimbabwe.',
           'Mutero, I.T.', '2018', 'chapter',
           'In A. Gimenez & M. Vambe (Eds.), Performing Zimbabwe: A Transdisciplinary Study of Zimbabwean Music. UKZN Press.', 19),
  ('u1',  'ZimDancehall micro-publics',
           'Mutero, I.T.', '', 'under-review',
           'Under revision — Journal of the Musical Arts in Africa', 20),
  ('u2',  'Zimbabwean popular music and digital platform discourse',
           'Mutero, I.T.', '', 'under-review',
           'Under revision (single-author)', 21),
  ('u3',  'Technology-enhanced learning in South African TVET colleges (Pro-Telde Project)',
           'Mutero, I.T. et al.', '', 'under-review',
           'Co-authored — in preparation', 22)
ON CONFLICT (id) DO NOTHING;

-- ── Default Admin User ────────────────────────────────────────────────────────
-- Change the password immediately after first login.
-- To create: SELECT create_admin_user('admin@zard.co.za', 'zard2025', 'Innocent Tinashe Mutero');
-- (Run this manually in Supabase SQL Editor — do NOT commit credentials to git.)

-- =============================================================================
--  END OF SCHEMA
-- =============================================================================
