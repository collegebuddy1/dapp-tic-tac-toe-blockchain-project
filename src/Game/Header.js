import React, {Component} from 'react';
import styled from 'styled-components';
import DEV from '../Environment';
import GameIcon from './GameIcon';
import Select from 'react-select';
import {Link} from 'react-router-dom';
import UserAccount from './UserAccount';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import Web3Providers from './Web3Providers';
import GameTooltip from './ToolTip';

const HeaderContainer = styled.div`
  z-index: 1;
  width: 100%;
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  color: black;
`;

const BorderBottom = styled.div`
  background: linear-gradient(90deg, rgb(0, 74, 153), rgb(1, 178, 208));
  height: 3px;
  width: 100%;
`;

const BorderTop = BorderBottom.extend`
  background: linear-gradient(90deg, rgb(1, 178, 208), rgb(0, 74, 153));
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
`;
const Right = styled.div`
  margin-left: auto;
`;

const DevEnv = styled.div`
  border: 1px solid ${props => (props.border ? props.border : props.color)};
  border-radius: 4px;
  padding: 4px;
  background: ${props => props.color};
  margin-left: 1em;
  color: white;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 3em;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Tab = styled.div`
  &:hover {
    color: #01a2ca;
    border-bottom-color: #01a2ca;
    font-size: 17.5px;
  }
  transition: 0.15s ease-in-out;
  font-size: 17px;
  color: #026899;
  cursor: pointer;
  padding: 0 20px;
  font-weight: bold;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const UserContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;

const GamesSearchContainer = styled.div`
  display: flex;
  padding: 0 10px;
  align-items: center;
`;

const SearchGame = styled.p`
  margin: 0;
  font-size: 10px;
  color: #026899;
  width: 70px;
`;

const Provider = styled.img`
  height: 38px;
  width: 38px;
  cursor: pointer;
`;

const WebProviderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
`;

class Header extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(context) {
    super(context);
    this.state = {
      selectedAddress: null,
      selectedGame: null,
      currentPath: null,
      isToolTipVisible: false
    };
  }

  componentDidMount() {
    if (this.props.account && DEV) {
      this.setState({selectedAddress: this.props.account.ethAddress});
    }
    this.setState({currentPath: this.props.location.pathname});
  }

  renderLeftContent() {
    return (
      <LeftContainer>
        <GameIcon
          color={'#016b9b'}
          width={45}
          height={45}
          marginBottom={0}
          icon={'bet'}
        />

        <a
          href={'https://github.com/lucaspelloni2/dapp-tic-tac-toe'}
          target="_blank"
        >
          <GameIcon icon={'github'} />
        </a>

        <WebProviderContainer>
          {this.renderProviderImage()}
        </WebProviderContainer>

        {DEV ? (
          <DevEnv color={'#d42517'} border={'#d42517'}>
            DEV ENVIRONMENT
          </DevEnv>
        ) : null}
      </LeftContainer>
    );
  }

  handleChange = selectedAddress => {
    this.setState({selectedAddress: selectedAddress});
    this.props.updateUserAccount(selectedAddress);
  };

  handleSearchGame = selectedGame => {
    this.setState({selectedGame: selectedGame});
    //this.props.history.push('/games/' + selectedGame.id);
    this.context.router.history.push('/games/' + selectedGame.id);
    window.location.reload(true);
  };

  renderRightContent() {
    if (this.props.addresses && DEV) {
      return (
        <RightContainer>
          <div>{this.renderTabs()}</div>
          {this.props.games ? <div>{this.renderGamesSearch()}</div> : null}
          <div>{this.renderUserAccount()}</div>
          <Select
            simpleValue
            style={{width: 220}}
            value={this.state.selectedAddress}
            onChange={this.handleChange}
            options={this.props.addresses.map(addr => ({
              label: addr,
              value: addr
            }))}
          />
        </RightContainer>
      );
    } else {
      return (
        <RightContainer>
          {this.props.account ? <div>{this.renderTabs()}</div> : null}
          {this.props.games ? <div>{this.renderGamesSearch()}</div> : null}
          {this.props.account ? <div>{this.renderUserAccount()}</div> : null}
        </RightContainer>
      );
    }
  }

  renderTabs() {
    return (
      <TabsContainer>
        <Link style={{textDecoration: 'none'}} to="/games/create">
          <Tab>Create a Game</Tab>
        </Link>

        <Link style={{textDecoration: 'none'}} to="/lobby">
          <Tab>Lobby</Tab>
        </Link>

        <Link style={{textDecoration: 'none'}} to="/games">
          <Tab>Join a Game</Tab>
        </Link>
      </TabsContainer>
    );
  }

  renderGamesSearch() {
    return (
      <GamesSearchContainer>
        <SearchGame>
          Visit another game{' '}
          <GameIcon
            icon={'search'}
            width={12}
            height={12}
            marginLeft={1}
            color={'#026899'}
          />
        </SearchGame>
        <Select
          simpleValue
          style={{width: 140}}
          value={
            this.state.selectedGame
              ? {
                  label: this.state.selectedGame.name.replace(/\u0000/g, ''),
                  value: this.state.selectedGame
                }
              : this.props.games.lenght > 0
                ? {
                    label: this.props.games[0].name.replace(/\u0000/g, ''),
                    value: this.props.games[0]
                  }
                : null
          }
          onChange={this.handleSearchGame}
          options={this.props.games.map(game => ({
            label: game.name,
            value: game
          }))}
        />
      </GamesSearchContainer>
    );
  }
  renderUserAccount() {
    return (
      <UserContainer>
        <UserAccount
          provider={this.props.provider}
          account={this.props.account}
        />
      </UserContainer>
    );
  }

  renderProviderImage() {
    if (this.props.provider === Web3Providers.META_MASK) {
      return (
        <GameTooltip
          overlay={'Your browser is using Metamask!'}
          placement={'bottom'}
          visible={this.state.isToolTipVisible}
        >
          <a target="_blank" href={'https://github.com/MetaMask/'}>
            <Provider
              onMouseEnter={() => {
                this.setState({isToolTipVisible: true});
              }}
              onMouseLeave={() => {
                this.setState({isToolTipVisible: false});
              }}
              src={'./../metamask.png'}
            />
          </a>
        </GameTooltip>
      );
    } else if (this.props.provider === Web3Providers.LOCALHOST) {
      return (
        <GameTooltip
          overlay={'Your browser is using Ganache!'}
          placement={'bottom'}
          visible={this.state.isToolTipVisible}
        >
          <a target="_blank" href={'https://github.com/trufflesuite/ganache'}>
            <Provider
              onMouseEnter={() => {
                this.setState({isToolTipVisible: true});
              }}
              onMouseLeave={() => {
                this.setState({isToolTipVisible: false});
              }}
              src={'./../ganache.png'}
            />
          </a>
        </GameTooltip>
      );
    }
  }

  render() {
    return (
      <div>
        <BorderTop />
        <HeaderContainer>
          <Left>{this.renderLeftContent()}</Left>
          <Right>{this.renderRightContent()}</Right>
        </HeaderContainer>
        <BorderBottom />
      </div>
    );
  }
}

export default withRouter(Header);
