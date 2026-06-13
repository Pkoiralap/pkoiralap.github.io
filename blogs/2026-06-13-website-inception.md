# The "Websiteception": Why I built my portfolio this way

**Date:** June 13, 2026

## The "I'm a Genius" Moment (or insomnia in action)
I recently decided that a standard portfolio website, you know, the ones with the boring static images and "Click here to see more" buttons that lead to a dead PDF, just wasn't cutting it. I wanted something that was *alive*, *quaking*, *moving*, yes basically a duck, or something that screamed "I have way too much time on my hands."

So, I engineered this platform as a zero-dependency with almost-vanilla JS (Vue 2, to be exact. Just kidding. Vue 3). My goal? To create a way-ducking-cool portfolio website where each project is an isolated, interactive website that is also, you guessed it, way-ducking-cool. Basically a **website-ception**.

## 1. Blogs: Keeping it Simple (Because I'm Lazy)
I thought, "Blogs are just blogs." They’re meant for reading (assuming people will actually read my ramblings). So, I kept it simple and used Markdown (MD) files. They are easy to write, easy to parse, and I found a cool library that loads and renders them in html. Figuring out which library exactly is left for the users as a fun little guessing game.

### So how do I add a blog post?
The goal here was: *What is the maximum amount of hours I can put into this so that when I actually have to write a blog, I put absolutely zero brain cells into including it in the website?*
The result? I just drop an `.md` file into the `/blogs` folder, add one line to a JSON file inside `data/blogs.json`, and boom! It's live. If it takes more than 10 seconds, I've failed my own laziness test.

## 2. Events: The "Website inside of a Website" Experiment
This is where things got weird. For the timeline events, I wanted to push the boundaries. I asked myself: *Can I render an entire website inside another website?*

I started experimenting with a mounting system that could fetch isolated HTML, CSS, and JS components and inject them into a sandboxed div. I used the Events section as my testing ground. I wanted to see if I could handle dynamic style scoping and script execution without causing a total meltdown of the global state. Spoilers: It worked, and nothing exploded. 

### "Adding a new Event"
To add a new milestone, I just create a folder with a `main.html` and maybe a `style.css`. I add a `main.js` if I am absolutely thrilled about that event. Then I tell `data/events.json` where it lives, and the engine does all the heavy lifting, including sandboxing the styles so they don't leak out and ruin the main website. I mean, that's the goal, right? 

## 3. Projects: A Successful Evolution (Technologia!)
The experiment was a success. However, now that I had tasted blood, I wanted more. Thus, I brought that same *technologia* (I watch way too many memes, send help) to the Projects section.

This is why the projects aren't just descriptions; they are fully isolated HTML, CSS, and JS packages. This setup lets me add cool stuff like interactive D3.js architecture diagrams or full-blown simulations (check out the Fire Simulator, which is just a gif file loaded in the html btw. Lol, please don't hate me. Simulating fire with javascript was too much work that I didn't want to put in. Although, I am curious if I can port it to web assembly, but that's for another one of these sleepless nights, when I am too fired up to sleep. See what I did there?). 

### The "Ultimate Scalability Hack"
Adding a project is the ultimate flex of this architecture. I can build a whole new mini-app, throw it into a folder, and register it in `data/projects.json`. (I spent weeks engineering this "mounting engine" just so that future-me could add a project in 5 seconds. Pure genius if you ask me. Engineering at its finest!)

## The Future?
Honestly, now that the "website-in-a-website" thing works so well, I might even move the blogs over to this format too, just to make it more cool (for another one of these sleepless nights, when I am too fired up. See what I did there again? :P) But this will probably happen, just like most of my plans, eventually .........

Until then, enjoy, live, laugh, and be kind.
Oh and feel free to use this as you see fit.
