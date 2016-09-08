import createDocumentStore from '@sanity/document-store'
import client from 'client:@sanity/base/client'
import {Observable} from 'rxjs'

const hasOwn = {}.hasOwnProperty
function flattenPatch(patch) {
  return Object.keys(patch).reduce((flattened, key) => {
    const val = patch[key]
    if (hasOwn.call(val, '$set')) {
      return Object.assign(flattened, {[key]: val.$set})
    }
    return flattened
  }, {})
}

const serverConnection = {
  byId(id) {
    return Observable.timer(0, 5000)
      .flatMap(() => client.data.getDocument(id))
      // .do(response => console.log('response', response))
      .map(doc => ({
        type: 'snapshot',
        document: doc
      }))
  },

  query(query, params) {
    return Observable.timer(0, 50000)
      .flatMap(() => client.data.fetch(query, params))
      .map(documents => ({
        type: 'snapshot',
        documents: documents
      }))
  },

  update(id, patch) {
    return Observable.from(client.data
      .patch(id)
      .set(flattenPatch(patch))
      .commit())
  },

  create(doc) {
    return Observable.from(client.data.create(doc))
  }
}

export default createDocumentStore({serverConnection})
