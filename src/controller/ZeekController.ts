import { Request, Response } from "express";
import AppDataSource from "../ormconfig";

class ZeekController {
    static InsertZeekData = async (ZeekData: any) => {
        let query = `insert into ${process.env.DB_DATABASE}.zeek (uid, originIPAddress, originPort, internalDeviceIPAddress, internalDevicePort, protocol, service, originBytes, respBytes, connectionState, localOrigin, localResp, missedByte, history, originPackets, originIPBytes, responsePackets, responseIPBytes, tunnelParents, zeekTime, duration, companyId) VALUES `;
        for (let i = 0; i < ZeekData.length; i++) {
            query = query + `('${ZeekData[i].uid}','${ZeekData[i].originIPAddress}', '${ZeekData[i].originPort}', '${ZeekData[i].internalDeviceIPAddress}', '${ZeekData[i].internalDevicePort}', '${ZeekData[i].protocol}', '${ZeekData[i].service}', '${ZeekData[i].originBytes}', '${ZeekData[i].respBytes}', '${ZeekData[i].connectionState}','${ZeekData[i].localOrigin}','${ZeekData[i].localResp}','${ZeekData[i].missedByte}','${ZeekData[i].history}','${ZeekData[i].originPackets}','${ZeekData[i].originIPBytes}','${ZeekData[i].responsePackets}','${ZeekData[i].responseIPBytes}','${ZeekData[i].tunnelParents}','${ZeekData[i].zeekTime}','${ZeekData[i].duration}', ${process.env.CompanyId}),`;
        }
        return await AppDataSource.manager.query(query.substring(0, query.length - 1));
    }
}
export default ZeekController;
