const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require('body-parser');

const db = new sqlite3.Database("./appDB.db", err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the db.");
});

const app = express();

app.set("port", process.env.PORT || 3001);

app.use(bodyParser.json());

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

app.get("/api/numbers", (req, res) => {
  const page = parseInt(req.query.page) ? parseInt(req.query.page) : 0;
  const size = parseInt(req.query.size) ? parseInt(req.query.size) : 10;
  const start = page ? size * (page - 1)
                     : 0;

  /**
   * WHERE sub-query was based on:
   * https://gist.github.com/ssokolow/262503
   * Scales better by filtering off row id rather than than ordering by
   * with an offset.
   */
  let sql = `
    SELECT Numbers.id,
           Numbers.number,
           Numbers.type,
           NumberConfiguration.answering_mode,
           Users.first_name,
           Users.last_name
    FROM Numbers 
      LEFT OUTER JOIN NumberConfiguration
                   ON Numbers.id=NumberConfiguration.number_id
      LEFT OUTER JOIN UserNumbers
                   ON Numbers.id=UserNumbers.number_id
      LEFT OUTER JOIN Users
                   ON UserNumbers.user_id=Users.id
  `
  if(page) {
    sql += `
      WHERE Numbers.oid NOT IN ( SELECT Numbers.oid FROM Numbers
                                 ORDER BY Numbers.id ASC LIMIT ` +  start + `)
      `
  }

  sql += `ORDER BY Numbers.id ASC`;

  if(page) {
    sql += " LIMIT " + size;
  }

  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.json({
        error: true,
        message: err.message
      });
    }

    let sql = `
      SELECT count(*) from Numbers;
    `
    db.get(sql, (err, row) => {
      if (err) {
        console.error(err.message);
        return res.json({
          error: true,
          message: err.message
        });
      }

      const count = row['count(*)'];
      const pages = Math.ceil(count / size);

      return res.json({
        error: false,
        message: rows,
        total: count
      });
    });
  });
});

app.put('/api/numbers/:id', (req, res) => {
  const id = parseInt(req.param.id);
  const updatedNumber = req.body;
  console.log(req.body);

  // TODO: Would validate updatedNumber with validator here...
  if(!updatedNumber.id || !parseInt(updatedNumber.id)) {
    return res.json({
      error: true,
      message: "Invalid format: No id"
    });
  }
  if(!updatedNumber.number || !parseInt(updatedNumber.number)) {
    return res.json({
      error: true,
      message: "Invalid format: No number"
    });
  }

  let sql = `
    UPDATE Numbers
    SET number=${updatedNumber.number}
    WHERE id=${updatedNumber.id}
  `

  db.all(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.json({
        error: true,
        message: err.message
      });
    }

    return res.json({
      error: false,
      message: updatedNumber
    });
  });
});

app.get("/api/users", (req, res) => {
  db.all(`SELECT * FROM Users`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    return res.json(rows);
  });
});

app.get("/api/usernumbers", (req, res) => {
  db.all(`SELECT * FROM UserNumbers`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    return res.json(rows);
  });
});

app.get("/api/numberconfiguration", (req, res) => {
  db.all(`SELECT * FROM NumberConfiguration`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    return res.json(rows);
  });
});