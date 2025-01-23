import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/') }
  const redirectToArticles = () => { navigate('/articles') }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token')
    setMessage("Goodbye!")
    redirectToLogin()
  }

  const login = async ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    const logIn = async () => {
      try {
        const response = await axios.post(
          loginUrl,
          {
            username,
            password
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.status !== 200) {
          throw new Error('Network response was not good');
        } else {
          setMessage(`Here are your articles, ${username}!`)
          const data = response.data;
          localStorage.setItem('token', data.token);
          redirectToArticles();
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          logout();
        } else {
          console.log('An error occured:', error);
        }
      } finally {
        setSpinnerOn(false);
      }
    };
    logIn();
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    if(!token) {
      logout()
    } else {
      setSpinnerOn(true)
      const fetchArticle = async () => {
        try {
          const response = await axios.get(
            articlesUrl,
            { headers: { Authorization: token } }
          )
          setArticles(response.data.articles)
        } catch (error) {
          if(error?.response?.status == 401) {
            logout()
          }
        } finally {
          setSpinnerOn(false)
        }
      }
      fetchArticle()
      setSpinnerOn(false)
    }
  };

  const postArticle = async (article) => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    if(!token) {
      logout()
    } else {
      const fetchArticle = async () => {
        try {
          const response = await axios.post(
            articlesUrl,
            {
              title: article.title,
              text: article.text,
              topic: article.topic
            },
            {
              headers: {
                Authorization: token,
                'Content-Type': 'application/json'
              }
            }
          );
          setMessage(response.data.message);
          if (response.status !== 200) {
            throw new Error('Post network is not good');
          }
        } catch (error) {
          if (error?.response?.status === 401) {
            logout();
          } else {
            console.log('An error occurred:', error);
          }
        } finally {
          getArticles();
          setSpinnerOn(false);
        }
      };
      fetchArticle();
    }
  }

  const updateArticle = ( article_id, article ) => {
    // ✨ implement
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    if(!token) {
      logout()
      spinnerOn(false)
    } else {
        const fetchArticle = async () => {
          try {
            const response = await axios.put(
              `${articlesUrl}/${article_id}`,
              {
                title: article.title,
                text: article.text,
                topic: article.topic
              },
              { headers: { 
                Authorization: token,
                'Content-Type': 'application/json'
              }}
            )
            getArticles()
            setMessage(response.data.message)
            if(!response.ok) {
              throw new Error('Update network is not good')
            }
          } catch (error) {
            if(error?.response?.status == 401) {
              logout()
            }
          } finally {
            setSpinnerOn(false)
          }
        }
        fetchArticle()
    }
  }

  const deleteArticle = article_id => {
    // ✨ implement
    const token = localStorage.getItem('token')

    if(!token) {
      logout()
    } else {
      setSpinnerOn(true)
        const fetchArticle = async () => {
          try {
            const response = await axios.delete(
              `${articlesUrl}/${article_id}`,
              { headers: {
                Authorization: token,
                'Content-Type': 'application/json'
              }}
            )
            setMessage(response.data.message)
            if(!response.ok) {
              throw new Error('Update network is not good')
            }
          } catch (error) {
            if(error?.response?.status == 401) {
              logout()
            }
          } finally {
            setSpinnerOn(false)
          }
        }
        fetchArticle()
        getArticles()
    }
  }

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
                currentArticle={articles.find(art => art.article_id === currentArticleId)}
              />
              <Articles 
                getArticles={getArticles}
                articles={articles}
                setCurrentArticleId={setCurrentArticleId}
                deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
