import React, { Component } from 'react';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

import Container from 'react-bootstrap/lib/Container';
import Sockette from 'sockette';

import BidsBook from '../components/OrderBook/BidsBook'
import AsksBook from '../components/OrderBook/AsksBook'

import {connect} from 'react-redux'
import updateBidsOrderBook from '../store/OrderBook/actions/update_bids'
import updateAsksOrderBook from '../store/OrderBook/actions/update_asks'
import {bindActionCreators} from 'redux'

import '../css/OrderBook.css';

let ws;
class OrderBook extends Component {

  constructor(props) {
      super(props);
    
      this.state = {
         connectionReady: true,
         isConnected: false,
         pres: 'P0',
         volume24h: 0,
         lastPrice: 0,
         priceChange: 0
      }
   }

  subscribeToAll(){
    const self = this;
    let payloadData = {};
    function onConnectionEstablished(e){
      console.log('connected');
      console.log(e);
      self.setState({connectionReady: true});
      let bookRequest = JSON.stringify({ 
        event: 'subscribe', 
        channel: 'book', 
        symbol: 'tBTCUSD',
        prec: self.state.pres
      })
      ws.send(bookRequest); 
    }

    function onConnectionClosed(e){
      console.log('closed');
      console.log(e);
    }

    function onMessageRecieved(e){
        payloadData = JSON.parse(e.data);
        if (!payloadData.event && Array.isArray(payloadData[1]) && payloadData[1].length === 3) {
          //Is order book data
          let tmpbookOrderRow = {
            price: parseFloat(payloadData[1][0]).toFixed(1),
            count: payloadData[1][1],
            amount: parseFloat(payloadData[1][2]).toFixed(2),
            total: parseFloat(0).toFixed(2)
          }
          if (tmpbookOrderRow.amount > 0) {
            self.props.updateBidsOrderBook(tmpbookOrderRow);
          }
          else{
            self.props.updateAsksOrderBook(tmpbookOrderRow);
          }
        }
    }
    ws = new Sockette('wss://api.bitfinex.com/ws/2', {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: onConnectionEstablished,
      onmessage: onMessageRecieved,
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => onConnectionClosed,
      onerror: e => console.log('Error:', e)
    });
    this.setState({isConnected: true});
  }

  closeConnection(){
    ws.close();
    this.setState({isConnected: false});
  }

  formmatNumberWithCommas(currentNumber){
    return currentNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  render() {
    return (
      <Container fluid={true}>
      <Row>
        <Col lg={12} className="buttons-container text-left">
          <ButtonToolbar>
                <Button disabled={!this.state.connectionReady || this.state.isConnected} onClick={this.subscribeToAll.bind(this)}>Connect</Button>
                <Button  disabled={!this.state.isConnected} onClick={this.closeConnection.bind(this)}>Disconnect</Button>
          </ButtonToolbar>
        </Col>
      </Row>
            <Row>
              <Col lg={9}>
                <Container fluid={true}>
                      <Row>
                        <Col lg={12}>
                          <h3 className="text-left">ORDER BOOK BTC/USD</h3>
                        </Col>
                        <Col lg={6} className='bids-container'>
                         <BidsBook orderBookBids={this.props.orderBookBids}/>
                        </Col>
                        <Col lg={6} className='asks-container'>
                         <div className="depth-bars-asks-container"></div>
                         <AsksBook orderBookAsks={this.props.orderBookAsks}/>
                        </Col>
                      </Row>
                </Container>
              </Col>
            </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    orderBookBids: state.orderBookBids,
    orderBookAsks: state.orderBookAsks,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateAsksOrderBook: updateAsksOrderBook, 
      updateBidsOrderBook: updateBidsOrderBook
    }, dispatch);
  }

export default connect(mapStateToProps, mapDispatchToProps)(OrderBook)