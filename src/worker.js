import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'

worker({
  async init() {
    // Persist under IndexedDB at key "patient-db"
    return PGlite.create('idb://patient-db')
  }
})
