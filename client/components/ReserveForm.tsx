import * as React from "react";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Redirect } from "react-router";
import { withCookies, Cookies } from 'react-cookie';

interface ReserveState {
  name: string,
  ticketId: number,
  reservedTime: string,
  toReserved: boolean,
  [key: string]: string | number | boolean
}

type StateKey = keyof ReserveState;

class ReserveForm extends React.Component<any, ReserveState> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      ticketId: 0,
      reservedTime: '',
      toReserved: false
    }
  }

  private isValidationPassed () {
    if (this.state.name.length === 0) {
      return {
        status: false,
        message: "名前を入力してください。"
      };
    }

    return {
      status: true
    }
  }

  async register() {
    const {status, message} = this.isValidationPassed();
    if(!status) {
      alert(message);
      return;
    }

    const response: Response = await fetch(
      '/ticket/reserve' ,{
        method: 'post',
        credentials: 'same-origin',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: this.state.name
        })
      }
    );
    const jsonData = await response.json();
    
    switch (response.status) {
      case 200:
        const {cookies} = this.props;

        if (!cookies.get('ticketId')) {
          cookies.remove('ticketId');
          cookies.remove('reservedTime');
        }
        
        cookies.set('ticketId', jsonData.result.number, { path: '/reserved '});
        cookies.set('reservedTime', jsonData.result.reservedTime, { path: '/reserved '});
        
        if (jsonData.result.reservedTime.length === 0) {
          alert("ファストパスは終了致しました。");
        } else {
          this.setState({
            ticketId: jsonData.result.number,
            reservedTime: jsonData.result.reservedTime,
            toReserved: true
          });
        }
        break;
      case 403:
        throw new Error('403 forbidden');
      case 404:
        throw new Error('404 not found');
      default:
        throw new Error('unexpected http status');
    }
  }
  
  private changeHandler(e) {
    const key: StateKey = e.target.id;
    this.setState({[key]: e.target.value});
  }

  render(): JSX.Element {
    if (this.state.toReserved) {
      return <Redirect to={{
        pathname: "/reserved",
        state: {
          ticketId: this.state.ticketId,
          reservedTime: this.state.reservedTime
        }
      }} />
    }

    return (
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <TextField 
              id="name"
              label="Name"
              placeholder="Your Name"
              value={this.state.name}
              onChange={this.changeHandler.bind(this)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={this.register.bind(this)}>予約する</Button>
          </Grid>
        </Grid>
    )
  } 
}

export default withCookies(ReserveForm);