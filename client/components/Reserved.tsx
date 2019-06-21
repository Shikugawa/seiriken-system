import * as React from "react";
import { withCookies, Cookies } from 'react-cookie';

interface ReservedProps {
  reservationId: number,
  reservationTime: string,
  cookies: Cookies
}

interface ReservedState {
  reservationId: number,
  reservationTime: string
}

class Reserved extends React.Component<ReservedProps, ReservedState> {
  constructor(props) {
    super(props);
    this.state = {
      reservationId: -1,
      reservationTime: ""
    };
  }

  componentWillMount() {
    const {cookies} = this.props;

    this.setState({
      reservationId: cookies.get('ticketId') || this.props.reservationId,
      reservationTime: cookies.get('reservedTime') || this.props.reservationTime
    });
  }

  render(): JSX.Element {
    const reserveationStatus = this.state.reservationId !== -1 ? (
      <div>
        <h1>予約番号: {this.state.reservationId}</h1>
        <h1>{this.state.reservationTime} から30分以内にお越しください。</h1>
      </div>
    ) : (
      <div>
        <h1>予約してください。</h1>
      </div>
    );

    return reserveationStatus;
  } 
}

export default withCookies(Reserved);