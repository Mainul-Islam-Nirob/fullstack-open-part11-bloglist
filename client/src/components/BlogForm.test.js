import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from './BlogForm'

test('<BlogForm /> updates parent state and calls onSubmit', () => {
  const addBlog = jest.fn()

  const component = render(<BlogForm createBlog={addBlog} />)

  const inputTitle = component.container.querySelector('#title')
  const inputAuthor = component.container.querySelector('#author')
  const inputUrl = component.container.querySelector('#url')
  const form = component.container.querySelector('form')

  fireEvent.change(inputTitle, {
    target: { value: 'Blog Title' },
  })
  fireEvent.change(inputAuthor, {
    target: { value: 'Author' },
  })
  fireEvent.change(inputUrl, {
    target: { value: 'http://blog-title.com' },
  })
  fireEvent.submit(form)

  expect(addBlog.mock.calls).toHaveLength(1)
  expect(addBlog.mock.calls[0][0].title).toBe('Blog Title')
  expect(addBlog.mock.calls[0][0].author).toBe('Author')
  expect(addBlog.mock.calls[0][0].url).toBe('http://blog-title.com')
})
