const stringHelper = require('../../functions/helpers/stringHelper');

it('should replace all comas by white space', () => {
    const mystr = 'josemar,caculo,hebo'
    expect(stringHelper.replaceAll(mystr,',',' ')).not.toContain(',')
    
});

it('should replace all special chars in string', () => {
    const mystr = 'a@b#c%1*2+3'
    expect(stringHelper.removeEspecialChars(mystr)).not.toContain('@')
    
});
