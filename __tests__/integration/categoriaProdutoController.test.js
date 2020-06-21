jest.setTimeout(10000)
const controller = require('../../functions/controllers/categoriaProdutoController');
const request = require('supertest');
const app= require('../server')

app.post('/', controller.create)

app.get('/:id', controller.getOne)

app.get('/', controller.getAll)

app.delete('/:id', controller.delete)
 
app.put('/:id', controller.update)

describe('categoria Produto Controller', () => {

    // it('should should create a new product category and receive a create code from http server', async () => {
    //     const res = await   request(app).post('/').send({
    //                                 "connection" : {
    //                                     "collectionName":"RedeFarmacias",
    //                                     "contaUsuariosId": "Lucas"
    //                                 },
    //                                 "categoriaProduto":{
    //                                     "nome": "Tranquilizante"
    //                                 }
    //                             })

          
    //     expect(res.status).toBe(201)
    //     expect(res.body.msg).toContain('sucesso')
       
    // });
    
    // it('should get all product category from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    //     expect(res.body).toBeInstanceOf(Array)
    // });

    // it('should get one specific product category from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/Tranquilizante').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

    // it('should delete a specific product category from database ', async() => {
    //     const res = await   request(app).delete('/Tranquilizante').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

    // it('should update a specific product category on database depending on the object sent', async() => {
    //     const res = await   request(app).put('/KjjjyLxNiHCTl1baLNNf').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         },
    //         "categoria":{
    //             "nome":"Anabolizantes"
    //         }
    //     })
    //     expect(res.status).toBe(201)
    // });


});

