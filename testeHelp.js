
function test() {
    return new Promise((resolve, reject) => {
        2>3 ?
        resolve('This is the then function'):
        reject('This is the catch function')
    }) 
}

test()
.then(console.log)
.catch(console.log)
