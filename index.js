import express from 'express';
import cors from 'cors';
const app= express();
app.use(cors()); 
import {searchMovies,getMovie,getReviews} from './scraper.js';
app.get('/', (req,res) => {
    res.json({
        message: 'Scraping is fun'
    })
})

//Search, URL looks like /search/fight club etc
app.get('/search/:title', (req,res) => {
    searchMovies(req.params.title).then(movies=>res.json(movies));
})//specifying name of movie in URL basically calls our searchMovies middleware

app.get('/movie/:imdbID', (req,res) => {
    getMovie(req.params.imdbID).then(movie=>{res.json(movie);});
});

app.get('/review/:imdbID',(req,res)=>{ getReviews(req.params.imdbID).then(reviews=>{res.json(reviews);});});
const port=process.env.PORT || 3000; 
app.listen(port,()=> {
    console.log(`Listening on ${port}`);
})