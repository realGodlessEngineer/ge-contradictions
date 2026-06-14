---
name: WBC second edition publisher/year drift
description: WBC commentaries with 2nd editions often have wrong publisher and year in AI-drafted scholarship — verify carefully
type: feedback
---

When AI-drafted scholarship lists a Word Biblical Commentary volume as "2nd ed.", the publisher and year are highly susceptible to error. Known correct values:

- Klein, *1 Samuel*, WBC 10, 2nd ed.: **Thomas Nelson, 2000** (NOT 2008/2009 — often miscited as 2008)
- Butler, *Joshua 1-12* and *Joshua 13-24*, WBC 7A/7B, 2nd ed.: **Grand Rapids: Zondervan, 2014** (NOT Nashville: Thomas Nelson — the 1st edition was Word, Waco 1983; 2nd ed transferred to Zondervan after HarperCollins acquired Thomas Nelson)
- Butler, *Judges*, WBC 8, 2009: Nashville: Thomas Nelson (no 2nd ed yet)

**Why:** WBC series publisher transitioned multiple times (Word Books → Word/Thomas Nelson → Thomas Nelson → Zondervan after 2012). AI drafts frequently default to "Nashville: Thomas Nelson" for any WBC volume regardless of actual publisher at the time of the specific edition.

**How to apply:** For any WBC entry marked "2nd ed." with a year of 2010 or later, default-suspect "Nashville: Thomas Nelson" and verify it's actually Grand Rapids: Zondervan. For pre-2010 WBC 2nd editions (like Klein 1 Samuel 2000), Nashville: Thomas Nelson is correct but the year is often wrongly bumped forward to 2008.
