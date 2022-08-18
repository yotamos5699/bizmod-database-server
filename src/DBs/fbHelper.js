
const storage = require('./dbConfig/firebaseConfig')
const {ref, uploadBytes, listAll} = require('firebase/storage')




const uploadFile = async (fileName, file, AccountKey) => {
    const imageRef = ref(storage, `signeddocs/${AccountKey}/signed_${fileName}`)
    try {
        uploadBytes(imageRef, file).then(res => {
            console.log(JSON.stringify(res))
        })
    } catch (err) {
        console.dir(err)
    }
}


const getUrlList = async (Path, Accounts) => {
    let result
    if (!Accounts) {
        let dir = ref(storage, Path)
        listAll(dir).then(list => {
            result = list
        })
    } else {
        let Urls = []
        Accounts.forEach(element => {
            listAll(`${Path}${element}`).then(list => {
                Urls.push(list)
            })

        });
        result = Urls
    }

    return result
}



module.exports.getUrlList = getUrlList
module.exports.uploadFile = uploadFile

