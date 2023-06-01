import { Request, Response } from "express";
import AppDataSource from "../ormconfig";
import Template from "../response/index";
import * as fs from "fs";
import * as path from "path";
import { getFilesFromSFTP } from "../helper/SFTPClient";
// import { CISParser } From "../helper/CISParser";
// import { CISScanHeader } From "../entity/CISScanHeader";
import { Zeek } from "../entity/Zeek";
import { ZeekParser } from "../helper/ZeekParser";

class ZeekController {
  public static GetMaxConnByExtSources = async (
    req: Request,
    res: Response
  ) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d') = date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT originIPAddress as sourceIp, COUNT(originIPAddress) as Count From ${process.env.DB_DATABASE}.zeek  ${whereCondition} group by originIPAddress order by count desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);

      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static GetMostConnectedInternalDevices = async (
    req: Request,
    res: Response
  ) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d')=date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT Case When ip.hostnames is null then zeek.internalDeviceIpAddress else ip.hostnames end as ipAddress, COUNT(ip.hostnames) as Count From ${process.env.DB_DATABASE}.zeek as zeek left join ${process.env.DB_DATABASE}.internal_ip_host_name_mapping as ip ON zeek.internalDeviceIpAddress = ip.ipaddress ${whereCondition}   group by ip.hostnames, zeek.internalDeviceIpAddress  order by Count desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);

      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static GetMostUsedProtocol = async (req: Request, res: Response) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d') = date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT protocol,COUNT(*) as Count From ${process.env.DB_DATABASE}.zeek ${whereCondition}  group by protocol  order by count desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);

      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static GetMostUsedConnService = async (
    req: Request,
    res: Response
  ) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d')= date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT service as protocol,COUNT(*) as Count From ${process.env.DB_DATABASE}.zeek ${whereCondition}  group by service order by count desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);

      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static GetLongestConnectedInternalDevices = async (
    req: Request,
    res: Response
  ) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d')= date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT Case When ip.hostnames is null then zeek.internalDeviceIpAddress else ip.hostnames end as ipAddress, SUM(zeek.duration) as Duration From ${process.env.DB_DATABASE}.zeek as zeek left join ${process.env.DB_DATABASE}.internal_ip_host_name_mapping as ip ON zeek.internalDeviceIpAddress = ip.ipaddress ${whereCondition} group by zeek.internalDeviceIpAddress, ip.hostnames  order by SUM(Duration) desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);
      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static GetMostConnectionStates = async (
    req: Request,
    res: Response
  ) => {
    const { range, count } = req.query;
    try {
      let whereCondition = ``;
      if (!range) {
        return res.status(400).json({ message: "monthrange missing" });
      }
      if (range === "today") {
        whereCondition = `where DATE_FORMAT(FROM_UNIXTIME(zeekTime), '%Y-%m-%d')= date_format(current_date(), '%Y-%m-%d')`;
      }
      const myQuery = `SELECT connectionState as state,COUNT(*) as Count From ${process.env.DB_DATABASE}.zeek ${whereCondition}  group by connectionState order by count desc limit ${count}`;
      const Data = await AppDataSource.manager.query(myQuery);

      return res.json(
        { Getdata: Data }
      );
    } catch (error) {
      return res.status(500).json({ message: "Error occurred in processing. Details ->", error });
    }
  };
  public static insertjsonsdata = async (req: Request, res: Response) => {
    // const { range,count } = req.query;

    // read file From SFTP
    await getFilesFromSFTP("zeek");

    let filePath;
    const fileDir = path.join(__dirname, "../Files/zeek");

    try {
      const files = fs.readdirSync(fileDir);
      console.log("Directory read successfull. 206");
      if (files.length === 0) {
        return res
          .status(400)
          .json({ message: "No files found in the directory." });
      } else {
        for (let i = 0; i < files.length; i++) {
          filePath = `${fileDir}/${files[i]}`;
          const zeekData: Zeek[] = await ZeekParser(filePath);
          let queryData = await this.InsertZeekData(zeekData);
          console.log("Query result", queryData);
          if (queryData) {
            await fs.unlinkSync(filePath);
            return res.status(200).json({
              message: "Insert done.",
              results: queryData.affectedRows
            });
          }
        }
      }
    } catch (error) {
     
    console.log("Function Name - insertjsonsdata ", Date(), error );
      return res.status(500).json({ message: "something went wrong", error })
    }
  };

  static InsertZeekData = async (ZeekData: any) => {
    let query = `insert into ${process.env.DB_DATABASE}.zeek (uid, originIPAddress, originPort, internalDeviceIPAddress, internalDevicePort, protocol, service, originBytes, respBytes, connectionState, localOrigin, localResp, missedByte, history, originPackets, originIPBytes, responsePackets, responseIPBytes, tunnelParents, zeekTime, duration, companyId) VALUES `;
    for (let i = 0; i < ZeekData.length; i++) {
      query = query + `('${ZeekData[i].uid}','${ZeekData[i].originIPAddress}', '${ZeekData[i].originPort}', '${ZeekData[i].internalDeviceIPAddress}', '${ZeekData[i].internalDevicePort}', '${ZeekData[i].protocol}', '${ZeekData[i].service}', '${ZeekData[i].originBytes}', '${ZeekData[i].respBytes}', '${ZeekData[i].connectionState}','${ZeekData[i].localOrigin}','${ZeekData[i].localResp}','${ZeekData[i].missedByte}','${ZeekData[i].history}','${ZeekData[i].originPackets}','${ZeekData[i].originIPBytes}','${ZeekData[i].responsePackets}','${ZeekData[i].responseIPBytes}','${ZeekData[i].tunnelParents}','${ZeekData[i].zeekTime}','${ZeekData[i].duration, ${process.env.CompanyId}}'),`;
    }
    return await AppDataSource.manager.query(query.substring(0, query.length - 1));
  }
}
export default ZeekController;
