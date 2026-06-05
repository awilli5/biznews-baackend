process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import Parser from "rss-parser";
//import compression from "compression";

const app = express();
const parser = new Parser();

app.use(cors());
//app.use(compression());

const PORT = process.env.PORT || 3000;

/*
========================================
SUPER FAST CACHE
========================================
*/

let homepageCache = {
    status: "starting",

    updated: null,

    top: [{
        title: "Loading latest news...",
        description: "Fetching feeds...",
        source: "Bizmunkey",
        pubDate: new Date(),
        link: "",
        image: ""
    }],

    politics: [],
    entertainment: [],
    sports: [],
    tech: [],
    world: []
};

let categoryCache = {
    politics: [],
    entertainment: [],
    sports: [],
    tech: [],
    world: []
};

let isRefreshing = false;

/*
========================================
FAST FEEDS ONLY
========================================
*/

const feeds = [
    "https://feeds.abcnews.com/abcnews/topstories",
    "https://feeds.nbcnews.com/nbcnews/public/news",
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://moxie.foxnews.com/google-publisher/latest.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://thehill.com/feed/",
    "https://www.theverge.com/rss/index.xml"
];
/*
========================================
TIMEOUT WRAPPER
========================================
*/

function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timeout"));
        }, ms);

        promise
            .then(res => {
                clearTimeout(timeout);
                resolve(res);
            })
            .catch(err => {
                clearTimeout(timeout);
                reject(err);
            });
    });
}

/*
========================================
REFRESH NEWS
========================================
*/

async function refreshNews() {
    if (isRefreshing) {
        console.log("Refresh already running...");
        return;
    }

    isRefreshing = true;

    const refreshStart = Date.now();

    console.log("========================================");
    console.log("REFRESH START:", new Date().toISOString());
    console.log("========================================");

    try {
        const allArticles = [];
const feedGroups = {};
        const politicsArticles = [];
        const entertainmentArticles = [];
        const sportsArticles = [];
        const techArticles = [];
        const worldArticles = [];

        /*
        ========================================
        LOAD FEEDS IN PARALLEL WITH TIMING
        ========================================
        */

        const feedPromises = feeds.map(async (url) => {
            const feedStart = Date.now();

            try {
                console.log("START:", url);

                const feed = await timeoutPromise(
                    5000,
                    parser.parseURL(url)
                );

                console.log(
                    "SUCCESS:",
                    url,
                    "-",
                    Date.now() - feedStart,
                    "ms"
                );

                const articles = feed.items
                    .slice(0, 10)
                    .map(item => {
                        return {
                            title: item.title || "No Title",

                            description:
                                item.contentSnippet ||
                                item.content ||
                                "No Description",

                            source:
                                feed.title || "News",

                            pubDate:
                                item.pubDate || new Date(),

                            link:
                                item.link || "",

                            image:
                                item.enclosure?.url || ""
                        };
                    });

                return articles;

            } catch (err) {
                console.log(
                    "FAILED:",
                    url,
                    "-",
                    Date.now() - feedStart,
                    "ms",
                    err.message
                );

                return [];
            }
        });

        const settledFeeds = await Promise.allSettled(feedPromises);

        settledFeeds.forEach(result => {
            if (
                result.status === "fulfilled" &&
                Array.isArray(result.value)
            ) {
                allArticles.push(...result.value);
				result.value.forEach(article => {

				    const source =
				        article.source || "Other";

				    if (!feedGroups[source]) {

				        feedGroups[source] = [];

				    }

				    feedGroups[source].push(article);

				});
            }
        });

        /*
        ========================================
        SORT NEWEST FIRST
        ========================================
        */

        allArticles.sort((a, b) =>
            new Date(b.pubDate) - new Date(a.pubDate)
        );

        /*
        ========================================
        AUTO CATEGORIZATION
        ========================================
        */

        allArticles.forEach(article => {
            const title = article.title.toLowerCase();

            if (
                title.includes("trump") ||
                title.includes("white house") ||
                title.includes("senate") ||
                title.includes("congress") ||
                title.includes("democrat") ||
                title.includes("republican") ||
                title.includes("election") ||
                title.includes("biden") ||
                title.includes("politic")
            ) {
                politicsArticles.push(article);
            }

            else if (
                title.includes("celebrity") ||
                title.includes("movie") ||
                title.includes("music") ||
                title.includes("hollywood") ||
                title.includes("actor") ||
                title.includes("singer")
            ) {
                entertainmentArticles.push(article);
            }

            else if (
                title.includes("nba") ||
                title.includes("nfl") ||
                title.includes("soccer") ||
                title.includes("baseball") ||
                title.includes("sports") ||
                title.includes("basketball") ||
                title.includes("football")
            ) {
                sportsArticles.push(article);
            }

            else if (
                title.includes("apple") ||
                title.includes("google") ||
                title.includes("microsoft") ||
                title.includes("ai") ||
                title.includes("technology") ||
                title.includes("iphone") ||
                title.includes("tesla")
            ) {
                techArticles.push(article);
            }

            else {
                worldArticles.push(article);
            }
        });

        /*
        ========================================
        CATEGORY CACHE
        ========================================
        */

        categoryCache = {
            politics: politicsArticles,
            entertainment: entertainmentArticles,
            sports: sportsArticles,
            tech: techArticles,
            world: worldArticles
        };

        /*
        ========================================
        HOMEPAGE CACHE
        ========================================
        */

        homepageCache = {
            status: "ok",

            updated:
                new Date().toISOString(),

            
			feeds: feedGroups,
			
			
			top:
			allArticles,

            politics:
                politicsArticles.slice(0, 5),

            entertainment:
                entertainmentArticles.slice(0, 5),

            sports:
                sportsArticles.slice(0, 5),

            tech:
                techArticles.slice(0, 5),

            world:
                worldArticles.slice(0, 5)
        };

        console.log("========================================");
        console.log(
            "REFRESH COMPLETE:",
            allArticles.length,
            "articles"
        );
        console.log(
            "TOTAL REFRESH TIME:",
            Date.now() - refreshStart,
            "ms"
        );
        console.log("========================================");

    } catch (err) {
        console.error("REFRESH FAILED:", err);
    } finally {
        isRefreshing = false;
    }
}

/*
========================================
START SERVER
========================================
*/

async function startServer() {
    //await refreshNews();
    refreshNews();
    /*
    ========================================
    AUTO REFRESH
    ========================================
    */

    setInterval(() => {
        refreshNews();
    }, 1000 * 60 * 10);

    /*
    ========================================
    FAST HOMEPAGE API
    ========================================
    */

    app.get("/news", (req, res) => {
        console.log(
            "REQUEST /news:",
            new Date().toISOString()
        );

        res.json(homepageCache);
    });

    /*
    ========================================
    CATEGORY API
    ========================================
    */

    app.get("/category/:name", (req, res) => {
        const category = req.params.name;

        console.log(
            "REQUEST /category/" + category + ":",
            new Date().toISOString()
        );

        if (!categoryCache[category]) {
            return res.status(404).json({
                status: "error",
                message: "Category not found"
            });
        }

        res.json({
            status: "ok",
            category,
            articles: categoryCache[category]
        });
    });

    /*
    ========================================
    START LISTENER
    ========================================
    */

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();