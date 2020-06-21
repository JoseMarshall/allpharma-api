jest.setTimeout(10000)
const controller = require('../../functions/controllers/farmaciaController');
const request = require('supertest');
const app= require('../server')

app.get('/encomenda/:id', controller.getOneEncomenda)

app.get('/encomenda', controller.getAllEncomenda)

app.delete('/encomenda/:id', controller.deleteEncomenda)

app.put('/encomenda/:id', controller.updateEncomenda)

app.put('/imageProfile/:id', controller.setImageProfile)

app.post('/imageProfile/upload/:id', controller.uploadImage)

app.post('/', controller.create)

app.get('/:id', controller.getOne)

app.get('/', controller.getAll)

app.put('/:id', controller.update)

app.delete('/:id', controller.delete)


describe('Farmacia Controller', () => {

    // it('should should create a new Farmacia and receive a ok code from http server', async () => {
    //     const res = await   request(app).post('/').send({
    //                                 "connection" : {
    //                                     "collectionName":"RedeFarmacias",
    //                                     "contaUsuariosId": "Lucas"
    //                                 },
    //                                 "farmacia":{
    //                                 "redeFarmaciaId":"Lucas",
    //                                     "nome": "Farmácia Mecofarma Maculusso",
    //                                     "email": "umemailqualquer@gmail.com",
    //                                     "caixaInicial": 1000000,
    //                                     "endereco": {
    //                                         "provincia": "luanda",
    //                                         "municipio": "luanda",
    //                                         "bairro": "samba",
    //                                         "rua": "ceramica",
    //                                         "andar": "1",
    //                                         "numPorta": "1",
    //                                         "latitude": "13.2294587",
    //                                         "longitude": "-8.8259371"
    //                                     },
    //                                     "telefones": ["92359845", "945548864"]
    //                                 }
    //                             })

          
    //     expect(res.status).toBe(201)
    //     expect(res.body.msg).toContain('sucesso')
       
    // });
    
    // it('should get all Farmacia from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         },
    //         "farmacia":{
    //         "redeFarmaciaId":"Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    //     expect(res.body).toBeInstanceOf(Array)
    // });

    // it('should get one specific Farmacia from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/5WvEznBzarwiuRU3ytms').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         },
    //         "farmacia":{
    //         "redeFarmaciaId":"Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

    // it('should delete a specific Farmacia from database ', async() => {
    //     const res = await   request(app).delete('/8gLj8BWt2r5uiEaJdvFv').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

    // it('should update a specific Farmacia on database depending on the object sent', async() => {
    //     const res = await   request(app).put('/G8YJFyPrknM69jtMayOg').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas"
    //         },
    //         "farmacia":{
    //             "nome":"Farmacia Kiluba",
    //             "endereco":{
    //                 "longitude":"-8.8786454",
    //                 "latitude":"13.45643515"
    //             }
    //         }
    //     })
    //     expect(res.status).toBe(201)
    // });


    // it('should get all encomendas ofpecific Farmacia from database and reurn it as json object', async() => {
    //     const res = await   request(app).get('/encomenda').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas",
    //             "contaUsuariosOrganizacaoPai":"Lucas"
    //         },
    //         "farmacia":{
    //         "farmaciaId":"G8YJFyPrknM69jtMayOg"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });

    // it('should get one encomenda of a specific Farmacia from database and return it as json object', async() => {
    //     const res = await   request(app).get('/encomenda/lBMSqnPftuBDr26bYnjm').send({
    //         "connection" : {
    //             "collectionName":"RedeFarmacias",
    //             "contaUsuariosId": "Lucas",
    //             "contaUsuariosOrganizacaoPai":"Lucas"
    //         },
    //         "farmacia":{
    //         "farmaciaId":"G8YJFyPrknM69jtMayOg"
    //         }
    //     })
    //     expect(res.status).toBe(200)
    // });
});

