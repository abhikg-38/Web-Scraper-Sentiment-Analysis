
import fetch from "node-fetch";
import cheerio from "cheerio";
//const url='https://www.imdb.com/find/?ref_=nv_sr_sm&q=';

const searchUrl="https://www.imdb.com/find/?s=tt&exact=true&ref_=fn_tt_ex&q=";
const movieUrl = 'https://www.imdb.com/title/';
//we've rearranged the URL to add &q= at the end

const movieCache={};
const reviewCache={};
const searchCache={};//caches the previous search results so it doesnt keep calling same thing

const movies=[];
export function searchMovies(searchTerm){
    if(searchCache[searchTerm]){
        console.log(`Serving from cache ${searchTerm}`);
        return Promise.resolve(searchCache[searchTerm]);
    }
    return fetch(`${searchUrl}${searchTerm}`)
    .then(response=> response.text()).then(
    //it normally returns HTML body, we are converting that to text
    body =>{
        const movies=[];
    const $=cheerio.load(body);
    
    //$ is the name of the cheerio instance
    $('.ipc-metadata-list-summary-item.ipc-metadata-list-summary-item--click.find-result-item.find-title-result').each(function(index,element) {//each loops through all matching css
        const $element=$(element);
        //$(element) wraps the current DOM in a cheerio instance which is called $element
        const $image = $element.find('img');
        const $title =$element.find('div.ipc-metadata-list-summary-item__tc a');
        const imdb_id=$title.attr('href').match(/title\/(.*)\//)[1];
        //the right sloping slashes are escape sequences, the regex should be enclosed within //, first parameter gives IMDb ID

        //basically the subsequent inclusions are the child elements
        //console.log($image.attr('src'));// the src attribute of the image tag is displayed

        const movie=  {
            image: $image.attr('src'),
            title: $title.text(),
            imdb_id
        };
        movies.push(movie);
        //we use push to add elements to array
    });
    searchCache[searchTerm]=movies;
    return movies;
});
}


export function getMovie(imdbID){
    if(movieCache[imdbID]){
        console.log(`Serving from cache ${imdbID}`);
        return Promise.resolve(movieCache[imdbID]);
    }
    return fetch(`${movieUrl}${imdbID}`)
    .then(response=> response.text()).then(
        body => {
            const $= cheerio.load(body);
            const $title = $('.hero__primary-text');

            const duration = $('ul.ipc-inline-list.ipc-inline-list--show-dividers.sc-d8941411-2.kRgWEf.baseAlt li.ipc-inline-list__item').last().text().trim();
            const elements = $('a.ipc-metadata-list-item__list-content-item.ipc-metadata-list-item__list-content-item--link[role="button"][tabindex="0"][aria-disabled="false"]').text();

            const ratingDiv = $('div[data-testid="hero-rating-bar__aggregate-rating__score"]');

            // Extract the rating value from the span inside the div
            const rating = ratingDiv.find('span.sc-eb51e184-1').first().text().trim();

            const director = $('li.ipc-inline-list__item a.ipc-metadata-list-item__list-content-item').first().text().trim();

            const releaseDate = $('a.ipc-link.ipc-link--baseAlt.ipc-link--inherit-color').first(). text().trim();
            const poster = $('a.ipc-lockup-overlay.ipc-focusable').attr('href');

            //const summaryDiv = $('div.ipc-html-content.ipc-html-content--base .ipc-html-content-inner-div');
            const summary = $('p[data-testid="plot"] span[data-testid="plot-xs_to_m"]').text().trim();
        
            const writerElements = $('.ipc-metadata-list-item__list-content-item--link');
            const writers = [];
    
            writerElements.each((index, element) => {
        // Extract the text content of each writer's <a> tag
            const writerName = $(element).text().trim();
            if(index<3 && index!=0){
                writers.push(writerName);
            }
    });
            const movie= {imdbID,
                "title": $title.text(),
                    duration,
                    rating,
                    director,
                    releaseDate,
                    "poster": `imdb.com/${poster}`,
                    summary,
                    "writers": writers,
            };
            movieCache[imdbID]=movie;
            return movie;
        }
    );
}
export function getReviews(imdbID) {
    if(reviewCache[imdbID]){
        console.log(`Serving from cache ${imdbID}`);
        return Promise.resolve(reviewCache[imdbID]);
    }
    return fetch(`${movieUrl}${imdbID}/reviews`)
        .then(response => response.text()) //convert response to text
        .then(body => {
            const $ = cheerio.load(body);
            const review_elements = $('.text.show-more__control');
            const reviews = [];
            review_elements.each((index, element) => {
                if (index < 7) {
                    const review_text = $(element).text().trim();
                    reviews.push(review_text);
                }
            });
            reviewCache[imdbID]=reviews;
            return { reviews }; //return the reviews array
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            return { reviews: [] }; //return an empty array in case of an error
        });
}