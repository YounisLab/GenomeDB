import React from 'react'
import styles from './styles'
import Row from './Row'
import { Button, Layout, Input, Table, Alert, Radio } from 'antd'
import { CSVLink } from 'react-csv'
const { Content } = Layout
const { Search } = Input
const { Group } = Input
const axios = require('axios')

function columns (title) {
  return [{
    title: title,
    dataIndex: 'gene',
    width: '40%'
  }, {
    title: 'Rvalue',
    dataIndex: 'Rvalue',
    sorter: (a, b) => a.Rvalue - b.Rvalue
  }]
}

function headers (label) {
  return [
    { label: label, key: 'gene' },
    { label: 'Rvalue', key: 'Rvalue' }
  ]
}

function isWhiteString (str) {
  return (isNaN(parseInt(str))) && str !== null
}

class Correlations extends React.Component {
  constructor (props) {
    super(props)

    this.columns = columns('RBP')
    this.headers = columns('RBP')

    this.input = {
      gene: '',
      Minimum: null,
      Maximum: null
    }
    this.state = {
      dataset: 'RBP',
      data: [],
      alertText: null
    }
    this.getRvals = this.getRvals.bind(this)
    this.updateVal = this.updateVal.bind(this)
    this.setDataset = this.setDataset.bind(this)
    this.doSearch = this.doSearch.bind(this)
  }

  doSearch (evt) {
    if (evt.key === 'Enter') {
      this.getRvals(this.input.gene)
    }
  }

  updateVal (evt, key) {
    this.input[key] = evt.target.value
  }

  setDataset (e) {
    this.setState({ dataset: e.target.value })
  }

  getRvals (gene) {
    let min = this.input.Minimum
    let max = this.input.Maximum
    this.setState({ alertText: null })
    if (!gene) {
      this.setState({ alertText: 'Please enter a gene name.' })
      return
    }
    if (min === '') {
      this.input.Minimum = null
      min = null
    }
    if (max === '') {
      this.input.Maximum = null
      max = null
    }
    // Check for non-numeric input/whitespace
    if (isNaN(min) || isWhiteString(min)) {
      this.setState({ alertText: 'Please enter numerical Minimum value.' })
    } else if (isNaN(max) || isWhiteString(max)) {
      this.setState({ alertText: 'Please enter numerical Maximum value.' })
    } else {
      axios.get('/api/correlations', {
        params: {
          table: this.state.dataset.toLowerCase() + '_rvalues',
          gene: gene.toUpperCase(), // DB stores gene names in UPPERCASE
          min: min,
          max: max
        }
      })
        .then(resp => {
          if (resp.data.length < 1) {
            if (min !== null || max !== null) {
              this.setState({ alertText: `${gene} not found for given range! Please try another entry.` })
            } else {
              this.setState({ alertText: `${gene} not found! Please try another name.` })
            }
            return
          }
          // If request goes through update header and column
          this.columns = columns(this.state.dataset)
          this.headers = headers(this.state.dataset)
          this.setState({
            data: resp.data,
            alertText: null
          })
        })
    }
  }

  render () {
    let alert

    if (this.state.alertText) {
      alert = <Alert message={this.state.alertText} type='error' style={{ width: '30%' }} />
    } else {
      alert = null
    }

    return (
      <Content style={styles.contentStyle}>
        <div style={styles.contentDivStyle}>
          <Row>
            <h1>Correlations</h1>
          </Row>
          <Row>
            Select desired data for correlation analysis
          </Row>
          <Row>
            <Radio.Group onChange={this.setDataset} defaultValue={'RBP'}>
              <Radio value={'RBP'}>RBP</Radio>
              <Radio value={'U12'}>U12</Radio>
            </Radio.Group>
          </Row>
          <Row>
            {alert}
          </Row>
          <Row>
            <Search
              size='large'
              placeholder='Enter gene name here, eg: MAPK14'
              onSearch={this.getRvals}
              style={{ width: '30%' }}
              onChange={(e) => this.updateVal(e, 'gene')}
              enterButton
            />
          </Row>
          <Row>
            Enter range of desired correlation values
          </Row>
          <Row>
            <Group compact size='medium'>
              <Input
                style={{
                  width: 60, textAlign: 'center', pointerEvents: 'none', color: '#000000'
                }}
                defaultValue='From'
                disabled
              />
              <Input style={{ width: '10%' }}
                placeholder='Minimum'
                onChange={(e) => this.updateVal(e, 'Minimum')}
                onKeyUp={this.doSearch}
              />
              <Input
                style={{
                  width: 40, textAlign: 'center', pointerEvents: 'none', color: '#000000'
                }}
                defaultValue='to'
                disabled
              />
              <Input style={{ width: '10%' }}
                placeholder='Maximum'
                onChange={(e) => this.updateVal(e, 'Maximum')}
                onKeyUp={this.doSearch}
              />
            </Group>
          </Row>
          <Row>
            <Table
              dataSource={this.state.data}
              columns={this.columns}
              size={'medium'}
              bordered
              pagination={false}
              style={{ width: '35%' }}
              locale={{ emptyText: 'Enter gene name to show results' }}
              scroll={{ y: 500 }}
            />
          </Row>
          <Row>
            <CSVLink
              data={this.state.data}
              headers={this.header}
              filename={`${this.input.gene}.csv`}>
              <Button
                type='primary'
                icon='download'
                size={'large'}
              >
                  Export as .csv
              </Button>
            </CSVLink>
          </Row>
        </div>
      </Content>
    )
  }
}

export default Correlations