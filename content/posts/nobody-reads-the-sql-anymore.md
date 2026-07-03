---
title: "Nobody Reads the SQL Anymore"
date: "2026-07-02T10:33:00"
tags: ["opinion", "ai", "sql", "performance", "culture"]
excerpt: "AI writing our queries is fine, and often better than fine. But reading skill was funded by writing, and now that the writing is gone, the reading is decaying while the volume of SQL entering our codebases goes up. Some thoughts on why SQL is the worst possible language for this to happen to."
og:
  template: "screenshot-split"
  title: "Nobody reads"
  accent: "the SQL anymore."
  claim: "AI writing your queries is fine. Nobody being able to read them is not. SQL literacy is quietly becoming the rarest skill on the team."
  image: "/img/posts/tabularis-visual-explain-graph-view-execution-plan.png"
---

# Nobody Reads the SQL Anymore

These days most of the SQL entering a codebase was written by a language model. I don't think this is a problem in itself: models have read more SQL than any of us ever will, and for the everyday query, the three-way join with a couple of aggregations, they are fast and usually correct. I use them for this all the time. The writing was never the sacred part of the job.

What worries me is a second-order effect that I started noticing in code reviews, my own included. A pull request arrives with a forty-line query in the middle, the tests pass, the data looks plausible, and the review comment says "LGTM". The reviewer did not really read the query. Often the author did not read it either, in any meaningful sense, because an agent wrote it and the output looked reasonable. Every single step of this is a rational decision, and the sum is **a query in production that no human being has ever actually understood**.

For most languages I would shrug at this. But reading skill and writing skill, while different things, were historically funded by the same activity: you learned to read queries by writing bad ones first and debugging them. Now the writing is gone, so the reading is decaying, and at the same time the volume of generated SQL is going up. Fewer readers, more text. That's a bad combination anywhere — but SQL is a special case, and I want to explain why I believe it is the worst possible language for this to happen to.

## SQL fails differently

**The cost of a query is invisible in its text.** SQL is declarative: the query says what you want, the database decides how to get it, and two queries that look almost identical can differ by three orders of magnitude at runtime. You cannot see a sequential scan over four million rows by staring at the SELECT statement, no matter how experienced you are. With imperative code, a triple nested loop at least *looks* suspicious. In SQL the truth is simply not on the page: it lives in the execution plan — a thing almost nobody looks at voluntarily, and which the model that generated the query has never seen at all.

**Wrong SQL usually works.** A subtly wrong query does not crash: the LEFT JOIN that should have been an inner join silently multiplies rows, the WHERE clause that mishandles NULL silently drops records, and the result set still looks completely plausible. The dashboard renders. Somebody makes a decision based on it. Your test suite does not catch this, because the fixture has forty rows and the bug needs four million, or needs that one customer with two addresses. This is the category of bug that surfaces months later as a number that has been wrong since March — and it is exactly the category where a human reading the query carefully would have helped.

:::newsletter:::

## The inversion

So my feeling is that we are heading into a strange inversion. For twenty years "can write SQL" was the skill you put on a resume. That is now table stakes, the agent writes it. The skill that is becoming scarce, and therefore valuable, is being able to look at a query you did not write and answer two questions: **does it mean what we think it means, and what is it going to cost?** The first is a question about semantics — row multiplicity, NULL behavior, what that DISTINCT is papering over. The second is not a question about the query at all: it is a question about the plan.

The developers who can answer both are turning into the editors of what the machines write, and editors were always rarer than writers. Maybe I'm wrong and models will get good enough at self-reviewing that human reading will stop mattering; but for now they can't even see the plan, so I would not bet on it yet.

## Reading has to get cheaper

The standard prescription at this point would be that developers should study SQL more, and I don't believe in it, for the same reason virtue-based prescriptions never work: nobody has slack for homework, and willpower loses against deadlines every single time. If reading matters more than before, reading has to become cheaper. **That's a tooling problem, not a discipline problem.**

This is, honestly, a big part of why I build Tabularis the way I do. The [visual query builder](/wiki/visual-query-builder) works in both directions: you compose a query visually, and it always shows you the SQL it is generating, so the tool doubles as a reading tutor without asking anything from you. The AI assistant can [explain a query](/wiki/ai-assistant) you inherited instead of just writing new ones. And for the cost question — the one the text cannot answer — [visual EXPLAIN](/wiki/visual-explain) renders the execution plan as an interactive graph where the expensive node is red and the estimate that is off by 40x is highlighted, instead of buried at line 60 of a text dump:

<video src="/videos/wiki/05-visual-explain.mp4" poster="/videos/wiki/05-visual-explain.jpg" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture style="width:100%;border-radius:8px;margin:1rem 0"></video>

*(There is a longer walkthrough in the [visual EXPLAIN wiki page](/wiki/visual-explain).)*

Note that none of this is an anti-AI position — there is a model in the loop right there in the previous paragraph. The position is narrower: **generation without inspection is debt**, and since the generation became effortless, the inspection has to become effortless too, otherwise it simply stops happening. Which is what we are watching happen.

:::star:::

If you want to keep the muscle without doing homework, there is a very small habit that I can suggest. Next time an agent hands you a query, before running it, spend thirty seconds making two predictions: roughly how many rows it should return, and which table will dominate the cost. Then run it and check. When you are right, you spent thirty seconds. When you are wrong, you found either a bug or a hole in your mental model of your own data, and both are worth much more than the time.

The machines write well now, better than most of us on a Tuesday afternoon. Someone still has to be able to tell when what they wrote is not what we meant. For the moment, that someone is necessarily human, and there are fewer of them every year. It seems like a good year to be one.
