import * as fs from 'fs';
import { Zeek } from '../entity/Zeek';

export const ZeekParser = (filePath: string): Zeek[] => {
    var buffer;



    try {
        buffer = fs.readFileSync(filePath);


        let fileContent = buffer.toString();


        const logs: string[] = buffer.toString().split("\n");

        const startIndex = logs.findIndex((item: string) => item.startsWith("#types"));
        const deletedLines = logs.splice(0, startIndex + 1);
        logs.splice(-2, 2); // for removing last 2 lines

        let headers = deletedLines[deletedLines.length - 2]?.split("\t");
        headers = headers?.slice(1, headers.length);
        const zeekData: Zeek[] = [];

        for (let i = 0; i < logs.length; i++) {
            let obj: any = {};
            const dataArray = logs[i]?.split("\t");
            for (let k = 0; k < dataArray.length; k++) {
                obj[headers && headers.length > 0 && headers[k]] = dataArray && dataArray.length > 0 && dataArray[k];
            }


            const zeek = new Zeek();
            zeek.zeekTime = obj["ts"]
            zeek.uid = obj["uid"];
            zeek.originIPAddress = obj["id.orig_h"];
            zeek.originPort = obj["id.orig_p"];
            zeek.internalDeviceIPAddress = obj["id.resp_h"]
            zeek.internalDevicePort = obj["id.resp_p"]
            zeek.protocol = obj["proto"]
            zeek.service = obj["service"]
            zeek.duration = isNaN(obj["duration"]) ? 0 : Number(obj["duration"])
            zeek.originBytes = obj["orig_byte"]
            zeek.respBytes = obj["resp_bytes"]
            zeek.connectionState = obj["conn_state"]
            zeek.localOrigin = obj["local_orig"]
            zeek.localResp = obj["local_resp"]
            zeek.missedByte = obj["missed_bytes"]
            zeek.history = obj["history"]
            zeek.originPackets = obj["orig_pkts"]
            zeek.originIPBytes = obj["orig_ip_bytes"]
            zeek.responsePackets = obj["resp_pkts"]
            zeek.responseIPBytes = obj["resp_ip_bytes"]
            zeek.tunnelParents = obj["tunnel_parents"]
            zeekData.push(zeek);
        }


        return zeekData;

    } catch (err) {
        console.log("Function Name - ZeekParser", Date(), err);
    }

    return [];
}