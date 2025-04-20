import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import Loader from "./components/Loader";
import { getTrendingMovie, updateSearchCount } from "./assets/AppWrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNWY2NDkyODNiZGI2OTFkZWYzMjc3M2FiNmQwMjQ2ZiIsIm5iZiI6MTc0NDkxMDEwNi45MjEsInN1YiI6IjY4MDEzNzFhZjM5YzczMDEyNWQ5NmNiNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JgsSHak5X0S6Q9UbhagY0DQEmiGSEbyZpqTEi_vsxWU";

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovie, setTrendingMovie] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncingSearch, setDebouncingSearch] = useState("");

  useDebounce(() => setDebouncingSearch(searchTerm), 1000, [searchTerm]);

  const fetchMovie = async (query = '') => {
    setisLoading(true);
    try {
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endPoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      if (data.Resposne === false) {
        setErrorMessage(data.Error || "Faild to fetch Movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`error fetching movie: ${error}`);
      setErrorMessage("Error Fetching Movie. Pleaes try again later!");
    } finally {
      setisLoading(false);
    }
  };

  const loadTrendingMovie = async () => {
    try {
      const movies = await getTrendingMovie();
      setTrendingMovie(movies.documents || []);
    } catch (error) {
      console.error(`can't Load Movie ${error}`);
    }
  };

  useEffect(() => {
    fetchMovie(debouncingSearch);
  }, [debouncingSearch]);

  useEffect(() => {
    loadTrendingMovie();
 }, []);


  return (
    <main className="">
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src=" ./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> WithOut Any
            Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovie.length > 0 && (
          <section className="trending">
          <h2>Trending Movie</h2>
          <ul>
            {trendingMovie.map((movie,index)=>(
              <li key={movie.$id}>
                <p>{index+1}</p>
                <img src={movie.poster_url} alt={movie.$searchTerm} />
              </li>
            ))}
          </ul>
          </section>
        )};

        <section className="all-movies">
          <h2 className=" text-indigo-500">All Moives</h2>
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <p className="text-red-900">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
