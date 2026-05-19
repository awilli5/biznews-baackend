
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    console.log('Device Ready');

    var refreshBtn =
        document.getElementById('refreshBtn');

    refreshBtn.addEventListener('click', function() { alert('Refresh clicked'); loadNews(); });

}

async function loadNews() {

    var keyword =
        document.getElementById('keyword').value;

    var newsContainer =
        document.getElementById('newsContainer');

    var trendingContainer =
        document.getElementById('trendingContainer');

    newsContainer.innerHTML =
        '<p style="color:white;padding:20px;">Loading...</p>';

    if (trendingContainer) {

        trendingContainer.innerHTML = '';

    }

    try {

        var response = await fetch(
            'https://biznews-baackend.onrender.com/news?q=' +
            encodeURIComponent(keyword)
        );

        var data = await response.json();

        // =========================
        // TRENDING TOPICS
        // =========================

        if (trendingContainer && data.trending) {

            trendingContainer.innerHTML +=

                '<div style="width:100%;font-size:24px;font-weight:900;color:white;padding:15px 5px;">🔥 TRENDING NOW</div>';

            data.trending.forEach(function(topic) {

                trendingContainer.innerHTML +=

                    '<div class="trend-chip">' +

                        topic[0] + ' (' + topic[1] + ')' +

                    '</div>';

            });

        }

        // =========================
        // BREAKING STORIES
        // =========================

        if (trendingContainer && data.breakingStories) {

            trendingContainer.innerHTML +=

                '<div style="width:100%;font-size:24px;font-weight:900;color:#ff4d4d;padding:25px 5px 15px 5px;">🚨 BREAKING NOW</div>';

            data.breakingStories.forEach(function(story) {

                trendingContainer.innerHTML +=

                    '<div style="background:#1a1a1a;border:1px solid #333;border-radius:18px;padding:18px;margin-bottom:16px;">' +

                        '<div style="font-size:22px;font-weight:900;color:white;margin-bottom:10px;">' +

                            story.keyword.toUpperCase() +

                        '</div>' +

                        '<div style="color:#ff4d4d;font-size:14px;font-weight:bold;">' +

                            story.count + ' SOURCES REPORTING' +

                        '</div>' +

                    '</div>';

            });

        }

        newsContainer.innerHTML = '';

        // =========================
        // SECTION RENDERER
        // =========================

        function renderSection(title, articles) {

            if (!articles || articles.length === 0) {
                return;
            }

            newsContainer.innerHTML +=

                '<div style="font-size:28px;font-weight:900;color:white;padding:30px 5px 15px 5px;">' +

                    title +

                '</div>';

            articles.slice(0, 15).forEach(function(article) {

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

                    dateText =
                        new Date(pubDate)
                        .toLocaleString();

                }

                newsContainer.innerHTML +=

'<div onclick="cordova.InAppBrowser.open(\'' + article.link + '\', \'_blank\', \'location=yes\')" style="background:#171717;padding:20px;margin-bottom:20px;border-radius:18px;border:1px solid #333;cursor:pointer;">' +

                    

                        (image ?

                        '<img src="' + image + '" style="width:100%;height:220px;object-fit:cover;border-radius:14px;margin-bottom:16px;">'

                        : '')
                        +

                        '<div style="background:red;color:white;display:inline-block;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:bold;margin-bottom:15px;">LIVE NEWS</div>' +

                        '<div style="font-size:24px;font-weight:900;line-height:1.35;color:white;margin-bottom:14px;">' +

                            articleTitle +

                        '</div>' +

                        '<div style="font-size:16px;line-height:1.6;color:#cccccc;margin-bottom:18px;">' +

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

        // =========================
        // RENDER CATEGORIES
        // =========================

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

        renderSection(
            '📰 LATEST NEWS',
            data.articles
        );

    } catch (error) {

        alert('ERROR: ' + error.message);

        console.error(error);

        newsContainer.innerHTML =
            '<p style="color:red;padding:20px;">Failed to load news</p>';

    }

}



window.onload = function() {

    console.log('WINDOW LOADED');

    var refreshBtn =
        document.getElementById('refreshBtn');

    refreshBtn.addEventListener('click', function() {

        alert('Refresh works');

        loadNews();

    });

};

