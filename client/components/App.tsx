import * as React from "react";
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ReserveForm from "./ReserveForm";
import { Reserves } from "./Reserves";
import Reserved from "./Reserved";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

export class ScoreBoardNavbar extends React.Component<{}, {}> {
  render(): JSX.Element {
    return (
      <AppBar>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            妹蚊 整理券システム
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export class App extends React.Component<{}, {}> {
  render(): JSX.Element {
    return (        
      <BrowserRouter>
        <Switch>
          <Route 
            exact={true}
            path="/"
            render={ (): JSX.Element => {
              return (
                <div>
                  <div>
                    <ScoreBoardNavbar />
                  </div>
                  <div style={{marginTop: 100}}>
                    <ReserveForm />
                  </div>
                </div>
              );
            }}
          />
          <Route
            exact={true}
            path="/reserved"
            render={ (props): JSX.Element => {
              const ticketId = props.location.state ? props.location.state.ticketId : undefined;
              const reservedTime = props.location.state ? props.location.state.reservedTime : undefined;
              
              return (
                <div>
                  <div>
                    <ScoreBoardNavbar />
                  </div>
                  <div style={{marginTop: 100}}>
                    <Reserved 
                      reservationId={ticketId}
                      reservationTime={reservedTime}
                    />
                  </div>
                </div>
              );
            }}
          />
          <Route
            exact={true}
            path="/reserves"
            render={ (): JSX.Element => {
              return (
                <div>
                  <div>
                    <ScoreBoardNavbar />
                  </div>
                  <div style={{marginTop: 100}}>
                    <Reserves />
                  </div>
                </div>
              );
            }}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}