const router = require('express').Router();
const thinky = require('../db/thinky');
const config = require('../config');
const Log = require('../Log');
const log = new Log(config.timestamps);
const r = thinky.r;
const errorMessage = 'here was an error reading from the database. This may be normal if there is no data in them yet';

router.route('/').get((req, res) => {
  res.status(200).render('../views/index.hbs')
});

//
// The most recent 2 hours, rolling 
router.route('/rolling').get((req, res) => {
  r.table('instants').orderBy(r.desc('date')).limit(240).orderBy('date').run().then(result => {
    res.status(200).json(result);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Today's average uptime
router.route('/uptime/today').get((req, res) => {
  r.table('instants').map(row => {
    return {
      date: row('date'),
      online: row('online'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).dayOfYear();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      online: left('online').add(right('online')),
      count: left('count').add(right('count'))
    }
  }).ungroup().orderBy(r.desc('group')).map((row) => {
    return {
      date: r.time(row('reduction')('date').year(), row('reduction')('date').month(), row('reduction')('date').day(), config.offset),
      online: row('reduction')('online').div(row('reduction')('count')),
      offline: r.expr(1).sub(row('reduction')('online').div(row('reduction')('count')))
    }
  }).nth(0).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average uptime by day
router.route('/uptime/daily').get((req, res) => {
  r.table('days').map(row => {
    return {
      date: row('date'),
      online: row('online'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).dayOfYear();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      online: left('online').add(right('online')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: r.time(row('reduction')('date').year(), row('reduction')('date').month(), row('reduction')('date').day(), config.offset),
      online: row('reduction')('online').div(row('reduction')('count')),
      offline: r.expr(1).sub(row('reduction')('online').div(row('reduction')('count')))
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average uptime by month
router.route('/uptime/monthly').get((req, res) => {
  r.table('days').map(row => {
    return {
      date: row('date'),
      online: row('online'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).month();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      online: left('online').add(right('online')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: row('reduction')('date').month(),
      online: row('reduction')('online').div(row('reduction')('count')),
      offline: r.expr(1).sub(row('reduction')('online').div(row('reduction')('count')))
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average uptime by year
router.route('/uptime/yearly').get((req, res) => {
  r.table('days').map(row => {
    return {
      date: row('date'),
      online: row('online'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).year();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      online: left('online').add(right('online')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: row('reduction')('date').year(),
      online: row('reduction')('online').div(row('reduction')('count')),
      offline: r.expr(1).sub(row('reduction')('online').div(row('reduction')('count')))
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average duration and count by day
router.route('/disconnects/daily').get((req, res) => {
  r.table('disconnects').map(row => {
    return {
      date: row('date'),
      duration: row('duration'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).dayOfYear();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      duration: left('duration').add(right('duration')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: r.time(row('reduction')('date').year(), row('reduction')('date').month(), row('reduction')('date').day(), config.offset),
      avgDuration: row('reduction')('duration').div(row('reduction')('count')),
      totalDuration: row('reduction')('duration'),
      count: row('reduction')('count')
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average duration and count by month
router.route('/disconnects/monthly').get((req, res) => {
  r.table('disconnects').map(row => {
    return {
      date: row('date'),
      duration: row('duration'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).month();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      duration: left('duration').add(right('duration')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: row('reduction')('date').month(),
      avgDuration: row('reduction')('duration').div(row('reduction')('count')),
      totalDuration: row('reduction')('duration'),
      count: row('reduction')('count')
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Average duration and count by year
router.route('/disconnects/yearly').get((req, res) => {
  r.table('disconnects').map(row => {
    return {
      date: row('date'),
      duration: row('duration'),
      count: 1
    }
  }).group(row => {
    return row('date').inTimezone(config.offset).year();
  }).reduce((left, right) => {
    return {
      date: left('date'),
      duration: left('duration').add(right('duration')),
      count: left('count').add(right('count'))
    }
  }).ungroup().map(row => {
    return {
      date: row('reduction')('date').year(),
      avgDuration: row('reduction')('duration').div(row('reduction')('count')),
      totalDuration: row('reduction')('duration'),
      count: row('reduction')('count')
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

//
// Lifetime number of disconnects
router.route('/lifetime/disconnects').get((req, res) => {
  r.table('disconnects').map(day => {
    return {
      duration: day('duration'),
      count: 1
    }
  }).reduce((left, right) => {
    return {
      duration: left('duration').add(right('duration')),
      count: left('count').add(right('count'))
    }
  }).run().then(results => {
    res.status(200).json(results);
  }, reject => {
    log.error(errorMessage);
    log.error(reject);
  });
});

module.exports = router;
