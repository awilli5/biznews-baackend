process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import googleTrends from "google-trends-api";

const app = express();

const parser = new Parser();

app.use(cors());

app.get("/news", async (req, res) => {

    try {

        const feeds = [

            // BBC
            "https://feeds.bbci.co.uk/news/rss.xml",

            // NPR
            "https://feeds.npr.org/1001/rss.xml",

            // New York Times
            "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",

            // NYT Politics
            "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",

            // Politico
            "https://www.politico.com/rss/politicopicks.xml",

            // The Hill
            "https://thehill.com/feed/",

            // DW
            "https://rss.dw.com/xml/rss-en-all",

            // Sky News
            "https://feeds.skynews.com/feeds/rss/home.xml",

            // Reuters
            "https://feeds.reuters.com/reuters/topNews",

            // AP
            "https://apnews.com/rss",

            // CBS
            "https://www.cbsnews.com/latest/rss/main",

            // NBC
            "https://feeds.nbcnews.com/nbcnews/public/news",

            // FOX
            "https://moxie.foxnews.com/google-publisher/latest.xml",

            // PBS
            "https://www.pbs.org/newshour/feeds/rss/headlines",

            // ABC
            "https://abcnews.go.com/abcnews/topstories",

            // Wall Street Journal
            "https://feeds.a.dj.com/rss/RSSWorldNews.xml",

            // New York Post
            "https://nypost.com/feed/",

            // Daily Mail
            "https://www.dailymail.co.uk/news/index.rss",

            // TMZ
            "https://www.tmz.com/rss.xml",

            // TechCrunch
            "https://feeds.feedburner.com/TechCrunch/",

            // Verge
            "https://www.theverge.com/rss/index.xml",

            // Reddit News
            "https://www.reddit.com/r/news/.rss",

            // Reddit Politics
            "https://www.reddit.com/r/politics/.rss",

            // Reddit World News
            "https://www.reddit.com/r/worldnews/.rss",

            // Google News Main
            "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",

            // Google Breaking News
            "https://news.google.com/rss/search?q=breaking+news&hl=en-US&gl=US&ceid=US:en",

            // Google Politics
            "https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en",

            // Google Trump
            "https://news.google.com/rss/search?q=Trump&hl=en-US&gl=US&ceid=US:en",

            // Google Democrats
            "https://news.google.com/rss/search?q=democrats&hl=en-US&gl=US&ceid=US:en",

            // Google Washington DC
            "https://news.google.com/rss/search?q=Washington+DC&hl=en-US&gl=US&ceid=US:en",

            // Google Animals
            "https://news.google.com/rss/search?q=animals&hl=en-US&gl=US&ceid=US:en"

        ];

        const allArticles = [];

        // GOOGLE TRENDS
		try {

		    const trends = await googleTrends.dailyTrends({
		        geo: 'US'
		    });

		    const trendsData = JSON.parse(trends);

		    const trendingSearches =
		        trendsData.default.trendingSearchesDays[0].trendingSearches;

		    console.log("Trending Searches:");

		    trendingSearches.slice(0, 10).forEach(item => {

		        console.log(item.title.query);

		    });

		} catch (trendError) {

		    console.log("Google Trends failed");

		}
        // LOAD RSS FEEDS
        for (const url of feeds) {

            try {

                console.log("Loading:", url);

                const feed = await parser.parseURL(url);

                const articles = feed.items.slice(0, 15).map(item => {

                    return {

                        title:
                            item.title || "No Title",

                        description:
                            item.contentSnippet ||
                            item.content ||
                            "No Description",

                        source:
                            feed.title || "News",

                        pubDate:
                            item.pubDate || new Date()

                    };

                });

                allArticles.push(...articles);

            } catch (err) {

                console.log("Feed failed:", url);

            }

        }

        
        // TRENDING TOPICS

        const topicCounts = {};

        allArticles.forEach(article => {

            const words =
                article.title.split(" ");

            words.forEach(word => {

                word = word
                    .replace(/[^a-zA-Z]/g, "")
                    .toLowerCase();

                if (word.length > 4) {

                    if (!topicCounts[word]) {
                        topicCounts[word] = 0;
                    }

                    topicCounts[word]++;

                }

            });

        });

        const trendingTopics =
            Object.entries(topicCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15);

        console.log("TRENDING TOPICS");

        console.log(trendingTopics);
		
		
		
		
		// SORT NEWEST FIRST
        allArticles.sort((a, b) =>
            new Date(b.pubDate) - new Date(a.pubDate)
        );

		res.json({
		    status: "ok",
		    total: allArticles.length,

		    trending: trendingTopics,

		    articles: allArticles
		});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "error",
            message: error.message
        });

    }

});

app.listen(3000, "0.0.0.0", () => {

    console.log("Server running on port 3000");

});