BEGIN;

-- ==========================================
-- SAFETY CHECK
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM room WHERE slug = 'ottawa') THEN
    RAISE EXCEPTION 'Room slug not found: ottawa';
  END IF;
END $$;

-- ==========================================
-- DELETE EXISTING FAQ (ORDER MATTERS)
-- ==========================================

DELETE FROM faq_item
WHERE category_id IN (
    SELECT fc.id
    FROM faq_category fc
    JOIN room r ON r.id = fc.room_id
    WHERE r.slug = 'ottawa'
);

DELETE FROM faq_category
WHERE room_id = (
    SELECT id FROM room WHERE slug = 'ottawa'
);

-- ==========================================
-- INSERT NEW FAQ (READABLE / AUTHORITATIVE)
-- ==========================================

WITH
room_ctx AS (
    SELECT id AS room_id
    FROM room
    WHERE slug = 'ottawa'
),

category_data (title, sequence) AS (
    VALUES
        ('Club', 1),
        ('Membership', 2)
),

inserted_categories AS (
    INSERT INTO faq_category (room_id, title, sequence)
    SELECT
        r.room_id,
        c.title,
        c.sequence
    FROM category_data c
    CROSS JOIN room_ctx r
    RETURNING id, title
),

faq_data (category_title, question, answer, sequence) AS (
    VALUES
        (
            'Club',
            'Can I visit the club?',
            $$
The club is locked 24/7 and not accessible to the public, except for special events from time to time.

Please do not show up at the club expecting to get in and play.  See the Membership FAQs below for details
 about getting a membership.
            $$,
            1
        ),
        (
            'Club',
            'Can I bring food and drink?',
            $$
You can bring in your own food and non-alcoholic drink.

Food is limited to the lounge area.

Drinks may be placed on the high-top tables and accessed between turns.

No food or beverages should ever be closer to the snooker tables.

Please ensure hands are clean before returning to play.

Garbage cans are provided and members are expected to clean up after themselves.
            $$,
            2
        ),
                (
            'Membership',
            'What does membership cost?',
            $$
There is no ongoing membership cost.

A $20 deposit is required for a key fob to access the building after hours.
            $$,
            1
        )

)

INSERT INTO faq_item (category_id, question, answer, sequence)
SELECT
    ic.id,
    f.question,
    f.answer,
    f.sequence
FROM faq_data f
JOIN inserted_categories ic
  ON ic.title = f.category_title;

COMMIT;

