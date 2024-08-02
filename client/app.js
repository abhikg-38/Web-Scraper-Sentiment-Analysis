const form=document.querySelector('form');
//so in querySelector we can put class name with .class_name and ID as #ID_name

const searchInput=document.querySelector('input');

const resultsList=document.querySelector('#results');
//fetches input tag from html

function getSearchResults(searchTerm){
    return fetch(`http://localhost:3000/search/${searchTerm}`)
    .then(results => results.json())
    .then(results =>{
        console.log('getSearchResults');
        console.log(results);
        return results;
    })
    .catch(error => {
        console.error('Fetch error:', error);
        return []; //return an empty array in case of an error
    });
    // return value is a promise chain  that resolves when the fetch request and all chained .then() handlers complete.
}

function showResults(results){
    //forEach loops through JSON
    console.log("show results");
    console.log(results);
    results.forEach(movie=>{
        const li=document.createElement('li');
        const img=document.createElement('img');
        const s=movie.image;
        img.src=s;
        const a=document.createElement('a');
        a.textContent=movie.title;
        a.href='./movie.html?imdbID=' +movie.imdb_id;
        li.appendChild(img);
        li.appendChild(a);
        //.appendChild adds multiple components to a single list element
        resultsList.appendChild(li);
    });
}
function formSubmitted(event){
    event.preventDefault();
    //normally form data is sent to server and page is refreshed but here we are preventing the default action
    const searchTerm=searchInput.value;

    getSearchResults(searchTerm).then(res=>showResults(res));
    console.log('form submitted');
}
form.addEventListener('submit',formSubmitted);

