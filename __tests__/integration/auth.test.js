process.env.JWT_KEY = '»1986«=?..DP_llahsr@M'
const auth = require('../../functions/midlewares/auth');
const request = require('supertest');
const app= require('../server')

app.post('/auth', auth.checkAuth);
app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'Welcome to AllPharma, created by JoseM@rshall in Dec/2019',
        datetime: new Date().toJSON()
    })
})

describe('Check token', () => {

    it('should should receive a token starting with Bearer', async () => {
        const res = await   request(app).post('/auth').send({
                                username:"Lucas",
                                password:"1234"
                            })
          
        expect(res.status).toBe(200)
        expect(res.body.token).toMatch(new RegExp('^Bearer ','g'))
       
    });
    
});
