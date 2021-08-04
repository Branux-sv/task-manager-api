const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDataBase } = require('./fixtures/db')

beforeEach(setupDataBase)

test('Should signup a new user', async () => {
    const resp = await request(app).post('/users').send({
        name: 'Brayan Test',
        email: 'Brayan123@gmail.com',
        password: 'Mypass1234'
    }).expect(201)

    // Assert
    const user = await User.findById(resp.body.user._id)
    expect(user).not.toBeNull()

    expect(resp.body).toMatchObject({
        user: {
            name: 'Brayan Test',
            email: 'Brayan123@gmail.com'
        }
    })

    expect(user.password).not.toBe('123456')
})

test('Should login existing user', async() =>{
    const resp = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)    

    const user = await User.findById(userOneId)
    expect(resp.body.token).toBe(user.tokens[1].token)

})

test('Should not login non-existing users', async() =>{
    await request(app).post('/users/login').send({
        email: 'something@contoso.net',
        password: 'dummy12345'
    }).expect(400)    
})

test('Should get profile for user', async() =>{
    await request(app)
    .get('/users/me')
    .set('Authorization','Bearer ' + userOne.tokens[0].token)    
    .send()
    .expect(200)    
})

test('Should not get profile for unauthenticated user', async() =>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)    
})

test('Should delete account for user', async() =>{
    await request(app)
    .delete('/users/me')
    .set('Authorization','Bearer ' + userOne.tokens[0].token)    
    .send()
    .expect(200)    

    // Assert user has to be null
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async() =>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)    
})

test('Should upload an avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            name: 'Chemita 4'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Chemita 4') 
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            location: 'Chemita 4'
        })
        .expect(400)
})
