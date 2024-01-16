import React, {Component} from 'react';
import styled from 'styled-components';
import BoardTile from './BoardTile';
import Announcement from './Annoucement';

const Container = styled.div`
  text-align: center;
  margin: auto;
`;
const Table = styled.div`
  width: 470px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
`;

class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      gameBoard: ['', '', '', '', '', '', '', '', ''],
      turn: 'x',
      winner: null,
      moves: 0,
      player: 'x'
    };
  }

  getGame(gameId) {
    this.props.contract.methods
      .games(gameId)
      .call({from: this.props.account.ethAddress})
      .then(res => {
        let game = {
          gameId: res.gameId,
          name: this.props.web3.utils.hexToAscii(res.name),
          state: res.state,
          ownerAddr: res.ownerAddr,
          moveCounter: res.moveCounter,
          playerXAddr: res.playerXAddr,
          playerOAddr: res.playerOAddr
        };
        console.log(game);
      })
      .catch(err => {
        console.log('error getting game ' + gameId + ': ' + err);
      });
  }

  getPlayer(address) {
    this.props.contract.methods
      .players(address)
      .call({from: this.props.account.ethAddress})
      .then(res => {
        let player = {
          playerName: this.props.web3.utils.hexToAscii(res.name)
        };
        console.log(player);
      })
      .catch(err => {
        console.log(
          'error getting player with address ' + address + ': ' + err
        );
      });
  }

  getBoard(gameId) {
    this.props.contract.methods
      .getBoard(gameId)
      .call({from: this.props.account.ethAddress})
      .then(res => {
        console.log(res);
        for (let i = 0; i < res.length; i++) {
          if (res[i] === '0') this.state.gameBoard[i] = '';
          else if (res[i] === '1') this.state.gameBoard[i] = 'x';
          else this.state.gameBoard[i] = 'o';
        }
        console.log(this.state.gameBoard);
      })
      .catch(err => {
        console.log('error getting board from game ' + gameId + ': ' + err);
      });
  }

  playMove(gameId, x, y) {
    this.props.contract.methods
      .playMove(gameId, x, y) //this.props.web3.utils.toBN(
      .send({from: this.props.account.ethAddress, gas: 4678127})
      .on('transactionHash', tx => {
        // this.addNewTx(tx, game.id, Status.GAME_JOINED);
        // this.setLoadingToTrue(game);
      })
      .on('receipt', res => {
        console.log(res);
        let isSuccess =
          res.status.toString().includes('0x01') || res.status === '0x1'; // for private testnet || for metamask
        if (isSuccess) {
          console.log('play successful');
          this.getBoard(gameId);
          this.getGame(gameId);
        } else {
          console.log('play not successful');
        }
      })
      .on('confirmation', function(confirmationNr) {
        // is returned for the first 24 block confirmations
        //console.log('new game joined ' + confirmationNr);
      });
  }

  createBet(gameId, isBetOnX, betValueInEth) {
    this.props.contract.methods
      .createBet(gameId, isBetOnX)
      .send({
        from: this.props.account.ethAddress,
        value: this.props.web3.utils.toWei(betValueInEth, 'ether'),
        gas: 4678127
      })
      .on('transactionHash', tx => {
        //this.addNewTx(tx, game.id, Status.GAME_JOINED);
        // this.setLoadingToTrue(game);
      })
      .on('receipt', res => {
        //console.log(res);
        let isSuccess =
          res.status.toString().includes('0x01') || res.status === '0x1'; // for private testnet || for metamask
        if (isSuccess) {
          console.log('bet created successfully');
        } else {
          console.log('bet could not be created');
        }
      })
      .on('confirmation', function(confirmationNr) {
        // is returned for the first 24 block confirmations
      });
  }

  joinBet(betId, betValueInEth) {
    this.props.contract.methods
      .joinBet(betId)
      .send({
        from: this.props.account.ethAddress,
        value: this.props.web3.utils.toWei(betValueInEth, 'ether')
      })
      .on('transactionHash', tx => {
        //this.addNewTx(tx, game.id, Status.GAME_JOINED);
        // this.setLoadingToTrue(game);
      })
      .on('receipt', res => {
        //console.log(res);
        if (res.status === '0x1') {
          console.log('bet joined successfully');
        } else {
          console.log('bet could not be joined');
        }
      })
      .on('confirmation', function(confirmationNr) {
        // is returned for the first 24 block confirmations
      });
  }

  getBet(betId) {
    this.props.contract.methods
      .bets(betId)
      .call({from: this.props.account.ethAddress})
      .then(res => {
        let bet = {
          betId: res.betId,
          gameId: res.gameId,
          state: res.state,
          value: this.props.web3.utils.fromWei(res.value, 'ether'),
          bettorOnOAddr: res.bettorOnOAddr,
          bettorOnXAddr: res.bettorOnXAddr
        };
        console.log(bet);
      })
      .catch(err => {
        console.log('error getting bet ' + betId + ': ' + err);
      });
  }

  render() {
    return (
      <Container>
        <Announcement
          winner={this.state.winner}
          turn={this.state.turn}
          player={this.state.player}
        />
        <Table>
          {this.state.gameBoard.map(
            function(value, i) {
              return (
                <BoardTile
                  key={i}
                  loc={i}
                  value={value}
                  updateBoard={this.updateBoard.bind(this)}
                  turn={this.state.turn}
                />
              );
            }.bind(this)
          )}
        </Table>
      </Container>
    );
  }

  updateBoard(loc, player) {
    //console.log(loc);
    //check for invalid move
    if (this.state.turn !== this.state.player || this.state.winner) {
      return;
    }
    if (
      this.state.gameBoard[loc] === 'x' ||
      this.state.gameBoard[loc] === 'o'
    ) {
      return;
    }

    /*
    0,1,2,3,4,5,6,7,8

    8 mod 3 = 2    x
    8 mod 3 = 2  	y

    7 mod 3	 = 1    x
    7 / 2	   = 2	  y

    0 mod 3  = 0	  x
    0 / 2	    = 0  	y

    1 mod 3  = 1   x
    1 / 2	    = 0	  y
    */

    console.log(loc % 3);
    console.log(Math.trunc(loc / 3));
    //TODO make gameId dynamic
    //this.playMove(0, loc % 3, Math.trunc(loc / 3));

    //this.createBet(0, false, '0.04');
    //this.getBet(1);
    //this.joinBet(1, '0.04');

    console.log(this.props.account.ethAddress);
    // for testing purposes.. does not work yet.
    // this.getPlayer(this.props.account.ethAddress);     DOES NOT WORK
    //this.getPlayer('0x8745be2c582bcfc50acf9d2c61caded65a4e3825'); DOES NOT WORK EITHER

    let currentGameBoard = this.state.gameBoard;
    currentGameBoard.splice(loc, 1, this.state.turn);
    this.setState({gameBoard: currentGameBoard});

    if (this.state.moves >= 9) {
      this.setState({winner: 'draw'});
    }

    this.setState({turn: this.state.turn === 'x' ? 'o' : 'x'});
    this.setState({player: this.state.player === 'x' ? 'o' : 'x'});
    this.setState({moves: this.state.moves + 1});
  }
}

export default GameBoard;
