import mysql = require('mysql');
import express = require('express');
import moment = require('moment-timezone');
import bodyParser = require('body-parser');

interface ReserveInfo {
  id: number,
  name: string,
  reserved_time: string,
  reserved_at: string
}

moment.locale('ja');

const router = express.Router();
const mysqlConnection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});

const handleError = (err, res, response) => {
  response = {
    result: err
  }
  res.status(500);
  res.json(response);
};

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const isDuplicated = (arr, limit) => {
  const _arr = arr.map(reservation => reservation.reserved_time);
  const firstValue = _arr[0];
  const filtered = _arr.filter(a => {
    return firstValue.year() === a.year() && 
    firstValue.month() === a.month() &&
    firstValue.date() === a.date() &&
    firstValue.hours() === a.hours() &&
    firstValue.minutes() === a.minutes()
  });
  
  if (filtered.length !== limit) {
    return false;
  } else {
    return true;
  }
}

const updateDateTimeFormat = val => {
  let updatedRFC2822Format;
  if (val >= 1 && val <= 9) {
    updatedRFC2822Format = `0${val}`
  } else {
    updatedRFC2822Format = `${val}`;
  }
  return updatedRFC2822Format;
};

const initReserve = currentMomentTimeStamp => {
  let reservingTime;
  
  const currentYear = updateDateTimeFormat(currentMomentTimeStamp.year());
  const currentMonth = updateDateTimeFormat(currentMomentTimeStamp.month() + 1);
  const currentDate = updateDateTimeFormat(currentMomentTimeStamp.date());
  
  if (currentMomentTimeStamp <= moment(`${currentYear}-${currentMonth}-${currentDate} 10:00:00`)) {
    reservingTime = moment(`${currentYear}-${currentMonth}-${currentDate} 10:00:00`);
  } else {
    reservingTime = currentMomentTimeStamp;
    while (true) {
      if (reservingTime.minutes() === 0 || reservingTime.minutes() === 30) {
        break;
      }
      reservingTime = moment(reservingTime).add(1, 'minutes');
    }
  }

  return reservingTime;
}

const addReserve = (currentMomentTimeStamp, lastReservationTime, withPrev) => {
  let reservingTime = moment(currentMomentTimeStamp);

  if (currentMomentTimeStamp > lastReservationTime) {
    reservingTime = initReserve(currentMomentTimeStamp);
    return reservingTime.format('YYYY-MM-DD HH:mm:ss');
  }

  if (withPrev) {
    reservingTime = lastReservationTime;
  } else {
    reservingTime = lastReservationTime.add(30, 'minutes');
  }

  return reservingTime.format('YYYY-MM-DD HH:mm:ss');
};

router.post('/reserve', async (req, res) => {
  const name = req.body.name;
  const currentMomentTimeStamp = moment();
  const currentMysqlTimeStamp = currentMomentTimeStamp.format('YYYY-MM-DD HH:mm:ss');
  const limit = 4;
  const currentYear = updateDateTimeFormat(currentMomentTimeStamp.year());
  const currentMonth = updateDateTimeFormat(currentMomentTimeStamp.month() + 1);
  const currentDate = updateDateTimeFormat(currentMomentTimeStamp.date());
  const closeHour = "17:00:00"
  let lastReservations;
  let reservingTime;
  let response = {};

  mysqlConnection.query(`
    SELECT * FROM reserves ORDER BY created_at DESC LIMIT ${limit}
  `, (err, results) => {
    if (err) {
      handleError(err, res, response);
      return;
    }
    
    lastReservations = results.map(reservation => {
      return {
        id: reservation.id,
        name: reservation.name,
        reserved_time: moment(reservation.reserved_time),
        created_at: moment(reservation.created_at)
      }
    });

    if (lastReservations.length === 0) {
      reservingTime = initReserve(currentMomentTimeStamp).format('YYYY-MM-DD HH:mm:ss');
    } else if ((lastReservations.length >= 1 && lastReservations.length <= (limit - 1)) || !isDuplicated(lastReservations, limit)) {
      const lastReservationTime = lastReservations[0].reserved_time;
      reservingTime = addReserve(currentMomentTimeStamp, lastReservationTime, true);
    } else {
      const lastReservationTime = lastReservations[0].reserved_time;
      reservingTime = addReserve(currentMomentTimeStamp, lastReservationTime, false);
    }
    
    const momentReservingTime = moment(reservingTime);
    if (momentReservingTime >= moment(
      `${currentYear}-${currentMonth}-${currentDate} ${closeHour}`)) {
      Object.assign(response, {
        result: {
          number: -1,
          reservedTime:  ""
        }
      });

      res.status(200);
      res.json(response);
      return;
    }

    mysqlConnection.query(`
      INSERT INTO reserves (
        name, reserved_time, created_at
      ) VALUES (
        "${name}", "${reservingTime}", "${currentMysqlTimeStamp}"
      )
    `, (err, results) => {
      
      if (err) {
        handleError(err, res, response);
        return;
      }
      
      Object.assign(response, {
        result: {
          number: results.insertId,
          reservedTime: reservingTime
        }
      });

      res.status(200);
      res.json(response);
    });
  });
});

router.get('/reserves', async (req, res) => {
  let response: {
    result: Array<ReserveInfo>
  } = {
    result: []
  };

  mysqlConnection.query(`
    SELECT * FROM reserves
  `, (err, results) => {
    if (err) {
      handleError(err, res, response);
      return;
    }

    response.result = results;
    res.send(response);
  });
});

module.exports = router;