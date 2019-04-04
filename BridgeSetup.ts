import fs from 'fs';
import { nupnpSearch, HueApi } from "node-hue-api";
import http from "http";

import { BridgeConfig, BridgeFile } from "./types";

export default function BridgeSetup(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        let newBridgeFile: BridgeFile = {};
        let bridgeCount: number = 0;
        nupnpSearch()
            .then((bridges) => {
                console.log("Bridges Found");
                console.log(bridges);
                for (let i = 0; i < bridges.length; i++) {
                    let bridge = bridges[i];
                    registerBridge(bridge.ipaddress).then((config) => {
                        newBridgeFile[config.ip] = config;
                        bridgeCount++;
                        if (bridgeCount === bridges.length) {
                            resolve(JSON.stringify(newBridgeFile));
                            return;
                        }
                    }).catch((err) => {
                        console.log("Error registering");
                        reject(err);
                    });
                }
            }).catch((reason) => {
                console.log("No Bridges found");
                reject(reason);
            });
    });
}

function registerBridge(ipAddress: string): Promise<BridgeConfig> {
    return new Promise<BridgeConfig>((resolve, reject) => {
        let options: http.RequestOptions = {
            hostname: ipAddress,
            path: "/api/",
            method: "POST",
            port: 80,
            headers: {
                "Content-Type": 'application/json'
            }
        }

        let req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on("data", (data) => {
                let username: string;
                try {
                    if (typeof data === "object") {
                        username = data[0]["success"]["username"];
                    } else if (typeof data === "string") {
                        let respObj = JSON.parse(data);
                        username = respObj[0]["success"]["username"];
                    } else {
                        reject("Error Getting Username: Not a string/obj " + (typeof data));
                        req.destroy();
                        return;
                    }
                    resolve({ username, ip: ipAddress });
                    req.destroy();
                } catch (err) {
                    reject("Error Getting Username: Error Parsing " + err);
                    req.destroy();
                }
            });
        });

        req.on("error", () => {
            reject("Error Getting Username");
        });

        req.write('{"devicetype":"my_hue_app#hue app"}');
        req.end();
    });
}