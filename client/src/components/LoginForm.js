import React, { useState } from 'react'
import PropTypes from 'prop-types'
import InputField from './InputField'
import Button from './Button'
import styles from './LoginForm.module.css'

const LoginForm = ({ handleLogin }) => {
  const [inputValue, setInputValue] = useState(null)

  const handleInputChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name

    setInputValue((prevValues) => {
      return {
        ...prevValues,
        [name]: value,
      }
    })
  }

  const login = (event) => {
    event.preventDefault()
    const username = inputValue?.username
    const password = inputValue?.password

    try {
      handleLogin(username, password)

      // reset input values
      setInputValue({ username: '', password: '' })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form className={styles.LoginForm} onSubmit={login}>
      <div className={styles.flex}>
        <InputField
          label="Username"
          type="text"
          name="username"
          value={inputValue?.username || ''}
          onChange={handleInputChange}
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          value={inputValue?.password || ''}
          onChange={handleInputChange}
        />
      </div><br/>
      <Button className={styles.loginBtn} type="submit">
        Login
      </Button>
    </form>
  )
}

export default LoginForm

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
}