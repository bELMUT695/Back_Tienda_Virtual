const MongoLib = require('../lib/Mongo_Libros');
// se encarga de crear password en modo Hash
const bcrypt = require('bcryptjs');

class UsersService{
    constructor(){
        this.collection='Users';
        this.mongoDB=new MongoLib();

    }

    // recibe un email y apartir de aquí buscamos a ese usuario en la DB
  async getUser({ email }) {
    const [user] = await this.mongoDB.getEmail(this.collection, { email });
    return user;
  }
  // creamos el usuario
  async createUser({ user }) {
    const { name, email, password } = user;
    // nos crea un password en modo hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserId = await this.mongoDB.create(this.collection, {
      name,
      email,
      password: hashedPassword
    });

    return createUserId;
  }
}

module.exports = UsersService;