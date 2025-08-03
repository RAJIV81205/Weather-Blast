// Weather News System with Real API Integration
// To use real news data, get a free API key from https://newsapi.org/
// Replace 'YOUR_NEWS_API_KEY' below with your actual API key

let currentPage = 1;
let totalPages = 1;
const articlesPerPage = 4; // Back to 4 articles per page as requested
const maxVisiblePages = 3; // Changed from 5 to 3 for better mobile experience

// NewsAPI configuration for weather and natural disaster news
const NEWS_API_KEY = 'c877edd05e7142d290f5ee7409afba2d'; // Replace with your actual API key
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

async function loadWeatherNews() {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = `
        <div class="news-loading">
            <div class="loading-spinner"></div>
            <h3>🌦️ Loading Latest Weather News...</h3>
            <p>Fetching the most recent weather and natural disaster updates</p>
        </div>
    `;
    
    try {
        let newsData = [];
        
        // Try to fetch real news from NewsAPI
        if (NEWS_API_KEY && NEWS_API_KEY !== 'YOUR_NEWS_API_KEY') {
            newsData = await fetchRealWeatherNews();
        } else {
            // Fallback to curated weather/disaster news data
            newsData = getFallbackWeatherNews();
        }
        
        totalPages = Math.ceil(newsData.length / articlesPerPage);
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const currentArticles = newsData.slice(startIndex, endIndex);
        
        newsGrid.innerHTML = '';
        currentArticles.forEach((news, index) => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.style.animationDelay = `${index * 0.1}s`; // Stagger animations
            
            const categoryIcons = {
                breaking: 'fas fa-bolt',
                severe: 'fas fa-exclamation-triangle',
                research: 'fas fa-flask',
                drought: 'fas fa-tint',
                analysis: 'fas fa-chart-line',
                warning: 'fas fa-exclamation-circle',
                seasonal: 'fas fa-snowflake',
                health: 'fas fa-heartbeat',
                space: 'fas fa-satellite',
                fire: 'fas fa-fire',
                weather: 'fas fa-cloud',
                disaster: 'fas fa-exclamation-triangle',
                climate: 'fas fa-thermometer-half'
            };

            newsCard.innerHTML = `
                <div class="news-source">
                    <i class="fas fa-newspaper"></i>
                    <span>${news.source}</span>
                </div>
                <h3>${news.title}</h3>
                <p>${news.description}</p>
                <div class="news-meta">
                    <span class="news-time">
                        <i class="fas fa-clock"></i>
                        ${news.time}
                    </span>
                    <button class="read-more-btn" onclick="readFullArticle('${news.title}', '${news.url || ''}')">
                        <i class="fas fa-arrow-right"></i>
                        Read More
                    </button>
                </div>
            `;
            newsGrid.appendChild(newsCard);
        });
        
        updatePagination();
        
    } catch (error) {
        console.error('Error loading news:', error);
        newsGrid.innerHTML = `
            <div class="news-error">
                <div class="error-icon">⚠️</div>
                <h3>Oops! News Temporarily Unavailable</h3>
                <p>We're having trouble loading the latest weather news. Please try again in a moment.</p>
                <button class="retry-btn" onclick="loadWeatherNews()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Fetch real weather and natural disaster news from NewsAPI
async function fetchRealWeatherNews() {
    try {
        const weatherKeywords = [
            'weather disaster',
            'hurricane',
            'tornado', 
            'flood',
            'earthquake',
            'wildfire',
            'drought',
            'blizzard',
            'climate change',
            'extreme weather'
        ];
        
        const randomKeyword = weatherKeywords[Math.floor(Math.random() * weatherKeywords.length)];
        
        const response = await fetch(`${NEWS_API_URL}?q=${randomKeyword}&sortBy=publishedAt&language=en&pageSize=16&apiKey=${NEWS_API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch news from API');
        }
        
        const data = await response.json();
        
        return data.articles.map(article => ({
            title: article.title,
            description: article.description || 'No description available.',
            time: formatTimeAgo(new Date(article.publishedAt)),
            source: article.source.name || 'Unknown Source',
            category: categorizeNews(article.title, article.description),
            url: article.url
        }));
        
    } catch (error) {
        console.error('Error fetching real news:', error);
        return getFallbackWeatherNews();
    }
}

// Categorize news based on title and description
function categorizeNews(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('hurricane') || text.includes('typhoon')) return 'severe';
    if (text.includes('tornado') || text.includes('twister')) return 'severe';
    if (text.includes('earthquake') || text.includes('seismic')) return 'breaking';
    if (text.includes('flood') || text.includes('flooding')) return 'warning';
    if (text.includes('wildfire') || text.includes('fire')) return 'fire';
    if (text.includes('drought') || text.includes('dry')) return 'drought';
    if (text.includes('snow') || text.includes('blizzard') || text.includes('winter')) return 'seasonal';
    if (text.includes('heat') || text.includes('temperature')) return 'health';
    if (text.includes('climate') || text.includes('global warming')) return 'climate';
    if (text.includes('storm') || text.includes('severe weather')) return 'severe';
    
    return 'weather';
}

// Format time ago from date
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else {
        return `${diffDays} days ago`;
    }
}

// Fallback weather news data when API is not available
function getFallbackWeatherNews() {
    return [
        {
            title: "🌪️ Severe Thunderstorms Expected Across Midwest",
            description: "National Weather Service issues warnings for damaging winds, large hail, and possible tornadoes affecting multiple states today. Emergency shelters are being prepared.",
            time: "2 hours ago",
            source: "National Weather Service",
            category: "severe"
        },
        {
            title: "🌀 Hurricane Season Enters Peak Activity Period",
            description: "Meteorologists monitor several tropical disturbances as hurricane season reaches its most active phase with increased storm development in the Atlantic basin.",
            time: "4 hours ago",
            source: "Weather Channel",
            category: "severe"
        },
        {
            title: "🔥 Record-Breaking Heat Dome Affects Western US",
            description: "Extreme temperatures exceeding 110°F prompt heat emergency declarations and rolling blackouts across California and Nevada. Cooling centers open to public.",
            time: "6 hours ago",
            source: "CNN Weather",
            category: "health"
        },
        {
            title: "💧 Flash Flood Emergency Declared in Desert Southwest",
            description: "Monsoon rains trigger dangerous flooding in normally dry washes, prompting water rescues and road closures throughout Arizona and New Mexico.",
            time: "8 hours ago",
            source: "AccuWeather",
            category: "warning"
        },
        {
            title: "🔥 Wildfire Conditions Reach Critical Levels",
            description: "Red flag warnings issued as dry conditions, high winds, and low humidity create extreme fire danger across the Pacific Northwest region.",
            time: "10 hours ago",
            source: "AP News",
            category: "fire"
        },
        {
            title: "🌡️ Climate Study Reveals Shifting Weather Patterns",
            description: "New research indicates significant changes in seasonal weather patterns affecting agriculture and water resources globally, with implications for food security.",
            time: "12 hours ago",
            source: "Reuters",
            category: "climate"
        },
        {
            title: "🌵 Drought Conditions Intensify in Agricultural Regions",
            description: "Farmers face crop losses as prolonged dry conditions and depleted groundwater supplies threaten food production across the central plains.",
            time: "14 hours ago",
            source: "BBC Weather",
            category: "drought"
        },
        {
            title: "❄️ Early Winter Storm Brings Unexpected Snow",
            description: "Unseasonably early snowfall disrupts travel and prompts winter weather advisories across northern mountain regions, closing major highways.",
            time: "16 hours ago",
            source: "USA Today",
            category: "seasonal"
        },
        {
            title: "🌊 Coastal Storm Surge Warnings Issued",
            description: "High tide and strong onshore winds combine to create dangerous coastal flooding conditions along the Eastern seaboard this weekend.",
            time: "18 hours ago",
            source: "NOAA",
            category: "warning"
        },
        {
            title: "⚡ Lightning Strikes Cause Power Outages",
            description: "Severe thunderstorms with frequent lightning strikes leave thousands without power across the Tennessee Valley region.",
            time: "20 hours ago",
            source: "NBC News",
            category: "severe"
        },
        {
            title: "🌡️ Urban Heat Island Effect Intensifies",
            description: "Cities experience temperatures 10-15°F higher than surrounding rural areas, leading to increased energy consumption and health concerns.",
            time: "22 hours ago",
            source: "Scientific American",
            category: "health"
        },
        {
            title: "🌨️ Blizzard Conditions Expected in Mountain Regions",
            description: "Heavy snow and high winds will create whiteout conditions in the Rocky Mountains, making travel extremely dangerous this week.",
            time: "1 day ago",
            source: "Weather Underground",
            category: "seasonal"
        },
        {
            title: "🌊 Tsunami Warning System Upgraded",
            description: "Pacific nations implement advanced early warning technology to better detect and respond to potential tsunami threats across the region.",
            time: "1 day ago",
            source: "NOAA",
            category: "breaking"
        },
        {
            title: "🌪️ Tornado Alley Sees Unusual Activity",
            description: "Meteorologists report shifting tornado patterns with increased activity in traditionally safer regions as climate patterns evolve.",
            time: "2 days ago",
            source: "Storm Prediction Center",
            category: "severe"
        },
        {
            title: "🔥 California Wildfire Season Extended",
            description: "Unprecedented dry conditions extend fire season into winter months, prompting year-round fire prevention measures statewide.",
            time: "2 days ago",
            source: "Cal Fire",
            category: "fire"
        },
        {
            title: "❄️ Polar Vortex Threatens Northern States",
            description: "Arctic air mass preparation underway as temperatures expected to plummet 40 degrees below normal across the upper Midwest.",
            time: "2 days ago",
            source: "Weather Channel",
            category: "seasonal"
        },
        {
            title: "🌡️ Record Heat Index Readings Recorded",
            description: "Dangerous heat index values exceeding 120°F create life-threatening conditions across the southern United States this week.",
            time: "3 days ago",
            source: "National Weather Service",
            category: "health"
        },
        {
            title: "💧 Atmospheric River Targets West Coast",
            description: "Powerful moisture stream from Pacific promises heavy rainfall and potential flooding relief for drought-stricken California.",
            time: "3 days ago",
            source: "NOAA",
            category: "warning"
        },
        {
            title: "🌪️ Supercell Thunderstorms Develop",
            description: "Rotating thunderstorms with potential for violent tornadoes form across the Great Plains as atmospheric conditions align.",
            time: "3 days ago",
            source: "Storm Prediction Center",
            category: "severe"
        },
        {
            title: "🌨️ Lake Effect Snow Warnings Issued",
            description: "Great Lakes region prepares for heavy snowfall as cold air mass moves over warmer lake waters, creating hazardous conditions.",
            time: "4 days ago",
            source: "National Weather Service",
            category: "seasonal"
        },
        {
            title: "🔥 Prescribed Burns Reduce Fire Risk",
            description: "Controlled burning operations across federal lands help reduce wildfire fuel loads before peak fire season arrives.",
            time: "4 days ago",
            source: "US Forest Service",
            category: "fire"
        },
        {
            title: "🌡️ Climate Change Accelerates Weather Extremes",
            description: "New study confirms increasing frequency and intensity of extreme weather events linked to rising global temperatures.",
            time: "4 days ago",
            source: "Nature Climate Change",
            category: "climate"
        },
        {
            title: "💧 Flash Flood Safety Week Begins",
            description: "Emergency management agencies launch awareness campaign as spring melt and rain season approaches flood-prone areas.",
            time: "5 days ago",
            source: "FEMA",
            category: "warning"
        },
        {
            title: "🌪️ Enhanced Fujita Scale Updates",
            description: "Tornado damage assessment receives updates to better categorize and understand the impact of extreme wind events.",
            time: "5 days ago",
            source: "NOAA",
            category: "research"
        },
        {
            title: "❄️ Avalanche Danger Reaches Extreme Levels",
            description: "Mountain rescue teams issue highest warnings as unstable snow conditions create deadly avalanche risks across ski regions.",
            time: "5 days ago",
            source: "Avalanche Center",
            category: "warning"
        },
        {
            title: "🌡️ Heat Wave Preparedness Guidelines",
            description: "Public health officials release updated recommendations for protecting vulnerable populations during extreme heat events.",
            time: "6 days ago",
            source: "CDC",
            category: "health"
        },
        {
            title: "🔥 Firefighting Technology Advances",
            description: "New aerial firefighting equipment and AI-powered fire prediction systems help combat increasingly severe wildfire seasons.",
            time: "6 days ago",
            source: "Fire Chief Magazine",
            category: "research"
        },
        {
            title: "🌊 Coastal Erosion Accelerates",
            description: "Rising sea levels and intensifying storms cause unprecedented coastal erosion rates along Atlantic and Pacific shores.",
            time: "6 days ago",
            source: "USGS",
            category: "climate"
        },
        {
            title: "💧 Drought Monitor Shows Expansion",
            description: "Weekly drought assessment reveals growing areas of severe and extreme drought conditions across the western United States.",
            time: "1 week ago",
            source: "US Drought Monitor",
            category: "drought"
        },
        {
            title: "🌪️ Tornado Season Safety Reminders",
            description: "Emergency managers stress importance of weather radios and safe rooms as peak tornado season approaches the Plains states.",
            time: "1 week ago",
            source: "Emergency Management",
            category: "severe"
        },
        {
            title: "❄️ Winter Storm Recovery Efforts",
            description: "Utility crews work around the clock to restore power and clear roads following major winter storm across the Northeast.",
            time: "1 week ago",
            source: "Associated Press",
            category: "seasonal"
        },
        {
            title: "🌡️ Urban Cooling Strategies Implemented",
            description: "Cities deploy green infrastructure and cooling centers to combat rising temperatures and protect residents from heat stress.",
            time: "1 week ago",
            source: "Urban Climate Magazine",
            category: "health"
        },
        {
            title: "🔥 Wildfire Smoke Health Impacts",
            description: "Medical experts warn of respiratory risks as wildfire smoke travels thousands of miles, affecting air quality nationwide.",
            time: "1 week ago",
            source: "American Lung Association",
            category: "health"
        },
        {
            title: "💧 Flood Insurance Claims Surge",
            description: "Record rainfall and flooding events drive unprecedented flood insurance claims as communities reassess flood risk maps.",
            time: "1 week ago",
            source: "Insurance Journal",
            category: "warning"
        },
        {
            title: "🌪️ Storm Chasing Technology Evolves",
            description: "Researchers deploy advanced mobile radars and drones to study severe thunderstorms and improve forecasting accuracy.",
            time: "1 week ago",
            source: "Journal of Atmospheric Science",
            category: "research"
        },
        {
            title: "🌨️ Snow Pack Analysis Shows Decline",
            description: "Mountain snow surveys reveal below-normal snow pack levels, raising concerns about summer water supplies and drought risk.",
            time: "1 week ago",
            source: "Natural Resources Conservation Service",
            category: "drought"
        },
        {
            title: "🌡️ Greenhouse Gas Concentrations Peak",
            description: "Atmospheric monitoring stations record highest-ever concentrations of climate-warming gases, accelerating weather changes.",
            time: "1 week ago",
            source: "World Meteorological Organization",
            category: "climate"
        },
        {
            title: "🔥 Fire Weather Forecasting Improved",
            description: "Enhanced computer models provide more accurate predictions of dangerous fire weather conditions days in advance.",
            time: "1 week ago",
            source: "National Interagency Fire Center",
            category: "fire"
        },
        {
            title: "💧 River Flooding Threatens Communities",
            description: "Spring snowmelt combines with heavy rains to push rivers beyond flood stage, forcing evacuations in multiple states.",
            time: "1 week ago",
            source: "National Weather Service",
            category: "warning"
        },
        {
            title: "🌪️ Mobile Home Safety in Severe Weather",
            description: "Safety experts provide critical guidance for mobile home residents during tornado warnings and severe thunderstorm events.",
            time: "1 week ago",
            source: "Manufactured Housing Institute",
            category: "severe"
        }
    ];
}

function updatePagination() {
    const paginationContainer = document.getElementById('news-pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadWeatherNews();
        }
    };
    paginationContainer.appendChild(prevBtn);
    
    // Simple page display: show current page and total pages
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.style.cssText = `
        padding: 8px 16px;
        margin: 0 8px;
        color: rgba(22, 66, 60, 0.8);
        font-weight: 500;
        font-size: 0.9em;
    `;
    paginationContainer.appendChild(pageInfo);
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadWeatherNews();
        }
    };
    paginationContainer.appendChild(nextBtn);
}

function readFullArticle(title, url = '') {
    // If we have a URL from the API, open it in a new tab
    if (url && url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        // Fallback for articles without URLs
        alert(`Full article: ${title}\n\nThis would normally open a detailed view of the article.`);
    }
}

// Initialize news when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('news-grid')) {
        loadWeatherNews();
    }
});
