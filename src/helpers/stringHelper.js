exports.replaceAll = (string, search, replaceValue) => {
    return string.replace(new RegExp('[' + search + ']', 'g'), replaceValue)
}

exports.removeEspecialChars = (string) => {

    return string.replace(new RegExp('[!@#$%^&*(),.?":{}|<> ]', 'g'), '')
}


const separeteByCaptalize = (str)=>{
    let words=[]
    let tmp=''
    for (const w of str) {
        if (w.charCodeAt(0)>64 && w.charCodeAt(0)<91) { //Verify if w is Uppercase
            words.push(tmp)
            tmp=''
        }
        tmp+=w
    }
    words.push(tmp)
    return words
}


exports.singularize = (str)=>{
    let words= separeteByCaptalize(str)
        
    words.map( (x,index)=>{
        if (x.match(new RegExp('ies$', 'g'))) {
            words[index] = x.replace(new RegExp('ies$', 'g'), 'y')     
            
        } 
        else if (x.match(new RegExp('es$', 'g'))) {
            words[index] = x.replace(new RegExp('es$', 'g'), '')     
            
        }  
        else if (x.match(new RegExp('s$', 'g'))) {
            words[index] = x.replace(new RegExp('s$', 'g'), '')     
            
        }  
        return
    })

    let result = words.reduce((prev, current)=>{
                    return prev+current
                })

    return result
}
