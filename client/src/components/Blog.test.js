import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Blog from './Blog'

describe('<Blog />', () => {
  let component

  const user = {
    username: 'Shanto',
    name: 'Shanto Chowdhury',
  }

  const blog = {
    user: user,
    author: 'Just me',
    title: 'Blog title',
    url: 'http://blog-title.com',
    likes: 0,
  }

  const mockHandlerUpdate = jest.fn()

  beforeEach(() => {
    component = render(
      <Blog
        user={user}
        blog={blog}
        updateLike={mockHandlerUpdate}
      />,
    )
  })


  test('renders blog title and author, but not url and number of likes by default', () => {

    const defaultBlogContent = component.container.querySelector('.blog')
    const defaultHiddenContent = component.getByTestId('hidden-content')

    expect(component.container).toHaveTextContent(blog.title)
    expect(component.container).toHaveTextContent(blog.author)
    expect(defaultBlogContent).not.toHaveStyle('display: none')
    expect(defaultBlogContent).toBeVisible()
    expect(defaultHiddenContent).toHaveStyle('display: none')

  })

  test('renders blog url and number of likes when view button is clicked', () => {
    const button = component.getByText('show')

    fireEvent.click(button)

    const revealedContent = component.getByTestId('hidden-content')
    const likes = component.container.querySelector('.likes')

    expect(revealedContent).not.toHaveStyle('display: none')
    expect(revealedContent).toBeVisible()
    expect(component.container).toHaveTextContent('Likes')
    expect(likes).toHaveTextContent(blog.likes)
    expect(component.container).toHaveTextContent(blog.url)
  })

  test('clicking the like button twice calls event handler passed as a prop twice', () => {
    const button = component.getByText('like')

    fireEvent.click(button)
    fireEvent.click(button)

    expect(mockHandlerUpdate.mock.calls).toHaveLength(2)
  })

})