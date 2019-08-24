import React from 'react'
import { Card, Table } from 'antd'
import fetchNumbers from './api/NumberAPI';
import './App.css'
//import { threadId } from 'worker_threads';

const columns = [
  {
    title: 'Phone Number',
    dataIndex: 'number',
    key: 'number'
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country'
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: 'Answering Mode',
    dataIndex: 'answering_mode',
    key: 'manswering_ode'
  },
  {
    title: 'Assigned To',
    dataIndex: 'user',
    key: 'user'
  },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [],
      pagination: {},
      loading: false
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  onTableChange = (pagination, filters, sorter) => {
    // Copy the state pagination to a new one.
    const pager = { ...this.state.pagination};
    // Get the current page from the given pagination from the table change event.
    pager.current = pagination.current;
    // Update the state with the pagination.
    this.setState({
      pagination: pager
    });
    const page = pagination.current;
    const size = pagination.pageSize;

    // If we do not have all items for the requests, then fetch the items from the api.
    if(!this.verifyLocalRange((page - 1) * size, size, pagination.total)) {
      this.fetchData({
        size: size,
        page: page
      });
    }
  }

  verifyLocalRange = (start, range, length) => {
    const data = this.state.numbers;
    for(let i = start; i < start + range && i < length; i++) {
      if(!data[i]) {
        return false;
      }
    }
    return true;
  }

  async fetchData(params = {}) {
    this.setState({ loading: true });
    try {
      const page = params.page ? params.page : 1
      const size = params.size ? params.size : 10

      let data = await fetchNumbers({
        page: page,
        size: size
      });

      if (data.error) {
        console.log("Error fetching numbers: ", data.message);
      } else {
        const numbers = this.state.numbers;

        // Copy the number references into the local data.
        for (let i = 0; i < data.numbers.length; i++) {
          let number = data.numbers[i];
          numbers[size * (page - 1) + i] = number;
        }

        // Rebuild the pagination for the state.
        const pagination = {...this.state.pagination};
        pagination.total = data.total;

        this.setState({
          numbers: numbers,
          loading: false,
          pagination: pagination
        });
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  render() {
    return(
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
            <Table
              dataSource={this.state.numbers}
              columns={columns}
              rowKey="id"
              pagination={this.state.pagination}
              loading={this.state.loading}
              onChange={this.onTableChange}
            />
          </Card>
        </section>
      </main>
    )
  }
}

export default App
