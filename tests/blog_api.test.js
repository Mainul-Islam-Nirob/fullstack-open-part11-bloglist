const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some blogs save initially', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs should contain id property (not _id)', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of new blog', () => {

  let token = null
  beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token have to do with async wait
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    return token
  })

  test('a valid blog can be added by authorized user', async () => {
    const newBlog = {
      title: 'New blog by M',
      author: 'Mainul',
      url: 'http://mainul.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    expect(titles).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain('New blog by M')

  })

  test('if like property is missing from req, it will default to the value 0', async () => {
    const newBlog = {
      title: 'Without likes',
      author: 'like',
      url: 'http://like.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    expect(blogsAtEnd[helper.initialBlogs.length].likes).toBe(0)

  })

  test('blog without title or url is not added', async () => {
    const newBlog = {
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('unauthorized user cannot create a blog', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    }

    token = null

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {

  let token = null
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    const newBlog = {
      title: 'Another blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    return token
  })

  test('succeeds deletion with status code 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({}).populate('user')
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({}).populate('user')

    expect(blogsAtStart).toHaveLength(1)
    expect(blogsAtEnd).toHaveLength(0)
    expect(blogsAtEnd).toEqual([])
  })

  test('fails when user is not authorized', async () => {
    const blogsAtStart = await Blog.find({}).populate('user')

    const blogToDelete = blogsAtStart[0]

    token = null

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    const blogsAtEnd = await Blog.find({}).populate('user')

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtStart).toEqual(blogsAtEnd)
  })
})


describe('updating of likes of blog', () => {
  test('succeeds update with status 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToUpdate = blogsAtStart[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 12 })
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    const updatedBlog = blogsAtEnd[0]

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(updatedBlog.likes).toBe(12)
  })
})

describe('addition of new comment', () => {
  let token = null
  beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    return token
  })

  test('succeeds with status 201 if id is valid and title is given', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToAddCommentTo = blogsAtStart[0]

    await api
      .post(`/api/blogs/${blogToAddCommentTo.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Comment' })
      .expect(201)

    const blogsAtEnd = await Blog.find({}).populate('comments')

    const updatedBlog = blogsAtEnd[0]

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(updatedBlog.comments[0].title).toBe('Comment')
  })

  test('blog without title is not added', async () => {
    const blogsAtStart = await Blog.find({}).populate('comments')

    const blogToAddCommentTo = blogsAtStart[0]

    await api
      .post(`/api/blogs/${blogToAddCommentTo.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send('I am missing title property')
      .expect(400)

    const blogsAtEnd = await Blog.find({}).populate('comments')

    const updatedBlog = blogsAtEnd[0]

    expect(blogToAddCommentTo.comments).toHaveLength(
      updatedBlog.comments.length,
    )
  })

  test('unauthorized user cannot create a comment', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToAddCommentTo = blogsAtStart[0]

    const newComment = {
      title: 'New comment',
    }

    token = null

    await api
      .post(`/api/blogs/${blogToAddCommentTo.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(newComment)
      .expect(401)

    const blogsAtEnd = await Blog.find({}).populate('comments')

    const updatedBlog = blogsAtEnd[0]

    expect(blogToAddCommentTo.comments).toHaveLength(
      updatedBlog.comments.length,
    )
  })
})


afterAll(() => {
  mongoose.connection.close()
})
