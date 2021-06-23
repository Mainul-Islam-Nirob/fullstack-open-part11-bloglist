import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, Redirect, Link } from 'react-router-dom'
import './App.css'
import blogService from './services/blogs'
import UsersPage from './components/UsersPage'
import User from './components/User'
import BlogView from './components/BlogView'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import { initializeBlogs } from './reducers/blogReducer'
import { initializeUsers } from './reducers/userReducer'
import Navbar from './components/Navbar'
import Container from '@material-ui/core/Container'

const App = () => {

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(initializeBlogs())
    dispatch(initializeUsers())
  }, [dispatch])

  const user = useSelector((state) => state.login)
  // Check if user in localStorage
  useEffect(() => {
    const loggedInUserJSON = JSON.parse(
      window.localStorage.getItem('loggedInBloglistUser'),
    )
    if (loggedInUserJSON) {
      const user = loggedInUserJSON
      blogService.setToken(user?.token)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('loggedInBloglistUser', JSON.stringify(user))
    blogService.setToken(user?.token)
  }, [user])

  return (
    <>
      <Container>
        <Navbar />
        <main>
          <div className="app__container">
            <Link to="/" className="app__logo">
              Blog app
            </Link>
            <Switch>
              <Route path='/users/:id'>
                {
                  user ? <User /> : <Redirect to='/login' />
                }
              </Route>
              <Route path="/blogs/:id">
                {
                  user ? <BlogView /> : <Redirect to='/login' />
                }
              </Route>
              <Route path='/users' exact>
                {
                  user ? <UsersPage /> : <Redirect to='/login' />
                }
              </Route>
              <Route path='/login' exact>
                {
                  user ? <HomePage /> : <LoginPage/>
                }
              </Route>
              <Route path='/'>
                {
                  user ? <HomePage /> : <Redirect to='/login' />
                }
              </Route>
            </Switch>
          </div>
        </main>
      </Container>
    </>
  )
}

export default App