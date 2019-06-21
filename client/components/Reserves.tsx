import * as React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

interface ReserveInfo {
  id: number,
  name: string,
  reservedTime: string,
  createdAt: string
}

interface ReservesState {
  reservationList: Array<ReserveInfo>
}

export class Reserves extends React.Component<any, ReservesState> {
  constructor (props) {
    super(props);
    this.state = {
      reservationList: []
    }
  }

  async componentWillMount() {
    const response = await fetch(
      `/ticket/reserves`, {
        method: 'get',
        credentials: 'same-origin'
      }
    );
    const jsonData = await response.json();
    switch (response.status) {
      case 200:
        this.setState({
          reservationList: jsonData.result.map(r => {
            return {
              id: r.id,
              name: r.name,
              reservedTime: r.reserved_time,
              createdAt: r.created_at
            }
          })
        })
        break;
      case 403:
        throw new Error('403 forbidden');
      case 404:
        throw new Error('404 not found');
      default:
        throw new Error('unexpected http status');
    }
  }

  render(): JSX.Element {
    return (
      <div className="reserves-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>整理券番号</TableCell>
              <TableCell>名前</TableCell>
              <TableCell>予約時間</TableCell>
              <TableCell>作成時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.reservationList.map(reserveInfo => {
              return (
                <TableRow>
                  <TableCell>{ reserveInfo.id }</TableCell>
                  <TableCell>{ reserveInfo.name }</TableCell>
                  <TableCell>{ reserveInfo.reservedTime }</TableCell>
                  <TableCell>{ reserveInfo.createdAt }</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}
