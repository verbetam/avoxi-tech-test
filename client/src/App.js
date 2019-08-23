import React from 'react'
import { Card, Table } from 'antd'
import './App.css'

function App() {
  return (
    <main className="App">
      <section className="App-header">
        <h1>Numbers</h1>
        <div className="auto" />
        <span>AVOXI Take-Home</span>
      </section>
      <section className="App-card">
        <Card
          className="App-card__inner"
          title="Available Numbers"
          bordered={true}
        >
          <Table />
        </Card>
      </section>
    </main>
  )
}

export default App
