```javascript
document.addEventListener('deviceready', onDeviceReady, false);

/*
========================================
DEVICE READY
========================================
*/

function onDeviceReady() {

    console.log('Device Ready');

    setupRefreshButton();

    loadNews();

}

/*
========================================
SETUP REFRESH BUTTON
========================================
*/

function setupRefreshButton() {

    var refreshBtn =
        document.getElementById('refreshBtn');

    if (!refreshBtn) {

        console.log('Refresh button not found');

        return;

    }

    /*
    REMOVE OLD LISTENERS
    */

    refreshBtn.onclick = null;

    /*
    ADD CLICK HANDLER
    */

    refreshBtn.onclick = function() {

        console.log('Refresh clicked');

        loadNews();

    };

}

/*
========================================
LOAD NEWS
========================================
*/

async function loadNews() {

    try {

        var keywordInput =
            document.getElementById('keyword');

        var keyword =
            keywordInput ?
            keywordInput.value :
            '';

        var newsContainer =
            document.getElementById('newsContainer');

        var trendingContainer =
            document.getElementById('trendingContainer');

        if (!newsContainer) {

            console.log('newsContainer missing');

            return;

        }

        /*
        ========================================
        FAST LOADING STATE
        ========================================
        */

        newsContainer.innerHTML =

            '<div style="padding:40px;text-align:center;color:white;font-size:18px;font-weight:bold;">Loading News...</div>';

        if (trendingContainer) {

            trendingContainer.innerHTML = '';

        }

        /*
        ========================================
        FETCH NEWS
        ========================================
        */

        const response = await fetch(

            'https://biznews-baackend.onrender.com/news?q=' +

            encodeURIComponent(keyword)

        );

        /*
        ========================================
        CHECK RESPONSE
        ========================================
        */

        if (!response.ok) {

            throw new Error(
                'Server Error: ' + response.status
            );

        }

        const data = await response.json();

        /*
        ========================================
        BUILD HTML IN MEMORY
        ========================================
        */

        let html = '';

        /*
        ========================================
        SECTION RENDERER
        ========================================
        */

        function renderSection(title, articles) {

            if (!articles || articles.length === 0) {

                return;

            }

            html +=

                '<div style="font-size:24px;font-weight:900;color:white;padding:22px 8px 14px 8px;">' +

                    title +

                '</div>';

            /*
            ========================================
            ONLY 5 ARTICLES PER SECTION
            ========================================
            */

            articles.slice(0, 5).forEach(function(article) {

                var articleTitle =
                    article.title || 'No Title';

                var description =
                    article.description || '';

                var source =
                    article.source || '';

                var image =
                    article.image || '';

                var pubDate =
                    article.pubDate || '';

                var dateText = '';

                if (pubDate) {

                    try {

                        dateText =
                            new Date(pubDate)
                            .toLocaleString();

                    } catch (e) {

                        dateText = '';

                    }

                }

                /*
                ========================================
                SAFE LINK
                ========================================
                */

                var safeLink =
                    article.link || '#';

                /*
                ========================================
                ARTICLE CARD
                ========================================
                */

                html +=

                    '<div class="news-card" style="background:#171717;padding:18px;margin-bottom:18px;border-radius:18px;border:1px solid #333;cursor:pointer;" onclick="openArticle(\'' + safeLink + '\')">' +

                        (image ?

                        '<img loading="lazy" src="' + image + '" style="width:100%;height:210px;object-fit:cover;border-radius:14px;margin-bottom:14px;background:#111;">'

                        : '') +

                        '<div style="background:red;color:white;display:inline-block;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:bold;margin-bottom:14px;">LIVE NEWS</div>' +

                        '<div style="font-size:22px;font-weight:900;line-height:1.35;color:white;margin-bottom:12px;">' +

                            articleTitle +

                        '</div>' +

                        '<div style="font-size:15px;line-height:1.55;color:#cccccc;margin-bottom:16px;">' +

                            description +

                        '</div>' +

                        '<div style="display:flex;justify-content:space-between;border-top:1px solid #333;padding-top:12px;">' +

                            '<div style="color:#888;font-size:13px;font-weight:bold;">' +

                                source +

                            '</div>' +

                            '<div style="color:#666;font-size:12px;">' +

                                dateText +

                            '</div>' +

                        '</div>' +

                    '</div>';

            });

        }

        /*
        ========================================
        TOP STORIES
        ========================================
        */

        renderSection(
            '🔥 TOP STORIES',
            data.top || data.articles
        );

        /*
        ========================================
        CATEGORY PREVIEWS
        ========================================
        */

        renderSection(
            '🏛 POLITICS',
            data.politics
        );

        renderSection(
            '🎬 ENTERTAINMENT',
            data.entertainment
        );

        renderSection(
            '🏈 SPORTS',
            data.sports
        );

        renderSection(
            '💻 TECH',
            data.tech
        );

        renderSection(
            '🌍 WORLD',
            data.world
        );

        /*
        ========================================
        EMPTY FALLBACK
        ========================================
        */

        if (!html || html.trim() === '') {

            html =

                '<div style="padding:40px;text-align:center;color:#999;font-size:18px;font-weight:bold;">No news available</div>';

        }

        /*
        ========================================
        SINGLE DOM RENDER
        ========================================
        */

        newsContainer.innerHTML = html;

        /*
        ========================================
        SCROLL TO TOP
        ========================================
        */

        window.scrollTo({

            top: 0,
            behavior: 'smooth'

        });

    } catch (error) {

        console.error('LOAD NEWS ERROR:', error);

        var newsContainer =
            document.getElementById('newsContainer');

        if (newsContainer) {

            newsContainer.innerHTML =

                '<div style="padding:40px;text-align:center;color:red;font-size:18px;font-weight:bold;">Failed to load news</div>';

        }

    }

}

/*
========================================
OPEN ARTICLE
========================================
*/

function openArticle(url) {

    try {

        if (!url || url === '#') {

            return;

        }

        cordova.InAppBrowser.open(

            url,
            '_blank',
            'location=yes'

        );

    } catch (error) {

        console.log(error);

        window.open(url, '_blank');

    }

}
```
