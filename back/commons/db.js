const pathPkg = require('path')
const fsPkg = require('fs')

class DataObject {
  params = {}

  constructor(dir, id) {
    this.params.dir = dir
    this.params.id = id
    this.params.path = pathPkg.join(dir, id)

    fsPkg.mkdirSync(this.params.path, { recursive: true })
  }

  getId() {
    return this.params.id
  }

  propName(name) {
    return pathPkg.join(this.params.path, name)
  }

  read(name) {
    return fsPkg.readFileSync(this.propName(name))
  }

  writeString(name, content) {
    fsPkg.writeFileSync(this.propName(name), content)
    return this
  }

  writeMany(many) {
    const self = this

    Object.keys(many)
      .map((key) => self.writeString(key, many[key].toString()))

    return self
  }

  getProps() {
    return fsPkg.readdirSync(this.params.path)
  }

  toJSON() {
    const self = this
    const json = { 'id': self.getId() }

    self.getProps()
      .map((name) => json[name] = self.read(name).toString())

    return json
  }
}

class DataBase {

  params = {}

  constructor(dir) {
    this.params.dir = dir

    fsPkg.mkdirSync(dir, { recursive: true })
  }

  in(dir) {
    return new DataBase(pathPkg.join(this.params.dir, dir))
  }

  new() {
    const id = Date.now().toString() // FIXME: uuid
    return new DataObject(this.params.dir, id)
  }

  keys() {
    return fsPkg.readdirSync(this.params.dir)
  }

  list() {
    const self = this
    return self.keys()
      .map((param) => new DataObject(self.params.dir, param))
  }

  listJSON() {
    return this.list().map((item) => item.toJSON())
  }

  find(params = {}) {
    return this.list()
      .find((data) => Object.keys(params)
        .every((param) => params[param] == data.read(param))
      )
  }

  get(id) {
    return this.list()
      .find((data) => data.getId() == id)
  }
}

module.exports = new DataBase(process.env.DATA_PATH)
