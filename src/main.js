import { PGliteWorker } from '@electric-sql/pglite/worker'

async function bootstrap() {
  // launch the worker, bundler rewrites the path for you
  const pgWorker = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module'
  })

  // connect to it (shares one instance across all tabs)
  const db = await PGliteWorker.create(pgWorker, {
    // must match the same dataDir you used in the worker init()
    dataDir: 'idb://patient-db'
  })

  // ensure schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id         SERIAL PRIMARY KEY,
      name       TEXT,
      age        INTEGER,
      gender     TEXT,
      address    TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `)

  // form logic
  document
    .getElementById('patient-form')
    .addEventListener('submit', async e => {
      e.preventDefault()
      const f = e.target
      await db.query(
        `INSERT INTO patients (name, age, gender, address)
         VALUES ($1, $2, $3, $4);`,
        [f.name.value, +f.age.value, f.gender.value, f.address.value]
      )
      alert('Patient registered!')
      f.reset()
    })

  // query runner
  document.getElementById('run-query').addEventListener('click', async () => {
    const sql = document.getElementById('sql-query').value
    try {
      const { rows } = await db.query(sql)
      render(rows)
    } catch (err) {
      alert(`SQL Error: ${err.message}`)
    }
  })

  function render(rows) {
    const thead = document.querySelector('#results-table thead')
    const tbody = document.querySelector('#results-table tbody')
    thead.innerHTML = tbody.innerHTML = ''
    if (!rows.length) {
      thead.innerHTML = `<tr><th>No results</th></tr>`
      return
    }
    // header
    thead.innerHTML = `<tr>${Object.keys(rows[0])
      .map(c => `<th>${c}</th>`)
      .join('')}</tr>`
    // body
    tbody.innerHTML = rows
      .map(r =>
        `<tr>${Object.values(r)
          .map(v => `<td>${v}</td>`)
          .join('')}</tr>`
      )
      .join('')
  }
}

bootstrap()
