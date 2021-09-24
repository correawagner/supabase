import MetaStore from './PostgresStore'
import PostgresMetaInterface from './MetaInterface'

export default class TableStore extends PostgresMetaInterface {
  constructor(rootStore: MetaStore, dataUrl: string, options: object) {
    super(rootStore, dataUrl, options)
  }
}
