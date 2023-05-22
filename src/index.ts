import AppDataSource from "./ormconfig";

import {zeekcron} from "./helper/CronJob";

// establish database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// cron job for the zeek 
zeekcron()
