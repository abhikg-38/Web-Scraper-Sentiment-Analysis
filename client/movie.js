console.log(window.location.search);
//above logs URL parameters
const main=document.querySelector('.container');
const rev=document.querySelector('.reviews');
const inf=document.querySelector('.inferences');
const imdbID=window.location.search.match(/imdbID=(.*)/)[1];

console.log(imdbID);
function getMovie(imdbID){
    return fetch(`http://localhost:3000/movie/${imdbID}`).then(res=> res.json());
}

async function getReviews(imdbID){
    const rev_results= await fetch(`http://localhost:3000/review/${imdbID}`);
    return rev_results.json();
}

function showMovie(movie){
    const section=document.createElement('section');
    main.appendChild(section);

    const properties = ['rating','duration','director','writers','releaseDate','summary']; 

    const descriptionHTML=properties.reduce((html,property)=> {
        html+=`<dt class="col-sm-3">${property}</dt>
        <dd class="col-sm-9">${movie[property]}</dd>`;
        return html;
    },'');
    //.reduce loops over array and accumulates results, return s single value at the end
    //description lists, dd each term in dl, dt is term or name in dl
    section.outerHTML= `
    <section class="row">
    <h1 class="text-center">${movie.title}</h1>
        <div class="col-sm-12">
        
        <dl class="row">
            ${descriptionHTML}
        </dl>
        </div>
    </section>
    `;
}
function showReviews(reviews){
    const h3=document.createElement('h3');
    h3.textContent="These are some of the reviews for the movie:";
    h3.style.textAlign='center';
    rev.appendChild(h3);

    const ul=document.createElement('ul');
    
    reviews.reviews.forEach(r=>{
        const li=document.createElement('li');
        const p=document.createElement('p');
        p.textContent=r;
        li.appendChild(p);
        ul.appendChild(li);
    });
    rev.appendChild(ul);
}
getMovie(imdbID).then(res=>showMovie(res));

async function display_reviews(imdbID) {
    try {
        const movie_reviews = await getReviews(imdbID);
        showReviews(movie_reviews);
        //await sendReviewsToFlask(movie_reviews);
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

async function sentiment_analysis(imdbID) {
    try {
        const movie_reviews = await getReviews(imdbID);
        const response=await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movie_reviews)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const python_response=await response.json();
        console.log('Sentiment analysis results:', python_response);
        const h3=document.createElement('h3')
        h3.textContent="These are the general sentiments expressed in the reviews:"
        h3.style.textAlign='center'
        inf.appendChild(h3)

        const ul=document.createElement('ul')
        const li1=document.createElement('li')
        const p1=document.createElement('p')
        p1.textContent=`Positive sentiment score of the movie: ${python_response['sentiments']['average_positive']}`
        li1.appendChild(p1);

        const li2=document.createElement('li')
        const p2=document.createElement('p')
        p2.textContent=`Negative sentiment score of the movie: ${python_response['sentiments']['average_negative']}`
        li2.appendChild(p2);

        const li3=document.createElement('li')
        const p3=document.createElement('p')
        p3.textContent=`Neutral sentiment score of the movie: ${python_response['sentiments']['average_neutral']}`
        li3.appendChild(p3);

        ul.appendChild(li1);
        ul.appendChild(li2);
        ul.appendChild(li3);
        inf.appendChild(ul);

    } catch (error) {
        console.error('Error:', error);
    }
}

display_reviews(imdbID);
sentiment_analysis(imdbID);


