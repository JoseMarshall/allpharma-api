jest.setTimeout(10000)
const controller = require('../../functions/controllers/clientePacienteController');
const request = require('supertest');
const app= require('../server')

app.get('/:id', controller.getOne)

app.get('/', controller.getAll)

app.put('/:id', controller.update)

app.delete('/:id', controller.delete)

describe('cliente Paciente Controller', () => {
    
    // it('should get all clients from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/')
    //     expect(res.status).toBe(200)
    //     expect(res.body).toBeInstanceOf(Array)
    // });

    // it('should get one specific product category from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/vgHtoNlzVXjLWtxAvw81').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

});

