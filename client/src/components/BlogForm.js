import React, { useState } from 'react'
import PropTypes from 'prop-types'
import InputField from '../components/InputField'
import Button from '../components/Button'
import styles from './BlogForm.module.css'

const BlogForm = ({ createBlog }) => {
  const [inputValue, setInputValue] = useState({
    title: '',
    author: '',
    url: ''
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setInputValue((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      }
    })
  }

  const addBlog = (event) => {
    event.preventDefault()
    try{
      createBlog({
        title: inputValue.title,
        author: inputValue.author,
        url: inputValue.url,
      })

      setInputValue({
        title: '',
        author: '',
        url: '' })
    }catch (err) {
      console.log(err)
    }
  }

  return (
    <form onSubmit={addBlog}>
      <div>
        <InputField
          id="title"
          type="text"
          value={inputValue.title}
          name="title"
          onChange={handleInputChange}
          label="Title"
        />
      </div>
      <div>
        <InputField
          id="author"
          type="text"
          value={inputValue.author}
          name="author"
          onChange={handleInputChange}
          label="Author"
        />
      </div>
      <div>
        <InputField
          id="url"
          type="text"
          value={inputValue.url}
          name="url"
          onChange={handleInputChange}
          label="URL"
        /><br/>
        <Button className={styles.createBtn} type="submit">create</Button>
      </div>
    </form>)
}

export default BlogForm


BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}