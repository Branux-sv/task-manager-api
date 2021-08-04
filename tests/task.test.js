const app = require('../src/app')
const request = require('supertest')
const Task = require('../src/models/task')
const { 
    userOne, 
    setupDataBase,         
    userTwo, 
    taskOne 
} = require('./fixtures/db')

beforeEach(setupDataBase)

test('Should create a task for user', async() => {
    const resp = await request(app)
        .post('/tasks')
        .set('Authorization','Bearer ' + userOne.tokens[0].token)
        .send({
            description: 'This is a test'            
        })
        .expect(201)
    
    const task = await Task.findById(resp.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
    
})

test('Should get all tasks for user one', async() => {
    const resp = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200)

    expect(resp.body.length).toEqual(2)
})


test('Should avoid user Two delete the first task that belongs user one', async() => {
    const resp = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
        .send()
        .expect(404)
 
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})