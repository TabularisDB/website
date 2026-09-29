---
title: 'When the Project Outgrows the Site: The tabularis.dev Rebuild Story'
date: '2026-09-28T14:00:00'
authors: ['wajrock']
tags: ['ux', 'ui', 'design', 'ai', 'open-source', 'website']
excerpt: 'Lessons from rebuilding tabularis.dev: what a vibecoded site gets you fast, what it quietly breaks, and how to close the gap before a project grows past you.'
og:
    template: 'screenshot-split'
    title: 'The tabularis.dev Rebuild Story'
    claim: 'How I approached the redesign of tabularis.dev, from auditing what existed to shipping a clearer structure.'
    image: '/img/posts/tabularis-site-redesign-hero.png'
---

# When the Project Outgrows the Site: The tabularis.dev Rebuild Story

Tabularis.dev worked. It shipped fast, it did its job, and nobody had complained. That's usually the moment a website stops getting attention, right up until the project behind it starts growing faster than the site can represent it.

Tabularis started as most fast-moving open source projects do now: built quickly, with AI doing a good share of the work, optimized for shipping rather than for what happens six months later. That's not a complaint, it's how the site got to exist in the first place. But it meant the version I inherited had never been asked to hold up under real scrutiny.

Here's the order I actually worked in, and what each step taught me.

## Understand what already exists before changing anything

Before opening any design tool, I audited the current site page by page: what was there, what it was trying to say, and where a first time visitor would likely get lost or give up.

Three things stood out. The navigation and page hierarchy weren't obvious to someone landing on the site cold. The content itself was dense in places where it should have been scannable. And the homepage, the page carrying the most weight in convincing someone to stay, wasn't actually selling the project. It described it without making the case for it.

<img src="/img/posts/tabularis-homepage-hero-before.png" alt="Homepage hero section before the redesign" loading="lazy">

I also looked outward, at how established dev tool sites handle the same problem: Stripe, Vercel, Linear. Not to copy their look, but to study two things specifically. First, how shallow and predictable their navigation stays even as the product grows, a handful of clear entries instead of trying to expose everything. Second, how consistent their design system is underneath: the same spacing scale, the same type rhythm, the same handful of colors, repeated everywhere instead of reinvented per page. Studying that meant I wasn't guessing at what "clean" looks like, I was reusing conventions that already work instead of inventing my own.

## Prototype before you touch code

From there I moved into Figma. It wasn't a rigid round of iterations with formal sign off between each one, more a continuous back and forth: sketch a direction, look at it next to the real content, adjust, move to the next page. Deciding on structure and hierarchy there is far cheaper than deciding it in code, and it gave something concrete to react to before any engineering time went into it.

## Audit the codebase the same way you audited the design

Once the direction was set, I went through the project's structure itself. Some of it was in good shape. Routing was cleanly organized, and SEO and Open Graph handling were already well integrated, better than most projects this size bother with.

Some of it wasn't. Every global style in the project lived in a single globals.css file, 11,229 lines of code on its own, about 13,000 with comments and blank lines included. In practice that meant: no reliable way to tell if a given rule was still used anywhere, real fear of editing a class because nothing guaranteed it wasn't also shaping three other pages, class names colliding across unrelated components, and a file too large to navigate with any confidence. The component structure itself was flat too, most components sitting directly under one folder with no separation by feature.

## Question every piece before keeping it

Rebuilding the pages meant going through each one and asking whether what was there actually earned its place, rather than assuming the existing shape was correct just because it existed.

The homepage features section was the clearest example. It listed 19 feature cards, all given equal visual weight. I cut that down to the 4 that actually matter for a first impression, with a link to the solutions page for anyone who wants the full list. Nineteen equally weighted items don't help a new visitor understand a project, they just delay the moment they decide it's worth their time.

Two other sections went entirely: one dedicated to the app's visual themes, another introducing the wiki. Neither was wrong to have somewhere on the site, but neither belonged on a landing page whose only job is to convert a first time visitor, not walk them through every corner of the product.

The homepage wasn't the only page that got this treatment. The download page, the compare pages, and the plugins bounty board all went through the same question: does this actually help the person reading it decide something, or is it here because it was easy to add at the time.

The bounty board is a clear example. Its hero used to carry a dense driver map: thirteen targets, four status colors, a legend explaining what each one meant, and three calls to action competing for attention before a visitor had even finished reading the headline. The new version keeps the same intent, showing what still needs a driver, but says it with six database logos orbiting the product mark and two buttons instead of three. Same information underneath, far less to parse before deciding what to do next.

<div class="post-gallery">
  <img src="/img/posts/tabularis-bounty-board-before.png" alt="Plugin bounty board hero with a driver map of thirteen targets, a status legend and three calls to action" loading="lazy">
  <img src="/img/posts/tabularis-bounty-board-after.png" alt="Plugin bounty board hero simplified to six database logos orbiting the product mark with two calls to action" loading="lazy">
</div>

## The pages that pushed back

Two parts of the rebuild took noticeably longer than the rest, for different reasons.

The download page was one. It sounds like the simplest page on the site, pick your platform, get the file, but that's exactly why it's worth getting right. Every extra click or bit of ambiguity there is someone who almost converted and didn't. I spent more time on that page's flow than its complexity would suggest, because the whole point of it is to be frictionless.

The other was the content pages, blog posts and solutions pages, which render hand formatted content rather than a fixed layout. That meant every content type needed its own tested treatment: headings at every level, code blocks, video embeds, image blocks, all of it. A content page isn't one component, it's a small system of components that has to look coherent no matter which combination a given article actually uses, which made it far less predictable to finish than a page with a fixed structure.

## Rebuild with a structure that stays clear as it grows

Development itself moved to CSS Modules, migrated both page by page as each one got its redesign pass, and component by component where it made sense to tackle a shared piece on its own. Styles now live next to the component they belong to, scoped and explicit, organized by feature instead of sitting flat in one folder.

globals.css didn't disappear, it shrank down to what actually deserves to be global: shared variables and the base layout classes. Everything else moved into its own module, so editing one component's styles no longer means reasoning about the entire site to make sure nothing else breaks.

## Where it landed

The whole thing wasn't a single sprint, it stretched over several weeks of work alongside everything else. The numbers reflect the shift:

|               | Before | After  | Change |
| ------------- | ------ | ------ | ------ |
| Files         | 145    | 274    | +89%   |
| Lines of code | 28,533 | 21,096 | -26%   |
| Total lines   | 32,295 | 23,899 | -26%   |

More files, less code, because the code that remained had somewhere specific to live instead of accumulating in whatever file was already open.

What changed isn't just how the site looks in a screenshot. The homepage now says what the project is in the time a new visitor actually gives it, instead of relying on them to dig for it, and the codebase underneath no longer punishes the next person who has to touch it.

## Closing

If you're looking at a site that "just works" for a project that's starting to grow, the question worth asking isn't whether it looks fine today. It's what happens to it under review, under load, and under six more months of changes nobody has planned for yet.

What's the one thing that still feels rough when you land on tabularis.dev? Tell us in [GitHub Discussions](https://github.com/TabularisDB/tabularis/discussions) or [Discord](https://discord.com/invite/K2hmhfHRSt).
