import React, { useState, useCallback } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate();
  const redirectToLogin = () => { navigate('/') }
  const redirectToArticles = () => { navigate('/articles') }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token');
    setMessage("Goodbye!");
    redirectToLogin();
  };

  const login = async ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    
      setMessage('');
      setSpinnerOn(true);
      try {
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          setMessage(data.message);
          redirectToArticles();
        } else {
          setMessage(data.message || 'Login failed');
        }
      } catch (error) {
        setMessage('An error occurred during login');
      } finally {
        setSpinnerOn(false);
      }
    };
    
    const authenticatedFetch = async (url, options = {}) => {
      const token = localStorage.getItem('token');
      if (!token) {
        redirectToLogin();
        throw new Error('Unauthorized');
      }

      const headers = {
        ...options.headers,
        Authorization: `${token}`,
      };

      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        if(response.status === 401) {
          redirectToLogin();
          throw new Error('Token expired or invalid');
        }
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      return response;
    };

  const getArticles = useCallback(async () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('');
    setSpinnerOn(true);
    
    try {
      const response = await authenticatedFetch(articlesUrl, {
        method: 'GET'
      });
      const data = await response.json();
      setArticles(data.articles || []);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSpinnerOn(false);
    }
  }, []);
      
    

  const postArticle = async (article) => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setSpinnerOn(true);
    setMessage('');
    try {
      const response = await authenticatedFetch(articlesUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'applicaton/json' },
        body: JSON.stringify(article),
      });
      const data = await response.json();

      if (response.ok) {
        await getArticles();
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Failed to post article');
      }
    } catch (error) {
      setMessage('An error occurred while posting the article');
    } finally {
      setSpinnerOn(false);
    }
  };
   

  const updateArticle = async ({ article_id, article }) => {
    // ✨ implement
    setSpinnerOn(true);
    setMessage('');
    try {
            const response = await authenticatedFetch(`${articlesUrl}/${article_id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(article),
            });
            const data = await response.json();

            await getArticles();

            setMessage(data.message || 'Article updated successfully');
          } finally {
            setSpinnerOn(false);
          }
        };

  const deleteArticle = async (article_id) => {
    // ✨ implement
    setMessage('');
    setSpinnerOn(true);
    try {
      const response = await authenticatedFetch(`${articlesUrl}/${article_id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setArticles((prev) => prev.filter((a) => a.article_id !== article_id));
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('error');
    } finally {
      setSpinnerOn(false);
    }
  };

  const currentArticle = articles.find(
    (article) => article.article_id === currentArticleId
  );

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm 
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticleId={currentArticleId}
                articles={articles}
                currentArticle={currentArticle}
              />
              <Articles 
                getArticles={getArticles}
                articles={articles}
                setCurrentArticleId={setCurrentArticleId}
                deleteArticle={deleteArticle}
                currentArticleId={currentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
