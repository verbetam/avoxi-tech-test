import React from 'react'
import { Card, Table } from 'antd'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
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
    this.fetchData({
      size: pagination.pageSize,
      page: pagination.current
    });
  }

  async fetchData(params = {}) {
    this.setState({ loading: true });
    try {
      let uri = '/api/numbers?page=';
      uri += encodeURIComponent(params.page ? params.page : 1);
      uri += "&size="
      uri += encodeURIComponent(params.size ? params.size : 10);

      let res = await fetch(uri).then(res => res.json());

      if (res.error) {
        console.log("Error fetching numbers: ", res.message);
      } else {
        const numbers = res.message;

        for (let number of numbers) {
          if (number.first_name) number.user = number.first_name + " " + number.last_name;
          const phoneNumber = parsePhoneNumberFromString("+" + number.number.toString());
          if (phoneNumber) {
            number.number = phoneNumber.formatInternational();
            number.country = phoneNumber.country;
          }
        }

        const pagination = {...this.state.pagination};
        pagination.total = res.total;

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
